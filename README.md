# Shubham Mallick — Portfolio (Full Stack)

A complete redesign of the portfolio as a proper two-part project:

```
.
├── frontend/   # vanilla HTML + CSS + JS (no framework)
│   ├── index.html, about.html, projects.html, skills.html, experience.html, contact.html
│   ├── assets/css/styles.css     # "aurora depth" theme (gradient hero, floating orbs, glass cards)
│   ├── assets/js/main.js         # nav, scroll-reveal, visitor counter + contact form (calls the API)
│   └── assets/img/               # drop profile.jpg here to show your photo (monogram fallback otherwise)
└── backend/    # FastAPI
    └── main.py                   # GET /api/visits, POST /api/contact, serves the frontend
```

## Stack

- **Frontend:** vanilla HTML, CSS, JavaScript (multi-page, responsive, no build step).
- **Backend:** FastAPI (Python) with SQLite for the visitor counter and contact messages.
- **Backend-for-frontend:** the API also serves the static `frontend/` files, so a
  single `uvicorn main:app` process runs the entire site.

## Run it all (one command)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open <http://localhost:8000/>. The visitor counter increments on each load and
contact submissions are validated and stored in `backend/data/app.db`.

## Run the frontend alone (optional)

```bash
cd frontend
python -m http.server 5500
```

If served separately, set `API_BASE` in `frontend/assets/js/main.js` to the
backend URL (e.g. `http://localhost:8000`).

## Features

- Distinct "aurora depth" visual: layered gradient hero, floating 3D orbs, glass
  cards with hover lift, gradient buttons/headline, dark aurora footer.
- Positioning: **Python Backend & Applied AI Developer**.
- Latest projects surfaced: GRBS, Learnify (Next.js + FastAPI), TalkBuzz, CUET AI,
  Guzu, Heirloom Scents, NewsBuzz, Reciprocity, Project VEDA (planned).
- Real backend: visitor count + contact form (no third-party form service needed).
- Responsive + accessible; respects `prefers-reduced-motion`.

> The earlier `src/` folder is the GitHub Pages repo (also redesigned); this
> `frontend/` + `backend/` project is the standalone full-stack version.
