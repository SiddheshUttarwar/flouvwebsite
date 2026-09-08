# FloUV Website

React (Vite) frontend + FastAPI backend for FloUV's public marketing site.
Ships three things in one deployable app:

1. **Public marketing site** — Home, Technology, Industries, About, FAQ, Blog.
2. **A RAG chatbot** ("Ask FloUV") backed by a Google Drive knowledge base + Gemini.
3. **An admin panel** (`/admin`) for blog management, inquiry/lead tracking, chatbot analytics, and knowledge-base sync.

If you're an AI agent picking this repo up cold, read this whole file before
making changes — several things here (the CSS responsive approach, the
chatbot's confidentiality rules, the git remote setup) are *deliberate*
non-obvious decisions, not bugs waiting to be "fixed."

---

## Repo & collaboration setup — READ THIS FIRST

This repo is worked on by two people, each with their own GitHub remote, both
tracking the same branch name:

- `origin` → `https://github.com/SiddheshUttarwar/flouvwebsite.git` (Siddhesh)
- `pankaj-repo` → `https://github.com/pankajuttarwar-flouv/Flouvwebsite.git` (Pankaj)

Check `git remote -v` — if you don't see both, add the missing one before
doing anything else, so you don't accidentally diverge history further.

**The active working branch is `design-refresh-2026-08-31`** (not `master` —
`master` is stale, from before the RAG chatbot and design refresh existed).
Always confirm which branch you're on and which branch the user means before
committing.

### Push policy

- **Commit locally as you go.** That's always safe.
- **Do not `git push` to either remote unless the user explicitly asks.**
  This has been the standing instruction throughout this project's history —
  treat it as the default unless told otherwise for the current session.
- When you do push, push to **both** `origin` and `pankaj-repo` unless told
  otherwise — they're meant to be kept in sync as one shared line of history.
- **Before pushing, check for divergence**: `git log --oneline --all --graph
  -15`. If the two remotes' `design-refresh-2026-08-31` branches have moved
  independently (each has commits the other doesn't), a plain push will be
  rejected as non-fast-forward. Do not resolve this with a blind
  `--force-with-lease` merge of unrelated work — this has happened before
  (a teammate's frontend-only commits vs. this line's backend work), and the
  correct fix was a **file-level reconciliation**: diff the two branches'
  actual file contents, decide per-file which version is right (or combine),
  apply via `git checkout <ref> -- <path>`, and land it as one new commit —
  not a git-level merge of the two histories. Ask the user before doing this
  kind of surgery; don't guess which side wins.
- Never push to `master` on either remote without being explicitly told to —
  it's not the deployment branch.

---

## Tech stack

- **Frontend**: React 18 + Vite, React Router, plain inline `style={{}}` objects for
  almost all styling (no CSS framework, no CSS Modules/styled-components) —
  see the "Styling approach" note below, it matters.
- **Backend**: FastAPI + SQLAlchemy + Alembic, running on Python.
- **Database**: Postgres in production (Render managed Postgres); SQLite by
  default for local dev if `DATABASE_URL` isn't set.
- **Chatbot**: Google Gemini (`google-genai` SDK, the **Interactions API** —
  not the older `generate_content` surface) + Chroma (vector store) + BM25
  (lexical search) + a disk-based embedding cache.
- **Knowledge base source**: a Google Drive folder, synced via OAuth
  (`backend/credentials.json` + `backend/token.json`).
- **Email**: Gmail SMTP with an App Password (no third-party email service).
- **Deployment**: Render (Blueprint via `render.yaml`, or manual dashboard
  setup — both are in use; check which before assuming `render.yaml` is
  authoritative for a live service's actual settings).

---

## Local development setup

**Frontend**
```
npm install
npm run dev        # http://localhost:5173, proxies /api to :8000
```

**Backend**
```
pip install -r requirements.txt
cp backend/.env.example backend/.env   # then fill in real values
python -m alembic upgrade head         # applies migrations
cd backend && uvicorn main:app --reload --port 8000
```

Run both at once for full local dev (frontend on :5173 talking to backend on
:8000 via Vite's proxy).

`npm run build` also runs `scripts/extract-site-content.mjs` (via the
`prebuild` script) — this bundles `Industries.jsx`/`Technology.jsx`/`Home.jsx`/`About.jsx`
for Node and extracts their exported marketing-copy consts into
`backend/site_content/*.txt`, which the chatbot ingests alongside the Drive
documents. **If you rename or restructure the exported consts in those four
page files (`INDUSTRIES`, `STANDARD_RANGE`, `TEAM`, etc. — grep the script for
the full list), the extraction script will break the build.** Every const it
depends on needs the `export` keyword; this has broken before during a
frontend merge that overwrote those files without preserving the exports.

## Environment variables

Full list with descriptions: [backend/.env.example](backend/.env.example).
Summary:

| Variable | Required? | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Chatbot generation, embeddings, report synthesis |
| `GOOGLE_DRIVE_FOLDER_ID` | Yes (for chatbot KB sync) | Drive folder the knowledge base pulls from |
| `ADMIN_PASSWORD` | Yes | Gates `/admin` |
| `GMAIL_SMTP_USER` / `GMAIL_SMTP_APP_PASSWORD` | Recommended | Sends inquiry-notification emails and the "email me this report" chatbot feature (currently `admin@flouv.us`). Both unset = emails silently skipped (storage still happens) |
| `INQUIRY_NOTIFY_EMAIL` | No (defaults to `pankajuttarwar@flouv.us`) | Where inquiry notifications land |
| `NEWSLETTER_SMTP_USER` / `NEWSLETTER_SMTP_APP_PASSWORD` | Recommended | Separate Gmail account (currently `newsletter@flouv.us`) used only for the newsletter batch send triggered on new blog posts — deliberately kept apart from `GMAIL_SMTP_USER` so bulk sends don't share a sending reputation with transactional mail. Each Gmail account needs its own separately-generated App Password even if the account passwords match |
| `SITE_BASE_URL` | No (defaults to `https://flouv.us`) | Used to build the post link in newsletter emails |
| `GOOGLE_DRIVE_EXCLUDE_FOLDER_NAMES` | No (has a safe default) | Folders never ingested into the chatbot's KB — **never set this to an empty string in production**, that means "expose everything," including IP/confidential docs |
| `DATABASE_URL` | No locally / auto on Render | Postgres connection string |
| `PERSIST_DIR` | Render only, if a disk is attached | Redirects vector store/cache/uploads/OAuth files to a persistent disk mount instead of the ephemeral container filesystem |
| `CORS_ORIGINS` | No | Only needed if frontend and API are ever hosted on different origins |
| `BOT_API_KEY` | No | Unused placeholder, kept for compatibility |

---

## Features

### Public site
Home, Technology, Industries (tabbed by product line: Dairy, Juices,
Beverages, Brewing, Biofermentation, Water), About, FAQ, Blog (with
DOMPurify-sanitized rendering). All contact/lead-capture CTAs across these
pages ("Book a Meeting", "Talk to the FloUV team", "Connect with Dirk",
"Request Report", newsletter signup) route through the systems below rather
than being plain navigation links — if you find one that's just a `<Link
to="/about">` with a contact-sounding label, that's almost certainly a bug
(this exact bug has been found and fixed multiple times).

### RAG chatbot ("Ask FloUV")
- Pipeline: retrieval (BM25 + embeddings, RRF fusion) → rerank → confidence
  scoring → constrained generation (structured JSON output, Gemini
  Interactions API) → hallucination fallback. See `backend/rag/pipeline.py`
  for the stage-by-stage flow.
- **Confidentiality is enforced in two independent layers**: (1) certain
  Drive folders are never ingested at all (`GOOGLE_DRIVE_EXCLUDE_FOLDER_NAMES`),
  and (2) the system prompt (`backend/rag/generation.py`) has an extensive
  set of rules refusing to answer from confidential content even if it
  somehow ends up in context, plus a "bright-line rule" that declines based
  on the *shape* of an adversarial request (confirmation attacks,
  impersonation, roleplay/injection) regardless of whether the underlying
  fact might separately be public. This was red-teamed against a 30-question
  adversarial suite and hardened until it passed 30/30 — treat this prompt
  as load-bearing security logic, not just copy.
- **Fallback is a deliberate security property, not just error handling**:
  whenever `insufficient_context=True`, the pipeline *always* discards the
  model's own text and substitutes one fixed generic message
  (`config.FALLBACK_TEXT`). This means there's no side-channel that lets a
  visitor distinguish "the bot doesn't know" from "the bot won't tell you" —
  don't "fix" this by returning the model's actual text in the fallback case.
- No images accompany chatbot answers — that feature existed early on and
  was deliberately removed (looked bad in practice). Don't re-add an
  image-selection field to the generation schema.
- Chat history is in-memory only (`src/context/ChatContext.jsx`), reset on
  every full page reload by design — this was an explicit requirement, not
  an oversight. It does survive client-side navigation between pages within
  the same session.
- "Generate Report" button on the chat page synthesizes a technology brief
  from the conversation and — instead of a print/download flow — emails it
  as a PDF attachment (`backend/report_pdf.py`, `fpdf2` + `markdown`) to
  whatever address the visitor types in.

### Inquiries & Signups
Every contact-form-style submission (Book a Meeting, Connect with an expert,
general enquiry, research collaboration, distribution partnership, consultant
representation, report requests) goes through `InquiryModal.jsx` →
`POST /api/inquiries`, which:
1. Stores the full submission in the `inquiries` table (mode, subject, name,
   company, email, phone, message, raw form JSON).
2. Also logs just the email address into the separate `signups` table
   (`source` = the inquiry mode), which functions as a simple master email
   list independent of the detailed inquiry records. The newsletter footer
   form and the chatbot's "email me this report" flow also write here
   (`source` = `"newsletter"` / `"ai_report_email"`).
3. Fires a background-task email notification (never blocks the response,
   never fails the submission if SMTP isn't configured) to
   `INQUIRY_NOTIFY_EMAIL`, and *additionally* to a specific FloUV contact's
   own email when the inquiry came from a "Connect with X" button
   (`notify_email`/`notify_name` columns — e.g. "Connect with Dirk"/"Connect
   with Prashant" both email `business@elefq.com`, "Connect with Nathan"
   emails `sales@juicingsystems.com`, not just the general inbox).

### Newsletter
The footer's "Sign up" form stores emails into `signups` with
`source="newsletter"` — no notification fires for this one (unlike
inquiries), it's just silently recorded. Creating a new blog post (`POST
/api/blogs` specifically — **never** on update or delete, by design) fires a
background task that emails every `source="newsletter"` subscriber
announcing the post, via the separate `NEWSLETTER_SMTP_USER` account (see
`backend/email_notify.py`'s `send_newsletter_for_new_blog`). It opens its own
fresh DB session rather than reusing the request's, since background tasks
run after that session has already closed.

### Admin panel (`/admin`)
Tabs: **Blogs** (CRUD + image upload), **Inquiries** (filterable by mode,
click a row to expand the full subject/message, mark handled), **Signups**
(filterable by source), **Analytics** (chatbot usage/cost/confidence over
time, daily volume chart, per-conversation transcripts), **Knowledge Base**
(trigger a Drive sync, see ingested documents and sync history — both capped
at a fixed height with internal scroll + sticky header, since these grow
unbounded), **System Health** (disk usage, uploaded files).

Auth is a single shared `ADMIN_PASSWORD` with server-side session tokens
(`backend/auth.py`) — no per-user accounts.

---

## Architecture notes / gotchas

### Styling approach — retrofit-responsive CSS
The frontend was originally built entirely with inline `style={{}}` objects
and *no* responsive design. Rather than rewrite ~6,000 lines across every
page to add proper CSS classes, mobile responsiveness was retrofitted via
**CSS attribute selectors matching the literal inline style strings React
serializes to the DOM**, combined with `!important` (which wins over an
inline style's corresponding longhand property regardless of source), living
in `src/index.css`. For example:
```css
@media (max-width: 640px) {
  [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
}
```
This means: **if you add a new `gridTemplateColumns` value inline in a page
component, it will NOT be responsive unless you also add a matching
attribute-selector rule in `index.css`** (or convert that one spot to a
proper class). Check `index.css`'s "Retrofit-responsive overrides" section
before assuming a new grid/section "just works" on mobile. Also note: grid
items default to `min-width: auto`, which can keep a "collapsed" grid track
wider than intended if a child's content doesn't shrink — the fix pattern is
`min-width: 0 !important` on that grid's direct children (see the same CSS
section for the established pattern).

The header/footer (`Layout.jsx`) and a few high-traffic components (Industries'
tab strip, the chat input row, the FAQ ask-bar) got proper `className`-based
responsive treatment instead, since they needed structural changes (a
hamburger menu, stacking rows) that attribute selectors can't express.

### Gemini API — your training data is likely stale here
- Uses the **Interactions API** (`client.interactions.create`), not the
  older `generate_content`. No `temperature` parameter exists on this
  surface.
- Embeddings use `gemini-embedding-001`, **not** `gemini-embedding-2` — the
  latter pools a batch of inputs into one vector, which silently breaks
  per-chunk retrieval if used by mistake.
- Structured output uses `response_format: {type:"text",
  mime_type:"application/json", schema_: {...}}` — note the trailing
  underscore on `schema_`.

### Persistent disk on Render (`PERSIST_DIR`)
Free-tier Render web services have no persistent disk — everything under
`backend/` gets wiped on every restart/redeploy. If a paid plan with an
attached disk is in use, `PERSIST_DIR` (set to the disk's mount path, e.g.
`/var/data`) redirects the vector store, embedding cache, KB sidecar,
`uploads/`, and the Drive OAuth files there instead. **Never mount a Render
disk directly over `backend/`** — that would freeze whatever code was there
at first mount and silently stop applying future deploys' code changes to
that path. `uploads/` seeds itself from the repo's checked-in defaults on
first boot against an empty disk.

Drive sync (`credentials.json`/`token.json`) can't be completed headlessly on
a server — the OAuth flow needs a real browser. These two files must be
generated locally once (`python drive_loader.py` or equivalent triggers
`flow.run_local_server()`) and manually copied onto the server/disk.

### Chunking
PDFs with zero paragraph breaks (common with some scanned/exported docs) can
become one giant unsplit chunk if not handled — `rag/ingest.py`'s
`_split_oversized()` exists specifically to prevent this; a prior version of
the chunking logic caused wrong pricing-data citations because of it. Don't
remove the oversized-paragraph splitting without understanding why it's there.

### `.claude/` is gitignored
Local editor/tool config (launch configs, permission settings) lives in
`.claude/` and is intentionally excluded from the repo — a teammate's
machine-specific paths (hardcoded Mac paths, a bundled Node binary) ended up
committed once by accident. Don't re-add it to git even if it looks harmless.

---

## Database & migrations

Alembic manages schema changes. From the **repo root** (not `backend/`):
```
python -m alembic revision --autogenerate -m "description"
python -m alembic upgrade head
```
Always review an autogenerated migration before applying it — check it only
contains the change you intended (autogenerate diffs the *entire* schema
against every model, so an unrelated model you touched recently can leak
into the same migration file if you're not careful).

---

## Deploying (Render)

Backend is deployed on Render as a web service; frontend is built and served
by the same FastAPI app (`dist/` via `StaticFiles`), so frontend and API
share an origin — CORS doesn't come into play in production.

- **Postgres**: paid plan currently in use (no more 30-day free-tier
  expiry). `DATABASE_URL` is wired automatically if deployed via
  `render.yaml`'s Blueprint; set it manually in the dashboard otherwise.
- **Web service**: check whether the live service was created via the
  Blueprint (`render.yaml` is authoritative) or manually in the dashboard
  (in which case the dashboard's Build/Start Command and env vars are
  authoritative, and `render.yaml` may be stale/unused — this has caused
  confusion before, e.g. a Start Command missing `--host 0.0.0.0` because
  the dashboard didn't match the file). **Confirm which mode the live
  service is in before assuming `render.yaml` reflects reality.**
- Start command must bind to `0.0.0.0` and Render's `$PORT`:
  `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`.
- If a persistent disk is attached (see `PERSIST_DIR` above), mount it at a
  dedicated path (e.g. `/var/data`) — never over `backend/`.

---

## Tests

```
pytest test_api.py -v
```
Runs against an isolated in-memory database — safe to run repeatedly, never
touches `backend/flouv.db` and never calls `/api/chat`, `/api/report`, or
`/api/ingest-gdrive` (those hit real Gemini/Google Drive credentials).

For ad-hoc verification of new backend endpoints, FastAPI's `TestClient` is
the fastest path (see recent commits for examples testing the
inquiries/signups flow) — but note its cookie jar respects the `Secure`
cookie flag and won't resend the admin session cookie over the test
transport's plain-http scheme; verify authenticated-endpoint *logic*
directly against the database instead of fighting the test client's cookie
handling.

---

## Project layout

- `src/` — React frontend
  - `src/pages/` — route-level pages (`Home.jsx`, `Technology.jsx`, `Industries.jsx`, `About.jsx`, `FAQ.jsx`, `Blog.jsx`, `BlogPost.jsx`, `Answer.jsx` (chat), `Admin.jsx` + `src/pages/admin/*Tab.jsx`)
  - `src/components/` — shared components (`Layout.jsx` (header/footer), `InquiryModal.jsx`, `ExpertCard.jsx`, `ScrollToTop.jsx`)
  - `src/context/ChatContext.jsx` — in-memory chat state
  - `src/index.css` — global styles + the retrofit-responsive rules (see above)
  - `scripts/extract-site-content.mjs` — bundles marketing copy for chatbot ingestion (see prebuild note above)
- `backend/main.py` — FastAPI app: blog CRUD, uploads, inquiries, signups, auth, chat/report endpoints, static frontend serving
- `backend/auth.py` — admin session auth
- `backend/email_notify.py` — Gmail SMTP notifications + report-email delivery
- `backend/signups.py` — records every captured email into the `signups` table
- `backend/report_pdf.py` — Markdown → PDF for the chatbot's report-email feature
- `backend/drive_loader.py` — pulls documents from Google Drive into the knowledge base
- `backend/rag/` — the chatbot pipeline (ingest → retrieve → rerank → confidence → generate → fallback → observability); see `rag/pipeline.py` for the stage order and `rag/config.py` for every tunable
- `backend/alembic/` — database migrations
- `backend/models.py` / `backend/schemas.py` — SQLAlchemy models / Pydantic schemas
