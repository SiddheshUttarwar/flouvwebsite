"""
Runs against an isolated in-memory SQLite DB (via a get_db dependency
override) instead of the real backend/flouv.db, and never calls
/api/chat, /api/report, or /api/ingest-gdrive — those hit the real Gemini /
Google Drive APIs using whatever credentials are in backend/.env, which would
both cost money and require network access in CI.

Run with: pytest test_api.py -v
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

os.environ.setdefault("ADMIN_PASSWORD", "test-admin-password")

from backend.main import app
from backend.database import Base, get_db
from backend import models

# StaticPool forces every connection (even from FastAPI's worker threadpool)
# to share the same single SQLite connection — without it, ":memory:" hands
# each thread its own separate, table-less database.
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# base_url must be https:// — the login cookie is Secure, and unlike real
# browsers (which special-case localhost/127.0.0.1 as a trustworthy origin),
# httpx's cookie jar strictly follows the scheme, so a Secure cookie set over
# TestClient's default http://testserver would silently never be sent back.
client = TestClient(app, base_url="https://testserver")
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]


def test_blogs_list_is_public_and_starts_empty():
    res = client.get("/api/blogs")
    assert res.status_code == 200
    assert res.json() == []


def test_login_rejects_wrong_password():
    res = client.post("/api/login", json={"password": "definitely-wrong"})
    assert res.status_code == 401


def test_login_accepts_correct_password_and_sets_session():
    res = client.post("/api/login", json={"password": ADMIN_PASSWORD})
    assert res.status_code == 200
    assert "auth_token" in res.cookies

    res = client.get("/api/check-auth")
    assert res.status_code == 200


def test_protected_endpoints_reject_missing_or_bad_cookie():
    anon = TestClient(app, base_url="https://testserver")
    res = anon.post("/api/blogs", json={
        "title": "t", "date": "d", "category": "c", "image": "i", "content": "c",
    })
    assert res.status_code == 401

    anon.cookies.set("auth_token", "not-a-real-token")
    res = anon.get("/api/check-auth")
    assert res.status_code == 401


def test_blog_crud_round_trip_when_authenticated():
    session = TestClient(app, base_url="https://testserver")
    login_res = session.post("/api/login", json={"password": ADMIN_PASSWORD})
    assert login_res.status_code == 200

    create_res = session.post("/api/blogs", json={
        "title": "Test Post",
        "date": "1/1/26",
        "category": "Technology",
        "image": "/uploads/fake.png",
        "content": "<p>hello</p>",
        "points": '["point one", "point two"]',
        "categories": '["Technology", "UV"]',
    })
    assert create_res.status_code == 200
    blog = create_res.json()
    assert blog["title"] == "Test Post"
    blog_id = blog["id"]

    get_res = session.get(f"/api/blogs/{blog_id}")
    assert get_res.status_code == 200

    delete_res = session.delete(f"/api/blogs/{blog_id}")
    assert delete_res.status_code == 200
    assert session.get(f"/api/blogs/{blog_id}").status_code == 404


def test_blog_create_rejects_malformed_points_json():
    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    res = session.post("/api/blogs", json={
        "title": "Bad Points",
        "date": "1/1/26",
        "category": "Technology",
        "image": "/uploads/fake.png",
        "content": "<p>hello</p>",
        "points": "not valid json",
    })
    assert res.status_code == 400


def test_upload_rejects_disallowed_file_extension():
    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    res = session.post(
        "/api/upload",
        files={"file": ("payload.exe", b"not really an image", "application/octet-stream")},
    )
    assert res.status_code == 400


def test_upload_accepts_allowed_image_extension():
    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    res = session.post(
        "/api/upload",
        files={"file": ("photo.png", b"\x89PNG\r\n\x1a\n" + b"0" * 100, "image/png")},
    )
    assert res.status_code == 200
    url = res.json()["url"]
    assert url.startswith("/uploads/")

    # Clean up the file this test wrote to the real uploads/ directory.
    from backend.main import UPLOAD_DIR
    written_path = os.path.join(UPLOAD_DIR, os.path.basename(url))
    if os.path.exists(written_path):
        os.remove(written_path)


def test_logout_invalidates_the_session():
    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})
    assert session.get("/api/check-auth").status_code == 200

    logout_res = session.post("/api/logout")
    assert logout_res.status_code == 200
    assert session.get("/api/check-auth").status_code == 401


def test_inquiry_submission_is_public_and_listing_requires_auth():
    res = client.post("/api/inquiries", json={
        "mode": "general",
        "subject": "General enquiry: test",
        "name": "Jane Tester",
        "email": "jane@example.com",
        "message": "Does this actually work?",
    })
    assert res.status_code == 200
    assert res.json()["email"] == "jane@example.com"

    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/inquiries").status_code == 401

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})
    list_res = session.get("/api/inquiries")
    assert list_res.status_code == 200
    assert any(i["email"] == "jane@example.com" for i in list_res.json())


def test_admin_stats_and_traces_require_auth_and_aggregate_correctly():
    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/admin/stats").status_code == 401
    assert anon.get("/api/admin/traces").status_code == 401

    # Seed RagTrace rows directly rather than calling /api/chat, which would
    # hit the real Gemini API (see module docstring).
    db = TestingSessionLocal()
    db.add(models.RagTrace(
        session_id="s-admin-test", query="what is UV treatment",
        aggregate_confidence=0.8, fallback_triggered=False,
        chosen_image="uv.png", prompt_tokens=100, completion_tokens=50,
        cost_estimate_usd=0.0006,
        stage_timings={"retrieval_ms": 120.0, "generation_ms": 800.0},
        citations=[{"source": "dairy_validation.txt", "chunk_index": 0}],
    ))
    db.add(models.RagTrace(
        session_id="s-admin-test", query="something outside the knowledge base",
        aggregate_confidence=0.1, fallback_triggered=True,
        chosen_image="uv.png", prompt_tokens=80, completion_tokens=10,
        cost_estimate_usd=0.0002,
        stage_timings={"retrieval_ms": 100.0, "generation_ms": 400.0},
        citations=[],
    ))
    db.commit()
    db.close()

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    stats_res = session.get("/api/admin/stats?days=30")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_messages"] >= 2
    assert stats["fallback_rate"] > 0
    # Confidence should only average non-fallback turns (0.8 here), not be
    # dragged down by the fallback turn's meaningless 0.1 score.
    assert stats["avg_confidence"] > 0.5

    traces_res = session.get("/api/admin/traces?limit=50")
    assert traces_res.status_code == 200
    queries = [t["query"] for t in traces_res.json()]
    assert "what is UV treatment" in queries

    # Stage timings should be averaged across both seeded traces: (120+100)/2, (800+400)/2
    assert stats["avg_stage_timings_ms"]["retrieval_ms"] == 110.0
    assert stats["avg_stage_timings_ms"]["generation_ms"] == 600.0
    # Only the non-fallback trace cited a source.
    assert {"source": "dairy_validation.txt", "citation_count": 1} in stats["top_sources"]


def test_inquiry_handled_flag_and_mode_filter():
    client.post("/api/inquiries", json={"mode": "general", "name": "A", "email": "a@example.com"})
    create_res = client.post("/api/inquiries", json={"mode": "collaboration", "name": "B", "email": "b@example.com"})
    inquiry_id = create_res.json()["id"]
    assert create_res.json()["handled"] is False

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    # Unfiltered list should include both.
    all_res = session.get("/api/inquiries")
    emails = [i["email"] for i in all_res.json()]
    assert "a@example.com" in emails and "b@example.com" in emails

    # mode filter should exclude the other mode.
    filtered_res = session.get("/api/inquiries?mode=collaboration")
    filtered_emails = [i["email"] for i in filtered_res.json()]
    assert "b@example.com" in filtered_emails and "a@example.com" not in filtered_emails

    # Anonymous can't toggle handled; admin can.
    anon = TestClient(app, base_url="https://testserver")
    assert anon.patch(f"/api/inquiries/{inquiry_id}", json={"handled": True}).status_code == 401

    patch_res = session.patch(f"/api/inquiries/{inquiry_id}", json={"handled": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["handled"] is True

    assert session.patch("/api/inquiries/999999", json={"handled": True}).status_code == 404


def test_session_transcript_drilldown():
    db = TestingSessionLocal()
    db.add(models.ChatSession(id="s-transcript-test"))
    db.add(models.ChatMessage(session_id="s-transcript-test", role="user", content="hello"))
    db.add(models.ChatMessage(session_id="s-transcript-test", role="assistant", content="hi there"))
    db.commit()
    db.close()

    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/admin/sessions/s-transcript-test/messages").status_code == 401

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    res = session.get("/api/admin/sessions/s-transcript-test/messages")
    assert res.status_code == 200
    body = res.json()
    assert body["session_id"] == "s-transcript-test"
    assert [m["role"] for m in body["messages"]] == ["user", "assistant"]

    # Unknown session_id returns an empty transcript, not a 404 — it's a valid
    # (if unused) session id, not a resource lookup failure.
    empty_res = session.get("/api/admin/sessions/does-not-exist/messages")
    assert empty_res.status_code == 200
    assert empty_res.json()["messages"] == []


def test_sync_history_requires_auth_and_reflects_seeded_runs():
    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/admin/sync-history").status_code == 401

    db = TestingSessionLocal()
    db.add(models.SyncRun(status="done", files_processed=3, chunks_indexed=42, message="ok"))
    db.commit()
    db.close()

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})
    res = session.get("/api/admin/sync-history")
    assert res.status_code == 200
    assert any(r["status"] == "done" and r["chunks_indexed"] == 42 for r in res.json())


def test_uploads_listing_and_delete_requires_auth():
    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/admin/uploads").status_code == 401
    assert anon.delete("/api/admin/uploads/whatever.png").status_code == 401

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})

    # Deleting a nonexistent file 404s rather than silently succeeding.
    assert session.delete("/api/admin/uploads/does-not-exist.png").status_code == 404

    # A literal ".." or an encoded "/" never even reach the handler: any
    # compliant HTTP client (httpx here, same as browsers) normalizes ".."
    # path segments before the request is sent, and Starlette's single-
    # segment {filename} path param doesn't match an embedded "/" at all —
    # both land on the app's catch-all route, which only registers GET, so
    # DELETE 405s there rather than ever reaching delete_upload(). Confirm
    # nothing gets deleted either way.
    for attempted_path in ("/api/admin/uploads/..", "/api/admin/uploads/..%2F..%2Fmain.py"):
        res = session.delete(attempted_path)
        assert res.status_code != 200, f"{attempted_path} should never succeed"
    assert os.path.exists(os.path.join(os.path.dirname(__file__), "backend", "main.py"))


def test_health_endpoint_requires_auth_and_reports_checks():
    anon = TestClient(app, base_url="https://testserver")
    assert anon.get("/api/admin/health").status_code == 401

    session = TestClient(app, base_url="https://testserver")
    session.post("/api/login", json={"password": ADMIN_PASSWORD})
    res = session.get("/api/admin/health")
    assert res.status_code == 200
    body = res.json()
    check_names = {c["name"] for c in body["checks"]}
    assert "Gemini API key" in check_names
    assert "Admin password" in check_names
    assert len(body["disk_usage"]) == 4


if __name__ == "__main__":
    import pytest
    raise SystemExit(pytest.main([__file__, "-v"]))
