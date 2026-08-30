"""RAG pipeline for SASY.

Ingestion : every data file (projects, skills, experience, bio, knowledge.md)
            is turned into retrievable passages and stored in MongoDB.
Retrieval : lexical + light positional scoring over the stored passages;
            the top-k passages are injected into the prompt so SASY answers
            strictly from Shubham's real data.

This is the "proper pipeline" baseline. To upgrade to semantic vector search,
generate embeddings in `ingest_chunks` and do cosine ranking in `retrieve`
(e.g. MongoDB Atlas Vector Search) — the retrieval interface stays the same.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Dict, List

DATA_DIR = Path(__file__).resolve().parent / "data"

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


def _join(*parts):
    out = []
    for p in parts:
        if p is None:
            continue
        s = str(p).strip()
        if s:
            out.append(s)
    return "\n".join(out)


def build_corpus() -> List[Dict[str, str]]:
    docs: List[Dict[str, str]] = []

    docs.append(
        {
            "text": _join(
                "Shubham Mallick - B.Tech CSE (AI) student, graduating 2029, GIET Gunupur,",
                "based in North 24 Parganas, West Bengal, India. Python backend & applied-AI",
                "developer (FastAPI, databases, RAG, LLMs, agents, production deployment).",
                "Open to backend / Python / AI-ML internships for 2025-2026.",
                "Email shubham.mallick1440@gmail.com | GitHub github.com/shubham001312 |",
                "LinkedIn /in/shubham-mallick.",
            ),
            "meta": "bio",
        }
    )

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

    for e in _load("experience.json"):
        docs.append({"text": json.dumps(e, ensure_ascii=False), "meta": "experience"})

    # Drop-in file for ANY extra personal data (write freely, it gets indexed).
    kf = DATA_DIR.parent / "knowledge.md"
    if kf.exists():
        docs.append({"text": kf.read_text(encoding="utf-8"), "meta": "knowledge"})

    return docs


def _tokens(t: str) -> List[str]:
    return [w for w in re.findall(r"[a-z0-9]+", (t or "").lower()) if w not in STOP]


def retrieve(
    query: str, corpus: List[Dict[str, str]], k: int = 6
) -> List[Dict[str, str]]:
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
