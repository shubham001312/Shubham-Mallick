/* ============================================================
   tips.js — one small tooltip for every interactive element.

   A single positioned element (#tip) shows what a control does after
   ~350 ms of hover or on keyboard focus. It follows the element (not
   the cursor), sits above it and flips below / clamps sideways to stay
   on screen. Text comes from data-tip; links get a sensible fallback
   ("Go to the About page", "Opens Learnify on GitHub (new tab)",
   "Email founder@imutechz.in"). Native title attributes are moved into
   data-tip so the browser's own tooltip never doubles it.

   Screen readers: the tooltip is aria-hidden — the control keeps its
   own accessible name, so nothing is announced twice. Touch devices
   (no hover) get no tooltips at all.
   ============================================================ */
(function () {
  "use strict";
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const SEL = "a[href], button, [role=button], input:not([type=hidden]), textarea, select, summary, [data-tip]";
  const PAGES = { "": "Home", "index.html": "Home", "about.html": "About", "work.html": "Work",
    "experience.html": "Path", "imurun.html": "IMURUN", "contact.html": "Contact" };
  const SITES = { "github.com": "GitHub", "linkedin.com": "LinkedIn", "youtube.com": "YouTube", "youtu.be": "YouTube",
    "scholar.google.com": "Google Scholar", "imutechz.in": "imutechz.in", "hosteler.shop": "hosteler.shop" };
  const tip = document.createElement("div");
  tip.id = "tip"; tip.className = "tip"; tip.setAttribute("aria-hidden", "true");
  document.body.appendChild(tip);
  let target = null, timer = 0;

  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  function siteName(host) {
    host = host.replace(/^www\./, "");
    for (const k in SITES) if (host === k || host.endsWith("." + k)) return SITES[k];
    return host;
  }
  function textFor(el) {
    if (el.dataset.tip) return el.dataset.tip;
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      const label = clean(el.getAttribute("aria-label") || (el.querySelector("h3") || {}).textContent || "").replace(/\s*\(opens in a new tab\)$/, "");
      if (/^mailto:/i.test(href)) return "Email " + href.slice(7).split("?")[0];
      if (/^tel:/i.test(href)) return "Call " + href.slice(4);
      if (href.startsWith("#")) return label ? `Jump to ${label}` : "Jump to this section";
      let u; try { u = new URL(href, location.href); } catch (e) { return ""; }
      if (u.origin !== location.origin) {
        const site = siteName(u.hostname);
        const what = label && label.toLowerCase() !== site.toLowerCase() ? `${label} on ${site}` : site;
        return `Opens ${what}${el.target === "_blank" ? " (new tab)" : ""}`;
      }
      const file = u.pathname.split("/").pop();
      const page = PAGES[file] || PAGES[file + ".html"];
      if (page) return (label && !label.match(/^(home|about|work|all|path|imurun|contact)$/i) ? `${label} — ` : "") + `Go to the ${page} page` + (u.hash ? " section" : "");
      return label ? `Open ${label}` : "";
    }
    const al = el.getAttribute("aria-label");
    if (al) return al;
    if (el.matches("input, textarea, select")) {
      const lab = el.closest("label");
      return clean(el.getAttribute("placeholder") || (lab && lab.firstChild && lab.firstChild.textContent) || "");
    }
    return "";
  }
  function place() {
    if (!target || !target.isConnected) return hide();
    const r = target.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || (!r.width && !r.height)) return hide();
    const tw = tip.offsetWidth, th = tip.offsetHeight, gap = 9;
    let x = r.left + r.width / 2 - tw / 2;
    x = Math.max(8, Math.min(innerWidth - tw - 8, x));
    let y = r.top - th - gap, below = false;
    if (y < 8) { y = r.bottom + gap; below = true; }
    tip.classList.toggle("below", below);
    tip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    tip.style.setProperty("--ax", `${Math.round(r.left + r.width / 2 - x)}px`);
  }
  function show(el) {
    const t = textFor(el);
    if (!t) return;
    target = el; tip.textContent = t;
    tip.classList.add("on"); place();
  }
  function hide() { clearTimeout(timer); target = null; tip.classList.remove("on"); }
  function schedule(el, delay) {
    clearTimeout(timer);
    // the browser's own title tooltip would double ours
    if (el.hasAttribute("title")) { if (!el.dataset.tip) el.dataset.tip = el.getAttribute("title"); el.removeAttribute("title"); }
    timer = setTimeout(() => show(el), delay);
  }

  document.addEventListener("pointerover", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const el = e.target.closest(SEL);
    if (!el || el === target) return;
    if (el.closest("[data-tip-off]")) return;
    hide(); schedule(el, 350);
  });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest(SEL);
    if (el && !el.contains(e.relatedTarget)) hide();
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest(SEL);
    if (!el || !el.matches(":focus-visible")) return;
    if (el.closest("[data-tip-off]") || el.matches("input, textarea")) return; // text fields already show their placeholder
    hide(); schedule(el, 350);
  });
  document.addEventListener("focusout", hide);
  document.addEventListener("pointerdown", hide, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  addEventListener("scroll", () => { if (target) place(); }, { passive: true });
  addEventListener("resize", hide);
  // keep live labels in sync (e.g. the theme / sound buttons change their tip)
  new MutationObserver(() => { if (target && tip.classList.contains("on")) { const t = textFor(target); if (t) tip.textContent = t; place(); } })
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["data-tip", "aria-label"] });
})();
