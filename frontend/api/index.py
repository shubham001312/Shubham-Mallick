"""Vercel serverless entrypoint (api/index.py) — fully self-contained.

Vercel builds from the "frontend" Root Directory, so this file must NOT import
anything outside it. All RAG + MongoDB logic is inlined here and reads data from
frontend/data/. Motor is imported lazily with an in-memory fallback.
"""

import hashlib
import json
import os
import re
from pathlib import Path

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI()

HERE = Path(__file__).resolve().parent
DATA_DIR = HERE.parent / "data"  # frontend/data

# ── Groq ─────────────────────────────────────────────────────────────────────
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
# llama-3.1-8b-instant is NOT available on this key (returns 404), so the working
# fast models are used. Override GROQ_MODEL if you later get llama access.
FALLBACK_MODELS = ["groq/compound-mini", "qwen/qwen3.6-27b"]
MAX_TOKENS = 600
TEMPERATURE = 0.5
TIMEOUT = 8

SASY_SYSTEM = (
    "You are SASY, a friendly, warm and welcoming Indian AI assistant on Shubham Mallick's portfolio. "
    "You know everything about Shubham and can answer questions about his projects, skills/stack, "
    "education, experience, and career direction. "
    "PERSONALITY (Indian, warm): speak with warm Indian hospitality and a polite, friendly female tone (Indian English accent). "
    "Stay in clear English - do NOT use Hindi or Hinglish words. Greet visitors warmly. "
    "You are Shubham's personal assistant - a little playful, caring, and proud of his work. "
    "FACTS ABOUT SHUBHAM (use ONLY these - never invent): "
    "Name: Shubham Mallick. A B.Tech Computer Science Engineering (Artificial Intelligence) student at "
    "MAKAUT (Maulana Abul Kalam Azad University of Technology, West Bengal), currently in Semester 3. "
    "He focuses on software engineering and artificial intelligence. Python is his primary language; he also "
    "uses C++, C and JavaScript. Backend/web: FastAPI, Flask, REST APIs, SQL, PostgreSQL, SQLite, React, Next.js. "
    "Tools: Git, GitHub, Linux, VS Code, Docker, CI/CD, cloud deployment. "
    "AI interests: Machine Learning, Deep Learning, NLP, LLMs, AI Agents, agentic systems, RAG, embeddings, "
    "vector databases, AI memory, tool calling, multi-model systems. "
    "Projects: Hosteler (e-commerce platform for hostel students, live at hosteler.shop), ChhayaTaru Cafe "
    "(Next.js cafe website for a Howrah coffee house), Learnify (his flagship AI study companion for Indian students "
    "- college discovery, career guidance, scholarships), Veda AI (the multilingual LLM assistant inside Learnify with "
    "RAG + vector memory, Hindi/English/Bengali/Tamil), Reciprocity (an academic accountability register on Render), and "
    "GRBS (GPT Roadmap By Shubham - a local roadmap/progress tracker). "
    "Experience: an AI internship with Autom8x / SWOT Management (AI agent development, agentic workflows, "
    "Claude API, sub-agents, CI validation, technical documentation). "
    "Career goal: a junior backend software engineer for AI products, progressing toward AI platform / ML "
    "infrastructure engineering. "
    "ACCURACY RULES: clearly distinguish learning vs exposure vs experience vs expertise. Do NOT call Shubham an "
    "expert in a technology just because he has used it. Do NOT invent employers, projects, certifications, "
    "achievements, rankings, or personal information. If asked for something not in this profile, say the profile "
    "does not provide that. "
    "STYLE: Answer thoroughly and helpfully. Try to keep replies concise but don't be artificially short — "
    "give enough detail to be genuinely useful. Be warm, friendly, and a little playful, in a lovely "
    "Indian-English female tone. If you lack information, say so briefly and point to shubham.mallick1440@gmail.com."
)
SHUBHAM_BIO = (
    "ABOUT SHUBHAM: Shubham Mallick - B.Tech CSE (AI) student at MAKAUT (Maulana Abul Kalam Azad University of "
    "Technology, West Bengal), currently Semester 3. Python-primary backend and applied-AI developer. Interests: "
    "FastAPI, databases, RAG, LLMs, agents, AI infrastructure and production deployment. Open to backend / Python "
    "/ AI internships. GitHub: github.com/shubham001312 - LinkedIn: /in/shubham-mallick - "
    "Email: shubham.mallick1440@gmail.com. "
    "Built projects: Hosteler (hosteler.shop), ChhayaTaru Cafe (chhayataru.vercel.app), Learnify (learnify.hosteler.shop), "
    "Veda AI (learnify.hosteler.shop/#veda), Reciprocity (reciprocity-live.onrender.com), GRBS (shubham001312.github.io/GRBS)."
)

