import os
import shutil
import uuid
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

# Support both launch styles: as a package (`backend.main`, used by Alembic and
# `uvicorn backend.main:app` from repo root) and as a top-level module
# (`uvicorn main:app` with backend/ as the working directory).
try:
    from . import models, schemas, email_notify, signups, report_pdf
    from .database import engine, get_db
    from .rag import config as rag_config
except ImportError:
    import models, schemas, email_notify, signups, report_pdf
    from database import engine, get_db
    from rag import config as rag_config

# Uploads live under PERSIST_DIR (a Render attached disk, when configured) so
# they survive restarts/redeploys instead of the ephemeral container
# filesystem. On first boot against an empty disk, seed it from the repo's
# checked-in defaults (blog images etc.) so nothing 404s before anyone
# re-uploads through /admin.
UPLOAD_DIR = os.path.join(rag_config.PERSIST_DIR, "uploads")
_repo_upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(UPLOAD_DIR) and os.path.isdir(_repo_upload_dir):
    shutil.copytree(_repo_upload_dir, UPLOAD_DIR)
else:
    os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="FloUV API", version="1.0.0")

try:
    from .auth import router as auth_router, verify_token
except ImportError:
    from auth import router as auth_router, verify_token
app.include_router(auth_router)

# Mount static files for images so frontend can access them via URL
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Allow the Vite frontend to talk to the backend. In prod the frontend is
# served from this same FastAPI app (same-origin, CORS irrelevant), but
# CORS_ORIGINS lets you add real cross-origin hosts without a code change.
_default_origins = [
    "http://localhost:5174", "http://localhost:5173",
    "http://127.0.0.1:5174", "http://127.0.0.1:5173",
]
_cors_env = os.getenv("CORS_ORIGINS")
allow_origins = [o.strip() for o in _cors_env.split(",") if o.strip()] if _cors_env else _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    # Render (and most PaaS) terminate TLS at a proxy in front of this
    # process, so the request arrives here as plain HTTP with the original
    # scheme recorded in X-Forwarded-Proto — check that instead of
    # request.url.scheme, and only send HSTS when the visitor actually
    # connected over HTTPS (sending it for local http://localhost dev would
    # make browsers remember to force HTTPS there afterward).
    forwarded_proto = request.headers.get("x-forwarded-proto", request.url.scheme)
    if forwarded_proto == "https":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _check_rate_limit(request: Request, store: dict, limit: int, window_seconds: int):
    """Simple in-memory sliding-window limiter, keyed by client IP."""
    ip = _client_ip(request)
    now = time.time()
    dq = store[ip]
    while dq and dq[0] < now - window_seconds:
        dq.popleft()
    if len(dq) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please slow down and try again shortly.")
    dq.append(now)


# --- FILE UPLOADS ---
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_UPLOAD_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}

@app.post("/api/upload", dependencies=[Depends(verify_token)])
async def upload_image(file: UploadFile = File(...)):
    original_name = file.filename or "upload"
    ext = os.path.splitext(original_name)[1].lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_UPLOAD_EXTENSIONS))}",
        )

    # Sanitize the filename to prevent path traversal, and prefix a short uuid
    # so concurrent uploads of the same name don't collide.
    safe_name = os.path.basename(original_name)
    safe_name = f"{uuid.uuid4().hex[:8]}_{safe_name}"
    file_location = os.path.join(UPLOAD_DIR, safe_name)

    size = 0
    try:
        with open(file_location, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File too large. Max size is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB.",
                    )
                buffer.write(chunk)
    except HTTPException:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise

    # Return a relative URL so it works on any host (API and frontend are same-origin in prod)
    return {"url": f"/uploads/{safe_name}"}

# --- BLOG ENDPOINTS ---

import json

def to_blog_response(db_blog):
    points_list = [p.point_text for p in db_blog.points]
    categories_list = [c.name for c in db_blog.categories]
    legacy_category = categories_list[0] if categories_list else "Uncategorized"
    
    return schemas.BlogResponse(
        id=db_blog.id,
        title=db_blog.title,
        date=db_blog.date,
        category=legacy_category,
        image=db_blog.image,
        content=db_blog.content,
        points=json.dumps(points_list),
        categories=json.dumps(categories_list)
    )

