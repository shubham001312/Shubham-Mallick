"""MongoDB persistence for visits, contact messages and chat logs.

Uses Motor (async). If MONGODB_URI is not set, it falls back to an
in-memory store so local dev works without a database.
"""

from __future__ import annotations

import hashlib
import os
from typing import Optional

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "portfolio")

_mongo = None
_db = None

# In-memory fallback (used when MONGODB_URI is absent).
_mem_visits = 0
_mem_messages: list[dict] = []
_mem_chats: list[dict] = []


def _client():
    """Return the Motor database, or None if Mongo is unavailable."""
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


async def get_visits(inc: bool = True) -> int:
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


async def save_contact(name: str, email: str, message: str) -> bool:
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


async def save_chat(user: str, reply: str) -> bool:
    db = _client()
    if db is not None:
        try:
            await db.chats.insert_one({"user": user, "reply": reply})
            return True
        except Exception:
            pass
    _mem_chats.append({"user": user, "reply": reply})
    return False


async def ingest_chunks(chunks: list[dict]) -> bool:
    """Store RAG passages in MongoDB (idempotent upsert by content hash)."""
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


async def get_chunks() -> Optional[list[dict]]:
    """Return stored RAG passages, or None when Mongo is unavailable."""
    db = _client()
    if db is None:
        return None
    try:
        cur = await db.chunks.find({}).to_list(length=400)
        return [{"text": d.get("text", ""), "meta": d.get("meta", "")} for d in cur]
    except Exception:
        return None
