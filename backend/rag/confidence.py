"""Stage 4: source confidence scoring."""
from . import config
from .schemas import RerankedCandidate, ScoredChunk


def score_confidence(reranked: list[RerankedCandidate]) -> list[ScoredChunk]:
    scored: list[ScoredChunk] = []
    for r in reranked:
        base = max(0.0, min(1.0, r.llm_relevance_score / 10.0))
        found_by_both = r.candidate.bm25_rank is not None and r.candidate.embed_rank is not None
        bonus = config.CONFIDENCE_AGREEMENT_BONUS if found_by_both else 0.0
        confidence = min(1.0, base + bonus)
        scored.append(ScoredChunk(reranked=r, confidence=confidence))
    return scored


def aggregate_confidence(scored: list[ScoredChunk]) -> float:
    if not scored:
        return 0.0
    top = max(s.confidence for s in scored)
    strong_count = sum(1 for s in scored if s.confidence >= config.CONFIDENCE_PER_CHUNK_FLOOR)
    if strong_count < 2:
        top = max(0.0, top - config.CONFIDENCE_WEAK_CONSENSUS_PENALTY)
    return top