def sync_relations(db, db_blog, blog_schema):
    try:
        points_list = json.loads(blog_schema.points) if blog_schema.points else []
        if not isinstance(points_list, list):
            raise ValueError("must be a JSON array")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid 'points' field, expected a JSON array: {e}")

    try:
        categories_list = json.loads(blog_schema.categories) if blog_schema.categories else []
        if not isinstance(categories_list, list):
            raise ValueError("must be a JSON array")
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid 'categories' field, expected a JSON array: {e}")

    if blog_schema.category and blog_schema.category not in categories_list:
        categories_list.append(blog_schema.category)
        
    db_blog.points = []
    for pt in points_list:
        db_blog.points.append(models.BlogPoint(point_text=pt))
        
    db_blog.categories = []
    for cat_name in categories_list:
        db_cat = db.query(models.Category).filter(models.Category.name == cat_name).first()
        if not db_cat:
            db_cat = models.Category(name=cat_name)
            db.add(db_cat)
        db_blog.categories.append(db_cat)

@app.get("/api/blogs", response_model=List[schemas.BlogResponse])
def get_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).offset(skip).limit(limit).all()
    return [to_blog_response(b) for b in blogs]

@app.get("/api/blogs/{blog_id}", response_model=schemas.BlogResponse)
def get_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return to_blog_response(blog)

@app.post("/api/blogs", response_model=schemas.BlogResponse, dependencies=[Depends(verify_token)])
def create_blog(blog: schemas.BlogCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_blog = models.Blog(
        title=blog.title,
        date=blog.date,
        image=blog.image,
        content=blog.content
    )
    sync_relations(db, db_blog, blog)
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    # Only on creation — never on update/delete, by design.
    background_tasks.add_task(email_notify.send_newsletter_for_new_blog, db_blog.id, db_blog.title)
    return to_blog_response(db_blog)

@app.put("/api/blogs/{blog_id}", response_model=schemas.BlogResponse, dependencies=[Depends(verify_token)])
def update_blog(blog_id: int, blog: schemas.BlogCreate, db: Session = Depends(get_db)):
    db_blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if db_blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db_blog.title = blog.title
    db_blog.date = blog.date
    db_blog.image = blog.image
    db_blog.content = blog.content
    
    sync_relations(db, db_blog, blog)
    
    db.commit()
    db.refresh(db_blog)
    return to_blog_response(db_blog)

@app.delete("/api/blogs/{blog_id}", dependencies=[Depends(verify_token)])
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"ok": True}


# --- INQUIRY / CONTACT FORM SUBMISSIONS ---
# The frontend's InquiryModal also opens a mailto: draft, but that silently
# does nothing if the visitor has no mail client configured. Persisting the
# submission server-side means the lead is never lost.
INQUIRY_RATE_LIMIT = 5
INQUIRY_RATE_WINDOW = 10 * 60  # 10 minutes
_inquiry_requests = defaultdict(deque)

