"""Stage 7: hallucination fallback. Decides whether the generated answer is
grounded enough to serve, and provides the fixed safe response when it isn't."""
from . import config
from .schemas import GenerationOutput


def should_fallback(
    generation_output: GenerationOutput | None, aggregate_confidence: float, num_chunks_retrieved: int
) -> bool:
    if num_chunks_retrieved == 0:
        return True
    if generation_output is None:
        return True  # generation itself failed/raised
    if generation_output.insufficient_context:
        return True
    if aggregate_confidence < config.CONFIDENCE_FALLBACK_THRESHOLD:
        return True
    return False


def serialize_safe_response() -> str:
    return config.FALLBACK_TEXT
