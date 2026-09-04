"""Runs Drive ingestion as a background job instead of inside the HTTP request
that triggers it. A folder with hundreds-to-a-thousand files can take minutes
to sync (Drive downloads + embedding calls) — far past any reasonable proxy/
browser timeout — and a blocking request also gives no visibility into
progress or partial failure. /api/ingest-gdrive starts a job and returns
immediately; /api/ingest-gdrive/status polls this module's state.

Single-process, in-memory job state: fine for this app's one-admin-triggers-a-
sync-occasionally usage, but it does NOT survive a process restart and isn't
shared across multiple instances. If ingestion needs to run from more than one
instance/process, this needs to move to a shared store (DB row, Redis, etc.)
instead of the module-level dict below.
"""
import threading
import traceback
from datetime import datetime, timezone

from . import ingest as rag_ingest
from . import vector_store
from . import bm25_index

try:
    from .. import drive_loader
    from ..database import SessionLocal
    from .. import models
except ImportError:
    import drive_loader
    from database import SessionLocal
    import models

_lock = threading.Lock()
_state = {
    "status": "idle",  # idle | running | done | error
    "total_files": 0,
    "downloaded_files": 0,
    "files_processed": 0,
    "chunks_indexed": 0,
    "message": None,
    "error": None,
    "started_at": None,
    "finished_at": None,
}
_run_started_at: datetime | None = None


def _persist_sync_run(status: str, files_processed: int, chunks_indexed: int, message: str | None, error: str | None):
    """Runs in the background thread, outside any request's DB session, so it
    opens and closes its own — this is history for the dashboard, not
    something the triggering request waits on."""
    db = SessionLocal()
    try:
        db.add(models.SyncRun(
            status=status,
            files_processed=files_processed,
            chunks_indexed=chunks_indexed,
            message=message,
            error=error,
            started_at=_run_started_at,
            finished_at=datetime.now(timezone.utc).replace(tzinfo=None),
        ))
        db.commit()
    finally:
        db.close()


def get_status() -> dict:
    with _lock:
        return dict(_state)


def _update(**kwargs):
    with _lock:
        _state.update(kwargs)


def start_ingest_job() -> bool:
    """Starts a background ingest run. Returns False (does nothing) if a job
    is already running, so callers can't accidentally fire two concurrent
    syncs against the same sidecar/vector store files."""
    global _run_started_at
    with _lock:
        if _state["status"] == "running":
            return False
        _run_started_at = datetime.now(timezone.utc).replace(tzinfo=None)
        _state.update(
            status="running",
            total_files=0,
            downloaded_files=0,
            files_processed=0,
            chunks_indexed=0,
            message=None,
            error=None,
            started_at=_run_started_at.isoformat(),
            finished_at=None,
        )
    threading.Thread(target=_run, daemon=True).start()
    return True


def _run():
    try:
        def on_progress(done, total):
            _update(downloaded_files=done, total_files=total)

        files_processed, message = drive_loader.load_folder_contents(progress_callback=on_progress)

        # Stage 1: ingest + normalize, from the structured sidecar (not a merged blob)
        documents = rag_ingest.load_sidecar_documents()
        all_chunks = []
        for doc in documents:
            chunks = rag_ingest.normalize_and_chunk(doc)
            vector_store.delete_by_source(doc["filename"])
            all_chunks.extend(chunks)

        # One batched upsert across every document's chunks, instead of one
        # embedding call per document — see vector_store.upsert_chunks.
        vector_store.upsert_chunks(all_chunks)
        bm25_index.rebuild()

        _update(
            status="done",
            files_processed=files_processed,
            chunks_indexed=len(all_chunks),
            message=message,
            finished_at=datetime.now(timezone.utc).isoformat(),
        )
        _persist_sync_run("done", files_processed, len(all_chunks), message, None)
    except Exception as e:
        traceback.print_exc()
        _update(
            status="error",
            error=str(e),
            finished_at=datetime.now(timezone.utc).isoformat(),
        )
        _persist_sync_run("error", _state.get("files_processed", 0), _state.get("chunks_indexed", 0), None, str(e))
