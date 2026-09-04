"""Stage 9 (speed/cost half): a single disk-backed cache, no external server.

Deliberately scoped to embeddings only (deterministic per input text+model) —
NOT full chat-response caching, since responses depend on conversation history
and caching them risks serving stale/wrong answers across sessions.
"""
import hashlib
import diskcache

from . import config

_cache = diskcache.Cache(config.CACHE_DIR)


def _embedding_key(text: str, model: str) -> str:
    digest = hashlib.sha256(f"{model}::{text}".encode("utf-8")).hexdigest()
    return f"embed::{digest}"


def get_cached_embedding(text: str, model: str):
    return _cache.get(_embedding_key(text, model))


def set_cached_embedding(text: str, model: str, embedding: list[float]) -> None:
    _cache.set(_embedding_key(text, model), embedding)
