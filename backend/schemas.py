from pydantic import BaseModel, ConfigDict
from typing import Any, List, Optional
from datetime import datetime

class BlogBase(BaseModel):
    title: str
    date: str
    category: str
    image: str
    content: str
    points: Optional[str] = None
    categories: Optional[str] = None

class BlogCreate(BlogBase):
    pass

class BlogResponse(BlogBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class InquiryCreate(BaseModel):
    mode: str
    subject: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    raw_data: Optional[str] = None
    # Set when the inquiry was opened via a specific FloUV contact's
    # "Connect with X" button (e.g. Dirk Dubiel for EU dairy) rather than
    # the generic "Book a Meeting" CTA — that person is also emailed
    # alongside the standard notification inbox.
    notify_email: Optional[str] = None
    notify_name: Optional[str] = None


class InquiryResponse(InquiryCreate):
    id: int
    handled: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InquiryUpdate(BaseModel):
    handled: bool


class NewsletterSignupCreate(BaseModel):
    email: str


class SignUpResponse(BaseModel):
    id: int
    email: str
    source: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReportEmailRequest(BaseModel):
    email: str
    report_markdown: str


class TraceResponse(BaseModel):
    id: int
    session_id: Optional[str] = None
    query: Optional[str] = None
    aggregate_confidence: Optional[float] = None
    fallback_triggered: bool = False
    chosen_image: Optional[str] = None
    citations: Optional[Any] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    cost_estimate_usd: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class DailyStat(BaseModel):
    date: str
    messages: int
    cost_usd: float
    fallback_count: int


class CitationStat(BaseModel):
    source: str
    citation_count: int


class AdminStatsResponse(BaseModel):
    total_messages: int
    total_cost_usd: float
    avg_confidence: float
    fallback_rate: float
    daily: List[DailyStat]
    avg_stage_timings_ms: dict[str, float] = {}
    top_sources: List[CitationStat] = []


class SessionMessage(BaseModel):
    role: str
    content: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SessionTranscriptResponse(BaseModel):
    session_id: str
    messages: List[SessionMessage]


class KBDocument(BaseModel):
    filename: str
    modified_time: Optional[str] = None
    ingested_at: Optional[str] = None
    chunk_count: int


class SyncRunResponse(BaseModel):
    id: int
    status: str
    files_processed: int
    chunks_indexed: int
    message: Optional[str] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HealthCheck(BaseModel):
    name: str
    ok: bool
    detail: str


class DiskUsageEntry(BaseModel):
    name: str
    path: str
    bytes: int
    exists: bool


class HealthResponse(BaseModel):
    checks: List[HealthCheck]
    disk_usage: List[DiskUsageEntry]


class UploadFileInfo(BaseModel):
    filename: str
    url: str
    bytes: int
    orphaned: bool