@app.post("/api/inquiries", response_model=schemas.InquiryResponse)
def create_inquiry(inquiry: schemas.InquiryCreate, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    _check_rate_limit(request, _inquiry_requests, INQUIRY_RATE_LIMIT, INQUIRY_RATE_WINDOW)
    db_inquiry = models.Inquiry(**inquiry.model_dump())
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    signups.record_signup(db, db_inquiry.email, db_inquiry.mode)
    # Runs after the response is sent, so a slow/failed SMTP call never
    # delays or breaks the visitor's form submission — the lead is already
    # safely persisted above regardless of whether this email goes out.
    background_tasks.add_task(email_notify.send_inquiry_notification, db_inquiry, extra_to=db_inquiry.notify_email)
    return db_inquiry

@app.get("/api/inquiries", response_model=List[schemas.InquiryResponse], dependencies=[Depends(verify_token)])
def list_inquiries(skip: int = 0, limit: int = 100, mode: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Inquiry)
    if mode:
        query = query.filter(models.Inquiry.mode == mode)
    return query.order_by(models.Inquiry.id.desc()).offset(skip).limit(limit).all()

# --- NEWSLETTER SIGNUP (footer form) ---
NEWSLETTER_RATE_LIMIT = 5
NEWSLETTER_RATE_WINDOW = 10 * 60  # 10 minutes
_newsletter_requests = defaultdict(deque)

@app.post("/api/newsletter-signup")
def newsletter_signup(payload: schemas.NewsletterSignupCreate, request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(request, _newsletter_requests, NEWSLETTER_RATE_LIMIT, NEWSLETTER_RATE_WINDOW)
    signups.record_signup(db, payload.email, "newsletter")
    return {"ok": True}

@app.get("/api/signups", response_model=List[schemas.SignUpResponse], dependencies=[Depends(verify_token)])
def list_signups(skip: int = 0, limit: int = 100, source: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.SignUp)
    if source:
        query = query.filter(models.SignUp.source == source)
    return query.order_by(models.SignUp.id.desc()).offset(skip).limit(limit).all()

@app.patch("/api/inquiries/{inquiry_id}", response_model=schemas.InquiryResponse, dependencies=[Depends(verify_token)])
def update_inquiry(inquiry_id: int, update: schemas.InquiryUpdate, db: Session = Depends(get_db)):
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if inquiry is None:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry.handled = update.handled
    db.commit()
    db.refresh(inquiry)
    return inquiry


# --- ADMIN ANALYTICS (chatbot usage/cost, from the RagTrace row logged per /api/chat call) ---
@app.get("/api/admin/traces", response_model=List[schemas.TraceResponse], dependencies=[Depends(verify_token)])
def list_traces(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(models.RagTrace).order_by(models.RagTrace.id.desc()).offset(skip).limit(limit).all()

@app.get("/api/admin/stats", response_model=schemas.AdminStatsResponse, dependencies=[Depends(verify_token)])
def get_admin_stats(days: int = 30, db: Session = Depends(get_db)):
    # RagTrace.created_at is a naive DateTime column (SQLite has no real
    # timezone-aware type) — comparing it against a tz-aware cutoff would
    # format the bind param with a "+00:00" suffix SQLite never wrote for the
    # stored rows, silently breaking the comparison. Strip tzinfo to match.
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).replace(tzinfo=None)
    traces = (
        db.query(models.RagTrace)
        .filter(models.RagTrace.created_at >= cutoff)
        .order_by(models.RagTrace.created_at.asc())
        .all()
    )

    total_messages = len(traces)
    total_cost = sum(t.cost_estimate_usd or 0.0 for t in traces)
    fallback_count_total = sum(1 for t in traces if t.fallback_triggered)
    # Confidence is meaningless (0.0) on fallback turns by design (pipeline.py sets
    # final_confidence=0.0 when should_fallback fires) — averaging those in would
    # understate how confident the model actually is on turns it DID answer, so
    # only non-fallback turns count toward this average.
    confident_scores = [t.aggregate_confidence for t in traces if not t.fallback_triggered and t.aggregate_confidence is not None]

    daily_map: dict[str, dict] = {}
    stage_totals: dict[str, list[float]] = {}
    source_counts: dict[str, int] = {}
    for t in traces:
        day = (t.created_at or datetime.now(timezone.utc)).strftime("%Y-%m-%d")
        bucket = daily_map.setdefault(day, {"date": day, "messages": 0, "cost_usd": 0.0, "fallback_count": 0})
        bucket["messages"] += 1
        bucket["cost_usd"] += t.cost_estimate_usd or 0.0
        if t.fallback_triggered:
            bucket["fallback_count"] += 1

        for stage, ms in (t.stage_timings or {}).items():
            stage_totals.setdefault(stage, []).append(ms)

        for citation in (t.citations or []):
            source = citation.get("source") if isinstance(citation, dict) else None
            if source:
                source_counts[source] = source_counts.get(source, 0) + 1

    avg_stage_timings = {stage: round(sum(vals) / len(vals), 1) for stage, vals in stage_totals.items()}
    top_sources = sorted(
        (schemas.CitationStat(source=s, citation_count=c) for s, c in source_counts.items()),
        key=lambda x: x.citation_count,
        reverse=True,
    )[:10]

    return schemas.AdminStatsResponse(
        total_messages=total_messages,
        total_cost_usd=round(total_cost, 6),
        avg_confidence=round(sum(confident_scores) / len(confident_scores), 4) if confident_scores else 0.0,
        fallback_rate=round(fallback_count_total / total_messages, 4) if total_messages else 0.0,
        daily=[schemas.DailyStat(**{**b, "cost_usd": round(b["cost_usd"], 6)}) for b in sorted(daily_map.values(), key=lambda d: d["date"])],
        avg_stage_timings_ms=avg_stage_timings,
        top_sources=top_sources,
    )

@app.get("/api/admin/sessions/{session_id}/messages", response_model=schemas.SessionTranscriptResponse, dependencies=[Depends(verify_token)])
def get_session_transcript(session_id: str, db: Session = Depends(get_db)):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.id.asc())
        .all()
    )
    return schemas.SessionTranscriptResponse(session_id=session_id, messages=messages)

