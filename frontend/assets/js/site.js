/* ============================================================
   site.js — theme, nav and every scroll-driven section of the
   redesign (the founder-page language): hero card → wall → dome,
   pinned selected work, sideways cards, a statement whose numbers
   blur into focus, a repository carousel, the path film, page heroes.

   Each stage is a tall track whose child is position:sticky; scroll
   position becomes a progress value p ∈ [0,1] (scrub). Nothing ever
   captures wheel/touch/keys or locks the body: normal scrolling always
   moves the page. prefers-reduced-motion: no smoothing, no idle loops.
   Loaded after main.js (SASY, terminal, project list) and motion.js.
   ============================================================ */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const eio = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ── theme: light / dark, remembered ─────────────────────── */
  const root = document.documentElement;
  function setTheme(t, save) {
    root.dataset.theme = t;
    if (save) { try { localStorage.setItem("sm-theme", t); } catch (e) { /* private mode */ } }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#070707" : "#f3ede2");
    $$(".theme-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(t === "dark"));
      b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      b.dataset.tip = b.getAttribute("aria-label");
    });
    window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  }
  setTheme(root.dataset.theme || "dark", false);
  $$(".theme-btn").forEach((b) => b.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark", true)));
  // follow the OS while the visitor has not chosen
  try {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      let saved = null; try { saved = localStorage.getItem("sm-theme"); } catch (er) { /* */ }
      if (!saved) setTheme(e.matches ? "dark" : "light", false);
    });
  } catch (e) { /* old Safari */ }

  /* ── nav: transparent over the orange, glass over the flow ── */
  const nav = $(".nav");
  const overUntil = () => {
    const end = $("[data-nav-over-end]");
    if (!end) return -1;
    return end.offsetTop + end.offsetHeight - (nav ? nav.offsetHeight : 64);
  };
  let overEnd = -1;
  function navPaint() {
    if (!nav) return;
    const y = scrollY;
    if (nav.classList.contains("over") || overEnd > 0) {
      const over = y < overEnd;
      nav.classList.toggle("over", over);
      nav.classList.toggle("solid", !over);
    } else {
      nav.classList.toggle("solid", y > 12);
    }
  }
  function navMeasure() { overEnd = overUntil(); navPaint(); }
  navMeasure();
  addEventListener("scroll", navPaint, { passive: true });
  addEventListener("resize", navMeasure);
  addEventListener("load", navMeasure);

  // mobile sheet (an overlay; the page itself is never scroll-locked)
  const sheet = $("#navSheet"), menuBtn = $("#menuBtn");
  if (sheet && menuBtn) {
    const setOpen = (o) => {
      sheet.classList.toggle("open", o);
      menuBtn.setAttribute("aria-expanded", String(o));
      sheet.setAttribute("aria-hidden", String(!o));
      sheet.inert = !o;
    };
    setOpen(false);
    menuBtn.addEventListener("click", () => setOpen(!sheet.classList.contains("open")));
    sheet.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet.classList.contains("open")) { setOpen(false); menuBtn.focus({ preventScroll: true }); } }); // focus never stays on the now-inert sheet
    const otwM = $("#otwOpenM");
    if (otwM) otwM.addEventListener("click", (e) => { e.preventDefault(); setOpen(false); const o = $("#otwOpen"); if (o) o.click(); });
  }

  /* ── scrub: scroll position → p for one element ──────────── */
  function scrub(el, onFrame, mode = "pin", smooth = 0.18) {
    if (!el) return;
    let target = 0, cur = -1, raf = 0, on = false;
    function measure() {
      const r = el.getBoundingClientRect();
      const vh = innerHeight || 1;
      if (mode === "pin") {
        const span = el.offsetHeight - vh;
        target = span > 4 ? clamp01(-r.top / span) : clamp01(-r.top / vh);
      } else if (mode === "leave") {
        target = clamp01(-r.top / Math.max(1, r.height));
      } else {
        target = clamp01((vh - r.top) / (vh + r.height));
      }
    }
    function tick() {
      raf = 0;
      if (!on) return;
      measure();
      const d = target - cur;
      cur = cur < 0 || reduce || Math.abs(d) < 0.0005 ? target : cur + d * smooth;
      onFrame(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    }
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(tick); };
    new IntersectionObserver((es) => {
      const vis = !!(es[0] && es[0].isIntersecting);
      if (vis && !on) { on = true; kick(); }
      else if (!vis && on) { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "25% 0px" }).observe(el);
    addEventListener("scroll", kick, { passive: true });
    addEventListener("resize", kick);
    measure(); cur = target; onFrame(cur);
  }
  window.smScrub = scrub;

  /* ── reveals ─────────────────────────────────────────────── */
  const rv = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) rv.forEach((el) => el.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach((el) => io.observe(el));
  }

  /* ── home hero: full-screen card → one tile in a wall → orange dome ── */
  const fh = $("#fh");
  if (fh) {
    const card = $(".fh-card", fh), wall = $(".fh-wall", fh), dome = $(".fh-dome", fh);
    scrub(fh, (p) => {
      const s = eio(clamp01(p / 0.55));
      card.style.transform = `scale(${1 - s * 0.5})`;
      card.style.borderRadius = `${s * 22}px`;
      wall.style.filter = `blur(${(1 - s) * 10}px)`;
      wall.style.opacity = String(0.25 + s * 0.75);
      wall.style.transform = `scale(${1.12 - s * 0.12})`;
      const d = ease(clamp01((p - 0.6) / 0.4));
      dome.style.transform = `translate3d(0, ${(1 - d) * 100}%, 0)`;
    });
  }

  /* ── selected work: pinned; the list's dots fill, the preview swaps ── */
  const fw = $("#fw");
  if (fw) {
    const items = $$(".fw-list li[data-body]", fw), imgs = $$(".fw-frame img", fw), cap = $(".fw-cap", fw), fill = $(".fw-rail i", fw);
    const n = items.length;
    let shown = -1, capRef = cap;
    const show = (i) => {
      if (i === shown) return;
      shown = i;
      items.forEach((li, k) => { li.classList.toggle("on", k === i); li.classList.toggle("done", k < i); });
      imgs.forEach((im, k) => im.classList.toggle("on", k === i));
      if (capRef) {
        const a = items[i].querySelector("a");
        const fresh = capRef.cloneNode(false); // a fresh node replays the rise-in
        fresh.innerHTML = esc(items[i].dataset.body) + (a ? ` <a href="${esc(a.getAttribute("href"))}"${a.target ? ' target="_blank" rel="noopener"' : ""}>Open ↗</a>` : "");
        capRef.replaceWith(fresh);
        capRef = fresh;
      }
    };
    scrub(fw, (p) => {
      show(Math.min(n - 1, Math.floor(p * n * 0.999)));
      if (fill) fill.style.transform = `scaleY(${clamp01(p * 1.05)})`;
    });
    // keyboard / hover users can pick a project directly
    items.forEach((li, i) => li.addEventListener("mouseenter", () => show(i)));
  }

  /* ── sideways cards (live from /api/projects) ──────────────
     The pinned height is derived from the track itself: one pixel of
     vertical scroll moves the track one pixel, so the last card always
     lands exactly at the right edge — at any width, with any card count. */
  const fx = $("#fx");
  if (fx) {
    const track = $(".fx-track", fx), view = $(".fx-view", fx), stage = $(".fx-stage", fx), count = $(".fx-count", fx);
    let max = 0;
    function cardHTML(p, i, n) {
      const url = p.page || p.link || "#";
      const ext = /^https?:/i.test(url);
      const tags = (p.stack || []).slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join("");
      const art = window.artFor ? window.artFor(p.title) : "";
      const lede = String(p.desc || p.summary || "").split(/(?<=[.!?])\s/)[0];
      return `<a class="fx-card${i === 0 ? " fx-hot" : ""}" href="${esc(url)}"${ext ? ' target="_blank" rel="noopener"' : ""} aria-label="${esc(p.title)}${ext ? " (opens in a new tab)" : ""}">` +
        (art && i ? `<img class="fx-art" src="${art}" alt="" loading="lazy" width="320" height="180">` : "") +
        `<span class="fx-arrow" aria-hidden="true">${ext ? "↗" : "→"}</span>` +
        `<span class="fx-k">${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}</span>` +
        `<h3>${esc(p.title)}</h3><p>${esc(lede)}</p><div class="fx-tags">${tags}</div></a>`;
    }
    function fit() {
      max = Math.max(0, track.scrollWidth - view.clientWidth);
      fx.style.height = `${Math.ceil(stage.offsetHeight + max)}px`;
    }
    const paint = (p) => { track.style.transform = `translate3d(${(-p * max).toFixed(1)}px, 0, 0)`; };
    fit();
    if (fx.dataset.from === "api") {
      fetch("/api/projects", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
        if (!Array.isArray(d) || !d.length) throw new Error("empty");
        track.innerHTML = d.map((p, i) => cardHTML(p, i, d.length)).join("");
        if (count) count.textContent = `${d.length} projects · live`;
        fit(); navMeasure();
        dispatchEvent(new Event("scroll"));
      }).catch(() => { if (count) count.textContent = `${track.children.length} highlights`; });
    }
    addEventListener("resize", fit);
    addEventListener("load", fit);
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(track);
    scrub(fx, paint);
  }

  /* ── statement: numbers blur into focus ──────────────────── */
  const fs = $("#fs");
  if (fs) {
    const chips = $$(".fs-chip", fs), line = $(".fs-text", fs);
    scrub(fs, (p) => {
      chips.forEach((c, i) => {
        const k = clamp01((p - 0.08 - i * 0.07) / 0.35);
        c.style.filter = `blur(${(1 - k) * 14}px)`;
        c.style.opacity = String(0.15 + k * 0.85);
        c.style.transform = `translate3d(0, ${(1 - k) * 40 - p * 30}px, 0) scale(${0.9 + k * 0.1})`;
      });
      if (line) line.style.opacity = String(0.35 + ease(clamp01(p / 0.3)) * 0.65);
    });
  }

  /* ── repository carousel ─────────────────────────────────── */
  const fr = $("#fr");
  if (fr) {
    const btns = $$(".fr-avatars button", fr);
    let idx = 0, hold = false;
    const show = (i) => {
      idx = i;
      btns.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", String(k === i)); });
      const b = btns[i], old = $(".fr-card", fr), card = old.cloneNode(false);
      card.innerHTML = `<h3>${esc(b.dataset.repo)}</h3><p class="fr-sub">github.com/shubham001312</p><p class="fr-d">${esc(b.dataset.d)}</p>` +
        `<a class="fr-link" href="https://github.com/shubham001312/${esc(b.dataset.repo)}" target="_blank" rel="noopener">Read the code <span aria-hidden="true">↗</span></a>`;
      old.replaceWith(card);
    };
    btns.forEach((b, i) => b.addEventListener("click", () => show(i)));
    fr.addEventListener("mouseenter", () => (hold = true));
    fr.addEventListener("mouseleave", () => (hold = false));
    fr.addEventListener("focusin", () => (hold = true));
    fr.addEventListener("focusout", () => (hold = false));
    if (!reduce) setInterval(() => { if (!hold && !document.hidden) show((idx + 1) % btns.length); }, 5200);
  }

  /* ── page heroes: the card settles back as you leave it ──── */
  $$(".ph").forEach((ph) => {
    const card = $(".ph-card", ph), inner = $(".ph-in", ph);
    if (!card || reduce) return;
    scrub(ph, (p) => {
      const s = ease(p);
      card.style.transform = `scale(${1 - s * 0.07})`;
      card.style.borderRadius = `${28 + s * 10}px`;
      if (inner) { inner.style.transform = `translate3d(0, ${s * -40}px, 0)`; inner.style.opacity = String(1 - s * 0.55); }
    }, "leave");
  });

  /* ── path film: the path as a scroll-scrubbed canvas ─────── */
  $$(".pf").forEach((wrap) => {
    let steps = [];
    try { steps = JSON.parse($("script[type='application/json']", wrap).textContent); } catch (e) { return; }
    const stage = $(".pf-stage", wrap), cv = $(".pf-canvas", wrap), capHost = $(".pf-cap", wrap);
    const ctx = cv.getContext("2d");
    if (!ctx || !steps.length) return;
    const n = steps.length;
    wrap.style.setProperty("--pf-steps", n);
    const ORANGE = [242, 102, 26], RED = [217, 72, 30];
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    const easeOutBack = (t) => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
    const drawn = (p) => clamp01((p - 0.04) / 0.88);
    let FG = [244, 239, 231], GROUND = "#070707", dark = true;
    function readTheme() {
      dark = root.dataset.theme === "dark";
      FG = dark ? [244, 239, 231] : [28, 25, 20];
      GROUND = getComputedStyle(document.body).backgroundColor || (dark ? "#070707" : "#f3ede2");
    }
    readTheme();
    let W = 0, H = 0, dpr = 1, mobile = false, nodes = [], samples = [], total = 0, nodeAt = [];
    let target = 0, cur = 0, painted = -1, raf = 0, on = false, shown = -1;
    function layout() {
      const r = stage.getBoundingClientRect();
      W = r.width; H = r.height; mobile = W < 760;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      nodes = [];
      for (let i = 0; i < n; i++) {
        const u = n === 1 ? 0.5 : i / (n - 1);
        nodes.push(mobile ? [W * (0.5 + Math.sin(u * Math.PI * 3.2) * 0.3), H * (0.16 + u * 0.44)]
                          : [W * (0.07 + u * 0.86), H * (0.42 + Math.sin(u * Math.PI * 2.4 + 0.4) * 0.16)]);
      }
      samples = []; nodeAt = []; total = 0;
      const pt = (i) => nodes[Math.max(0, Math.min(n - 1, i))];
      for (let i = 0; i < n - 1; i++) {
        const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
        for (let s = 0; s < 40; s++) {
          const t = s / 40, t2 = t * t, t3 = t2 * t;
          const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
          const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
          if (samples.length) { const q = samples[samples.length - 1]; total += Math.hypot(x - q[0], y - q[1]); }
          if (s === 0) nodeAt[i] = total;
          samples.push([x, y, total]);
        }
      }
      const last = nodes[n - 1], q = samples[samples.length - 1];
      total += Math.hypot(last[0] - q[0], last[1] - q[1]);
      samples.push([last[0], last[1], total]);
      nodeAt[n - 1] = total;
      painted = -1;
    }
    function measure() {
      const r = wrap.getBoundingClientRect();
      const span = wrap.offsetHeight - stage.offsetHeight;
      target = span > 4 ? clamp01(-r.top / span) : 0;
    }
    function caption(i) {
      const s = steps[i];
      const fresh = capHost.cloneNode(false);
      fresh.innerHTML = `<p class="pf-cap-k"><span>${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}</span><span>${esc(s.kind)}</span></p>` +
        `<p class="pf-cap-when">${esc(s.when)}</p><h3 class="pf-cap-role">${esc(s.role)}</h3><p class="pf-cap-org">${esc(s.org)}</p><p class="pf-cap-d">${esc(s.d)}</p>`;
      const curCap = $(".pf-cap", wrap);
      curCap.replaceWith(fresh);
    }
    function paint(p, time) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const L = drawn(p) * total;
      ctx.setLineDash([2, 9]); ctx.lineCap = "round"; ctx.lineWidth = 2;
      ctx.strokeStyle = rgba(FG, dark ? 0.24 : 0.2);
      ctx.beginPath(); samples.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.setLineDash([]);
      let head = samples[0];
      if (L > 0) {
        const g = ctx.createLinearGradient(nodes[0][0], nodes[0][1], nodes[n - 1][0], nodes[n - 1][1]);
        g.addColorStop(0, rgba(RED, 1)); g.addColorStop(1, rgba(ORANGE, 1));
        ctx.strokeStyle = g; ctx.lineWidth = mobile ? 3 : 4;
        ctx.beginPath();
        for (let k = 0; k < samples.length; k++) {
          const s = samples[k];
          if (s[2] > L) {
            const a = samples[k - 1], f = (L - a[2]) / Math.max(1e-6, s[2] - a[2]);
            head = [a[0] + (s[0] - a[0]) * f, a[1] + (s[1] - a[1]) * f];
            ctx.lineTo(head[0], head[1]);
            break;
          }
          head = s;
          k ? ctx.lineTo(s[0], s[1]) : ctx.moveTo(s[0], s[1]);
        }
        ctx.stroke();
      }
      ctx.textAlign = "center";
      for (let i = 0; i < n; i++) {
        const [x, y] = nodes[i];
        const reach = clamp01((L - nodeAt[i] + total * 0.012) / (total * 0.035));
        if (reach <= 0) {
          ctx.fillStyle = GROUND; ctx.strokeStyle = rgba(FG, 0.32); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = rgba(FG, 0.4);
        } else {
          const s = easeOutBack(reach), r = (mobile ? 9 : 11) * s;
          ctx.fillStyle = rgba(ORANGE, 0.16 * reach); ctx.beginPath(); ctx.arc(x, y, r * 2.1, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = rgba(RED, 1); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, r * 0.36, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = rgba(FG, 0.5 + 0.4 * reach);
        }
        ctx.font = `500 ${mobile ? 11 : 12.5}px "JetBrains Mono", ui-monospace, monospace`;
        const below = mobile ? false : i % 2 === 0;
        ctx.fillText(steps[i].year, x, y + (below ? 34 : -24));
      }
      if (L > 0 && L < total) {
        const pulse = reduce ? 1 : 0.85 + Math.sin(time / 260) * 0.15;
        const gr = ctx.createRadialGradient(head[0], head[1], 0, head[0], head[1], 26 * pulse);
        gr.addColorStop(0, rgba(ORANGE, 0.55)); gr.addColorStop(1, rgba(ORANGE, 0));
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(head[0], head[1], 26 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(head[0], head[1], 3.2, 0, Math.PI * 2); ctx.fill();
      }
      let idx = 0;
      for (let i = 0; i < n; i++) if (L >= nodeAt[i] - total * 0.012) idx = i;
      if (idx !== shown) { shown = idx; caption(idx); }
    }
    function tick(time) {
      raf = 0;
      if (!on) return;
      measure();
      const d = target - cur;
      cur = Math.abs(d) < 0.0005 || reduce ? target : cur + d * 0.12;
      if (cur !== painted) { painted = cur; paint(cur, time || 0); raf = requestAnimationFrame(tick); }
    }
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(tick); };
    new IntersectionObserver((es) => {
      const vis = !!(es[0] && es[0].isIntersecting);
      if (vis && !on) { on = true; measure(); cur = target; kick(); }
      else if (!vis && on) { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
    }, { rootMargin: "40% 0px" }).observe(wrap);
    new ResizeObserver(() => { layout(); paint(cur, 0); }).observe(stage);
    addEventListener("scroll", kick, { passive: true });
    addEventListener("themechange", () => { readTheme(); paint(cur, 0); });
    layout(); measure(); cur = target; paint(cur, 0);
  });

  /* ── contact form → POST /api/contact ────────────────────── */
  const form = $("#contactForm");
  if (form) {
    const msg = $(".cform-msg", form), btn = $("button[type=submit]", form);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (fd.get("website")) return; // honeypot
      const body = { name: String(fd.get("name") || "").trim(), email: String(fd.get("email") || "").trim(), message: String(fd.get("message") || "").trim() };
      if (!body.name || !body.email || !body.message) { msg.className = "cform-msg err"; msg.textContent = "All three fields are needed."; return; }
      btn.disabled = true; msg.className = "cform-msg"; msg.textContent = "Sending…";
      try {
        const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.ok) { msg.className = "cform-msg ok"; msg.textContent = "Thank you — your message is in. I usually reply within a day."; form.reset(); }
        else { msg.className = "cform-msg err"; msg.textContent = d.detail ? (typeof d.detail === "string" ? d.detail : "Please check the fields.") : "Something went wrong — email me instead."; }
      } catch (er) {
        msg.className = "cform-msg err"; msg.textContent = "Could not reach the server — email shubham.mallick1440@gmail.com instead.";
      }
      btn.disabled = false;
    });
  }

  /* ── visitor counter (GET /api/visits; counts once per session) ── */
  const vis = $("#visits");
  if (vis) {
    let counted = false;
    try { counted = !!sessionStorage.getItem("sm-visit"); sessionStorage.setItem("sm-visit", "1"); } catch (e) { counted = true; }
    fetch("/api/visits" + (counted ? "?inc=false" : ""), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d && typeof d.count === "number" && d.count > 0) vis.textContent = `${d.count.toLocaleString("en-US")} visits`;
    }).catch(() => {});
  }

  const yr = $("#year");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
