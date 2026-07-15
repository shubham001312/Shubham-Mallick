# Shubham Mallick — Portfolio Content Guide

> **Your single source of truth.** Every piece of written text on the site lives here,
> grouped by page and field, with a `Location:` note telling you exactly where it sits
> in the HTML. To change something on the live site, edit the text in the matching
> HTML file (the site is static — there is no database).

---

## How to use this file

1. Find the page section below (HOME, ABOUT, PROJECTS, …).
2. Find the field you want to change (e.g. `hero_h1`).
3. Open the `Location:` file and edit that exact text.
4. Refresh the browser to see the change.
5. For contact details (email / GitHub / LinkedIn), they appear in **many places** —
   search the whole `portfolio/` folder for the value and update every occurrence,
   or ask me to do a global replace.

**File map**
```
index.html       → Home
about.html       → About
projects.html    → Projects
skills.html      → Skills
experience.html  → Experience
contact.html     → Contact
assets/css/styles.css → all visual styling (colors, spacing, fonts)
assets/js/main.js     → nav toggle, scroll reveal, contact form
```

---

## GLOBAL — appears on every page

### Header brand
- **brand_name**: `Shubham Mallick`
  Location: every page → `.brand-name` (first line of the `<a class="brand">`)
- **brand_subtitle**: `Python Backend & Applied AI`
  Location: every page → `.brand-name small`

### Navigation labels
- **nav**: `Home` · `About` · `Projects` · `Skills` · `Experience` · `Contact`
  Location: every page → `.nav ul li a`

### Footer
- **footer_brand**: `Shubham Mallick`
  Location: every page → `.footer-brand`
- **footer_sub**: `Python Backend & Applied AI Developer · North 24 Parganas, WB, India`
  Location: every page → `.footer-brand small`
- **footer_note**: `© 2026 Shubham Mallick. Built with HTML, CSS & vanilla JS. No private data published.`
  Location: every page → `.footer-note`

### Contact details (used in header/footer + Contact page; all open Gmail compose — update everywhere)
- **email**: `shubham.mallick1440@gmail.com`
- **github**: `https://github.com/shubham001312`
- **linkedin**: `https://www.linkedin.com/in/shubham-mallick-061298378`
- **location**: `North 24 Parganas, West Bengal, India`
- **portfolio_url**: `https://shubham001312.github.io/Shubham-Mallick/`
  Location: `contact.html` → "Portfolio:" link

---

## HOME — `index.html`

### Hero
- **hero_eyebrow**: `Python Backend & Applied AI Developer`
  Location: `.hero-eyebrow`
- **hero_h1**: `Building AI products with FastAPI, Machine Learning, RAG, and LLM systems.`
  Location: `.hero h1`
- **hero_lead**: `Hi, I'm Shubham Mallick — a B.Tech CSE(AI) student building practical backend and AI systems with Python. My focus is to become a strong backend engineer for AI products first, and later grow into AI Platform / ML Infrastructure engineering.`
  Location: `.hero-lead`
- **hero_meta** (three chips):
  - `North 24 Parganas, West Bengal, India`
  - `B.Tech CSE (Artificial Intelligence)`
  - `Open to internships`
  Location: `.hero-meta span`
- **hero_cta**: button labels `View Projects` · `Get in Touch`
  Location: `.hero-cta .btn`

### Focus (3 cards)
- **focus_eyebrow**: `What I do`
- **focus_h2**: `Focused on the backend of AI products`
  Location: `.section .section-head` (first section)
- Card 1 — **title**: `Python Backend Engineering`
  **text**: `FastAPI, REST APIs, SQL and PostgreSQL, authentication basics, and clean service design. I build the systems that sit behind an AI feature and make it usable.`
- Card 2 — **title**: `Applied AI & LLM Systems`
  **text**: `Machine learning, deep learning, NLP, RAG pipelines, embeddings, vector databases, and AI agents. I turn models into working products, not just demos.`
- Card 3 — **title**: `Production-Ready Mindset`
  **text**: `Testing with pytest, Docker basics, deployment, and a project-first approach. I care about systems that are useful, scalable, reliable, and shipped.`
  Location: `.split .card` (3 articles)

### Featured projects
- **feat_eyebrow**: `Selected work`
- **feat_h2**: `Featured projects`
- **feat_lead**: `A few of the builds that show where I'm taking this — from a shipped roadmap app to a flagship personal AI system.`
  Location: `.section--tight .section-head` (second section)
- Project cards reuse the same text as the PROJECTS page (see below). Link labels:
  - GRBS: `Open GRBS` (links to GRBS live site)
  - NewsBuzz: `Details` (links to `#newsbuzz`)
  - VEDA: `Details` (links to `#veda`)
