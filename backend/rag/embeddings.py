"""Embedding wrapper used by both ingest (batch) and retrieval (single query),
routed through the disk cache so repeat text never gets re-embedded.

Uses gemini-embedding-001, NOT gemini-embedding-2 — the -2 model pools a whole
batch of input texts into a single aggregated vector, whereas -001 returns one
vector per input text. Retrieval needs one vector per chunk, so -2 would
silently collapse every chunk in a batch onto the same vector."""
import os
from typing import Optional
from google import genai

from . import config
from . import cache

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY") or "missing")
    return _client


def embed_texts(texts: list[str], model: str = config.EMBEDDING_MODEL) -> list[list[float]]:
    """Batch-embed texts, using the cache for any that were embedded before.
    Fetches in fixed-size batches (config.EMBED_BATCH_SIZE) so a large ingest
    (100s-1000s of chunks) never sends one oversized request. The SDK already
    retries 429/5xx with backoff by default, so no custom retry wrapper here."""
    if not texts:
        return []

    results: list[Optional[list[float]]] = [None] * len(texts)
    to_fetch_idx: list[int] = []
    to_fetch_text: list[str] = []

    for i, text in enumerate(texts):
        cached = cache.get_cached_embedding(text, model)
        if cached is not None:
            results[i] = cached
        else:
            to_fetch_idx.append(i)
            to_fetch_text.append(text)

    batch_size = config.EMBED_BATCH_SIZE
    for start in range(0, len(to_fetch_text), batch_size):
        batch_idx = to_fetch_idx[start : start + batch_size]
        batch_text = to_fetch_text[start : start + batch_size]
        response = _get_client().models.embed_content(model=model, contents=batch_text)
        for idx, embedding in zip(batch_idx, response.embeddings):
            results[idx] = embedding.values
            cache.set_cached_embedding(texts[idx], model, embedding.values)

    return results


def embed_query(text: str, model: str = config.EMBEDDING_MODEL) -> list[float]:
    return embed_texts([text], model=model)[0]