from typing import Optional
from dotenv import load_dotenv

# Load env variables from backend/.env — must happen before any `rag` submodule
# reads GEMINI_API_KEY at import/call time.
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

try:
    from . import rag as _rag_pkg  # noqa: F401  (ensures package init runs first)
    from .rag import pipeline as rag_pipeline
    from .rag import ingest_job as rag_ingest_job
except ImportError:
    import rag as _rag_pkg  # noqa: F401
    from rag import pipeline as rag_pipeline
    from rag import ingest_job as rag_ingest_job

try:
    from . import drive_loader
    from .rag import config as rag_config
    from .rag import ingest as rag_ingest
    from .rag import vector_store as rag_vector_store
except ImportError:
    import drive_loader
    from rag import config as rag_config
    from rag import ingest as rag_ingest
    from rag import vector_store as rag_vector_store

# --- RAG CHATBOT ---
# Full 10-stage pipeline (ingest+normalize, hybrid retrieval, rerank, confidence
# scoring, constrained generation, citations, hallucination fallback, evals,
# caching+memory, observability) lives in backend/rag/ — these routes are thin
# delegation. See backend/rag/pipeline.py for the orchestration.

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ReportRequest(BaseModel):
    session_id: str

# Both endpoints are intentionally public (anonymous site visitors use the
# chatbot), so they're the only thing standing between an open internet and
# your Gemini API bill — rate-limit them per IP.
CHAT_RATE_LIMIT = 15
CHAT_RATE_WINDOW = 60  # seconds
_chat_requests = defaultdict(deque)

REPORT_RATE_LIMIT = 5
REPORT_RATE_WINDOW = 60
_report_requests = defaultdict(deque)

@app.post("/api/ingest-gdrive", status_code=202, dependencies=[Depends(verify_token)])
def ingest_gdrive():
    # The Drive folder can hold hundreds-to-thousands of files — syncing runs
    # as a background job (rag/ingest_job.py) instead of blocking this request,
    # which would otherwise run for minutes and hit a proxy/browser timeout
    # long before finishing. Poll /api/ingest-gdrive/status for progress.
    started = rag_ingest_job.start_ingest_job()
    if not started:
        raise HTTPException(status_code=409, detail="An ingestion job is already running.")
    return {"status": "started", "message": "Ingestion started — poll /api/ingest-gdrive/status for progress."}

@app.get("/api/ingest-gdrive/status", dependencies=[Depends(verify_token)])
def ingest_gdrive_status():
    return rag_ingest_job.get_status()