- **feat_all_btn**: `All projects` → links to `projects.html`

### At a glance (stats)
- `11` · `Portfolio Projects`
- `3` · `Built / Live`
- `2025–29` · `B.Tech CSE (AI)`
- `AI` · `Platform Track`
  Location: `.stats .stat` (number + label)

### Target roles callout
- **target_callout_title**: `Looking for an internship-ready Python Backend & Applied AI Developer?`
- **target_callout_text**: `I'm targeting Python Developer, Backend, and AI/ML internships — and I learn fast by building. See my skills, experience, or reach out.`
  Location: `.callout` (last section before footer)

---

## ABOUT — `about.html`

- **breadcrumb**: `Home / About`
- **h1**: `About`
- **lead**: `I'm not only learning AI from a theoretical angle — I'm building toward real engineering ability. My focus is backend systems, APIs, databases, machine learning, LLM applications, RAG, agents, and deployment.`
  Location: `.page-hero`

### Short version
- **short_eyebrow**: `Who I am`
- **short_h2**: `The short version`
- **short_p1**: `I am Shubham Mallick, a B.Tech Computer Science Engineering student specializing in Artificial Intelligence. I am focused on Python backend development, applied AI, LLM applications, RAG systems, and production-ready software engineering.`
- **short_p2**: `My current goal is to become internship-ready as a Python Backend and Applied AI Developer, while building serious portfolio projects such as GRBS, NewsBuzz, and Project VEDA.`

### In detail
- **detail_eyebrow**: `In detail`
- **detail_h2**: `How I think about the work`
- **detail_p1**: `My core interest lies at the intersection of software engineering and artificial intelligence. I am building my foundation in Python, C/C++, DSA, SQL, backend development, machine learning, deep learning, NLP, LLMs, RAG systems, and AI agents.`
- **detail_p2**: `My preferred career path starts with Python backend development for AI products and gradually moves toward AI Platform Engineering, ML Infrastructure, and LLM systems. I enjoy understanding systems from the ground up, building projects, debugging deeply, and turning learning into practical applications.`
- **detail_p3**: `My long-term vision is to build reliable AI systems that can reason, remember, assist, automate, and operate in real-world software environments.`

### Education (timeline)
- **edu_eyebrow**: `Education`
- **edu_h2**: `Where I'm studying`
- Item 1 — **date**: `2025 – 2029`
  **title**: `B.Tech — Computer Science Engineering (AI)`
  **meta**: `Budge Budge Institute of Technology · under MAKAUT`
  **text**: `Specialization in Artificial Intelligence. Currently entering 2nd year, building toward a CGPA of 8+.`
- Item 2 — **date**: `Senior Secondary`
  **title**: `Jawahar Navodaya Vidyalaya`
  **meta**: `Computer Science background`
  **text**: `Foundations in mathematics and computing that set the direction for engineering.`

### Strengths
- **str_eyebrow**: `Strengths`
- **str_h2**: `How I work`
- **str_tags**: Analytical thinking · Logical problem solving · Fast learning · Self-driven discipline · Project-first mindset · Debugging patience · Build from scratch · Backend + AI focus · Career clarity · Ownership mindset

### Learning style & career goal
- **learn_eyebrow**: `Learning style`
- **learn_h2**: `How I learn`
- **learn_callout_1**: `I learn by first understanding the concept, then attempting problems independently, spending serious time debugging, and finally comparing my approach with better solutions.`
- **learn_callout_2**: `I prefer project-based learning because it forces me to convert theory into working systems.`
- **career_callout**: `Career goal. Immediate: become internship-ready as a Python Backend and Applied AI Developer. Long-term: become an AI Platform / ML Infrastructure Engineer who can build, deploy, optimize, and operate reliable AI systems at scale.`

### Positioning
- **pos_title**: `Current positioning`
- **pos_line1**: `Python Backend and Applied AI Developer — FastAPI, SQL, Machine Learning, RAG, and LLM Applications.`
- **pos_line2**: `Aspiring AI Platform Engineer focused on backend systems, machine learning infrastructure, LLM applications, and production AI products.`
- **pos_btn**: `See what I've built` → links to `projects.html`

---

## PROJECTS — `projects.html`

- **breadcrumb**: `Home / Projects`
- **h1**: `Projects`
- **lead**: `A mix of shipped work and planned builds — each one chosen to push my backend and AI engineering ability further. Status is kept honest.`

### Status chart
- **chart_h3**: `Project status at a glance`
- **chart_hint**: `11 projects · categorical by status`
- **legend**: `Built / Live` (1) · `In Progress` (2) · `Planned` (8)
- **table_caption**: `Projects by status (full list below)`

