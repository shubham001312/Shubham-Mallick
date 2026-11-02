/* ============================================================
   home.js — motion for the home page's own layout.
   • hero: as you scroll away, the two name lines drift apart, the
     arched portrait sinks and narrows, the sun rises and the orange
     dims toward the page — a scrub, never a pin, never a scroll lock.
   • selected work: a preview of the project art follows the pointer
     over the index (desktop with a mouse only).
   • the back-to-top dial.
   Reduced motion: no scrub, no follow — everything sits still.
   ============================================================ */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const hx = $("#hx");
  if (hx && !reduce && window.smScrub) {
    const l1 = $(".hx-line:nth-child(1)", hx), l2 = $(".hx-line:nth-child(2)", hx), fig = $(".hx-fig", hx),
      sun = $(".hx-sun", hx), shade = $(".hx-shade", hx), roles = $(".hx-roles", hx);
    window.smScrub(hx, (p) => {
      const s = ease(clamp01(p * 1.25));
      const wide = innerWidth > 860;
      if (l1) l1.style.transform = `translate3d(${-s * (wide ? 12 : 8)}vw, 0, 0)`;
      if (l2) l2.style.transform = `translate3d(${s * (wide ? 12 : 8)}vw, 0, 0)`;
      if (fig) fig.style.transform = `translate3d(0, ${s * 14}%, 0) scale(${1 - s * 0.12}, ${1 - s * 0.05})`;
      if (sun) sun.style.transform = `translate3d(0, ${-s * 22}%, 0) scale(${1 + s * 0.25})`;
      if (roles) roles.style.opacity = String(1 - s * 0.6);
      if (shade) shade.style.opacity = String(s * 0.55);
    }, "leave");
  }

  // the index: a floating preview that follows the pointer
  const list = $(".ix-list"), float = $(".ix-float");
  if (list && float && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
    const step = () => {
      x += (tx - x) * (reduce ? 1 : 0.18); y += (ty - y) * (reduce ? 1 : 0.18);
      float.style.transform = `translate3d(${x + 28}px, ${y - 110}px, 0)`;
      raf = on && (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) ? requestAnimationFrame(step) : 0;
    };
    list.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY;
      if (!on) { x = tx; y = ty; }
      if (!raf) raf = requestAnimationFrame(step);
    });
    list.addEventListener("pointerover", (e) => {
      const row = e.target.closest(".ix-row");
      if (!row) return;
      const src = row.dataset.art;
      if (src && float.getAttribute("src") !== src) float.setAttribute("src", src);
      on = true; float.classList.add("on");
    });
    list.addEventListener("pointerleave", () => { on = false; float.classList.remove("on"); });
    addEventListener("scroll", () => { if (on) { on = false; float.classList.remove("on"); } }, { passive: true });
  }

  // back-to-top dial
  const btt = $("#toTopDial");
  if (btt) btt.addEventListener("click", () => {
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    const nav = $(".brand");
    setTimeout(() => nav && nav.focus({ preventScroll: true }), reduce ? 0 : 700);
  });
})();
