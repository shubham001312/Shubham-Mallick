<![CDATA[<div align="center">

# Shubham Mallick

### Python Backend & Applied AI Developer

[![Portfolio](https://img.shields.io/badge/🌐_Live_Site-shubhammallickengineer.hosteler.shop-7A1F2B?style=for-the-badge&logo=vercel&logoColor=white)](https://shubhammallickengineer.hosteler.shop/)
[![GitHub](https://img.shields.io/badge/GitHub-@shubham001312-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/shubham001312)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-/in/shubham--mallick-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shubham-mallick-061298378)
[![Email](https://img.shields.io/badge/Email-shubham.mallick1440@gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:shubham.mallick1440@gmail.com)

**B.Tech CSE (AI) student building production-grade FastAPI services, RAG pipelines, and LLM products that survive real users.**

---

</div>

## 🧑‍💻 About Me

I'm **Shubham Mallick** — a Python-first backend and applied-AI developer from West Bengal, India. I don't just build demos — I ship products.

- 🎓 **B.Tech CSE (AI)** at MAKAUT (Maulana Abul Kalam Azad University of Technology), West Bengal — Semester 3
- 🔧 **Focus:** Backend systems, APIs, databases, machine learning, LLM applications, RAG, agents, and deployment
- 🎯 **Goal:** Become a strong backend engineer for AI products, then grow into AI Platform / ML Infrastructure engineering
- 🌍 **Available for:** Backend / Python / AI internships & freelance (2025–2026)

## 🚀 What I Build

| Domain | Stack | What it does |
|--------|-------|-------------|
| **Backend Engineering** | FastAPI, PostgreSQL, SQLAlchemy, REST APIs, pytest | Production-grade services with clean architecture |
| **Applied AI & LLM Systems** | RAG, LLMs, Embeddings, Vector DBs, AI Agents, LangChain | Models treated as engineered systems with latency budgets |
| **Ship-to-Production** | Docker, CI/CD, Vercel, Supabase, Git, Linux | Projects that leave my machine and stay alive |

## 📂 Featured Projects

| Project | Description | Stack | Status |
|---------|-------------|-------|--------|
| [**Hosteler**](https://www.hosteler.shop/) | E-commerce platform for hostel students — essentials, wishlist, cart, student discounts, free pan-India delivery | Next.js, React, Node.js, PostgreSQL, Vercel | ✅ Live |
| [**Learnify**](https://learnify.hosteler.shop/) | AI study companion for Indian students — college discovery, career guidance, scholarships | Python, FastAPI, RAG, LLMs, Vector DB | ✅ Live |
| [**Veda AI**](https://learnify.hosteler.shop/#veda) | Multilingual LLM assistant inside Learnify — Hindi, English, Bengali, Tamil | FastAPI, RAG, Vector Memory, Embeddings | ✅ Live |
| [**ChhayaTaru Cafe**](https://chhayataru.vercel.app/) | Bilingual cafe website for a Howrah coffee house — menu, gallery, table booking | Next.js, React, Vercel, Tailwind CSS | ✅ Live |
| [**Reciprocity**](https://reciprocity-live.onrender.com/) | Academic accountability register | Python, FastAPI | ✅ Live |
| [**GRBS**](https://shubham001312.github.io/GRBS/) | GPT Roadmap By Shubham — local roadmap/progress tracker | HTML, CSS, JS | ✅ Live |

## 🛠️ Tech Stack

```
Languages:    Python · C++ · C · JavaScript
Backend:      FastAPI · Flask · REST APIs · SQL · PostgreSQL · SQLite
Frontend:     React · Next.js · HTML · CSS · JavaScript
AI/ML:        RAG · LLMs · Embeddings · Vector DBs · AI Agents · NLP · ML · DL
Tools:        Git · GitHub · Linux · VS Code · Docker · CI/CD
Deployment:   Vercel · Render · Supabase · Cloud
```

## 🏗️ Portfolio Architecture

```
.
├── frontend/                    # Vanilla HTML + CSS + JS (no framework)
│   ├── index.html               # Home — 3D hero, capabilities, SASY AI assistant
│   ├── about.html               # About — values, background, portrait
│   ├── projects.html            # Work — dynamic project cards from API
│   ├── experience.html          # Path — timeline, education, milestones
│   ├── contact.html             # Contact — email, shell terminal UI
│   ├── robots.txt               # SEO — crawler directives
│   ├── sitemap.xml              # SEO — sitemap for Google/Bing
│   ├── sw.js                    # Service worker for offline + caching
│   ├── api/                     # Vercel serverless functions
│   │   └── index.py             # /api/chat, /api/projects, /api/skills, /api/visits
│   ├── assets/
│   │   ├── css/styles.css       # Full theme (700+ lines, responsive, animations)
│   │   ├── js/main.js           # Nav, 3D hero, SASY AI chat, drag, TTS, particles
│   │   └── img/                 # Profile photo, favicon, SASY SVG
│   └── data/
│       ├── projects.json        # Project data (dynamic rendering)
│       └── skills.json          # Skills data (dynamic rendering)
│
└── backend/                     # FastAPI (local dev)
    ├── main.py                  # Routes: /api/visits, /api/contact, /api/health
    ├── chat_core.py             # SASY AI — Groq API, RAG, intent detection, memory
    ├── rag.py                   # RAG pipeline — corpus building, lexical retrieval
    ├── db.py                    # MongoDB persistence + in-memory fallback
    └── data/                    # Local data files
```

## ✨ Key Features

### 🤖 SASY — AI Personal Assistant
- **Context-engineered backend** — intent detection (8 intents), query-aware context injection, persistent memory (14 turns)
- **RAG pipeline** — lexical retrieval over project/skill corpus, relevance scoring
- **Browser SpeechSynthesis** — lightweight TTS using the device's native voice
- **Draggable character** — CSS face expressions (happy, sad, angry, think, talk, calm, excited, wave)
- **Chat panel** — terminal-style UI with quick commands, typing indicator, themed bubbles

### 🎨 Visual Design
- **3D WebGL Hero** — Three.js neural core with particle system, orbital rings, ambient glow
- **Aurora Depth theme** — gradient hero, floating orbs, glass cards, custom cursor
- **Mood system** — SASY reacts to conversation with face expressions + sound effects
- **Particle animation** — Canvas-based floating particles around SASY (24fps)
- **Responsive** — Fully responsive across all devices (mobile, tablet, desktop)

### ⚡ Performance
- **No build step** — vanilla HTML/CSS/JS, zero dependencies on frontend
- **Lazy loading** — Three.js loads only when hero is visible, pauses when off-screen
- **Capped animations** — Hero at 30fps, particles at 24fps, cursor throttled via RAF
- **Message debouncing** — Prevents API flooding from rapid chat messages
- **RAG caching** — Corpus cached in memory, no rebuild per request

### 🔍 SEO (100+ Keywords Targeted)
- **Open Graph** + **Twitter Cards** on all 5 pages
- **JSON-LD structured data** — Person, WebSite, OfferCatalog, CollectionPage, ItemList, ContactPoint
- **Canonical URLs** on every page
- **Meta keywords** — 100+ keywords per page (name, skills, projects, location, education, internship)
- **robots.txt** + **sitemap.xml**
- **Semantic HTML** — proper H1/H2/H3 hierarchy, alt text, ARIA labels

## 🚀 Quick Start

### Frontend (static)
```bash
cd frontend
python -m http.server 5500
# Open http://localhost:5500
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Open http://localhost:8000
```

### Full Stack (single command)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Serves both API + frontend
```

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/visits` | Visitor counter (increments on each load) |
| `POST` | `/api/contact` | Submit contact form (`{name, email, message}`) |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | SASY AI chat (`{message, history, session}`) |
| `GET` | `/api/projects` | Get all projects (JSON) |
| `GET` | `/api/skills` | Get all skills (JSON) |

## 🌍 Live Deployment

| Platform | URL | Purpose |
|----------|-----|---------|
| **Vercel** | [shubhammallickengineer.hosteler.shop](https://shubhammallickengineer.hosteler.shop/) | Production site (auto-deploys on push to `main`) |
| **GitHub** | [shubham001312/Shubham-Mallick](https://github.com/shubham001312/Shubham-Mallick) | Source code |

## 📊 SEO & Discoverability

- **Google Search Console** — sitemap submitted, all pages indexed
- **100+ targeted keywords** across 5 pages
- **Structured data** (JSON-LD) for rich Google snippets
- **Open Graph** + **Twitter Cards** for social sharing
- **Canonical URLs** to prevent duplicate content
- **robots.txt** allowing all crawlers, blocking API routes
- **sitemap.xml** with priorities and lastmod dates

## 📜 License

This project is personal portfolio code. All rights reserved by Shubham Mallick.

---

<div align="center">

**Built with 💜 by Shubham Mallick**

*"Shipped, not just built."*

</div>
]]>