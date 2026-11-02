/* ============================================================
   intro.js — the first-visit loading animation.

   Particles stream in from every edge and assemble the home page:
   they settle exactly onto the hero's name (same font, size and
   position as the real text) and trace the arched portrait, hold for
   a beat, then the overlay melts away so the real page is underneath
   the particles, pixel for pixel. On the inner pages they form the
   name in the centre. ~1.6 s in total.

   • once per browser session (the <head> script sets html.intro)
   • never with prefers-reduced-motion (the head script skips it)
   • any click, key, wheel or touch skips straight to the end
   • the overlay is position:fixed: no layout shift, and the page
     underneath keeps its normal scrolling the whole time
   ============================================================ */
(function () {
  "use strict";
  const root = document.documentElement, el = document.getElementById("intro");
  if (!el) return;
  if (!root.classList.contains("intro")) { el.remove(); return; }
  try { sessionStorage.setItem("sm-intro", "1"); } catch (e) { /* */ }

  const cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
  let done = false, raf = 0, skipAt = 0, t0 = 0, started = false;
  const finish = () => {
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    root.classList.add("intro-done"); root.classList.remove("intro");
    el.remove();
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => removeEventListener(ev, skip, true));
  };
  function skip() { if (!started) return finish(); if (!skipAt && !done) skipAt = performance.now() - t0; }
  ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => addEventListener(ev, skip, { capture: true, passive: true }));
  setTimeout(finish, 5000); // never stays up, whatever happens
  if (!ctx) { finish(); return; }

  const dark = root.dataset.theme !== "light";
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  ctx.scale(dpr, dpr);
  const home = !!document.querySelector("[data-intro-target]") || /(^\/$|index\.html$)/.test(location.pathname);
  // on the home page the overlay wears the hero's colours, so the hand-off is seamless
  el.style.background = dark ? "#070707" : "#f3ede2"; // the page ground: the hand-off to the real page is seamless

  function build() {
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const o = off.getContext("2d");
    o.fillStyle = "#000"; o.strokeStyle = "#000";
    let drewHero = false;
    const target = document.querySelector("[data-intro-target]");
    if (target) {
      const lines = target.querySelectorAll(".hx-line");
      lines.forEach((ln) => {
        const r = ln.getBoundingClientRect(), cs = getComputedStyle(ln);
        if (!r.width || r.top > H) return;
        const fs = parseFloat(cs.fontSize);
        o.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
        o.textBaseline = "alphabetic";
        if ("letterSpacing" in o) o.letterSpacing = cs.letterSpacing;
        const padL = parseFloat(cs.paddingLeft) || 0;
        o.fillText(ln.textContent.trim(), r.left + padL, r.top + r.height * 0.5 + fs * 0.34);
        drewHero = true;
      });
      const fig = document.querySelector(".hx-fig");
      if (fig) {
        const r = fig.getBoundingClientRect();
        if (r.width && r.top < H) {
          const rad = r.width / 2;
          o.lineWidth = 3;
          o.beginPath();
          o.moveTo(r.left, r.bottom - 28);
          o.lineTo(r.left, r.top + rad);
          o.arc(r.left + rad, r.top + rad, rad, Math.PI, 0);
          o.lineTo(r.right, r.bottom - 28);
          o.stroke();
          // a soft sparse fill inside the arch
          for (let i = 0; i < 260; i++) {
            const x = r.left + Math.random() * r.width, y = r.top + Math.random() * r.height;
            const inArch = y > r.top + rad || Math.hypot(x - (r.left + rad), y - (r.top + rad)) < rad;
            if (inArch) o.fillRect(x, y, 2, 2);
          }
        }
      }
    }
    if (!drewHero) {
      const small = W < 700, lines = small ? ["SHUBHAM", "MALLICK"] : ["SHUBHAM MALLICK"];
      let fs = small ? Math.min(W * 0.2, 96) : Math.min(W * 0.1, 150);
      const font = (f) => `500 ${f}px "Host Grotesk", "Segoe UI", Arial, sans-serif`;
      o.font = font(fs);
      const widest = Math.max(...lines.map((l) => o.measureText(l).width));
      if (widest > W * 0.88) { fs *= (W * 0.88) / widest; o.font = font(fs); }
      o.textAlign = "center"; o.textBaseline = "middle";
      const lh = fs * 0.98, top = H / 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((l, i) => o.fillText(l, W / 2, top + i * lh));
    }
    const data = o.getImageData(0, 0, W, H).data;
    const step = W < 700 ? 3 : 4;
    const pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 110) pts.push([x, y]);
    const cap = W < 700 ? 2200 : 4200;
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    pts.length = Math.min(pts.length, cap);
    return pts;
  }

  function run() {
    if (done) return;
    const pts = build();
    const ink = dark ? ["#f4efe7", "#efe6da", "#d9cfc2"] : ["#16130f", "#2a231c", "#4a4038"];
    const tint = home ? [...ink, ...ink, "#f2661a"] : ["#f2661a", "#ea4a1a", "#f6a04d"];
    const P = pts.map(([tx, ty]) => {
      // start just outside a random edge, so they genuinely fly in from everywhere
      const e = (Math.random() * 4) | 0, m = 60 + Math.random() * 160;
      const sx = e === 0 ? -m : e === 1 ? W + m : Math.random() * W;
      const sy = e === 2 ? -m : e === 3 ? H + m : Math.random() * H;
      const cx = (sx + tx) / 2 + (Math.random() - 0.5) * W * 0.35, cy = (sy + ty) / 2 + (Math.random() - 0.5) * H * 0.35;
      return { sx, sy, cx, cy, tx, ty, d: Math.random() * 0.3, s: 1.6 + Math.random() * 1.4, c: tint[(Math.random() * tint.length) | 0],
        vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 1.6 };
    });
    const IN = 800, HOLD = 520, OUT = 420;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    started = true; t0 = performance.now();
    const frame = (now) => {
      const t = now - t0;
      const outStart = skipAt ? Math.min(skipAt, IN + HOLD) : IN + HOLD, outLen = skipAt ? 200 : OUT;
      const k = Math.max(0, Math.min(1, (t - outStart) / outLen));
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        const q = ease(Math.max(0, Math.min(1, (t / IN - p.d) / (1 - p.d))));
        const a = 1 - q;  // quadratic bezier through a random control point: curved flight paths
        let x = a * a * p.sx + 2 * a * q * p.cx + q * q * p.tx, y = a * a * p.sy + 2 * a * q * p.cy + q * q * p.ty;
        if (k > 0) { x += p.vx * k * 60; y += p.vy * k * 60; }
        ctx.globalAlpha = (0.3 + 0.7 * q) * (1 - k);
        ctx.fillStyle = p.c;
        const s = p.s * (1 - k * 0.6);
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
      el.style.opacity = String(1 - ease(k));
      if (k >= 1) return finish();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }

  // wait for the page to lay out (and the fonts, briefly) so the targets are real
  // start the clock only once the overlay is actually on screen (first paint), then give the
  // web font a moment so the particles land on the real glyphs
  const painted = new Promise((res) => {
    try {
      const po = new PerformanceObserver((l) => { if (l.getEntries().length) { po.disconnect(); res(); } });
      po.observe({ type: "paint", buffered: true });
    } catch (e) { res(); }
    setTimeout(res, 2000);
  });
  const go = () => painted.then(() => {
    const fonts = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 250))]) : Promise.resolve();
    return fonts;
  }).then(() => requestAnimationFrame(() => requestAnimationFrame(run)));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
