"""Shared SASY chat logic — used by both the local FastAPI backend and the
Vercel serverless function (frontend/api/chat.py)."""

from __future__ import annotations

import json
import os
from pathlib import Path

import httpx

from db import get_chunks as db_get_chunks, ingest_chunks as db_ingest_chunks
from rag import build_corpus, retrieve

DATA_DIR = Path(__file__).resolve().parent / "data"

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Tuned for fast, snappy replies.
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
    "STYLE: Respond however long or short you feel is appropriate for the question. There is NO length "
    "restriction — a simple question gets a simple answer, a detailed question gets a detailed answer. "
    "Be warm, friendly, and a little playful. Use formatting like bullet points or line breaks when it "
    "helps clarity. If you lack information, say so and point to shubham.mallick1440@gmail.com."
)

SHUBHAM_BIO = (
    "ABOUT SHUBHAM: B.Tech CSE (AI) student, graduating 2029, based in North 24 Parganas, "
    "West Bengal, India. Python backend & applied-AI developer - FastAPI, databases, RAG, "
    "LLMs, agents, production deployment. Open to backend / Python / AI-ML internships for "
    "2025-2026. GitHub: github.com/shubham001312 - LinkedIn: /in/shubham-mallick - "
    "Email: shubham.mallick1440@gmail.com."
)

_corpus_cache = None


def load_json(name):
    path = DATA_DIR / name
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return []


def _names(items):
    out = []
    for it in items or []:
        if isinstance(it, dict):
            out.append(it.get("name") or it.get("label") or str(it))
        else:
            out.append(str(it))
    return ", ".join(out)


def build_context(message: str) -> str:
    m = (message or "").lower()
    parts = [SHUBHAM_BIO]
    if any(k in m for k in ("project", "work", "built", "ship", "portfolio")):
        projs = load_json("projects.json")
        if projs:
            parts.append(
                "PROJECTS: "
                + "; ".join(
                    f"{p.get('title')} ({p.get('status', '?')})" for p in projs[:14]
                )
            )
    if any(k in m for k in ("skill", "stack", "tech", "language", "tool", "know")):
        skills = load_json("skills.json")
        if skills:
            parts.append(
                "SKILLS: "
                + "; ".join(
                    f"{c.get('cat')}: {_names(c.get('items', []))}" for c in skills
                )
            )
    if any(
        k in m
        for k in ("availab", "intern", "hire", "job", "open", "work with", "freelance")
    ):
        parts.append(
            "AVAILABILITY: Open to internships / freelance for 2025-2026. Best contact: shubham.mallick1440@gmail.com."
        )
    if any(
        k in m for k in ("contact", "email", "reach", "message", "linkedin", "github")
    ):
        parts.append(
            "CONTACT: email shubham.mallick1440@gmail.com, GitHub github.com/shubham001312, LinkedIn /in/shubham-mallick."
        )
    if any(
        k in m
        for k in (
            "experience",
            "path",
            "education",
            "study",
            "college",
            "course",
            "degree",
        )
    ):
        parts.append(
            "EDUCATION/PATH: B.Tech CSE(AI) 2025-2029 at GIET Gunupur; builds Learnify, Heirloom Scents, GRBS, NewsBuzz, CUET AI, Guzu, Reciprocity, Project VEDA."
        )
    return "\n".join(parts)


def offline_answer(message: str) -> str:
    m = (message or "").lower()
    if any(k in m for k in ("project", "work", "built", "ship")):
        projs = load_json("projects.json")
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


def offline_answer_with(message: str, hits: list) -> str:
    """Offline reply grounded in the retrieved RAG passages."""
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
    key = os.getenv("GROQ_API_KEY")
    if not key:
        return None
    system = SASY_SYSTEM + "\n\nCONTEXT YOU CAN USE:\n" + ctx
    messages = [{"role": "system", "content": system}]
    for h in (history or [])[-6:]:
        if (
            isinstance(h, dict)
            and h.get("role") in ("user", "assistant")
            and h.get("content")
        ):
            messages.append({"role": h["role"], "content": str(h["content"])})
    messages.append({"role": "user", "content": message})
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": TEMPERATURE,
                    "max_tokens": MAX_TOKENS,
                },
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"].strip()
    except Exception:
        return None


async def chat_reply(message, history=None):
    msg = (message or "").strip()
    if not msg:
        return "Say something and I'll help! :)"
    global _corpus_cache
    corpus = _corpus_cache
    if corpus is None:
        corpus = await db_get_chunks()
        if corpus is None:
            corpus = build_corpus()
            try:
                await db_ingest_chunks(corpus)
            except Exception:
                pass
        _corpus_cache = corpus
    hits = retrieve(msg, corpus)
    context = (
        "\n\n".join(f"[{h['meta']}]\n{h['text']}" for h in hits)
        if hits
        else SHUBHAM_BIO
    )
    reply = await call_groq(msg, history or [], context)
    if not reply:
        reply = offline_answer_with(msg, hits)
    return reply
