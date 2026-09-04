"""Stage 1: ingest + normalize. Chunks a single source document's raw text
(from the kb_sidecar.json structured store) into Chunk objects with stable,
source-attributable ids — the prerequisite for real citations."""
import json
import os

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


def normalize_and_chunk(doc: dict) -> list[Chunk]:
    """Splits one document's raw_text into paragraph-level chunks. Reuses the
    same `\\n\\n`-split + length-filter heuristic as the original prototype
    (a reasonable default for prose/markdown), but with NO cap on chunk count —
    the cap existed only to bound the old brute-force cosine scan, which ANN
    search (ChromaDB) no longer needs."""
    filename = doc["filename"]
    raw_text = doc.get("raw_text", "")
    ingested_at = doc.get("ingested_at")

    paragraphs = [p.strip() for p in raw_text.split("\n\n") if len(p.strip()) > config.CHUNK_MIN_CHARS]

    chunks: list[Chunk] = []
    for i, para in enumerate(paragraphs):
        chunks.append(
            Chunk(
                chunk_id=f"{filename}::{i}",
                text=para,
                source=filename,
                chunk_index=i,
                ingested_at=ingested_at,
            )
        )
    return chunks


def normalize_and_chunk_all() -> dict[str, list[Chunk]]:
    documents = load_sidecar_documents()
    return {doc["filename"]: normalize_and_chunk(doc) for doc in documents}
