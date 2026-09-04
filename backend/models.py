from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float, Boolean, JSON, func
from sqlalchemy.orm import relationship

# Support import both as a package submodule (backend.models, used by Alembic)
# and as a top-level module (models, when the app runs from the backend/ dir).
try:
    from .database import Base
except ImportError:
    from database import Base

class BlogCategoryLink(Base):
    __tablename__ = "blog_category_links"
    blog_id = Column(Integer, ForeignKey("blogs.id"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), primary_key=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    blogs = relationship("Blog", secondary="blog_category_links", back_populates="categories")

class BlogPoint(Base):
    __tablename__ = "blog_points"
    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blogs.id"))
    point_text = Column(String)
    
    blog = relationship("Blog", back_populates="points")

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(String)
    # Replaced 'category' string with relation below
    image = Column(String)
    content = Column(Text)
    
    # Replaced JSON strings 'points' and 'categories' with relations
    categories = relationship("Category", secondary="blog_category_links", back_populates="blogs")
    points = relationship("BlogPoint", back_populates="blog", cascade="all, delete-orphan")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True)  # uuid4 hex, matches the existing session_id format
    created_at = Column(DateTime, server_default=func.now())

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"), index=True)
    role = Column(String)  # "user" | "assistant"
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")


class Inquiry(Base):
    """Server-side record of every InquiryModal submission, kept so a lead is
    never lost even if the visitor's browser has no mail client configured
    to send the mailto: draft the form also opens."""
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String, index=True)  # meeting, general, collaboration, distribution, representation, report
    subject = Column(String)
    name = Column(String)
    company = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    message = Column(Text)
    # Raw JSON-encoded copy of every field the form collected, so mode-specific
    # fields (region, vertical, years, etc.) aren't lost to the fixed columns above.
    raw_data = Column(Text)
    handled = Column(Boolean, default=False, nullable=False, server_default="0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SyncRun(Base):
    """One row per Google Drive knowledge-base sync, so the admin dashboard can
    show sync history instead of only the single most recent in-memory status
    (rag/ingest_job.py's _state dict is overwritten by the next run and lost
    entirely on process restart)."""
    __tablename__ = "sync_runs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, index=True)  # done | error
    files_processed = Column(Integer, default=0)
    chunks_indexed = Column(Integer, default=0)
    message = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    finished_at = Column(DateTime, nullable=True, index=True)


class RagTrace(Base):
    __tablename__ = "rag_traces"
    id = Column(Integer, primary_key=True, index=True)
    # Not a strict FK — a trace row should survive session deletion.
    session_id = Column(String, index=True, nullable=True)
    query = Column(Text)
    stage_timings = Column(JSON)
    retrieval_scores = Column(JSON)
    rerank_scores = Column(JSON)
    aggregate_confidence = Column(Float)
    fallback_triggered = Column(Boolean, default=False)
    chosen_image = Column(String, nullable=True)
    citations = Column(JSON)
    prompt_tokens = Column(Integer)
    completion_tokens = Column(Integer)
    cost_estimate_usd = Column(Float)
    created_at = Column(DateTime, server_default=func.now(), index=True)
