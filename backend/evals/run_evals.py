"""Stage 8: continuous evals. Runs the full pipeline (retrieval -> rerank ->
confidence -> generation -> fallback) against a small fixture corpus + golden
Q&A set, entirely isolated from the production KB (ephemeral in-memory Chroma
collection + a throwaway BM25Index instance) — no live Google Drive credentials
needed, and this never touches backend/chroma_data/ or the production BM25
singleton.

Run: `python -m backend.evals.run_evals` from repo root, or `pytest backend/evals -v`.
Makes real Gemini API calls (embeddings + rerank/generation) — needs
GEMINI_API_KEY set, and costs a small amount per run.
"""
import glob
import json
import os
import sys
from dataclasses import dataclass, field

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVALS_DIR = os.path.dirname(os.path.abspath(__file__))

# Make `rag` importable the same way main.py does, regardless of how this
# script itself is invoked (module vs script, repo-root vs backend cwd).
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# This script is meant to run standalone (no FastAPI app involved), so it must
# load backend/.env itself — main.py's load_dotenv() call never runs here.
from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from rag import ingest as rag_ingest  # noqa: E402
from rag import vector_store  # noqa: E402
from rag import retrieval  # noqa: E402
from rag import rerank as rag_rerank  # noqa: E402
from rag import confidence as rag_confidence  # noqa: E402
from rag import generation as rag_generation  # noqa: E402
from rag import fallback as rag_fallback  # noqa: E402
from rag.bm25_index import BM25Index  # noqa: E402

RECALL_THRESHOLD = 0.8
KEYWORD_HIT_THRESHOLD = 0.7


@dataclass
class EvalResult:
    passed: bool
    recall_hits: int
    recall_total: int
    keyword_hits: int
    keyword_total: int
    fallback_correct: int
    fallback_total: int
    rows: list = field(default_factory=list)


def _load_fixture_corpus() -> list[dict]:
    """Builds sidecar-shaped document dicts from backend/evals/seed_corpus/*.txt."""
    docs = []
    for path in sorted(glob.glob(os.path.join(EVALS_DIR, "seed_corpus", "*.txt"))):
        filename = os.path.basename(path)
        with open(path, "r", encoding="utf-8") as f:
            raw_text = f.read()
        docs.append({"filename": filename, "raw_text": raw_text, "ingested_at": None})
    return docs


def _build_ephemeral_store():
    collection = vector_store.new_ephemeral_collection()
    bm25 = BM25Index()

    all_chunks = []
    for doc in _load_fixture_corpus():
        chunks = rag_ingest.normalize_and_chunk(doc)
        all_chunks.extend(chunks)

    vector_store.upsert_chunks(all_chunks, collection=collection)
    bm25.build_from_chunks(all_chunks)
    return collection, bm25


def _contains_any_keyword(text: str, keywords: list[str]) -> bool:
    lowered = text.lower()
    return any(kw.lower() in lowered for kw in keywords)


def main() -> EvalResult:
    with open(os.path.join(EVALS_DIR, "golden_qa.json"), "r", encoding="utf-8") as f:
        golden_qa = json.load(f)

    collection, bm25 = _build_ephemeral_store()

    recall_hits = recall_total = 0
    keyword_hits = keyword_total = 0
    fallback_correct = fallback_total = 0
    rows = []

    for item in golden_qa:
        question = item["question"]
        expected_keywords = item["expected_keywords"]
        expect_fallback = item["expect_fallback"]

        candidates = retrieval.hybrid_retrieve(question, collection=collection, bm25_module=bm25)

        # --- recall@5 (skipped for deliberately-unanswerable questions, which
        # have no expected_keywords to check retrieval against) ---
        recall_hit = None
        if expected_keywords:
            recall_total += 1
            top5_text = " ".join(c.chunk.text for c in candidates[:5])
            recall_hit = _contains_any_keyword(top5_text, expected_keywords)
            if recall_hit:
                recall_hits += 1

        # --- full pipeline: rerank -> confidence -> generation -> fallback ---
        reranked = rag_rerank.llm_rerank(question, candidates)
        scored = rag_confidence.score_confidence(reranked)
        agg_confidence = rag_confidence.aggregate_confidence(scored)

        try:
            output, _usage = rag_generation.generate(question, scored, history=[])
        except Exception as e:
            print(f"Generation failed for {question!r}: {e}")
            output = None

        fallback_triggered = rag_fallback.should_fallback(output, agg_confidence, len(candidates))
        if fallback_triggered:
            _, answer_text = rag_fallback.safe_response()
        else:
            citations = rag_generation.build_citations(output, scored)
            answer_text = rag_generation.serialize_legacy(output, citations)

        fallback_total += 1
        fallback_ok = fallback_triggered == expect_fallback
        if fallback_ok:
            fallback_correct += 1

        keyword_hit = None
        if expected_keywords:
            keyword_total += 1
            keyword_hit = _contains_any_keyword(answer_text, expected_keywords)
            if keyword_hit:
                keyword_hits += 1

        rows.append(
            {
                "question": question,
                "recall_hit": recall_hit,
                "keyword_hit": keyword_hit,
                "expect_fallback": expect_fallback,
                "fallback_triggered": fallback_triggered,
                "fallback_ok": fallback_ok,
            }
        )

    recall_rate = recall_hits / recall_total if recall_total else 1.0
    keyword_rate = keyword_hits / keyword_total if keyword_total else 1.0
    fallback_rate = fallback_correct / fallback_total if fallback_total else 1.0

    passed = (
        recall_rate >= RECALL_THRESHOLD
        and keyword_rate >= KEYWORD_HIT_THRESHOLD
        and fallback_correct == fallback_total
    )

    print(f"\n{'Question':<70} {'Recall':<8} {'Keyword':<8} {'Fallback':<10}")
    print("-" * 100)
    for row in rows:
        recall_str = "-" if row["recall_hit"] is None else ("Y" if row["recall_hit"] else "N")
        keyword_str = "-" if row["keyword_hit"] is None else ("Y" if row["keyword_hit"] else "N")
        fallback_str = "OK" if row["fallback_ok"] else "FAIL"
        print(f"{row['question'][:68]:<70} {recall_str:<8} {keyword_str:<8} {fallback_str:<10}")

    print("-" * 100)
    print(
        f"recall@5: {recall_hits}/{recall_total} ({recall_rate:.0%})  |  "
        f"generation keyword-hit: {keyword_hits}/{keyword_total} ({keyword_rate:.0%})  |  "
        f"fallback correctness: {fallback_correct}/{fallback_total} ({fallback_rate:.0%})"
    )
    print(f"RESULT: {'PASS' if passed else 'FAIL'}\n")

    return EvalResult(
        passed=passed,
        recall_hits=recall_hits,
        recall_total=recall_total,
        keyword_hits=keyword_hits,
        keyword_total=keyword_total,
        fallback_correct=fallback_correct,
        fallback_total=fallback_total,
        rows=rows,
    )


if __name__ == "__main__":
    result = main()
    sys.exit(0 if result.passed else 1)