### Built & in progress
- **bi_eyebrow**: `Shipped & in progress`
- **bi_h2**: `Built and in-progress work`

Project entries (title · status pill · description · tech tags):
1. **GRBS — Goal Roadmap Builder System** · `Built` · `A roadmap and progress-tracking web app with dashboard, roadmap, projects, goals, readiness meters, localStorage, import/export, and a responsive UI.` · tags: Web App, Dashboard, localStorage, Import / Export, Responsive UI · link: `Open live` → `https://shubham001312.github.io/GRBS/`
2. **NewsBuzz** · `In Progress` · `An AI-powered news website concept with an auto-publishing pipeline and a manual release workflow for controlled rollout.` · tags: AI, Content, Automation, Publishing · anchor `#newsbuzz`
3. **Project VEDA** · `Flagship` · `A personal AI system combining local LLMs, external model APIs, vector memory, RAG, summarization, chat, agents, and web deployment.` · tags: LLM, RAG, Vector Memory, Agents, Summarization · anchor `#veda`

### Planned
- **plan_eyebrow**: `Roadmap`
- **plan_h2**: `Planned builds`
- **plan_lead**: `These are the next projects on my list — each targets a specific skill: backend, systems, ML math, or LLM engineering.`

Planned entries (title · `Planned` · description · tags):
4. **Student Productivity API** · `Backend API with authentication, database, testing, Docker, and deployment.` · FastAPI, Auth, SQL, pytest, Docker
5. **CLI Expense Tracker** · `Python CLI project for expense tracking with file/database persistence.` · Python, CLI, Persistence
6. **CLI AI Assistant** · `Terminal-based assistant using APIs / local models for productivity automation.` · Python, CLI, LLM API
7. **RAG Demo App** · `Document Q&A system using embeddings, a vector database, and LLM responses.` · Embeddings, Vector DB, LLM
8. **Agent Demo** · `Tool-using AI agent with memory and structured tasks.` · AI Agent, Memory, Tools
9. **Mini DB Engine** · `Low-level systems project to understand storage, indexing, and query behavior.` · Systems, Storage, Indexing
10. **PCA From Scratch** · `ML / math project implementing Principal Component Analysis manually.` · NumPy, Math, ML
11. **Visual Backprop** · `Deep learning visualization project to make training behavior observable.` · Deep Learning, Visualization

---

## SKILLS — `skills.html`

- **breadcrumb**: `Home / Skills`
- **h1**: `Skills`
- **lead**: `A honest map of what I can do today and what I'm actively learning — from Python and FastAPI to machine learning, LLMs, and RAG.`

### Radar chart
- **radar_h3**: `AI & Backend profile`
- **radar_hint**: `Self-rated 0–5 · single series`
- **radar_desc**: `The shape shows where my effort is concentrated right now — strong programming fundamentals, growing backend and LLM work, with deep learning and MLOps still ramping up.`
- **radar_table_caption**: `Self-rated skill areas (0 = none, 5 = production-ready)`
- Areas + ratings: Programming 4.0 · Backend 3.0 · Databases 3.0 · AI / ML 3.0 · Deep Learning 2.5 · LLM Systems 3.0 · Tools & DevOps 3.5 · DSA & Testing 2.5

### Skill meters
- **meters_eyebrow**: `By area`
- **meters_h2**: `What I work with`
- **meters_note**: `Levels are self-assessed: Basic, Learning, Intermediate, Solid, Advanced.`

Skill groups (area → note → items `label : level`):
- **Programming** (Core languages I build with): Python : Solid · C : Intermediate · C++ : Intermediate · Java (basic) : Basic
- **Backend** (APIs and server-side development): FastAPI : Learning · REST APIs : Intermediate · JSON / HTTP : Solid · Authentication basics : Basic
- **Databases** (Storing and querying data): SQL : Intermediate · PostgreSQL : Intermediate · SQLAlchemy : Learning · Database design : Basic
- **AI / ML** (Classical machine learning): NumPy : Intermediate · pandas : Intermediate · scikit-learn : Intermediate · PyTorch : Learning · TensorFlow : Basic
- **Deep Learning** (Networks, sequences, transformers): Neural networks : Learning · CNNs : Learning · RNN / LSTM : Learning · Transformers : Learning · Hugging Face : Basic
- **LLM Systems** (Retrieval, agents, orchestration): RAG : Learning · Embeddings : Learning · Vector databases : Learning · LangChain : Basic · LlamaIndex : Basic · AI agents : Learning
- **Tools & DevOps** (Day-to-day engineering): Git / GitHub : Solid · Linux : Intermediate · VS Code : Solid · WSL2 : Intermediate · Docker : Basic
- **Testing, DSA & Deployment** (Quality and shipping): pytest / unit testing : Learning · DSA (arrays, strings, maps, sorting…) : Intermediate · GitHub Pages : Solid · Web / API deployment : Learning

