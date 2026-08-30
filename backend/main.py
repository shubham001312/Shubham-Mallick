"""Shubham Mallick — Portfolio backend (FastAPI).

Endpoints
  GET  /api/visits        -> increments + returns the visitor count
  POST /api/contact       -> validates + stores a contact message (optional SMTP)
  GET  /api/health        -> liveness check

The static frontend in ../frontend is served from "/" so a single
`uvicorn main:app` process runs the whole site.
"""

from __future__ import annotations

import json
import os
import re
import smtplib
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import httpx

from db import (
    get_visits as db_get_visits,
    save_contact as db_save_contact,
    save_chat as db_save_chat,
)

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = FastAPI(title="Shubham Mallick Portfolio API", version="1.0.0")

# CORS — permissive for local dev; tighten to your domain in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ContactIn(BaseModel):
    name: str
    email: str
    message: str


def maybe_send_email(name: str, email: str, message: str) -> None:
    """Best-effort SMTP delivery. No-op if SMTP_* env vars are unset."""
    from email.message import EmailMessage

    host = os.getenv("SMTP_HOST")
    user = os.getenv("SMTP_USER")
    pwd = os.getenv("SMTP_PASS")
    if not (host and user and pwd):
        return
    to = os.getenv("CONTACT_TO", "shubham.mallick1440@gmail.com")
    mail = EmailMessage()
    mail["Subject"] = f"Portfolio message from {name}"
    mail["From"] = user
    mail["To"] = to
    mail.set_content(f"From: {name} <{email}>\n\n{message}")
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587"))) as s:
        s.starttls()
        s.login(user, pwd)
        s.send_message(mail)


@app.get("/api/visits")
async def visits(inc: bool = True):
    return {"count": await db_get_visits(inc)}


@app.post("/api/contact")
async def post_contact(payload: ContactIn):
    name = payload.name.strip()
    email = payload.email.strip()
    message = payload.message.strip()
    if not name or not email or not message:
        return JSONResponse(
            status_code=422, content={"ok": False, "detail": "All fields are required."}
        )
    if not EMAIL_RE.match(email):
        return JSONResponse(
            status_code=422, content={"ok": False, "detail": "Invalid email address."}
        )
    created = datetime.now(timezone.utc).isoformat()
    await db_save_contact(name, email, message)
    try:
        maybe_send_email(name, email, message)
    except Exception:
        pass  # storage succeeded; email is best-effort
    return {"ok": True, "created_at": created}


@app.get("/api/health")
def health():
    return {"ok": True}


def load_json(name: str):
    """Read a JSON data file from the data/ directory (or return [] on error)."""
    path = DATA_DIR / name
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return []


@app.get("/api/projects")
def get_projects():
    data = load_json("projects.json")
    return data if isinstance(data, list) else []


@app.get("/api/skills")
def get_skills():
    data = load_json("skills.json")
    return data if isinstance(data, list) else []


# ───────────────────────────── AI CHAT (SASY) ─────────────────────────────
# Shared logic lives in chat_core.py so the Vercel serverless function
# (frontend/api/chat.py) and this local backend stay in sync.
from chat_core import chat_reply


class ChatIn(BaseModel):
    message: str
    history: list = []


@app.post("/api/chat")
async def chat(payload: ChatIn):
    reply = await chat_reply(payload.message, payload.history or [])
    await db_save_chat(payload.message, reply)
    return {"reply": reply}


# Serve the static frontend last so API routes take precedence.
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