# --- KNOWLEDGE BASE CONTENTS + SYNC HISTORY ---
@app.get("/api/admin/kb-documents", response_model=List[schemas.KBDocument], dependencies=[Depends(verify_token)])
def list_kb_documents():
    documents = rag_ingest.load_sidecar_documents()  # from kb_sidecar.json — what Drive sync last extracted
    chunk_counts: dict[str, int] = {}
    for chunk in rag_vector_store.get_all_chunks():  # what's actually indexed right now
        chunk_counts[chunk.source] = chunk_counts.get(chunk.source, 0) + 1

    return [
        schemas.KBDocument(
            filename=doc["filename"],
            modified_time=doc.get("modified_time"),
            ingested_at=doc.get("ingested_at"),
            chunk_count=chunk_counts.get(doc["filename"], 0),
        )
        for doc in sorted(documents, key=lambda d: d["filename"])
    ]

@app.get("/api/admin/sync-history", response_model=List[schemas.SyncRunResponse], dependencies=[Depends(verify_token)])
def list_sync_history(limit: int = 20, db: Session = Depends(get_db)):
    return db.query(models.SyncRun).order_by(models.SyncRun.id.desc()).limit(limit).all()


# --- SYSTEM HEALTH + STORAGE ---
def _dir_size_bytes(path: str) -> int:
    if not os.path.isdir(path):
        return 0
    total = 0
    for dirpath, _dirnames, filenames in os.walk(path):
        for f in filenames:
            try:
                total += os.path.getsize(os.path.join(dirpath, f))
            except OSError:
                pass
    return total

@app.get("/api/admin/health", response_model=schemas.HealthResponse, dependencies=[Depends(verify_token)])
def get_health():
    gemini_key = os.getenv("GEMINI_API_KEY")
    checks = [
        schemas.HealthCheck(
            name="Gemini API key",
            ok=bool(gemini_key),
            detail="Configured" if gemini_key else "GEMINI_API_KEY is not set — chat/embeddings/report will fail",
        ),
        schemas.HealthCheck(
            name="Google Drive OAuth token",
            ok=os.path.exists(drive_loader.TOKEN_FILE),
            detail="token.json present" if os.path.exists(drive_loader.TOKEN_FILE) else "token.json missing — complete the OAuth flow locally and upload it (can't be done headless on a server)",
        ),
        schemas.HealthCheck(
            name="Google Drive OAuth client secret",
            ok=os.path.exists(drive_loader.CREDENTIALS_FILE),
            detail="credentials.json present" if os.path.exists(drive_loader.CREDENTIALS_FILE) else "credentials.json missing",
        ),
        schemas.HealthCheck(
            name="Drive folder configured",
            ok=bool(drive_loader.FOLDER_ID),
            detail="Configured" if drive_loader.FOLDER_ID else "GOOGLE_DRIVE_FOLDER_ID is not set",
        ),
        schemas.HealthCheck(
            name="Admin password",
            ok=os.getenv("ADMIN_PASSWORD", "flouvadmin") != "flouvadmin",
            detail="Custom password set" if os.getenv("ADMIN_PASSWORD", "flouvadmin") != "flouvadmin" else "Still using the default password — change ADMIN_PASSWORD before going to production",
        ),
    ]

    db_url = engine.url
    if db_url.get_backend_name() == "sqlite" and db_url.database:
        db_entry = schemas.DiskUsageEntry(
            name="Database (SQLite)",
            path=db_url.database,
            bytes=os.path.getsize(db_url.database) if os.path.exists(db_url.database) else 0,
            exists=os.path.exists(db_url.database),
        )
    else:
        # Postgres/etc — no local file to size; just confirm which backend is in use.
        db_entry = schemas.DiskUsageEntry(
            name=f"Database ({db_url.get_backend_name()})",
            path=f"{db_url.host or 'unknown host'}/{db_url.database or ''}",
            bytes=0,
            exists=True,
        )

    disk_usage = [
        db_entry,
        schemas.DiskUsageEntry(name="Vector store (Chroma)", path=rag_config.CHROMA_DIR, bytes=_dir_size_bytes(rag_config.CHROMA_DIR), exists=os.path.isdir(rag_config.CHROMA_DIR)),
        schemas.DiskUsageEntry(name="Embedding cache", path=rag_config.CACHE_DIR, bytes=_dir_size_bytes(rag_config.CACHE_DIR), exists=os.path.isdir(rag_config.CACHE_DIR)),
        schemas.DiskUsageEntry(name="Uploads", path=UPLOAD_DIR, bytes=_dir_size_bytes(UPLOAD_DIR), exists=os.path.isdir(UPLOAD_DIR)),
    ]

    return schemas.HealthResponse(checks=checks, disk_usage=disk_usage)


