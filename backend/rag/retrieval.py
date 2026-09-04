"""Stage 2: hybrid retrieval. Runs BM25 (lexical) and embedding ANN (semantic)
independently, then fuses via weighted Reciprocal Rank Fusion (RRF)."""
from . import config
from . import bm25_index
from . import vector_store
from . import embeddings as emb
from .schemas import RetrievedCandidate, Chunk


def hybrid_retrieve(
    query: str,
    k: int = config.RETRIEVAL_FUSED_K,
    collection=None,
    bm25_module=None,
) -> list[RetrievedCandidate]:
    """Returns the top-k fused candidates. `collection`/`bm25_module` let evals
    inject an ephemeral store instead of the production singleton."""
    bm25_module = bm25_module or bm25_index

    # Lazily build the production BM25 index on first use, mirroring the
    # original code's "if not vector_store: build it" pattern.
    if bm25_module is bm25_index and not bm25_index.is_built():
        bm25_index.rebuild(collection=collection)

    bm25_hits = bm25_module.search(query, config.RETRIEVAL_K_BM25)
    query_embedding = emb.embed_query(query)
    embed_hits = vector_store.query(query_embedding, config.RETRIEVAL_K_EMBED, collection=collection)

    # rank maps: chunk_id -> 0-based rank
    bm25_rank_of = {chunk_id: rank for rank, (chunk_id, _score) in enumerate(bm25_hits)}
    embed_rank_of = {c.chunk.chunk_id: c.embed_rank for c in embed_hits}
    embed_chunk_of = {c.chunk.chunk_id: c.chunk for c in embed_hits}

    all_ids = set(bm25_rank_of) | set(embed_rank_of)

    fused: list[RetrievedCandidate] = []
    for chunk_id in all_ids:
        bm25_rank = bm25_rank_of.get(chunk_id)
        embed_rank = embed_rank_of.get(chunk_id)

        score = 0.0
        if bm25_rank is not None:
            score += config.RRF_WEIGHT_BM25 * (1.0 / (config.RRF_K + bm25_rank))
        if embed_rank is not None:
            score += config.RRF_WEIGHT_EMBED * (1.0 / (config.RRF_K + embed_rank))

        chunk: Chunk | None = embed_chunk_of.get(chunk_id)
        if chunk is None:
            chunk = bm25_module.get_chunk(chunk_id)
        if chunk is None:
            continue  # chunk vanished between BM25 build and now — skip defensively

        fused.append(
            RetrievedCandidate(chunk=chunk, bm25_rank=bm25_rank, embed_rank=embed_rank, rrf_score=score)
        )

    fused.sort(key=lambda c: c.rrf_score, reverse=True)
    return fused[:k]
