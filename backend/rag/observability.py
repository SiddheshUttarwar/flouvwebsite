"""Stage 10: structured logging (visible in Render's log viewer) + a SQLite
RagTrace row per request. No third-party observability SaaS — built-in only."""
import json
import logging
import time
from contextlib import contextmanager
from sqlalchemy.orm import Session

try:
    from .. import models
except ImportError:
    import models

from . import config

logger = logging.getLogger("flouv.rag")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(message)s"))
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)


@contextmanager
def stage_timer(trace: dict, name: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        trace.setdefault("stage_timings", {})[f"{name}_ms"] = round(elapsed_ms, 1)


def count_tokens(text: str, model: str) -> int:
    try:
        import tiktoken

        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))
    except Exception:
        # tiktoken should always be available (it's a required dependency), but
        # token counting is diagnostic-only — never let it break the request.
        return len(text) // 4


def estimate_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    pricing = config.PRICING_PER_1K.get(model)
    if not pricing:
        return 0.0
    return (prompt_tokens / 1000.0) * pricing["prompt"] + (completion_tokens / 1000.0) * pricing[
        "completion"
    ]


def log_trace(db: Session, trace: dict) -> int:
    """Emits a structured JSON log line and writes a RagTrace row. Returns the
    new row's id. Flushes (not commits) — the id is only assigned once the
    INSERT actually runs, but the caller (pipeline.handle_chat) owns the
    single commit for the whole chat turn; see memory.py's docstring for why."""
    logger.info(json.dumps({"event": "rag_trace", **trace}, default=str))

    row = models.RagTrace(
        session_id=trace.get("session_id"),
        query=trace.get("query"),
        stage_timings=trace.get("stage_timings"),
        retrieval_scores=trace.get("retrieval_scores"),
        rerank_scores=trace.get("rerank_scores"),
        aggregate_confidence=trace.get("aggregate_confidence"),
        fallback_triggered=trace.get("fallback_triggered", False),
        chosen_image=trace.get("chosen_image"),
        citations=trace.get("citations"),
        prompt_tokens=trace.get("prompt_tokens", 0),
        completion_tokens=trace.get("completion_tokens", 0),
        cost_estimate_usd=trace.get("cost_estimate_usd", 0.0),
    )
    db.add(row)
    db.flush()
    return row.id