- **currently_learning**: `Currently learning: FastAPI production backend, DSA, ML systems, LLM engineering, and MLOps basics.`

---

## EXPERIENCE — `experience.html`

- **breadcrumb**: `Home / Experience`
- **h1**: `Experience`
- **lead**: `Internships, community memberships, and the learning track behind them — plus the roles I'm targeting next.`

### Roles
- **roles_eyebrow**: `Roles & memberships`
- **roles_h2**: `What I've been doing`
- 1. **AI Intern — Autom8x / SWOT Management LLC** · `Jul 2026 – Sep 2026` · `Remote · AI/ML systems · Claude certification-oriented work` · `Working on applied AI/ML systems and gaining hands-on exposure to production AI workflows through a Claude learning track.`
- 2. **Member — Google Developer Group** · `Jun 2026 – Present` · `Kolkata` · `Community member engaging with developer events, talks, and applied Google technologies.`
- 3. **AI Prompt / Evaluation Work — Project Seal India** · `Contract` · `Optional · contractor-style experience` · `Prompt engineering and evaluation contributions. Listed as optional public experience.`

### Certifications
- **cert_eyebrow**: `Learning & credentials`
- **cert_h2**: `Certifications`
- **cert_lead**: `Some titles are still being verified before public use — noted honestly below.`
- Google AI · `Completed` · `Google AI certification. Verify exact title before publishing.`
- Google AI Essentials · `Completed` · `Foundational Google AI Essentials course.`
- Python for Data Science, AI & Development · `Completed` · `Python for data science and AI. Verify platform before publishing.`
- SQL for Data Science · `Verify` · `SQL for data science — verify status before publishing.`
- Statistics for Data Science · `Verify` · `Statistics for data science — verify status before publishing.`
- Claude Certified Architect / Learning Track · `In Progress` · `In progress through the internship — Claude certification and applied AI track.`

### Target roles
- **target_eyebrow**: `What I'm looking for`
- **target_h2**: `Target roles`
- **Primary**: Python Developer Intern · Backend Developer Intern · Software Engineering Intern · Backend Engineer for AI Products · AI Product Backend Developer · NLP / LLM Intern
- **Secondary**: AI / ML Intern · Applied AI Intern · GenAI Intern · Data Science Intern · Data Engineering Intern · Research Assistant
- **target_btn**: `Get in touch about a role` → links to `contact.html`

---

## CONTACT — `contact.html`

- **breadcrumb**: `Home / Contact`
- **h1**: `Contact`
- **lead**: `Open to internships and collaborations. Reach out by email or LinkedIn — I usually reply within a day or two.`

### Contact info
- **contact_intro**: `I'm available for Python Backend, Applied AI, and LLM internships, as well as small collaborative builds.`
- **contact_email_label**: `Email` · value `shubham.mallick1440@gmail.com` (Gmail compose link, opens in new tab)
- **contact_linkedin_label**: `LinkedIn` · value `linkedin.com/in/shubham-mallick-061298378`
- **contact_github_label**: `GitHub` · value `github.com/shubham001312`
- **contact_location_label**: `Location` · value `North 24 Parganas, West Bengal, India`
- **contact_portfolio_line**: `Portfolio: shubham001312.github.io/Shubham-Mallick`

### Form
- **form_h3**: `Send a message`
- **form_note**: `Fill it in and press Send — your email opens pre-filled to me, so the message lands straight in my inbox. No data is stored on this site.`
- **form_name_label**: `Name` · placeholder `Your name`
- **form_email_label**: `Email` · placeholder `you@example.com`
- **form_message_label**: `Message` · placeholder `A role, a project, or just a hello`
- **form_btn**: `Send message` (direct delivery to your inbox is ACTIVE via Formspree `xrenepnd`; the visitor needs no mail app. `FORM_ENDPOINT` in assets/js/main.js)
- **form_success**: `Thanks, {name} — your message is ready to send. Connect via the email or LinkedIn links above.`
- **form_error_empty**: `Please fill in every field before sending.`
- **form_error_email**: `That email address does not look valid.`

### Privacy note
- **privacy_note**: `Privacy note. This site publishes only my email, LinkedIn, GitHub, and general location. No home address, phone number, or financial details are included.`

---

## Things you should NEVER put in this site
Full home address · phone number · loan/banking info · family financial details ·
personal documents · exact sensitive IDs · private emails/screenshots.
If you must add contact info, prefer email + LinkedIn + GitHub + city/region only.
