import os
import io
import json
import logging
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import PyPDF2
from dotenv import load_dotenv

try:
    from .rag import config as rag_config
except ImportError:
    from rag import config as rag_config

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Same setup as rag/observability.py's logger — a plain StreamHandler so
# `print()`-style visibility survives in Render's log viewer, but now with
# timestamps/levels and consistent per-file lines instead of ad hoc prints
# (which also silently said nothing at all on a *successful* file, only on
# skip/failure — you could ever tell a sync ran and just did nothing).
logger = logging.getLogger("flouv.drive_sync")
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s"))
    logger.addHandler(_handler)
    logger.setLevel(logging.INFO)

# We only need read-only access to Drive files
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

# Folders never descended into during sync, by name (case-insensitive,
# whitespace-trimmed since Drive folder names in the wild carry stray
# trailing spaces) — matched anywhere in the tree, not just at the top level.
# This is the only thing standing between confidential/IP documents (patent
# filings, internal engineering detail, client-specific presentations) and a
# public chatbot that will happily quote whatever it's given to anonymous
# website visitors. Defaults reflect what's actually in the FloUV Shared
# Drive; override via env var if the folder structure changes.
_DEFAULT_EXCLUDED_FOLDERS = "FloUV - Technology & IP,Client Presentations,Design and Engineering"
EXCLUDED_FOLDER_NAMES = {
    name.strip().lower()
    for name in os.getenv("GOOGLE_DRIVE_EXCLUDE_FOLDER_NAMES", _DEFAULT_EXCLUDED_FOLDERS).split(",")
    if name.strip()
}

# All state files live next to this module rather than being resolved against
# the current working directory, so `alembic`/`uvicorn`/tests invoked from the
# repo root (instead of backend/) still read and write the same files.
_MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(rag_config.PERSIST_DIR, "processed_files.json")
# Structured per-document sidecar consumed by the RAG pipeline's ingest/normalize
# stage (backend/rag/ingest.py) — preserves real per-source-file boundaries so
# citations can point at an actual filename. Shares rag_config's path so both
# modules agree on where it lives once PERSIST_DIR is set.
SIDECAR_FILE = rag_config.KB_SIDECAR_PATH
# OAuth files — can't be re-obtained headlessly (the flow needs a browser),
# so on a persistent disk these must be uploaded once and then survive every
# restart/redeploy; without PERSIST_DIR they're wiped on every restart of a
# free-tier instance and must be re-uploaded each time.
TOKEN_FILE = os.path.join(rag_config.PERSIST_DIR, "token.json")
CREDENTIALS_FILE = os.path.join(rag_config.PERSIST_DIR, "credentials.json")

# Each worker thread gets its own Drive service — googleapiclient's service
# objects (and the http transport they wrap) aren't safe to share across
# threads, so a shared single instance would corrupt concurrent downloads.
_thread_local = threading.local()


def get_credentials():
    creds = None
    # token.json stores the user's access and refresh tokens
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                raise FileNotFoundError(
                    f"credentials.json not found! Please download your OAuth client ID credentials "
                    f"from Google Cloud Console and save it to {CREDENTIALS_FILE}."
                )
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    return creds


def _get_thread_service(creds):
    service = getattr(_thread_local, "service", None)
    if service is None:
        service = build('drive', 'v3', credentials=creds, cache_discovery=False)
        _thread_local.service = service
    return service


_FOLDER_MIME = "application/vnd.google-apps.folder"


def _resolve_drive_id(service, folder_id: str) -> str | None:
    """Returns folder_id itself if it's actually the root of a Shared Drive,
    else None. Shared Drive content is invisible to a plain files().list()
    parents-query unless supportsAllDrives/includeItemsFromAllDrives (and,
    for a shared-drive root specifically, corpora='drive' + driveId) are set
    — omitting them doesn't error, it just silently returns zero files, which
    looks identical to "the folder is empty"."""
    try:
        service.drives().get(driveId=folder_id).execute()
        return folder_id
    except Exception:
        return None


def _list_children(service, parent_id: str, drive_id: str | None) -> list[dict]:
    kwargs = dict(
        q=f"'{parent_id}' in parents and trashed=false",
        fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
        supportsAllDrives=True,
        includeItemsFromAllDrives=True,
    )
    if drive_id:
        kwargs["corpora"] = "drive"
        kwargs["driveId"] = drive_id

    items = []
    page_token = None
    while True:
        if page_token:
            kwargs["pageToken"] = page_token
        results = service.files().list(**kwargs).execute()
        items.extend(results.get("files", []))
        page_token = results.get("nextPageToken")
        if not page_token:
            break
    return items


