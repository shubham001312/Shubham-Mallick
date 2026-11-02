/* ============================================================
   sound.js — the portfolio's sound, synthesised with Web Audio.

   No audio files. A small, soft, situational palette:
     nav      a low felt "thock" — going to another page here
     out      a glass ping — a link that leaves the site / email
     tick     a tiny paper tick — any button or control
     open     an airy rise + two soft notes — the assistant opens
     close    the same, falling — it closes
     send     a short lifted blip — your message goes out
     reply    a two-note mallet — the assistant answers
     dark     a low, warm chime — lights off
     light    a bright, high chime — lights on
     error    a muted thud

   Rules: nothing is created or played before the visitor's first
   gesture; everything is quiet (master 0.18) and low-passed warm;
   one mute toggle (.sound-btn), remembered in localStorage.
   API: window.SMSound.play(name), .muted(), .toggle()
   ============================================================ */
(function () {
  "use strict";
  const KEY = "sm-sound";
  let ctx = null, master = null, gestured = false, muted = false;
  try { muted = localStorage.getItem(KEY) === "off"; } catch (e) { /* storage blocked: sound stays on */ }

  function audio() {
    if (muted || !gestured) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      master = ctx.createGain();
      master.gain.value = 0.18;
      const warm = ctx.createBiquadFilter();
      warm.type = "lowpass"; warm.frequency.value = 4800; warm.Q.value = 0.3;
      master.connect(warm); warm.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }
  // the first real gesture unlocks audio (browsers require it; we respect it)
  const unlock = () => { gestured = true; };
  ["pointerdown", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, unlock, { capture: true, passive: true }));

  function tone({ freq = 440, type = "sine", dur = 0.08, gain = 0.5, sweep = 0, delay = 0 }) {
    const c = audio(); if (!c) return;
    const t0 = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (sweep) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + sweep), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.03);
  }
  function noise({ dur = 0.04, gain = 0.14, freq = 2400, to = 0, q = 0.9, type = "bandpass", delay = 0 }) {
    const c = audio(); if (!c) return;
    const t0 = c.currentTime + delay, len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const g = c.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  const mallet = (freq, gain = 0.14, dur = 0.34, delay = 0) => {
    tone({ freq, dur, gain, delay });
    tone({ freq: freq * 3.98, dur: dur * 0.16, gain: gain * 0.2, delay });
  };

  const SOUNDS = {
    tick() { noise({ dur: 0.026, gain: 0.12, freq: 3200, q: 1.2 }); tone({ freq: 1150, dur: 0.03, gain: 0.05 }); },
    nav() { tone({ freq: 190, sweep: -70, dur: 0.12, gain: 0.32 }); noise({ dur: 0.05, gain: 0.08, freq: 700, type: "lowpass" }); },
    out() { mallet(1320, 0.07, 0.42); mallet(1980, 0.035, 0.36, 0.05); },
    open() { noise({ dur: 0.22, gain: 0.07, freq: 600, to: 2600, q: 0.6 }); mallet(523, 0.1, 0.3, 0.05); mallet(784, 0.08, 0.36, 0.12); },
    close() { noise({ dur: 0.2, gain: 0.06, freq: 2400, to: 600, q: 0.6 }); mallet(659, 0.08, 0.26); mallet(440, 0.07, 0.3, 0.07); },
    send() { tone({ freq: 620, sweep: 260, dur: 0.09, gain: 0.12 }); },
    reply() { mallet(784, 0.09, 0.3); mallet(1047, 0.07, 0.36, 0.08); },
    dark() { mallet(392, 0.11, 0.5); mallet(587, 0.07, 0.55, 0.06); },
    light() { mallet(880, 0.08, 0.42); mallet(1319, 0.06, 0.46, 0.06); },
    error() { tone({ freq: 140, sweep: -40, dur: 0.16, gain: 0.25, type: "triangle" }); },
  };

  function play(name) { if (!muted && gestured && SOUNDS[name]) { try { SOUNDS[name](); } catch (e) { /* never break the page */ } } }

  function paintButtons() {
    document.querySelectorAll(".sound-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(!muted));
      b.classList.toggle("is-muted", muted);
      b.setAttribute("aria-label", muted ? "Turn sounds on" : "Mute sounds");
      b.dataset.tip = muted ? "Turn sounds on" : "Mute sounds";
    });
  }
  function setMuted(m) {
    muted = !!m;
    try { localStorage.setItem(KEY, muted ? "off" : "on"); } catch (e) { /* */ }
    paintButtons();
    if (!muted) play("light"); // switching on answers with a note
  }

  // situational sounds for links and buttons (event delegation, capture phase)
  document.addEventListener("click", (e) => {
    if (muted || e.defaultPrevented && !e.target.closest("[data-sound]")) { /* still allow explicit ones below */ }
    const el = e.target.closest("a[href], button, [role=button], summary, input[type=checkbox], input[type=radio]");
    if (!el || el.closest("[data-sound=none]")) return;
    const explicit = el.getAttribute("data-sound");
    if (explicit) { play(explicit); return; }
    if (el.matches(".sound-btn, .theme-btn, #sasy, .sasy-launch, #chatClose")) return; // these play their own
    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (/^(mailto|tel):/i.test(href) || el.target === "_blank" || (/^https?:/i.test(href) && new URL(href, location.href).origin !== location.origin)) { play("out"); return; }
      if (href.startsWith("#")) { play("tick"); return; }
      // same-site page change: give the thock ~90 ms before the page goes
      if (!muted && gestured && ctx && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented) {
        e.preventDefault(); play("nav");
        setTimeout(() => { location.href = el.href; }, 90);
        return;
      }
      play("nav"); return;
    }
    play("tick");
  }, true);

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".sound-btn");
    if (b) setMuted(!muted);
  });
  addEventListener("themechange", (e) => play(e.detail === "dark" ? "dark" : "light"));

  window.SMSound = { play, muted: () => muted, toggle: () => setMuted(!muted), set: setMuted };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paintButtons); else paintButtons();
})();
