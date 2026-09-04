# FloUV Website

React (Vite) frontend + FastAPI backend, serving the public marketing site,
an admin panel for blog content, and a RAG-based chatbot backed by a Google
Drive knowledge base.

## Setup

**Frontend**
```
npm install
npm run dev        # http://localhost:5173, proxies /api to :8000
```

**Backend**
```
pip install -r requirements.txt
cp backend/.env.example backend/.env   # then fill in real values
python -m alembic upgrade head         # applies migrations to backend/flouv.db
cd backend && uvicorn main:app --reload --port 8000
```

Required `backend/.env` values — see [backend/.env.example](backend/.env.example)
for the full list with descriptions:
- `GEMINI_API_KEY` — chatbot, report generation, and embeddings (Google Gemini)
- `GOOGLE_DRIVE_FOLDER_ID` — folder the chatbot's knowledge base syncs from (also needs `backend/credentials.json`, a Google OAuth client secret — see `backend/drive_loader.py`)
- `ADMIN_PASSWORD` — gates `/admin` (blog management, uploads, Drive sync). Set a strong value in production.
- `CORS_ORIGINS` (optional) — comma-separated origins, only needed if the frontend is ever hosted separately from the API
- `DATABASE_URL` (optional) — defaults to a local `backend/flouv.db` SQLite file; set to a Postgres URL for production (render.yaml wires this automatically)

## Tests

```
pip install pytest   # already in requirements.txt
pytest test_api.py -v
```

Runs against an isolated in-memory database — safe to run repeatedly, never
touches `backend/flouv.db` and never calls `/api/chat`, `/api/report`, or
`/api/ingest-gdrive` (those hit real Gemini/Google Drive credentials).

## Deploying (Render)

`render.yaml` provisions a managed Postgres database and a web service:
installs from the root `requirements.txt`, builds the frontend, runs
migrations, then starts uvicorn — the backend serves the built frontend
itself (`dist/`), so frontend and API share an origin and CORS doesn't come
into play in production. Google Drive sync (`/api/ingest-gdrive`) requires a
`backend/token.json` with a valid, already-authorized refresh token — Render
is headless and can't complete the interactive OAuth consent flow itself.

Both services are currently on Render's free plan (deliberate, for testing
the deploy pipeline) — see the comments in `render.yaml` for what that
trades off (no persistent disk, so uploads/RAG data/the Drive token don't
survive a restart; 15-min idle spin-down; free Postgres expires after 30
days). Upgrade `plan: free` → `plan: starter` on the web service once you
need uploads and the chatbot's knowledge base to actually persist.

## Project layout

- `src/` — React frontend (pages, components)
- `backend/main.py` — FastAPI app: blog CRUD, uploads, inquiries, auth, static frontend serving
- `backend/auth.py` — admin session auth (password + server-side session tokens)
- `backend/rag/` — the chatbot's retrieval/rerank/generation pipeline (see `backend/rag/pipeline.py`)
- `backend/drive_loader.py` — pulls documents from Google Drive into the knowledge base
- `backend/alembic/` — database migrations