# --- UPLOADS CLEANUP ---
@app.get("/api/admin/uploads", response_model=List[schemas.UploadFileInfo], dependencies=[Depends(verify_token)])
def list_uploads(db: Session = Depends(get_db)):
    referenced = {os.path.basename(url) for (url,) in db.query(models.Blog.image).filter(models.Blog.image.isnot(None)).all()}
    files = []
    for filename in sorted(os.listdir(UPLOAD_DIR)):
        full_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.isfile(full_path):
            continue
        files.append(schemas.UploadFileInfo(
            filename=filename,
            url=f"/uploads/{filename}",
            bytes=os.path.getsize(full_path),
            orphaned=filename not in referenced,
        ))
    return files

@app.delete("/api/admin/uploads/{filename}", dependencies=[Depends(verify_token)])
def delete_upload(filename: str, db: Session = Depends(get_db)):
    # Reject path separators outright rather than relying on basename to save
    # us — belt-and-suspenders against traversal on a delete endpoint.
    if "/" in filename or "\\" in filename or filename in (".", ".."):
        raise HTTPException(status_code=400, detail="Invalid filename")

    referenced = {os.path.basename(url) for (url,) in db.query(models.Blog.image).filter(models.Blog.image.isnot(None)).all()}
    if filename in referenced:
        raise HTTPException(status_code=400, detail="File is referenced by a blog post — update or delete that post first")

    full_path = os.path.join(UPLOAD_DIR, filename)
    real_upload_dir = os.path.realpath(UPLOAD_DIR)
    if os.path.realpath(full_path) != os.path.join(real_upload_dir, filename) or not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    os.remove(full_path)
    return {"ok": True}

@app.post("/api/chat")
def chat_with_flouv(request: ChatRequest, http_request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(http_request, _chat_requests, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW)
    return rag_pipeline.handle_chat(request.query, request.session_id, db)

@app.post("/api/report")
def generate_report(request: ReportRequest, http_request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(http_request, _report_requests, REPORT_RATE_LIMIT, REPORT_RATE_WINDOW)
    return rag_pipeline.handle_report(request.session_id, db)

@app.post("/api/report/email")
def email_report(payload: schemas.ReportEmailRequest, http_request: Request, db: Session = Depends(get_db)):
    _check_rate_limit(http_request, _report_requests, REPORT_RATE_LIMIT, REPORT_RATE_WINDOW)
    pdf_bytes = report_pdf.markdown_to_pdf_bytes(payload.report_markdown)
    try:
        email_notify.send_report_email(payload.email, pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to send the report: {e}")
    signups.record_signup(db, payload.email, "ai_report_email")
    return {"ok": True}


# --- STATIC FRONTEND SERVING ---
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')

if os.path.isdir(os.path.join(DIST_DIR, 'assets')):
    app.mount('/assets', StaticFiles(directory=os.path.join(DIST_DIR, 'assets')), name='assets')

@app.api_route('/{full_path:path}', methods=["GET", "HEAD"])
async def serve_frontend(full_path: str):
    # Resolve the requested path and ensure it stays inside DIST_DIR to prevent
    # path traversal (e.g. "../../etc/passwd"); otherwise fall through to the SPA.
    dist_root = os.path.realpath(DIST_DIR)
    file_path = os.path.realpath(os.path.join(dist_root, full_path))
    if (file_path == dist_root or file_path.startswith(dist_root + os.sep)) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(DIST_DIR, 'index.html'))

