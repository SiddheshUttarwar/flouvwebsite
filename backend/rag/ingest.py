"""Stage 1: ingest + normalize. Chunks a single source document's raw text
(from the kb_sidecar.json structured store, or the site-content export) into
Chunk objects with stable, source-attributable ids — the prerequisite for
real citations."""
import glob
import json
import os
from datetime import datetime, timezone

from . import config
from .schemas import Chunk


def load_sidecar_documents() -> list[dict]:
    """Returns a list of {filename, modified_time, raw_text, ingested_at} dicts,
    or [] if the sidecar doesn't exist yet (e.g. before the first Drive sync)."""
    if not os.path.exists(config.KB_SIDECAR_PATH):
        return []
    with open(config.KB_SIDECAR_PATH, "r", encoding="utf-8") as f:
        sidecar = json.load(f)
    return list(sidecar.values())


def load_site_content_documents() -> list[dict]:
    """Returns the site's own marketing copy (extracted from Industries,
    Technology, Home, About via scripts/extract-site-content.mjs) in the same
    {filename, raw_text, ingested_at} shape as a Drive sidecar document, so
    it flows through the exact same chunk/embed/citation pipeline. [] if the
    export hasn't been run yet (e.g. local dev before `npm run build`)."""
    if not os.path.isdir(config.SITE_CONTENT_DIR):
        return []
    now = datetime.now(timezone.utc).isoformat()
    docs = []
    for path in sorted(glob.glob(os.path.join(config.SITE_CONTENT_DIR, "*.txt"))):
        with open(path, "r", encoding="utf-8") as f:
            raw_text = f.read()
        docs.append({"filename": os.path.basename(path), "raw_text": raw_text, "ingested_at": now})
    return docs


def _split_oversized(paragraph: str, max_chars: int) -> list[str]:
    """Some PDFs extract with no blank-line breaks at all (PyPDF2 loses
    paragraph structure on certain layouts), so a single "paragraph" from
    the `\\n\\n`-split above can be an entire multi-page document — tens of
    thousands of characters. Without this, one such paragraph blows straight
    through target_chars, becomes one giant chunk, and eats the whole
    CONTEXT_MAX_CHARS budget by itself, silently pushing every other
    retrieved chunk out of what the model actually sees. Splits on the
    nearest whitespace before each max_chars boundary so words aren't cut."""
    if len(paragraph) <= max_chars:
        return [paragraph]
    pieces = []
    rest = paragraph
    while len(rest) > max_chars:
        split_at = rest.rfind(" ", 0, max_chars)
        if split_at <= 0:
            split_at = max_chars
        pieces.append(rest[:split_at].strip())
        rest = rest[split_at:].strip()
    if rest:
        pieces.append(rest)
    return pieces


def _group_paragraphs(paragraphs: list[str], target_chars: int, overlap_chars: int) -> list[str]:
    """Greedily packs consecutive paragraphs into ~target_chars-sized chunks,
    carrying the trailing paragraph(s) of one chunk forward into the start of
    the next so a fact split across a paragraph boundary still lands fully
    inside at least one chunk instead of being stranded alone in its own tiny
    chunk. Oversized paragraphs are pre-split (see _split_oversized) so no
    single chunk can still blow past target_chars."""
    if not paragraphs:
        return []

    paragraphs = [piece for para in paragraphs for piece in _split_oversized(para, target_chars)]

    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for para in paragraphs:
        if current and current_len + len(para) > target_chars:
            chunks.append("\n\n".join(current))

            overlap: list[str] = []
            overlap_len = 0
            for p in reversed(current):
                if overlap_len + len(p) > overlap_chars:
                    break
                overlap.insert(0, p)
                overlap_len += len(p)
            current, current_len = overlap, overlap_len

        current.append(para)
        current_len += len(para)

    if current:
        chunks.append("\n\n".join(current))
    return chunks


def normalize_and_chunk(doc: dict) -> list[Chunk]:
    """Groups a document's raw_text into ~CHUNK_TARGET_CHARS-sized chunks of
    consecutive paragraphs (with CHUNK_OVERLAP_CHARS of trailing-paragraph
    overlap between them), rather than one chunk per `\\n\\n`-separated
    paragraph. A single isolated paragraph is often too fragmentary to
    answer a question on its own — e.g. a PDF's "material is FEP" sentence
    landing in its own chunk, cut off from the surrounding paragraphs that
    would make it findable/interpretable — grouping keeps related content
    together so retrieval is far less sensitive to exactly where a fact
    happens to fall relative to a paragraph break."""
    filename = doc["filename"]
    raw_text = doc.get("raw_text", "")
    ingested_at = doc.get("ingested_at")

    paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > config.CHUNK_MIN_CHARS]
    grouped = _group_paragraphs(paragraphs, config.CHUNK_TARGET_CHARS, config.CHUNK_OVERLAP_CHARS)

    chunks: list[Chunk] = []
    for i, text in enumerate(grouped):
        chunks.append(
            Chunk(
                chunk_id=f"{filename}::{i}",
                text=text,
                source=filename,
                chunk_index=i,
                ingested_at=ingested_at,
            )
        )
    return chunks


def normalize_and_chunk_all() -> dict[str, list[Chunk]]:
    documents = load_sidecar_documents()
    return {doc["filename"]: normalize_and_chunk(doc) for doc in documents}
