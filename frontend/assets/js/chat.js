/* ============================================================
   chat.js — SASY, Shubham's assistant: launcher + chat window.
   Self-contained: injects its own markup, styles live in
   assets/css/chat.css. Talks to POST /api/chat.

   Launcher  an "ember orb" with eyes that blink and glance at the
             pointer, a breathing halo and an online dot. Drag it
             anywhere (position remembered per desktop / phone);
             a drag never opens it. A one-time "ask me" nudge with
             an unread badge, dismissible.
   Window    click / Enter / Space on the launcher opens it, scaled
             out of the launcher; launcher again, the close button
             or Esc closes it. Focus goes to the input on open and
             back to the launcher on close. Desktop: non-modal, page
             scroll untouched. Phones (<=600px): a full-height bottom
             sheet, page locked behind it, focus trapped, swipe the
             header down to close.
   Sounds    window.SMSound (assets/js/sound.js): open, close, send,
             reply, error — it owns the mute setting.
   API       window.SASY = {ask, think, bubble, mood, open, close}
             (the contact-page terminal uses ask/think/bubble/mood).
   ============================================================ */
(function () {
  "use strict";
  if (window.SASY && window.SASY.__chat) return; // never boot twice

  const LIMIT = 500;
  const history_ = window.history;
  const HKEY = "sasy_chat_history", NKEY = "sasy_nudge", PKEY = "sasy_pos";
  const MAIL = "founder@imutechz.in";
  const CHIPS = ["Who is Shubham?", "Is he open to work?", "What is IMURUN?", "How can I contact him?"];

  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const phone = matchMedia("(max-width: 600px)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } },
  };
  const snd = (n) => { try { window.SMSound && window.SMSound.play(n); } catch (e) { /* */ } };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SID = (() => { try { let s = localStorage.getItem("sasy_sid"); if (!s) { s = crypto.randomUUID ? crypto.randomUUID() : "s" + Date.now() + Math.random().toString(36).slice(2); localStorage.setItem("sasy_sid", s); } return s; } catch (e) { return "anon"; } })();

  /* ── markup ─────────────────────────────────────────────── */
  const I = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    retry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>',
  };
  const orb = () => '<span class="sy-orb" aria-hidden="true"><svg class="sy-grain" aria-hidden="true"><rect width="100%" height="100%" filter="url(#sy-noise)"/></svg><span class="sy-eyes"><i></i><i></i></span></span>';

  document.querySelectorAll("#sasy, #chat, .sasy-launch, section.chat").forEach((n) => n.remove()); // legacy static markup
  const root = document.createElement("div");
  root.className = "sy-root";
  root.id = "sasy-root";
  root.dataset.sound = "none"; // sound.js: we play our own
  root.dataset.state = "idle";
  root.innerHTML = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><filter id="sy-noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs></svg>
<div class="sy-scrim" aria-hidden="true"></div>
<div class="sy-nudge" role="status" hidden>
  <button class="sy-nudge-txt" type="button"><b>Hi, I'm SASY.</b><span>Ask me anything about Shubham's work.</span></button>
  <button class="sy-nudge-x" type="button" aria-label="Dismiss" data-tip="Dismiss">${I.close}</button>
</div>
<button class="sy-launch" id="sasy" type="button" aria-controls="chat" aria-expanded="false" aria-haspopup="dialog" aria-label="Chat with SASY, Shubham's assistant" data-tip="Chat with SASY · drag to move">
  <span class="sy-halo" aria-hidden="true"></span>${orb()}<span class="sy-dot" aria-hidden="true"></span><span class="sy-badge" aria-hidden="true">1</span>
</button>
<section class="sy-panel" id="chat" role="dialog" aria-modal="false" aria-labelledby="sy-title" aria-describedby="sy-sub">
  <header class="sy-head">
    <span class="sy-grab" aria-hidden="true"></span>
    <span class="sy-av">${orb()}<span class="sy-dot" aria-hidden="true"></span></span>
    <div class="sy-who"><b id="sy-title">SASY</b><small id="sy-sub"><i aria-hidden="true"></i><span class="sy-status">Shubham's assistant · Online</span></small></div>
    <div class="sy-tools">
      <button class="sy-ib sy-more" type="button" aria-label="Chat options" aria-haspopup="menu" aria-expanded="false" aria-controls="sy-menu" data-tip="Options">${I.more}</button>
      <button class="sy-ib sy-close" id="chatClose" type="button" aria-label="Close the chat (it stays saved)" data-tip="Close · chat is kept (Esc)">${I.close}</button>
    </div>
    <div class="sy-menu" id="sy-menu" role="menu" hidden>
      <div class="sy-menu-main"><button class="sy-mi sy-clear" type="button" role="menuitem">${I.trash}<span>Clear chat…</span></button></div>
      <div class="sy-menu-confirm" hidden><p>Delete this whole conversation? This can't be undone.</p><div class="sy-menu-row"><button class="sy-mb sy-cancel" type="button">Cancel</button><button class="sy-mb sy-danger sy-confirm" type="button">Clear chat</button></div></div>
    </div>
  </header>
  <div class="sy-msgs" role="log" aria-live="polite" aria-relevant="additions" tabindex="-1"></div>
  <form class="sy-form" novalidate>
    <div class="sy-field">
      <label class="sy-sr" for="sy-input">Message SASY</label>
      <textarea class="sy-input" id="sy-input" rows="1" maxlength="${LIMIT}" placeholder="Ask about Shubham…" autocomplete="off" enterkeyhint="send" data-tip-off></textarea>
      <button class="sy-send" type="submit" aria-label="Send" data-tip="Send (Enter)" disabled>${I.send}</button>
    </div>
    <div class="sy-foot"><span>Answers come from Shubham's site · <a href="mailto:${MAIL}">${MAIL}</a></span><span class="sy-count" aria-live="polite"></span></div>
  </form>
</section>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const launch = $(".sy-launch"), panel = $(".sy-panel"), msgs = $(".sy-msgs"), form = $(".sy-form"), input = $(".sy-input"),
    sendBtn = $(".sy-send"), count = $(".sy-count"), status = $(".sy-status"), nudge = $(".sy-nudge"), scrim = $(".sy-scrim");

  /* ── markdown-lite (escape first, then a small, safe subset) ── */
  const LINK = /\[([^\]\n]{1,80})\]\(((?:https?:\/\/|\/(?!\/))[^\s)]+)\)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)|(https?:\/\/[^\s<]+)|((?:www\.)?(?:[a-z0-9-]+\.)+(?:in|com|shop|app|dev|io|be|org|net|ai)(?:\/[^\s<,)]*)?)|((?:^|(?<=[\s(]))\/(?:[a-z0-9-]+\.html|[a-z0-9-]+)(?:#[\w-]+)?(?=[\s.,;:!?)]|$))/gi;
  function trimPunct(u) { const m = u.match(/[.,;:!?)]+$/); return m ? [u.slice(0, -m[0].length), m[0]] : [u, ""]; }
  function inline(s) {
    const codes = [];
    s = s.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return "\u0000" + (codes.length - 1) + "\u0000"; });
    s = s.replace(LINK, (all, txt, href, mail, url, dom, path) => {
      if (txt) { const ext = /^https?:/i.test(href); return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${txt}</a>`; }
      if (mail) return `<a href="mailto:${mail}">${mail}</a>`;
      if (url) { const [u, t] = trimPunct(url); return `<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https?:\/\//, "")}</a>${t}`; }
      if (dom) { if (/^\d/.test(dom)) return dom; const [u, t] = trimPunct(dom); return `<a href="https://${u}" target="_blank" rel="noopener">${u}</a>${t}`; }
      if (path) return `<a href="${path}">${path}</a>`;
      return all;
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s.,;:!?)]|$)/g, "$1<em>$2</em>");
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`);
  }
  function md(src) {
    const lines = esc(src).replace(/\r/g, "").split("\n");
    let html = "", list = null, para = [];
    const flushP = () => { if (para.length) { html += `<p>${para.map(inline).join("<br>")}</p>`; para = []; } };
    const flushL = () => { if (list) { html += `<${list.t}>${list.items.map((x) => `<li>${inline(x)}</li>`).join("")}</${list.t}>`; list = null; } };
    for (const raw of lines) {
      const ln = raw.trim();
      const ul = ln.match(/^(?:[-*•])\s+(.*)$/), ol = ln.match(/^\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        flushP();
        const t = ul ? "ul" : "ol";
        if (!list || list.t !== t) { flushL(); list = { t, items: [] }; }
        list.items.push((ul || ol)[1]);
      } else if (!ln) { flushP(); flushL(); }
      else { flushL(); para.push(ln); }
    }
    flushP(); flushL();
    return html || "<p></p>";
  }

  /* ── conversation ───────────────────────────────────────── */
  let history = store.get(HKEY, []);
  if (!Array.isArray(history)) history = [];
  history = history.filter((h) => h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string").slice(-50);
  const save = () => store.set(HKEY, history.slice(-50));
  const time = (t) => new Date(t || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const atBottom = () => msgs.scrollHeight - msgs.scrollTop - msgs.clientHeight < 60;
  const toBottom = (force) => { if (force || atBottom()) msgs.scrollTop = msgs.scrollHeight; };

  function row(role, html, opts = {}) {
    const r = document.createElement("div");
    const bot = role !== "user";
    r.className = "sy-row " + (bot ? "sy-bot" : "sy-u") + (opts.cls ? " " + opts.cls : "");
    // a bot avatar only on the first message of a run
    const prev = msgs.lastElementChild;
    const firstOfRun = bot && !(prev && prev.classList.contains("sy-bot"));
    r.innerHTML = (bot ? (firstOfRun ? orb() : '<span class="sy-slot"></span>') : "") +
      `<div class="sy-col"><div class="sy-b">${html}</div>${opts.meta ? `<span class="sy-meta">${opts.meta}</span>` : ""}</div>`;
    msgs.appendChild(r);
    return r;
  }
  function addMsg(role, text, t) {
    const r = row(role, role === "user" ? esc(text) : md(text), { meta: `${role === "user" ? "You" : "SASY"} · ${time(t)}` });
    toBottom(true);
    return r;
  }
  function welcome() {
    msgs.innerHTML = '<p class="sy-day">Today</p>';
    row("assistant", md("Hi, I'm **SASY**, Shubham's assistant. Ask me about his work, projects, skills, education or how to reach him."));
    const c = document.createElement("div");
    c.className = "sy-chips";
    c.setAttribute("role", "group");
    c.setAttribute("aria-label", "Suggested questions");
    c.innerHTML = CHIPS.map((q) => `<button class="sy-chip" type="button">${esc(q)}</button>`).join("");
    msgs.appendChild(c);
  }
  function render() {
    if (!history.length) { welcome(); return; }
    msgs.innerHTML = '<p class="sy-day">Earlier</p>';
    history.forEach((h) => addMsg(h.role, h.content, h.t));
  }
  const dropChips = () => msgs.querySelectorAll(".sy-chips").forEach((c) => c.remove());

  /* ── talking to the API ─────────────────────────────────── */
  let busy = false;
  const setState = (s) => {
    root.dataset.state = s;
    status.textContent = s === "thinking" ? "Typing…" : "Shubham's assistant · Online";
  };
  async function fetchReply(q, hist) {
    const ctl = "AbortController" in window ? new AbortController() : null;
    const timer = setTimeout(() => ctl && ctl.abort(), 20000);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl ? ctl.signal : undefined,
        body: JSON.stringify({ message: q, history: hist.map(({ role, content }) => ({ role, content })).slice(-8), session: SID }),
      });
      let d = null;
      try { d = await r.json(); } catch (e) { /* not JSON */ }
      if (d && d.reply && (r.ok || r.status === 413)) return { ok: true, reply: String(d.reply) };
      return { ok: false, why: r.status >= 500 ? "The server had a problem." : "I didn't get an answer." };
    } catch (e) {
      return { ok: false, why: e && e.name === "AbortError" ? "That took too long." : (navigator.onLine === false ? "You seem to be offline." : "I couldn't reach the server.") };
    } finally { clearTimeout(timer); }
  }
  // the public ask(): always resolves to text (used by the contact-page terminal too)
  async function ask(q) {
    const res = await fetchReply(String(q || "").slice(0, LIMIT), history);
    return res.ok ? res.reply : `${res.why} Please try again in a moment, or write to ${MAIL}.`;
  }

  function typing() {
    const r = row("assistant", "<i></i><i></i><i></i>", { cls: "sy-typing" });
    r.setAttribute("aria-label", "SASY is typing");
    toBottom(true);
    return r;
  }
  async function send(q, isRetry) {
    q = String(q || "").trim().slice(0, LIMIT);
    if (!q || busy) return;
    busy = true; syncSend();
    dropChips();
    if (!isRetry) {
      const t = Date.now();
      addMsg("user", q, t);
      history.push({ role: "user", content: q, t }); save();
      snd("send");
    }
    setState("thinking");
    const dots = typing();
    const minWait = new Promise((r) => setTimeout(r, reduce.matches ? 0 : 450)); // let the dots be seen
    const [res] = await Promise.all([fetchReply(q, history.slice(0, -1)), minWait]);
    dots.remove();
    setState("idle");
    if (res.ok) {
      const t = Date.now();
      addMsg("assistant", res.reply, t);
      history.push({ role: "assistant", content: res.reply, t }); save();
      snd("reply");
      happy(900);
      if (!isOpen()) markUnread(1);
    } else {
      const r = row("assistant", md(`${res.why} Your message wasn't answered.`), { cls: "sy-err" });
      const b = document.createElement("button");
      b.type = "button"; b.className = "sy-retry"; b.innerHTML = I.retry + "Retry";
      b.addEventListener("click", () => { r.remove(); send(q, true); });
      r.querySelector(".sy-col").appendChild(b);
      toBottom(true);
      snd("error");
    }
    busy = false; syncSend();
    if (isOpen() && !phone.matches) input.focus({ preventScroll: true });
  }
  function reset() {
    if (busy) return;
    history = []; save(); welcome(); input.value = ""; autosize(); syncSend();
    input.focus({ preventScroll: true });
  }

  /* ── composer ───────────────────────────────────────────── */
  function autosize() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 120) + "px"; }
  function syncSend() {
    const n = input.value.length, empty = !input.value.trim();
    sendBtn.disabled = empty || busy || n > LIMIT;
    count.textContent = n >= LIMIT * 0.8 ? `${n}/${LIMIT}` : "";
    count.classList.toggle("warn", n >= LIMIT * 0.8 && n < LIMIT);
    count.classList.toggle("over", n >= LIMIT);
  }
  input.addEventListener("input", () => { autosize(); syncSend(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : submit(); }
  });
  function submit() { if (sendBtn.disabled) return; const v = input.value; input.value = ""; autosize(); syncSend(); send(v); }
  form.addEventListener("submit", (e) => { e.preventDefault(); submit(); });
  msgs.addEventListener("click", (e) => { const c = e.target.closest(".sy-chip"); if (c) send(c.textContent); });
  /* header menu: Clear chat, behind a confirm */
  const moreBtn = $(".sy-more"), menu = $(".sy-menu"), menuMain = $(".sy-menu-main"), menuConfirm = $(".sy-menu-confirm");
  const menuOpen = () => !menu.hidden;
  function showMenu(on) {
    menu.hidden = !on;
    moreBtn.setAttribute("aria-expanded", String(on));
    menuMain.hidden = false; menuConfirm.hidden = true;
    if (on) $(".sy-clear").focus({ preventScroll: true });
  }
  moreBtn.addEventListener("click", () => showMenu(!menuOpen()));
  $(".sy-clear").addEventListener("click", () => { menuMain.hidden = true; menuConfirm.hidden = false; $(".sy-cancel").focus({ preventScroll: true }); });
  $(".sy-cancel").addEventListener("click", () => { showMenu(false); moreBtn.focus({ preventScroll: true }); });
  $(".sy-confirm").addEventListener("click", () => { showMenu(false); reset(); snd("close"); });
  panel.addEventListener("pointerdown", (e) => { if (menuOpen() && !e.target.closest(".sy-menu, .sy-more")) showMenu(false); });

  /* ── the orb comes alive: blinks, glances, smiles ───────── */
  function blink() {
    root.classList.add("sy-blink");
    setTimeout(() => root.classList.remove("sy-blink"), 130);
  }
  (function loop() {
    const next = 2600 + Math.random() * 3800;
    setTimeout(() => {
      if (!document.hidden && !reduce.matches) { blink(); if (Math.random() < 0.18) setTimeout(blink, 260); }
      loop();
    }, next);
  })();
  let happyT = 0;
  function happy(ms) { root.classList.add("sy-happy"); clearTimeout(happyT); happyT = setTimeout(() => root.classList.remove("sy-happy"), ms); }
  let lastMove = 0, raf = 0, gp = null;
  const glance = (x, y) => { root.style.setProperty("--gx", x.toFixed(2) + "px"); root.style.setProperty("--gy", y.toFixed(2) + "px"); };
  addEventListener("pointermove", (e) => {
    if (!finePointer.matches || reduce.matches) return;
    lastMove = Date.now(); gp = e;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = launch.getBoundingClientRect();
      const dx = gp.clientX - (r.left + r.width / 2), dy = gp.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * 3;
      glance((dx / d) * k, (dy / d) * k * 0.8);
    });
  }, { passive: true });
  setInterval(() => { // idle: an occasional look around, then back to centre
    if (document.hidden || reduce.matches || Date.now() - lastMove < 5000 || root.dataset.state === "thinking") return;
    if (Math.random() < 0.5) { glance((Math.random() * 2 - 1) * 3, (Math.random() * 2 - 1) * 1.6); setTimeout(() => glance(0, 0), 1400); }
  }, 4200);

  /* ── launcher position: draggable, remembered, kept on screen ── */
  const posKey = () => PKEY + (phone.matches ? "_m" : "_d");
  function margins() { return phone.matches ? 16 : 24; }
  function applyPos(p) {
    if (!p) { launch.style.removeProperty("right"); launch.style.removeProperty("bottom"); return; }
    const w = launch.offsetWidth || 60, m = 8;
    const right = Math.min(Math.max(m, p.r), innerWidth - w - m), bottom = Math.min(Math.max(m, p.b), innerHeight - w - m);
    launch.style.right = right + "px"; launch.style.bottom = bottom + "px";
  }
  applyPos(store.get(posKey(), null));
  let drag = null, suppressClick = false;
  launch.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const r = launch.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, r: innerWidth - r.right, b: innerHeight - r.bottom, moved: false };
    // capture at once, so a fast flick that leaves the button before the first move still drags it
    try { launch.setPointerCapture(e.pointerId); } catch (er) { /* */ }
  });
  launch.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      launch.classList.add("is-drag");
      hideNudge(false);
    }
    applyPos({ r: drag.r - dx, b: drag.b - dy });
    if (isOpen()) anchor();
  });
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (drag.moved) {
      suppressClick = true; // the click that follows a drag must not toggle
      setTimeout(() => (suppressClick = false), 350);
      const r = launch.getBoundingClientRect();
      store.set(posKey(), { r: Math.round(innerWidth - r.right), b: Math.round(innerHeight - r.bottom) });
    }
    launch.classList.remove("is-drag");
    drag = null;
  }
  launch.addEventListener("pointerup", endDrag);
  launch.addEventListener("pointercancel", endDrag);
  launch.addEventListener("dblclick", (e) => e.preventDefault());

  /* ── open / close ───────────────────────────────────────── */
  const isOpen = () => root.classList.contains("is-open");
  let lastToggle = 0, closeT = 0, opener = null;
  function anchor() {
    if (phone.matches) { panel.style.removeProperty("right"); panel.style.removeProperty("bottom"); panel.style.removeProperty("top"); return; }
    const l = launch.getBoundingClientRect();
    const pw = panel.offsetWidth || Math.min(400, innerWidth - 32);
    const ph = panel.offsetHeight || Math.min(620, innerHeight - 128);
    const gap = 14, m = 16;
    // horizontally: align the panel's right edge with the launcher's, kept on screen
    let right = Math.min(Math.max(m, innerWidth - l.right), innerWidth - pw - m);
    // vertically: above the launcher if it fits, else below it, else as close as possible
    let top = l.top - gap - ph;
    if (top < m) {
      if (l.bottom + gap + ph <= innerHeight - m) top = l.bottom + gap; // below it
      else { // neither fits: beside it, never on top of it
        top = Math.min(Math.max(m, l.top + l.height / 2 - ph / 2), innerHeight - m - ph);
        right = l.left + l.width / 2 > innerWidth / 2 ? innerWidth - l.left + gap : innerWidth - (l.right + gap) - pw;
        right = Math.min(Math.max(m, right), innerWidth - pw - m);
      }
    }
    panel.style.right = right + "px";
    panel.style.bottom = "auto";
    panel.style.top = top + "px";
    const left = innerWidth - right - pw;
    panel.style.setProperty("--ox", `${l.left + l.width / 2 - left}px`);
    panel.style.setProperty("--oy", `${l.top + l.height / 2 - top}px`);
  }
  let inerted = [];
  function setModal(on) {
    const doc = document.documentElement;
    if (on && phone.matches) {
      doc.classList.add("sy-locked");
      panel.setAttribute("aria-modal", "true");
      inerted = [...document.body.children].filter((n) => n !== root && !n.inert && n.tagName !== "SCRIPT");
      inerted.forEach((n) => (n.inert = true));
    } else {
      doc.classList.remove("sy-locked");
      panel.setAttribute("aria-modal", "false");
      inerted.forEach((n) => (n.inert = false));
      inerted = [];
    }
  }
  function open() {
    if (isOpen()) return;
    clearTimeout(closeT);
    hideNudge(true);
    opener = document.activeElement && document.activeElement !== document.body ? document.activeElement : launch;
    if (!msgs.children.length) render();
    panel.classList.remove("closing");
    anchor();
    root.classList.add("is-open");
    launch.classList.add("is-open");
    launch.setAttribute("aria-expanded", "true");
    launch.setAttribute("aria-label", "Close the chat with SASY");
    void panel.offsetWidth; // start the transition from the launcher
    panel.classList.add("on");
    setModal(true);
    if (unread) markUnread(0);
    if (phone.matches) {
      fitViewport();
      try { if (!(history_.state && history_.state.sasy)) history_.pushState(Object.assign({}, history_.state, { sasy: 1 }), ""); } catch (e) { /* */ }
    }
    snd("open");
    happy(700);
    toBottom(true);
    const focus = () => { if (isOpen()) input.focus({ preventScroll: true }); };
    if (reduce.matches) focus(); else setTimeout(focus, phone.matches ? 60 : 160);
  }
  function close(opts = {}) {
    if (!isOpen()) return;
    showMenu(false);
    // the phone sheet pushed a history entry so the back gesture closes it; drop it again
    if (!opts.fromPop) { try { if (history_.state && history_.state.sasy) history_.back(); } catch (e) { /* */ } }
    root.classList.remove("is-open");
    launch.classList.remove("is-open");
    launch.setAttribute("aria-expanded", "false");
    launch.setAttribute("aria-label", "Chat with SASY, Shubham's assistant");
    panel.classList.add("closing");
    panel.classList.remove("on");
    panel.style.removeProperty("--drag");
    setModal(false);
    snd("close");
    closeT = setTimeout(() => { panel.classList.remove("closing"); queueLift(); }, 450);
    if (opts.focus !== false) {
      const back = opener && opener.isConnected && opener !== input && !panel.contains(opener) ? opener : launch;
      back.focus({ preventScroll: true });
    }
  }
  function toggle() {
    const now = Date.now(), prev = lastToggle;
    lastToggle = now;
    if (now - prev < 300) return; // a double- or triple-click is one intention, not open+close+open
    isOpen() ? close() : open();
  }
  launch.addEventListener("click", (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    opener = launch;
    toggle();
  });
  $(".sy-close").addEventListener("click", () => close());
  addEventListener("popstate", () => { if (isOpen()) close({ fromPop: true }); });
  // phones: keep the sheet inside the visible viewport, above the on-screen keyboard
  const vv = window.visualViewport;
  function fitViewport() {
    if (!vv || !phone.matches || !isOpen()) { panel.style.removeProperty("--vvh"); panel.style.removeProperty("--vvt"); return; }
    panel.style.setProperty("--vvh", vv.height + "px");
    panel.style.setProperty("--vvt", vv.offsetTop + "px");
    toBottom(false);
  }
  if (vv) { vv.addEventListener("resize", fitViewport); vv.addEventListener("scroll", fitViewport); }
  scrim.addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isOpen() && menuOpen()) { e.preventDefault(); e.stopPropagation(); showMenu(false); moreBtn.focus({ preventScroll: true }); }
      else if (isOpen()) { e.preventDefault(); e.stopPropagation(); close(); }
      else if (nudge.classList.contains("on")) hideNudge(true);
      return;
    }
    // focus trap while the phone sheet is open
    if (e.key === "Tab" && isOpen() && phone.matches) {
      const f = [...panel.querySelectorAll("button:not([disabled]), textarea, a[href], [tabindex]:not([tabindex='-1'])")].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!panel.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, true);

  // phones: swipe the sheet's header down to close it
  (function swipe() {
    const head = $(".sy-head");
    let s = null;
    head.addEventListener("pointerdown", (e) => { if (!phone.matches || e.target.closest("button")) return; s = { id: e.pointerId, y: e.clientY, t: Date.now() }; try { head.setPointerCapture(e.pointerId); } catch (er) { /* */ } panel.classList.add("is-drag"); });
    head.addEventListener("pointermove", (e) => { if (!s || e.pointerId !== s.id) return; panel.style.setProperty("--drag", Math.max(0, e.clientY - s.y) + "px"); });
    const end = (e) => {
      if (!s || e.pointerId !== s.id) return;
      const dy = e.clientY - s.y, v = dy / Math.max(1, Date.now() - s.t);
      panel.classList.remove("is-drag");
      s = null;
      if (dy > 110 || (dy > 40 && v > 0.6)) close(); else panel.style.removeProperty("--drag");
    };
    head.addEventListener("pointerup", end);
    head.addEventListener("pointercancel", end);
  })();

  let rz = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      applyPos(store.get(posKey(), null));
      if (isOpen()) { anchor(); setModal(false); setModal(true); }
      if (nudge.classList.contains("on")) placeNudge();
    });
  });

  /* ── the one-time "ask me" nudge + unread badge ─────────── */
  function placeNudge() {
    const l = launch.getBoundingClientRect(), gap = 12;
    const nw = nudge.offsetWidth, nh = nudge.offsetHeight;
    const leftSide = l.left + l.width / 2 > innerWidth / 2; // launcher on the right: bubble to its left
    nudge.classList.toggle("flip", !leftSide);
    nudge.style.left = Math.max(8, Math.min(innerWidth - nw - 8, leftSide ? l.left - gap - nw : l.right + gap)) + "px";
    nudge.style.top = Math.max(8, Math.min(innerHeight - nh - 8, l.top + l.height / 2 - nh + 10)) + "px";
  }
  let nudgeT = 0;
  function showNudge() {
    if (isOpen() || store.get(NKEY, null)) return;
    if (root.classList.contains("sy-tucked")) { setTimeout(showNudge, 1500); return; } // wait until it's on screen
    nudge.hidden = false;
    placeNudge();
    root.classList.add("has-unread");
    launch.setAttribute("aria-label", "Chat with SASY, Shubham's assistant (1 new message)");
    requestAnimationFrame(() => nudge.classList.add("on"));
    nudgeT = setTimeout(() => hideNudge(false), 14000); // the bubble steps back; the badge stays until opened
  }
  function hideNudge(done) {
    clearTimeout(nudgeT);
    nudge.classList.remove("on");
    setTimeout(() => { if (!nudge.classList.contains("on")) nudge.hidden = true; }, 300);
    if (done) {
      store.set(NKEY, Date.now());
      root.classList.remove("has-unread");
      if (!isOpen()) launch.setAttribute("aria-label", "Chat with SASY, Shubham's assistant");
    }
  }
  $(".sy-nudge-x").addEventListener("click", (e) => { e.stopPropagation(); hideNudge(true); launch.focus({ preventScroll: true }); });
  $(".sy-nudge-txt").addEventListener("click", () => { opener = launch; open(); });
  if (!store.get(NKEY, null)) {
    if (history.length) store.set(NKEY, Date.now()); // returning visitor who already chatted
    else setTimeout(showNudge, 6000);
  }

  /* ── never cover the footer's back-to-top button (or other marked controls) ── */
  // the launcher lifts just enough while such a control is under it; data-sasy-avoid opts more in
  let liftRaf = 0;
  // phones: the launcher stays tucked away while the page's hero fills the screen, then fades in
  const hero = document.querySelector("[data-sasy-hero], .hx");
  function tuck() {
    const on = !!hero && phone.matches && !isOpen() && hero.getBoundingClientRect().bottom > innerHeight * 0.45;
    if (on !== root.classList.contains("sy-tucked")) {
      root.classList.toggle("sy-tucked", on);
      launch.setAttribute("aria-hidden", String(on));
      launch.tabIndex = on ? -1 : 0;
      if (on && nudge.classList.contains("on")) hideNudge(false);
    }
  }
  function lift() {
    liftRaf = 0;
    tuck();
    const targets = document.querySelectorAll("#toTop, .to-top, .foot-bar, [data-sasy-avoid]");
    if (!targets.length || isOpen()) { launch.style.setProperty("--lift", "0px"); return; }
    // the resting box (right/bottom are untouched by the lift's translate, so no feedback loop)
    const cs = getComputedStyle(launch), w = launch.offsetWidth, h = launch.offsetHeight;
    const bottom = innerHeight - parseFloat(cs.bottom), right = innerWidth - parseFloat(cs.right);
    const l = { left: right - w, right, top: bottom - h, bottom };
    let need = 0;
    targets.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
      const overlapX = r.left < l.right + 8 && r.right > l.left - 8, overlapY = r.top < l.bottom + 8 && r.bottom > l.top - 8;
      if (overlapX && overlapY) need = Math.max(need, l.bottom - r.top + 12);
    });
    launch.style.setProperty("--lift", Math.min(need, 200) + "px");
  }
  const queueLift = () => { if (!liftRaf) liftRaf = requestAnimationFrame(lift); };
  addEventListener("scroll", queueLift, { passive: true });
  addEventListener("resize", queueLift);
  launch.addEventListener("pointerup", () => setTimeout(queueLift, 0));
  setTimeout(queueLift, 300);

  /* ── unread badge: replies that arrived while the chat was closed ── */
  let unread = 0;
  function markUnread(n) {
    unread = n ? unread + n : 0;
    root.classList.toggle("has-unread", unread > 0);
    $(".sy-badge").textContent = unread > 9 ? "9+" : String(unread || 1);
    if (!isOpen()) launch.setAttribute("aria-label", "Chat with SASY, Shubham's assistant" + (unread ? ` (${unread} new ${unread > 1 ? "replies" : "reply"})` : ""));
  }

  /* ── boot ───────────────────────────────────────────────── */
  setState("idle");
  syncSend();

  window.SASY = {
    __chat: true,
    ask,
    think: () => setState("thinking"),
    bubble: () => setState("idle"),
    mood: () => { happy(900); setState("idle"); },
    open, close: () => close(), send: (q) => { open(); send(q); },
    play: snd,
  };
})();