def _list_all_files_recursive(service, root_id: str, drive_id: str | None) -> list[dict]:
    """BFS through root_id and every subfolder beneath it (except
    EXCLUDED_FOLDER_NAMES, never descended into), returning a flat list of
    every non-folder file found at any depth. The Drive folder here isn't a
    flat bucket of documents — it has real subfolder structure — so only
    listing direct children would silently skip most of the actual knowledge
    base."""
    all_files = []
    folders_to_visit = [root_id]
    while folders_to_visit:
        parent_id = folders_to_visit.pop()
        for item in _list_children(service, parent_id, drive_id):
            if item["mimeType"] == _FOLDER_MIME:
                if item["name"].strip().lower() in EXCLUDED_FOLDER_NAMES:
                    logger.info("SKIP  folder excluded from sync (IP/confidential): %s", item["name"])
                    continue
                folders_to_visit.append(item["id"])
            else:
                all_files.append(item)
    return all_files


def extract_pdf_text(file_stream):
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text


def _download_media(service, file_id) -> bytes:
    # export_media (Google Docs/Sheets, below) doesn't accept this param at
    # all — Drive API rejects it with a TypeError — but get_media (plain
    # files: text/PDF) needs it or a Shared Drive file 404s despite having
    # just been listed successfully.
    request = service.files().get_media(fileId=file_id, supportsAllDrives=True)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        _status, done = downloader.next_chunk()
    return fh.getvalue()


def _export_media(service, file_id, export_mime_type) -> bytes:
    request = service.files().export_media(fileId=file_id, mimeType=export_mime_type)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while done is False:
        _status, done = downloader.next_chunk()
    return fh.getvalue()


def _process_one_file(creds, item: dict) -> dict | None:
    """Runs in a worker thread: downloads + extracts text for a single Drive
    file. Returns a result dict, or None if the file was unsupported or failed
    (failures are logged and skipped rather than aborting the whole batch —
    one bad PDF shouldn't take down a 1000-file sync)."""
    service = _get_thread_service(creds)
    file_id = item['id']
    file_name = item['name']
    mime_type = item['mimeType']
    modified_time = item.get('modifiedTime', '')

    try:
        if mime_type == 'application/vnd.google-apps.document':
            content = _export_media(service, file_id, 'text/plain').decode('utf-8')
        elif mime_type == 'application/vnd.google-apps.spreadsheet':
            content = _export_media(service, file_id, 'text/csv').decode('utf-8')
        elif mime_type == 'text/plain':
            content = _download_media(service, file_id).decode('utf-8')
        elif mime_type == 'application/pdf':
            content = extract_pdf_text(io.BytesIO(_download_media(service, file_id)))
        else:
            logger.info("SKIP  (unsupported type %s): %s", mime_type, file_name)
            return None
    except Exception as e:
        logger.warning("FAIL  %s: %s", file_name, e)
        return None

    if not content.strip():
        # A PDF with no extractable text (scanned/image-only, no OCR here) or an
        # empty Doc "succeeds" technically but contributes nothing to the
        # knowledge base — worth its own log line, since it looks identical to
        # a real success in the state file otherwise.
        logger.warning("EMPTY (no extractable text): %s", file_name)
        return None

    logger.info("OK    ingested %s (%s, %d chars)", file_name, mime_type, len(content))
    return {
        "file_id": file_id,
        "filename": file_name,
        "modified_time": modified_time,
        "content": content,
    }