STOP = set(
    "a an the and or of to in for with on is are be this that his her you your our "
    "we i my me as at by from it its about he she they them can will do does did has have".split()
)


def _load(name):
    try:
        with open(DATA_DIR / name, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return []


# ── MongoDB (lazy, in-memory fallback) ────────────────────────────────────────
MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "portfolio")
CHAT_CAP = 200 * 1024 * 1024  # 200 MB FIFO ring buffer for chat history
_mongo = None
_db = None
_mem_visits = 0
_mem_messages = []
_mem_chats = []


def _client():
    global _mongo, _db
    if not MONGO_URI:
        return None
    if _mongo is None:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient

            _mongo = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=4000)
            _db = _mongo[DB_NAME]
        except Exception:
            _mongo = None
            _db = None
    return _db


async def db_get_visits(inc=True):
    db = _client()
    if db is not None:
        try:
            if inc:
                await db.visitors.update_one(
                    {"_id": "counter"}, {"$inc": {"count": 1}}, upsert=True
                )
            doc = await db.visitors.find_one({"_id": "counter"})
            return int(doc.get("count", 0)) if doc else 0
        except Exception:
            pass
    global _mem_visits
    if inc:
        _mem_visits += 1
    return _mem_visits


async def db_save_contact(name, email, message):
    db = _client()
    if db is not None:
        try:
            await db.messages.insert_one(
                {"name": name, "email": email, "message": message}
            )
            return True
        except Exception:
            pass
    _mem_messages.append({"name": name, "email": email, "message": message})
    return False


async def db_save_chat(user, reply, session=None):
    db = _client()
    if db is None:
        _mem_chats.append({"user": user, "reply": reply, "session": session})
        return False
    try:
        from datetime import datetime, timezone

        now = datetime.now(timezone.utc)
        docs = [
            {
                "ts": now,
                "session": session or "anon",
                "role": "user",
                "text": user,
                "bytes": len(user.encode("utf-8", "ignore")),
            },
            {
                "ts": now,
                "session": session or "anon",
                "role": "assistant",
                "text": reply,
                "bytes": len(reply.encode("utf-8", "ignore")),
            },
        ]
        await db.chat_history.insert_many(docs)
        added = sum(d["bytes"] for d in docs)
        await db.chat_meta.update_one(
            {"_id": "stats"}, {"$inc": {"total_bytes": added}}, upsert=True
        )
        # 200 MB FIFO ring buffer: evict oldest entries until under the cap
        stats = await db.chat_meta.find_one({"_id": "stats"})
        total = int((stats or {}).get("total_bytes", 0))
        while total > CHAT_CAP:
            oldest = await db.chat_history.find_one(sort=[("ts", 1)])
            if not oldest:
                break
            sz = int(oldest.get("bytes", 0)) or len(
                oldest.get("text", "").encode("utf-8", "ignore")
            )
            await db.chat_history.delete_one({"_id": oldest["_id"]})
            total -= sz
            await db.chat_meta.update_one(
                {"_id": "stats"}, {"$set": {"total_bytes": total}}
            )
        return True
    except Exception:
        _mem_chats.append({"user": user, "reply": reply, "session": session})
        return False


async def db_get_memory(session, limit=14):
    """Recent chat for THIS visitor (persists across reloads) so SASY learns continuity."""
    db = _client()
    if db is None or not session:
        return ""
    try:
        cur = (
            await db.chat_history.find({"session": session})
            .sort("ts", -1)
            .to_list(length=limit)
        )
        lines = [f"{d['role']}: {d['text']}" for d in reversed(cur)]
        return "\n".join(lines)
    except Exception:
        return ""


async def db_ingest_chunks(chunks):
    db = _client()
    if db is None:
        return False
    try:
        for c in chunks:
            cid = hashlib.md5(
                (c.get("meta", "") + "|" + (c.get("text", "") or "")[:80]).encode()
            ).hexdigest()
            await db.chunks.update_one(
                {"_id": cid},
                {"$set": {"text": c.get("text", ""), "meta": c.get("meta", "")}},
                upsert=True,
            )
        return True
    except Exception:
        return False


