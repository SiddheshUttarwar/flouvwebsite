"""Stage 5 + 6: constrained generation + citation-backed responses.

Uses Gemini's structured-output JSON schema (not the old free-text
"emit imagefile ||| answer" prompt) so the image choice is enum-enforced at the
API level rather than hoped-for via prompt instructions. The result is then
serialized back into the legacy `imagefile.png ||| markdown` string the
frontend already parses, so the external contract is unchanged.

Uses the Interactions API (client.interactions.create), Gemini's current
generation surface — not the older generate_content method. Notably, this API
has no `temperature` parameter (removed in favor of thinking_level/seed)."""
import json
import os
import re
from google import genai

from . import config
from .schemas import ScoredChunk, GenerationOutput, Citation

_client = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=os.getenv("GEMINI_API_KEY") or "missing")
    return _client


_GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "image": {"type": "string", "enum": list(config.VALID_IMAGES)},
        "answer_markdown": {"type": "string"},
        "insufficient_context": {"type": "boolean"},
    },
    "required": ["image", "answer_markdown", "insufficient_context"],
}

_SYSTEM_PROMPT = (
    "You are FloUV's highly professional, empathetic customer support agent. "
    "Use ONLY the numbered context passages below to answer — do not use outside "
    "knowledge. Every factual claim you make must be backed by a passage: reference it "
    "inline in `answer_markdown` using bracket markers like [1], [2] matching passage "
    "numbers. If the passages don't contain enough information to answer confidently, set "
    "`insufficient_context` to true and keep `answer_markdown` brief — do not guess or "
    "use outside knowledge to fill gaps. Choose the single image filename that best fits "
    "the topic: 'dairy.png' for milk/dairy, 'water.png' for water/juice/beverage, or "
    "'uv.png' for general UV technology/science or when insufficient_context is true."
)


def _build_context_block(scored: list[ScoredChunk]) -> str:
    parts = []
    for i, s in enumerate(scored, start=1):
        chunk = s.reranked.candidate.chunk
        parts.append(f"[{i}] (chunk_id: {chunk.chunk_id}, source: {chunk.source})\n{chunk.text}")
    return "\n\n".join(parts)[: config.CONTEXT_MAX_CHARS]


def _history_to_input_steps(history: list[dict]) -> list[dict]:
    """Maps this app's {"role": "user"|"assistant", "content": str} history
    shape onto the Interactions API's step format."""
    steps = []
    for msg in history:
        step_type = "user_input" if msg["role"] == "user" else "model_output"
        steps.append({"type": step_type, "content": [{"type": "text", "text": msg["content"]}]})
    return steps


def generate(
    query: str, scored: list[ScoredChunk], history: list[dict]
) -> tuple[GenerationOutput, dict]:
    """Returns (GenerationOutput, usage_dict). Raises on unrecoverable failure —
    caller (pipeline.py) is responsible for catching and routing to fallback."""
    context = _build_context_block(scored) if scored else "No relevant context was found."
    system_instruction = f"{_SYSTEM_PROMPT}\n\n--- CONTEXT ---\n{context}"

    input_steps = _history_to_input_steps(history[-config.CHAT_HISTORY_LIMIT :])
    input_steps.append(
        {"type": "user_input", "content": [{"type": "text", "text": query[: config.CHAT_QUERY_MAX_CHARS]}]}
    )

    interaction = _get_client().interactions.create(
        model=config.GENERATION_MODEL,
        system_instruction=system_instruction,
        input=input_steps,
        generation_config={"max_output_tokens": config.GENERATION_MAX_TOKENS},
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema_": _GENERATION_SCHEMA,
        },
    )
    parsed = json.loads(interaction.output_text)
    output = GenerationOutput(**parsed)
    usage = {
        "prompt_tokens": interaction.usage.total_input_tokens if interaction.usage else 0,
        "completion_tokens": interaction.usage.total_output_tokens if interaction.usage else 0,
    }
    return output, usage


_MARKER_RE = re.compile(r"\[(\d+)\]")


def build_citations(output: GenerationOutput, scored: list[ScoredChunk]) -> list[Citation]:
    """Citations come from the [N] markers the model writes inline in
    answer_markdown, mapped back to the Nth passage in the numbered context
    block (1-indexed, same numbering shown to the model in _build_context_block)."""
    citations: list[Citation] = []
    seen_sources: set[tuple[str, int]] = set()

    def _add(scored_chunk: ScoredChunk) -> None:
        chunk = scored_chunk.reranked.candidate.chunk
        key = (chunk.source, chunk.chunk_index)
        if key in seen_sources:
            return
        seen_sources.add(key)
        citations.append(
            Citation(
                marker=f"[{len(citations) + 1}]",
                source=chunk.source,
                chunk_index=chunk.chunk_index,
                snippet=chunk.text[:200],
                confidence=scored_chunk.confidence,
            )
        )

    for match in _MARKER_RE.finditer(output.answer_markdown):
        passage_num = int(match.group(1))
        if 1 <= passage_num <= len(scored):
            _add(scored[passage_num - 1])

    return citations


def serialize_legacy(output: GenerationOutput, citations: list[Citation]) -> str:
    body = output.answer_markdown
    if citations:
        sources_lines = "\n".join(f"{c.marker} {c.source}" for c in citations)
        body = f"{body}\n\n**Sources:**\n{sources_lines}"
    return f"{output.image} ||| {body}"
