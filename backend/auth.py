import os
import secrets
import time

from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel

router = APIRouter()

# Read at import time; falls back to the previous hardcoded password only if
# ADMIN_PASSWORD isn't set, so existing local .env files keep working.
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "flouvadmin")

SESSION_TTL_SECONDS = 12 * 60 * 60  # 12 hours
# token -> expiry timestamp. In-memory only (mirrors the chatbot's session
# store) — sessions reset on server restart, which is fine for a single-admin
# internal tool with no persistence requirements.
active_sessions = {}

# Basic brute-force protection: track failed attempts per client IP.
MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_SECONDS = 15 * 60
_failed_attempts = {}  # ip -> (count, first_attempt_ts)


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _is_locked_out(ip: str) -> bool:
    entry = _failed_attempts.get(ip)
    if not entry:
        return False
    count, first_ts = entry
    if time.time() - first_ts > LOGIN_LOCKOUT_SECONDS:
        _failed_attempts.pop(ip, None)
        return False
    return count >= MAX_LOGIN_ATTEMPTS


def _record_failed_attempt(ip: str):
    count, first_ts = _failed_attempts.get(ip, (0, time.time()))
    _failed_attempts[ip] = (count + 1, first_ts)


def _clear_failed_attempts(ip: str):
    _failed_attempts.pop(ip, None)


def _prune_expired_sessions():
    now = time.time()
    expired = [t for t, exp in active_sessions.items() if exp < now]
    for t in expired:
        active_sessions.pop(t, None)


class LoginRequest(BaseModel):
    password: str


@router.post("/api/login")
async def login(req: LoginRequest, request: Request, response: Response):
    ip = _client_ip(request)
    if _is_locked_out(ip):
        raise HTTPException(status_code=429, detail="Too many failed login attempts. Try again later.")

    if not secrets.compare_digest(req.password, ADMIN_PASSWORD):
        _record_failed_attempt(ip)
        raise HTTPException(status_code=401, detail="Invalid password")

    _clear_failed_attempts(ip)
    _prune_expired_sessions()

    token = secrets.token_urlsafe(32)
    active_sessions[token] = time.time() + SESSION_TTL_SECONDS

    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=SESSION_TTL_SECONDS,
    )
    return {"ok": True}


@router.post("/api/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("auth_token")
    if token:
        active_sessions.pop(token, None)
    # Matching attributes aren't required by the spec for deletion, but some
    # browsers are stricter about clearing a cookie that doesn't match how it
    # was set — pass them explicitly rather than relying on defaults.
    response.delete_cookie(key="auth_token", httponly=True, secure=True, samesite="lax")
    return {"ok": True}


def verify_token(request: Request):
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing authentication cookie")
    expiry = active_sessions.get(token)
    if expiry is None or expiry < time.time():
        active_sessions.pop(token, None)
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return True


@router.get("/api/check-auth", dependencies=[Depends(verify_token)])
async def check_auth():
    return {"ok": True}
