# Shubham Mallick — Portfolio

A multi-page personal portfolio for **Shubham Mallick**, Python Backend & Applied AI Developer.
Built as clean, dependency-free static HTML/CSS/JS — no frameworks, no build step.

Live: https://shubham001312.github.io/Shubham-Mallick/

## Pages

| File             | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `index.html`     | Home — hero, focus areas, featured projects, at-a-glance stats |
| `about.html`     | Bio, education timeline, strengths, learning style, career goal |
| `projects.html`  | All 11 projects grouped by status + a status-distribution chart |
| `skills.html`    | Skill areas with proficiency meters + an AI/Backend radar chart |
| `experience.html`| Internships, memberships, certifications, target roles         |
| `contact.html`   | Email, LinkedIn, GitHub, location + a client-side contact form  |

Shared layout (header nav, footer, theme) lives in `assets/`.

## Project structure

```
portfolio/
├── index.html
├── about.html
├── projects.html
├── skills.html
├── experience.html
├── contact.html
└── assets/
    ├── css/styles.css   # design tokens + all component styles
    └── js/main.js       # mobile nav, scroll reveal, form validation
```

## Editing content

All written text lives in **`content.md`** — a single, human-readable "personal guide"
organized by page and field, with a `Location:` note for every entry telling you
exactly where it sits in the HTML. The site is static, so to publish a change you
edit the matching spot in the HTML file noted there (or ask for a global replace of
shared details like email / GitHub / LinkedIn). Nothing is auto-generated.

## Contact form delivery

The contact form has no backend. By default it opens the visitor's email
(Gmail compose) pre-filled to `shubham.mallick1440@gmail.com`, so the message
lands in the inbox when they press Send. Email links (footer + contact page) also
open Gmail compose so they work even without a desktop mail app.

For **direct delivery** (message arrives in the inbox with no action from the
visitor), set `FORM_ENDPOINT` in `assets/js/main.js` to a
[Formspree](https://formspree.io) (or Formspark) endpoint. Leave it `''` to keep
the email fallback. No data is stored on the site.

## Design

- **Theme:** the original blue-accent identity (Montserrat display + Inter body, gradient hero) is preserved and extended into a consistent multi-page system.
- **Charts** (`projects.html`, `skills.html`) are hand-built inline SVG — offline-friendly for GitHub Pages, colorblind-checked, and paired with data tables for accessibility.
- **Accessibility:** visible keyboard focus, `prefers-reduced-motion` respected, ARIA labels on icon links and charts.
- **Responsive:** down to mobile, with a hamburger nav under 720px.

## Privacy

This site publishes **only** email, LinkedIn, GitHub, and general location.
No home address, phone number, or financial details are included.

## Run locally

```bash
cd portfolio
python -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)

Push the `portfolio/` contents to the `Shubham-Mallick` repository (root).
GitHub Pages serves `index.html` as the entry point; relative links handle the rest.

## Verify before publishing

A few bio-data fields are flagged for verification — kept honest in the UI:
- Exact B.Tech dates and CGPA.
- GitHub username (`shubham001312` used; `shubham001440` noted as alternate).
- Certification titles marked **Verify** on the Experience page.
