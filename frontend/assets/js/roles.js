/* ============================================================
   roles.js — the "Founder · ImuTechz" and "AI Developer Intern ·
   Potion Labs" dialogs.

   Any element with data-role-dialog="imutechz" | "potion" opens the
   matching <dialog class="rd">. Native modal dialogs keep focus inside
   (the rest of the page is inert while open) and close on Esc; we add a
   close button, backdrop click, a smooth open/close (instant with
   prefers-reduced-motion), focus on the dialog title, and focus back
   on the button that opened it. Phones get a bottom sheet (CSS).
   Sounds come from sound.js (open / close), tooltips from tips.js.
   ============================================================ */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const snd = (n) => window.SMSound && window.SMSound.play(n);
  let opener = null;

  function open(id, from) {
    const d = document.getElementById("rd-" + id);
    if (!d || d.open) return;
    opener = from || document.activeElement;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    d.classList.remove("closing");
    requestAnimationFrame(() => d.classList.add("in"));
    const h = d.querySelector(".rd-title");
    if (h) h.focus({ preventScroll: true });
    snd("open");
  }
  function close(d) {
    if (!d || !d.open || d.classList.contains("closing")) return;
    d.classList.remove("in"); d.classList.add("closing");
    snd("close");
    const done = () => {
      d.classList.remove("closing");
      if (d.open) { if (typeof d.close === "function") d.close(); else d.removeAttribute("open"); }
      if (opener && opener.focus) opener.focus({ preventScroll: true });
      opener = null;
    };
    if (reduce) done(); else setTimeout(done, 240);
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-role-dialog]");
    if (t) { e.preventDefault(); open(t.getAttribute("data-role-dialog"), t); return; }
    const c = e.target.closest("[data-rd-close]");
    if (c) { close(c.closest("dialog")); return; }
    // a click on the backdrop lands on the <dialog> element itself
    if (e.target.matches("dialog.rd")) {
      const r = e.target.querySelector(".rd-card").getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(e.target);
    }
  });
  document.querySelectorAll("dialog.rd").forEach((d) => {
    // Esc: animate out instead of the instant native close
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(d); });
    // Tab cycles inside the dialog (never out to the page or the browser chrome)
    d.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = [...d.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || !d.contains(a) || a === d.querySelector(".rd-title"))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (a === last || !d.contains(a))) { e.preventDefault(); first.focus(); }
    });
  });
  window.SMRoles = { open, close: () => document.querySelectorAll("dialog.rd[open]").forEach(close) };
})();
