import os
import io
import json
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

# We only need read-only access to Drive files
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")

# All state files live next to this module rather than being resolved against
# the current working directory, so `alembic`/`uvicorn`/tests invoked from the
# repo root (instead of backend/) still read and write the same files.
_MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(_MODULE_DIR, "processed_files.json")
# Structured per-document sidecar consumed by the RAG pipeline's ingest/normalize
# stage (backend/rag/ingest.py) — preserves real per-source-file boundaries so
# citations can point at an actual filename.
SIDECAR_FILE = os.path.join(_MODULE_DIR, "kb_sidecar.json")
TOKEN_FILE = os.path.join(_MODULE_DIR, "token.json")
CREDENTIALS_FILE = os.path.join(_MODULE_DIR, "credentials.json")

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
                raise FileNotFoundError("credentials.json not found! Please download your OAuth client ID credentials from Google Cloud Console and save it as backend/credentials.json.")
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


def extract_pdf_text(file_stream):
    reader = PyPDF2.PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text


def _download_media(service, file_id) -> bytes:
    request = service.files().get_media(fileId=file_id)
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
            print(f"Skipping unsupported MIME type: {mime_type} for file {file_name}")
            return None
    except Exception as e:
        print(f"Failed to process {file_name}: {e}")
        return None

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

    # Query for all files in the folder, paginating through all results
    query = f"'{FOLDER_ID}' in parents and trashed=false"
    items = []
    page_token = None
    while True:
        kwargs = dict(q=query, fields="nextPageToken, files(id, name, mimeType, modifiedTime)")
        if page_token:
            kwargs["pageToken"] = page_token
        results = service.files().list(**kwargs).execute()
        items.extend(results.get('files', []))
        page_token = results.get('nextPageToken')
        if not page_token:
            break

    if not items:
        print("No files found in the specified Google Drive folder.")
        return 0, "No files found in the specified Google Drive folder."

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

    if progress_callback:
        progress_callback(0, len(to_process))

    if not to_process:
        print("No new or updated files found in Google Drive. Knowledge base is already up to date!")
        return 0, "All files are already up to date — nothing to sync!"

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
    if files_processed == 0:
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

    return files_processed, f"✅ {files_processed} file{'s' if files_processed != 1 else ''} successfully synced!"


if __name__ == '__main__':
    load_folder_contents()
