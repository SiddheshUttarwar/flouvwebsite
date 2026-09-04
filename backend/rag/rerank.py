"""Stage 3: ANN + reranking.

Default path (`fused_order_rerank`) reuses the RRF fusion order/score computed
for free in stage 2 — measured via rag_traces.stage_timings, the LLM rerank
below was costing 2-3.5s per request for marginal reordering benefit over a
10-candidate list, so it's no longer on the hot path. `llm_rerank` is kept
available for cases where reranking quality needs to be revisited."""
import json
import os
from google import genai

from . import config
from .schemas import RetrievedCandidate, RerankedCandidate

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY") or "missing")
    return _client


_RERANK_SCHEMA = {
    "type": "object",
    "properties": {
        "scores": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "candidate_index": {"type": "integer"},
                    "relevance_0_to_10": {"type": "number"},
                },
                "required": ["candidate_index", "relevance_0_to_10"],
            },
        }
    },
    "required": ["scores"],
}


def _normalize_rrf_to_0_10(candidates: list[RetrievedCandidate]) -> dict[int, float]:
    """confidence.py divides llm_relevance_score by 10 expecting an absolute
    0-10 relevance scale (the old LLM rerank prompt's scale). Raw RRF scores
    are tiny (~0.01-0.03) and would collapse confidence to ~0 if used directly,
    so min-max normalize them to 0-10 relative to this candidate set instead."""
    scores = [c.rrf_score for c in candidates]
    lo, hi = min(scores), max(scores)
    spread = hi - lo
    if spread <= 0:
        return {i: 10.0 for i in range(len(candidates))}
    return {i: 10.0 * (c.rrf_score - lo) / spread for i, c in enumerate(candidates)}


def fused_order_rerank(
    query: str, candidates: list[RetrievedCandidate], top_n: int = config.RERANK_TOP_N
) -> list[RerankedCandidate]:
    """No API call: takes the already-fused hybrid retrieval order (BM25 +
    embedding, weighted RRF) as the relevance ranking."""
    if not candidates:
        return []
    score_by_index = _normalize_rrf_to_0_10(candidates)
    reranked = [
        RerankedCandidate(candidate=c, llm_relevance_score=score_by_index[i])
        for i, c in enumerate(candidates)
    ]
    reranked.sort(key=lambda r: r.llm_relevance_score, reverse=True)
    return reranked[:top_n]


def llm_rerank(
    query: str, candidates: list[RetrievedCandidate], top_n: int = config.RERANK_TOP_N
) -> list[RerankedCandidate]:
    if not candidates:
        return []

    numbered = "\n\n".join(
        f"[{i}] {c.chunk.text[:600]}" for i, c in enumerate(candidates)
    )
    prompt = (
        "Score how relevant each numbered passage is to answering the query, on a 0-10 scale "
        "(10 = directly and completely answers it, 0 = irrelevant).\n\n"
        f"Query: {query}\n\nPassages:\n{numbered}"
    )

    try:
        interaction = _get_client().interactions.create(
            model=config.RERANK_MODEL,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema_": _RERANK_SCHEMA,
            },
        )
        parsed = json.loads(interaction.output_text)
        score_by_index = {
            item["candidate_index"]: item["relevance_0_to_10"] for item in parsed["scores"]
        }
    except Exception as e:
        print("Rerank failed, falling back to RRF order:", e)
        # Degrade gracefully: use the RRF fusion order/score as the relevance proxy
        # rather than failing the whole request over a reranker hiccup.
        score_by_index = _normalize_rrf_to_0_10(candidates)

    reranked = [
        RerankedCandidate(candidate=c, llm_relevance_score=score_by_index.get(i, 0.0))
        for i, c in enumerate(candidates)
    ]
    reranked.sort(key=lambda r: r.llm_relevance_score, reverse=True)
    return reranked[:top_n]