async def db_get_chunks():
    db = _client()
    if db is None:
        return None
    try:
        cur = await db.chunks.find({}).to_list(length=400)
        return [{"text": d.get("text", ""), "meta": d.get("meta", "")} for d in cur]
    except Exception:
        return None


# ── RAG ───────────────────────────────────────────────────────────────────────
def _join(*parts):
    out = []
    for p in parts:
        if p is None:
            continue
        s = str(p).strip()
        if s:
            out.append(s)
    return "\n".join(out)


def build_corpus():
    docs = [
        {
            "text": _join(
                "Shubham Mallick - B.Tech CSE (AI) student at MAKAUT (Maulana Abul Kalam Azad",
                "University of Technology, West Bengal), currently Semester 3. Python-primary",
                "backend and applied-AI developer. Interests: FastAPI, databases, RAG, LLMs,",
                "agents, AI infrastructure, production deployment. Open to backend / Python / AI",
                "internships. Email shubham.mallick1440@gmail.com | GitHub github.com/shubham001312 |",
                "LinkedIn /in/shubham-mallick.",
            ),
            "meta": "bio",
        }
    ]
    for p in _load("projects.json"):
        title = p.get("title", "Project")
        bits = [
            f"Project: {title}",
            f"status: {p.get('status', '')}",
            f"role: {p.get('role', '')}",
        ]
        stack = p.get("stack") or p.get("tech")
        if stack:
            bits.append(
                "stack: "
                + (", ".join(stack) if isinstance(stack, list) else str(stack))
            )
        if p.get("summary"):
            bits.append(p["summary"])
        if p.get("desc"):
            bits.append(p["desc"])
        if isinstance(p.get("highlights"), list):
            bits.append("highlights: " + "; ".join(p["highlights"]))
        if p.get("link"):
            bits.append("link: " + p["link"])
        docs.append({"text": _join(*bits), "meta": f"project:{title}"})
    for c in _load("skills.json"):
        cat = c.get("cat", "Skills")
        items = c.get("items", [])
        names = ", ".join(
            (i.get("name") or "") if isinstance(i, dict) else str(i) for i in items
        )
        docs.append({"text": f"Skill category {cat}: {names}", "meta": f"skill:{cat}"})
    return docs


def _tokens(t):
    return [w for w in re.findall(r"[a-z0-9]+", (t or "").lower()) if w not in STOP]


def retrieve(query, corpus, k=6):
    q = set(_tokens(query))
    if not q:
        return corpus[:k]
    scored = []
    for d in corpus:
        toks = _tokens(d["text"])
        overlap = len(q & set(toks))
        if overlap:
            coverage = overlap / len(toks) if toks else 0
            scored.append((overlap + 0.5 * coverage, d))
    scored.sort(key=lambda x: -x[0])
    return [d for _, d in scored[:k]]


def offline_answer(message):
    m = (message or "").lower()
    if any(k in m for k in ("project", "work", "built", "ship")):
        projs = _load("projects.json")
        if projs:
            return (
                "Shubham's projects include "
                + ", ".join(p.get("title") for p in projs[:6])
                + ". (AI offline - open the Work page for the full list.)"
            )
    if any(k in m for k in ("skill", "stack", "tech")):
        return "His stack centers on Python/FastAPI, Postgres, RAG/LLMs and Docker. (AI offline - see the Stack page.)"
    if any(k in m for k in ("availab", "intern", "hire", "freelance")):
        return "He's open to internships / freelance for 2025-2026. Reach him at shubham.mallick1440@gmail.com."
    if any(k in m for k in ("contact", "email", "reach")):
        return "Email Shubham at shubham.mallick1440@gmail.com (GitHub: shubham001312)."
    return "I'm SASY, Shubham's assistant - but my AI brain is offline right now. You can still email him at shubham.mallick1440@gmail.com."


def offline_answer_with(message, hits):
    m = (message or "").lower()
    if any(k in m for k in ("project", "work", "built", "ship")):
        titles = [
            h["meta"].split(":", 1)[1] for h in hits if h["meta"].startswith("project:")
        ]
        if titles:
            return (
                "Shubham's projects include "
                + ", ".join(titles)
                + ". (AI offline - open the Work page for the full list.)"
            )
    if any(k in m for k in ("skill", "stack", "tech")):
        cats = [
            h["meta"].split(":", 1)[1] for h in hits if h["meta"].startswith("skill:")
        ]
        if cats:
            return (
                "His stack spans: "
                + ", ".join(cats)
                + ". (AI offline - see the Stack page.)"
            )
    return offline_answer(message)