def load_folder_contents(progress_callback=None):
    """Lists every file in GOOGLE_DRIVE_FOLDER_ID, downloads+extracts text for
    any new/changed ones (concurrently, bounded by
    rag.config.DRIVE_DOWNLOAD_CONCURRENCY), and writes the results into
    kb_sidecar.json for the RAG pipeline's ingest stage to chunk + embed.

    progress_callback(done_count, total_count), if given, is called after each
    file finishes — used by rag.ingest_job to report progress on what can be a
    many-minute run against a 1000-file folder.
    """
    if not FOLDER_ID:
        raise ValueError("GOOGLE_DRIVE_FOLDER_ID is not set in the .env file")

    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds, cache_discovery=False)

    # Resolve and log the folder's actual name, not just its opaque ID — the
    # whole point of this log line is "am I even looking at the right
    # folder", which a raw ID string doesn't answer. Best-effort: a lookup
    # failure here (wrong ID, no access) shouldn't block the sync attempt
    # itself — the files().list() call right after will surface that error
    # properly if the folder is genuinely inaccessible.
    try:
        folder_meta = service.files().get(fileId=FOLDER_ID, fields="id, name", supportsAllDrives=True).execute()
        folder_name = folder_meta.get("name", "(unknown)")
    except Exception as e:
        # A Shared Drive root isn't addressable via files().get() the same
        # way a regular folder is — fall back to drives().get(), which _is_
        # how _resolve_drive_id (below) actually confirms it's a Shared Drive.
        try:
            drive_meta = service.drives().get(driveId=FOLDER_ID, fields="name").execute()
            folder_name = drive_meta.get("name", "(unknown)")
        except Exception:
            folder_name = "(could not resolve folder name)"
            logger.warning("Failed to look up folder metadata for id=%s: %s", FOLDER_ID, e)
    logger.info("Starting Drive sync — folder: '%s' (id: %s)", folder_name, FOLDER_ID)

    # Works for both a regular folder and a Shared Drive root — for the
    # latter, _resolve_drive_id detects it and _list_children adds the
    # required corpora/driveId params (a plain parents-query against a Shared
    # Drive silently returns zero files instead of erroring).
    drive_id = _resolve_drive_id(service, FOLDER_ID)
    if drive_id:
        logger.info("'%s' is a Shared Drive root — querying with Shared Drive support.", folder_name)
    items = _list_all_files_recursive(service, FOLDER_ID, drive_id)

    if not items:
        logger.info("Folder '%s' is empty (or contains no visible files) — nothing to sync.", folder_name)
        return 0, "No files found in the specified Google Drive folder."

    logger.info("Found %d file(s) in '%s':", len(items), folder_name)
    for item in items:
        logger.info("  seen: %s (%s)", item['name'], item['mimeType'])

    # Load previously processed files so we skip duplicates
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            state = json.load(f)
    else:
        state = {}

    to_process = [
        item for item in items
        if not (item['id'] in state and state[item['id']] == item.get('modifiedTime', ''))
    ]
    already_up_to_date = len(items) - len(to_process)

    if progress_callback:
        progress_callback(0, len(to_process))

    if not to_process:
        logger.info(
            "All %d file(s) already up to date (unchanged since last sync) — nothing to do.",
            already_up_to_date,
        )
        return 0, "All files are already up to date — nothing to sync!"

    logger.info(
        "%d file(s) new or changed since last sync, %d already up to date. Ingesting the %d...",
        len(to_process), already_up_to_date, len(to_process),
    )

    updated_state = state.copy()
    sidecar_updates = {}
    done_count = 0
    progress_lock = threading.Lock()

    with ThreadPoolExecutor(max_workers=rag_config.DRIVE_DOWNLOAD_CONCURRENCY) as pool:
        futures = [pool.submit(_process_one_file, creds, item) for item in to_process]
        for future in as_completed(futures):
            result = future.result()
            with progress_lock:
                done_count += 1
                if result:
                    updated_state[result["file_id"]] = result["modified_time"]
                    sidecar_updates[result["file_id"]] = {
                        "filename": result["filename"],
                        "modified_time": result["modified_time"],
                        "raw_text": result["content"],
                        "ingested_at": datetime.now(timezone.utc).isoformat(),
                    }
                if progress_callback:
                    progress_callback(done_count, len(to_process))

    files_processed = len(sidecar_updates)
    files_skipped_or_failed = len(to_process) - files_processed
    if files_processed == 0:
        logger.warning(
            "None of the %d attempted file(s) could be ingested — all were unsupported types, "
            "empty, or failed. See per-file lines above for which and why.",
            len(to_process),
        )
        return 0, "No files could be processed — all downloads failed or were unsupported types."

    # Persist the structured per-document sidecar the RAG pipeline chunks from.
    if os.path.exists(SIDECAR_FILE):
        with open(SIDECAR_FILE, "r", encoding="utf-8") as f:
            sidecar = json.load(f)
    else:
        sidecar = {}
    sidecar.update(sidecar_updates)
    with open(SIDECAR_FILE, "w", encoding="utf-8") as f:
        json.dump(sidecar, f)

    # Only mark files as processed once the sidecar write above succeeded, so a
    # crash mid-write retries these files next sync instead of silently skipping them.
    with open(STATE_FILE, "w") as f:
        json.dump(updated_state, f)

    logger.info(
        "Sync complete: %d ingested, %d skipped/failed, %d already up to date (%d found in folder total).",
        files_processed, files_skipped_or_failed, already_up_to_date, len(items),
    )
    return files_processed, f"✅ {files_processed} file{'s' if files_processed != 1 else ''} successfully synced!"


if __name__ == '__main__':
    load_folder_contents()
