"""Pydantic models shared across the RAG pipeline stages."""
from typing import Optional
from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: str  # f"{source}::{chunk_index}"
    text: str
    source: str
    chunk_index: int
    ingested_at: Optional[str] = None


class RetrievedCandidate(BaseModel):
    chunk: Chunk
    bm25_rank: Optional[int] = None
    embed_rank: Optional[int] = None
    rrf_score: float = 0.0


class RerankedCandidate(BaseModel):
    candidate: RetrievedCandidate
    llm_relevance_score: float  # 0..10, as scored by the reranker model


class ScoredChunk(BaseModel):
    reranked: RerankedCandidate
    confidence: float  # 0..1


class GenerationOutput(BaseModel):
    answer_markdown: str
    insufficient_context: bool


class Citation(BaseModel):
    marker: str  # e.g. "[1]"
    source: str
    chunk_index: int
    snippet: str
    confidence: float


class ChatApiResponse(BaseModel):
    answer: str
    session_id: str
    citations: list[Citation] = []
    confidence: float = 0.0
    fallback: bool = False
    trace_id: Optional[int] = None