async def call_groq(message, history, ctx):
    import asyncio

    key = os.getenv("GROQ_API_KEY")
    if not key:
        return None
    system = SASY_SYSTEM + "\n\nRELEVANT INFO ABOUT SHUBHAM:\n" + ctx
    messages = [{"role": "system", "content": system}]
    for h in (history or [])[-6:]:
        if (
            isinstance(h, dict)
            and h.get("role") in ("user", "assistant")
            and h.get("content")
        ):
            messages.append({"role": h["role"], "content": str(h["content"])})
    messages.append({"role": "user", "content": message})

    models = [GROQ_MODEL] + [m for m in FALLBACK_MODELS if m != GROQ_MODEL]

    def _post():
        for mdl in models:
            try:
                with httpx.Client(
                    timeout=httpx.Timeout(
                        connect=4, read=TIMEOUT, write=TIMEOUT, pool=4
                    )
                ) as client:
                    r = client.post(
                        GROQ_URL,
                        headers={
                            "Authorization": f"Bearer {key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": mdl,
                            "messages": messages,
                            "temperature": TEMPERATURE,
                            "max_tokens": MAX_TOKENS,
                        },
                    )
                    if r.status_code == 200:
                        return r.json()["choices"][0]["message"]["content"].strip()
            except Exception:
                continue
        return None

    return await asyncio.to_thread(_post)


# Cache the corpus in memory so we never hit Mongo (or rebuild) on the hot path.
_CORPUS = None


def _get_corpus():
    global _CORPUS
    if _CORPUS is None:
        _CORPUS = build_corpus()
    return _CORPUS


async def chat_reply(message, history=None, session=None):
    msg = (message or "").strip()
    if not msg:
        return "Say something and I'll help! :)"
    corpus = _get_corpus()
    hits = retrieve(msg, corpus)
    context = (
        "\n\n".join(f"[{h['meta']}]\n{h['text']}" for h in hits)
        if hits
        else SHUBHAM_BIO
    )
    memory = await db_get_memory(session)
    if memory:
        context += (
            "\n\nCONVERSATION MEMORY (learned from prior chats with this visitor):\n"
            + memory
        )
    reply = await call_groq(msg, history or [], context)
    if not reply:
        reply = offline_answer_with(msg, hits)
    return reply


# ── Routes ────────────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(request: Request):
    try:
        data = await request.json()
    except Exception:
        data = {}
    msg = (data.get("message") or "").strip()
    history = data.get("history") or []
    session = data.get("session") or None
    if not msg:
        return JSONResponse({"reply": "Ask me something about Shubham! :)"})
    reply = await chat_reply(msg, history, session)
    await db_save_chat(msg, reply, session)
    return JSONResponse({"reply": reply})


@app.get("/api/projects")
async def projects():
    d = _load("projects.json")
    return d if isinstance(d, list) else []


@app.get("/api/skills")
async def skills():
    d = _load("skills.json")
    return d if isinstance(d, list) else []


@app.get("/api/visits")
async def visits(inc: bool = True):
    return {"count": await db_get_visits(inc)}


# ── Static site (so Vercel serves the portfolio HTML/CSS/JS too) ──────────────
STATIC_DIR = HERE.parent  # frontend/


@app.get("/{full_path:path}")
async def static_site(full_path: str):
    from fastapi.responses import FileResponse

    req = (full_path or "").lstrip("/")
    if not req or req.endswith("/"):
        req = "index.html"
    # map extension-less page routes to .html
    if "/" not in req and "." not in req and req not in ("index.html",):
        req = req + ".html"
    root = STATIC_DIR.resolve()
    candidate = (root / req).resolve()
    if str(candidate).startswith(str(root)):
        if candidate.is_file():
            return FileResponse(str(candidate))
    # SPA-ish fallback to index.html for unknown paths
    idx = root / "index.html"
    if idx.is_file():
        return FileResponse(str(idx))
    return JSONResponse(status_code=404, content={"detail": "not found"})


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ContactIn(BaseModel):
    name: str
    email: str
    message: str


@app.post("/api/contact")
async def contact(payload: ContactIn):
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
    await db_save_contact(name, email, message)
    return {"ok": True}
