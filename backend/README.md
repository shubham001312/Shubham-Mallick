# Portfolio Backend (FastAPI)

Serves the visitor counter and contact form used by the `../frontend` site,
and also hosts the static frontend so one process runs the whole project.

## Run

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate      # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                # optional (email delivery)
uvicorn main:app --reload --port 8000
```

Then open <http://localhost:8000/> — the API and the site are both served here.

## API

| Method | Path           | Purpose                                                       |
| ------ | -------------- | ------------------------------------------------------------- |
| GET    | `/api/visits`  | Increments and returns the visitor count (`?inc=false` to read only) |
| POST   | `/api/contact` | Validates + stores a message (`{name, email, message}`); optional SMTP send |
| GET    | `/api/health`  | Liveness check                                                |

## Data

State lives in `backend/data/app.db` (SQLite): a single-row `visitors` counter
and a `messages` table. No external services or PII beyond what visitors submit.

## Notes

- CORS is open (`*`) for local development — tighten `allow_origins` in `main.py`
  to your real domain before deploying.
- For production, run behind a reverse proxy (nginx/Caddy) or a PaaS
  (Render, Railway, Fly.io, Railway) and set `SMTP_*` env vars to enable email.
