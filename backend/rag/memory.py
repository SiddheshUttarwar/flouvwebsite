"""Stage 9 (durability half): SQLite-backed chat sessions/messages, replacing
the old in-memory `sessions` dict that was lost on every restart."""
import uuid
from sqlalchemy.orm import Session

try:
    from .. import models
except ImportError:
    import models

from . import config


def get_or_create_session(db: Session, session_id: str | None) -> "models.ChatSession":
    """Does NOT commit — id is client-generated (uuid4 hex), so the caller
    doesn't need a round-trip to learn it. Callers should commit once at the
    end of the request (see pipeline.handle_chat) instead of once per write,
    both to cut SQLite write-lock round-trips and so a chat turn persists
    atomically rather than in partial pieces if something later in the same
    request fails."""
    if session_id:
        existing = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
        if existing:
            return existing
    new_session = models.ChatSession(id=session_id or uuid.uuid4().hex)
    db.add(new_session)
    return new_session


def append_message(db: Session, session_id: str, role: str, content: str) -> None:
    """Does NOT commit — see get_or_create_session's docstring."""
    db.add(models.ChatMessage(session_id=session_id, role=role, content=content))


def get_recent_history(db: Session, session_id: str, limit: int = config.CHAT_HISTORY_LIMIT) -> list[dict]:
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    messages.reverse()
    return [{"role": m.role, "content": m.content} for m in messages]


def get_full_history(db: Session, session_id: str) -> list[dict]:
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id)
        .order_by(models.ChatMessage.id.asc())
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]


def has_history(db: Session, session_id: str) -> bool:
    return (
        db.query(models.ChatMessage.id).filter(models.ChatMessage.session_id == session_id).first()
        is not None
    )
