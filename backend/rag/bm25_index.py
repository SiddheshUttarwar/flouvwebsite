"""Stage 2 lexical half. Chroma has no native lexical search, so BM25 runs as an
in-memory index rebuilt from whatever chunks the vector store currently holds.
Cheap to rebuild from scratch at this corpus size (no incremental-update logic).

Exposed as a class (not bare module globals) so the eval harness can build a
throwaway index without touching the production singleton — running an eval in
the same process must never clobber the live BM25 index."""
import re
from rank_bm25 import BM25Okapi

from . import vector_store
from .schemas import Chunk

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


class BM25Index:
    def __init__(self):
        self._bm25: BM25Okapi | None = None
        self._chunk_ids: list[str] = []
        self._chunks_by_id: dict[str, Chunk] = {}

    def build_from_chunks(self, chunks: list[Chunk]) -> None:
        self._chunk_ids = [c.chunk_id for c in chunks]
        self._chunks_by_id = {c.chunk_id: c for c in chunks}
        if not chunks:
            self._bm25 = None
            return
        tokenized = [_tokenize(c.text) for c in chunks]
        self._bm25 = BM25Okapi(tokenized)

    def rebuild(self, collection=None) -> None:
        self.build_from_chunks(vector_store.get_all_chunks(collection=collection))

    def search(self, query: str, k: int) -> list[tuple[str, float]]:
        if self._bm25 is None or not self._chunk_ids:
            return []
        scores = self._bm25.get_scores(_tokenize(query))
        ranked = sorted(zip(self._chunk_ids, scores), key=lambda pair: pair[1], reverse=True)
        return ranked[:k]

    def get_chunk(self, chunk_id: str) -> Chunk | None:
        return self._chunks_by_id.get(chunk_id)

    def is_built(self) -> bool:
        return self._bm25 is not None


# Production singleton — module-level functions below delegate to this so
# existing call sites (`bm25_index.rebuild()`, `bm25_index.search(...)`) keep working.
_default_index = BM25Index()


def build_from_chunks(chunks: list[Chunk]) -> None:
    _default_index.build_from_chunks(chunks)


def rebuild(collection=None) -> None:
    _default_index.rebuild(collection=collection)


def search(query: str, k: int) -> list[tuple[str, float]]:
    return _default_index.search(query, k)


def get_chunk(chunk_id: str) -> Chunk | None:
    return _default_index.get_chunk(chunk_id)


def is_built() -> bool:
    return _default_index.is_built()
