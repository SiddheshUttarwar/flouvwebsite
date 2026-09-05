"""Orchestrates the full 10-stage RAG pipeline. main.py's /api/chat and
/api/report routes delegate here. Ingestion (/api/ingest-gdrive) runs as a
background job — see rag/ingest_job.py — since a 1000-file Drive sync takes
too long to run inside a single request/response cycle."""
import os
from fastapi import HTTPException
from google import genai
from sqlalchemy.orm import Session

from . import config
from . import retrieval
from . import rerank as rag_rerank
from . import confidence as rag_confidence
from . import generation as rag_generation
from . import fallback as rag_fallback
from . import memory
from . import observability

_report_client = None


def _get_report_client() -> genai.Client:
    global _report_client
    if _report_client is None:
        _report_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY") or "missing")
    return _report_client


def handle_chat(query: str, session_id: str | None, db: Session) -> dict:
    trace: dict = {"query": query}
    session = memory.get_or_create_session(db, session_id)
    session_id = session.id
    trace["session_id"] = session_id

    memory.append_message(db, session_id, "user", query)
    history = memory.get_recent_history(db, session_id, limit=config.CHAT_HISTORY_LIMIT + 1)[:-1]

    # Stage 2: hybrid retrieval. Embedding the query is a real external API
    # call (Gemini) just like generation below — an outage/rate-limit/billing
    # issue here shouldn't crash the whole request with a raw 500; fall
    # through with no candidates and let the existing low-confidence fallback
    # path (stage 7) produce the normal "I don't have enough information"
    # response instead.
    with observability.stage_timer(trace, "retrieval"):
        try:
            candidates = retrieval.hybrid_retrieve(query)
        except Exception as e:
            print("Retrieval failed:", e)
            candidates = []
    trace["retrieval_scores"] = [
        {"chunk_id": c.chunk.chunk_id, "rrf_score": round(c.rrf_score, 4)} for c in candidates
    ]

    # Stage 3: ANN + reranking (RRF fusion order, no extra API call — see rerank.py)
    with observability.stage_timer(trace, "rerank"):
        reranked = rag_rerank.fused_order_rerank(query, candidates)
    trace["rerank_scores"] = [
        {"chunk_id": r.candidate.chunk.chunk_id, "score": r.llm_relevance_score} for r in reranked
    ]

    # Stage 4: source confidence scoring
    with observability.stage_timer(trace, "confidence"):
        scored = rag_confidence.score_confidence(reranked)
        agg_confidence = rag_confidence.aggregate_confidence(scored)
    trace["aggregate_confidence"] = round(agg_confidence, 4)

    # Stage 5/6: constrained generation + citations
    output = None
    usage = {"prompt_tokens": 0, "completion_tokens": 0}
    with observability.stage_timer(trace, "generation"):
        try:
            output, usage = rag_generation.generate(query, scored, history)
        except Exception as e:
            print("Generation failed:", e)
            output = None

    # Stage 7: hallucination fallback
    fallback_triggered = rag_fallback.should_fallback(output, agg_confidence, len(candidates))
    citations = []
    if fallback_triggered:
        answer_string = rag_fallback.serialize_safe_response()
        chosen_image, _ = rag_fallback.safe_response()
        final_confidence = 0.0
    else:
        citations = rag_generation.build_citations(output, scored)
        answer_string = rag_generation.serialize_legacy(output, citations)
        chosen_image = output.image
        final_confidence = agg_confidence

    memory.append_message(db, session_id, "assistant", answer_string)

    # Stage 10: observability
    trace["fallback_triggered"] = fallback_triggered
    trace["chosen_image"] = chosen_image
    trace["citations"] = [c.model_dump() for c in citations]
    trace["prompt_tokens"] = usage["prompt_tokens"]
    trace["completion_tokens"] = usage["completion_tokens"]
    trace["cost_estimate_usd"] = round(
        observability.estimate_cost(
            config.GENERATION_MODEL, usage["prompt_tokens"], usage["completion_tokens"]
        ),
        6,
    )
    trace_id = observability.log_trace(db, trace)

    # Single commit for the whole turn (session create/lookup + both messages +
    # the trace row) instead of one per write — fewer SQLite write-lock
    # round-trips per request, and the turn persists atomically rather than in
    # partial pieces if something above raised before reaching here.
    db.commit()

    return {
        "answer": answer_string,
        "session_id": session_id,
        "citations": [c.model_dump() for c in citations],
        "confidence": round(final_confidence, 4),
        "fallback": fallback_triggered,
        "trace_id": trace_id,
    }


def handle_report(session_id: str, db: Session) -> dict:
    if not memory.has_history(db, session_id):
        raise HTTPException(status_code=400, detail="No chat history found for this session.")

    history = memory.get_full_history(db, session_id)
    chat_history_str = ""
    for msg in history:
        role = "User" if msg["role"] == "user" else "FloUV Agent"
        chat_history_str += f"{role}: {msg['content']}\n\n"

    system_prompt = (
        "You are an expert technical writer for FloUV. Your task is to read the following Q&A chat "
        "history and synthesize a highly professional, cohesive 1-page 'Technology Brief' report. "
        "The report should summarize the key findings, technologies discussed, and the specific "
        "answers provided. Format it beautifully using Markdown (with headers, bullet points, and "
        "bold text). Do NOT include the raw chat transcript. Write it as a standalone executive "
        "summary."
    )

    try:
        interaction = _get_report_client().interactions.create(
            model=config.GENERATION_MODEL,
            system_instruction=system_prompt,
            input=f"Here is the chat history:\n\n{chat_history_str}",
            generation_config={"max_output_tokens": 800},
        )
        return {"report": interaction.output_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
