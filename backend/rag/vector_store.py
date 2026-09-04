"""Stage 1 (write side) + Stage 2 (read side, ANN): a persistent ChromaDB
collection storing chunk text + metadata alongside embeddings."""
import chromadb

from . import config
from . import embeddings as emb
from .schemas import Chunk, RetrievedCandidate

_client = None
_collection = None


def _get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path=config.CHROMA_DIR)
        _collection = _client.get_or_create_collection(name=config.CHROMA_COLLECTION)
    return _collection


def upsert_chunks(chunks: list[Chunk], collection=None) -> None:
    """Upserts in fixed-size batches (config.EMBED_BATCH_SIZE) rather than one
    call for the whole ingest — a 1000-file Drive folder can produce thousands
    of chunks, and embed_texts already batches at the same size, so this keeps
    each Chroma upsert aligned 1:1 with an embedding request instead of holding
    every vector for the whole corpus in memory before writing any of them."""
    if not chunks:
        return
    collection = collection or _get_collection()
    batch_size = config.EMBED_BATCH_SIZE
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        texts = [c.text for c in batch]
        vectors = emb.embed_texts(texts)
        collection.upsert(
            ids=[c.chunk_id for c in batch],
            embeddings=vectors,
            documents=texts,
            metadatas=[
                {"source": c.source, "chunk_index": c.chunk_index, "ingested_at": c.ingested_at or ""}
                for c in batch
            ],
        )


def delete_by_source(source: str, collection=None) -> None:
    collection = collection or _get_collection()
    # Chroma's `where` filter needs at least one clause; querying by exact source name.
    existing = collection.get(where={"source": source})
    if existing and existing.get("ids"):
        collection.delete(ids=existing["ids"])


def query(query_embedding: list[float], n_results: int, collection=None) -> list[RetrievedCandidate]:
    collection = collection or _get_collection()
    count = collection.count()
    if count == 0:
        return []
    n_results = min(n_results, count)
    result = collection.query(query_embeddings=[query_embedding], n_results=n_results)

    candidates: list[RetrievedCandidate] = []
    ids = result.get("ids", [[]])[0]
    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]
    for rank, (chunk_id, text, meta) in enumerate(zip(ids, docs, metas)):
        chunk = Chunk(
            chunk_id=chunk_id,
            text=text,
            source=meta.get("source", "unknown"),
            chunk_index=meta.get("chunk_index", 0),
            ingested_at=meta.get("ingested_at") or None,
        )
        candidates.append(RetrievedCandidate(chunk=chunk, embed_rank=rank))
    return candidates


def get_all_chunks(collection=None) -> list[Chunk]:
    collection = collection or _get_collection()
    count = collection.count()
    if count == 0:
        return []
    result = collection.get(limit=count)
    chunks: list[Chunk] = []
    for chunk_id, text, meta in zip(result["ids"], result["documents"], result["metadatas"]):
        chunks.append(
            Chunk(
                chunk_id=chunk_id,
                text=text,
                source=meta.get("source", "unknown"),
                chunk_index=meta.get("chunk_index", 0),
                ingested_at=meta.get("ingested_at") or None,
            )
        )
    return chunks


def new_ephemeral_collection():
    """An in-memory (non-persistent) Chroma client + collection, for eval fixtures
    so evals never touch the production store on disk."""
    client = chromadb.Client()
    return client.get_or_create_collection(name="eval_kb")
