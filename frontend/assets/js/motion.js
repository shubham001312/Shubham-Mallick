/* ═══════════════════════════════════════════════════════════════════════════
   MOTION ENGINE — scroll reel, scrub reveals, parallax, tilt, spotlight,
   velocity marquee, counters and a real YouTube player with custom controls.
   Loaded after main.js. Never touches the core chat / project logic.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover:none)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ─────────────────────────────────────────────────────────────
     1. SCROLL PROGRESS RAIL
     ───────────────────────────────────────────────────────────── */
  function initRail() {
    if (reduce) return;
    let rail = document.querySelector('.scroll-rail');
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'scroll-rail';
      rail.setAttribute('aria-hidden', 'true');
      rail.innerHTML = '<i></i>';
      document.body.appendChild(rail);
    }
    const bar = rail.querySelector('i');
    let ticking = false;
    function upd() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
      ticking = false;
    }
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    addEventListener('resize', upd, { passive: true });
    upd();
  }

  /* ─────────────────────────────────────────────────────────────
     2. REVEAL ON SCROLL
     ───────────────────────────────────────────────────────────── */
  function initReveals() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const d = parseFloat(el.getAttribute('data-delay') || '0');
        if (d) el.style.transitionDelay = d + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────
     3. TEXT SPLIT — word-by-word masked rise
     ───────────────────────────────────────────────────────────── */
  function splitWords(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    const walk = (node, out) => {
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach((w) => {
            if (!w) return;
            if (/^\s+$/.test(w)) { out.appendChild(document.createTextNode(w)); return; }
            const outer = document.createElement('span');
            outer.className = 'split-w';
            const inner = document.createElement('span');
            inner.className = 'split-word';
            inner.textContent = w;
            outer.appendChild(inner);
            out.appendChild(outer);
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false);
          walk(n, clone);
          out.appendChild(clone);
        }
      });
    };
    const frag = document.createDocumentFragment();
    walk(el, frag);
    el.innerHTML = '';
    el.appendChild(frag);
    let i = 0;
    el.querySelectorAll('.split-word').forEach(w => {
      w.style.setProperty('--wi', i++);
    });
  }

  function initSplit() {
    const hosts = document.querySelectorAll('[data-split]');
    if (!hosts.length) return;
    hosts.forEach(h => {
      h.classList.add('split-host');
      splitWords(h);
    });
    if (reduce || !('IntersectionObserver' in window)) {
      hosts.forEach(h => h.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    hosts.forEach(h => io.observe(h));

    // safety net: anything already on screen when the page settles gets revealed
    const revealVisible = () => {
      hosts.forEach(h => {
        if (h.classList.contains('in')) return;
        const r = h.getBoundingClientRect();
        if (r.top < innerHeight * 0.95 && r.bottom > 0) h.classList.add('in');
      });
    };
    addEventListener('load', revealVisible);
    setTimeout(revealVisible, 1200);
  }

  /* ─────────────────────────────────────────────────────────────
     4. SCRUB — element state tied to scroll progress
     ───────────────────────────────────────────────────────────── */
  function initScrub() {
    const els = document.querySelectorAll('[data-scrub]');
    if (!els.length || reduce) return;
    const items = els.map(el => ({ el, box: null, p: 0 }));
    function measure() {
      items.forEach(it => { it.box = it.el.getBoundingClientRect(); });
    }
    function paint() {
      const vh = innerHeight;
      items.forEach(it => {
        const b = it.box;
        if (!b) return;
        if (b.bottom < -200 || b.top > vh + 200) return;
        // 0 when the element enters from the bottom, 1 when it leaves the top
        const total = vh + b.height;
        const p = clamp((vh - b.top) / total, 0, 1);
        it.p = p;
        const speed = parseFloat(it.el.getAttribute('data-scrub-speed') || '1');
        const shift = (p - 0.5) * 120 * speed;
        it.el.style.transform = it.el.getAttribute('data-scrub') === 'zoom'
          ? 'scale(' + (0.86 + p * 0.14).toFixed(3) + ') translateY(' + shift.toFixed(1) + 'px)'
          : 'translateY(' + shift.toFixed(1) + 'px)';
        it.el.style.opacity = clamp(0.25 + p * 1.4, 0, 1).toFixed(3);
      });
    }
    let ticking = false;
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(() => { measure(); paint(); ticking = false; }); }
    }, { passive: true });
    addEventListener('resize', () => { measure(); paint(); }, { passive: true });
    measure(); paint();
  }

  /* ─────────────────────────────────────────────────────────────
     5. SCROLL REEL — vertical scroll drives a horizontal strip
     ───────────────────────────────────────────────────────────── */
  function initReel() {
    const reel = document.querySelector('[data-reel]');
    if (!reel) return;
    const track = reel.querySelector('.reel-track');
    const bar = reel.querySelector('.reel-bar i');
    if (!track) return;

    const FALLBACK = [
      { title: 'Hosteler', desc: 'E-commerce for hostel students — essentials, cart, wishlist, student discounts, free pan-India delivery.', stack: ['Next.js', 'Node.js', 'PostgreSQL'], link: 'https://www.hosteler.shop/' },
      { title: 'IMURUN', desc: 'A local-first AI coding agent for the terminal. Models run on your machine and your code never leaves it.', stack: ['TypeScript', 'Bun', 'MIT'], link: 'imurun.html' },
      { title: 'Learnify', desc: 'AI study companion for Indian students — college discovery, career guidance, scholarships, multilingual Veda.', stack: ['FastAPI', 'RAG', 'Supabase'], link: 'https://learnify.hosteler.shop/' },
      { title: 'ChhayaTaru Cafe', desc: 'Bilingual cafe site for a Howrah coffee house — menu, gallery, table booking.', stack: ['Next.js', 'Tailwind'], link: 'https://chhayataru.vercel.app/' }
    ];

    function fill(data) {
      const list = (Array.isArray(data) && data.length) ? data : FALLBACK;
      track.innerHTML = list.map((p, i) => {
        const url = p.page || p.link || '#';
        const tags = (p.stack || []).slice(0, 4).map(t => '<span class="chip">' + esc(t) + '</span>').join('');
        return '<a class="reel-card" data-reveal="up" href="' + esc(url) + '"' +
          (String(url).startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>' +
          '<span class="reel-idx">/REEL ' + String(i + 1).padStart(2, '0') + '</span>' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<p>' + esc(p.desc || p.summary || '') + '</p>' +
          '<div class="reel-tags">' + tags + '</div>' +
          '</a>';
      }).join('');
      if (window.activateReveals) window.activateReveals();
    }

    if (reel.dataset.reelFrom === 'api') {
      fetch('/api/projects', { cache: 'no-store' })
        .then(r => (r.ok ? r.json() : null))
        .then(d => fill(d))
        .catch(() => fill(FALLBACK));
    } else {
      fill(FALLBACK);
    }

    if (reduce) return;

    let lastY = scrollY, v = 0;
    let ticking = false;
    function paint() {
      const r = reel.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      const max = Math.max(0, track.scrollWidth - innerWidth + 120);
      track.style.transform = 'translate3d(' + (-p * max).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      ticking = false;
    }
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    addEventListener('resize', paint, { passive: true });
    setTimeout(paint, 60);
  }

  /* ─────────────────────────────────────────────────────────────
     6. 3D TILT
     ───────────────────────────────────────────────────────────── */
  function initTilt() {
    if (touch || reduce) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = parseFloat(el.getAttribute('data-tilt') || '8');
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('tilted');
        el.style.transform =
          'perspective(900px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) translateZ(0)';
      });
      el.addEventListener('mouseleave', () => {
        el.classList.remove('tilted');
        el.style.transform = '';
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     7. MAGNETIC — handled by main.js for .magnet / [data-magnet]
     ───────────────────────────────────────────────────────────── */

  /* ─────────────────────────────────────────────────────────────
     8. SPOTLIGHT + pointer coordinates on cards
     ───────────────────────────────────────────────────────────── */
  function initSpotlight() {
    if (touch) return;
    document.querySelectorAll('.spotlight').forEach(sec => {
      sec.addEventListener('mousemove', (e) => {
        const r = sec.getBoundingClientRect();
        sec.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        sec.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        sec.classList.add('lit');
      });
      sec.addEventListener('mouseleave', () => sec.classList.remove('lit'));
    });
    document.querySelectorAll('[data-spot]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     9. TIMELINE RAIL FILL
     ───────────────────────────────────────────────────────────── */
  function initRailFill() {
    const list = document.querySelector('.exp-list');
    if (!list || reduce) return;
    const fill = list.querySelector('.rail-fill');
    if (!fill) return;
    let ticking = false;
    function paint() {
      const r = list.getBoundingClientRect();
      const total = r.height - innerHeight * 0.4;
      const p = total > 0 ? clamp((-r.top + innerHeight * 0.4) / total, 0, 1) : 1;
      list.style.setProperty('--rail', p.toFixed(3));
      ticking = false;
    }
    addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(paint); }
    }, { passive: true });
    addEventListener('resize', paint, { passive: true });
    paint();
  }

  /* ─────────────────────────────────────────────────────────────
     10. MARQUEE — constant speed, never touched by scrolling
     ───────────────────────────────────────────────────────────── */
  function initVelocity() {
    /* intentionally empty: the marquee keeps its own constant speed and
       direction — scrolling must never accelerate, reverse or stall it. */
  }

  /* ─────────────────────────────────────────────────────────────
     11. COUNTERS
     ───────────────────────────────────────────────────────────── */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]:not([data-counted])');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(el => { el.textContent = (+el.dataset.count).toLocaleString('en-US'); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, t0 = performance.now();
        el.dataset.counted = '1';
        (function tick(t) {
          const p = Math.min(1, (t - t0) / 1500);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * ease).toLocaleString('en-US');
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach(el => io.observe(el));
  }

  /* ─────────────────────────────────────────────────────────────
     12. STICKY SECTION HEAD PROGRESS
     ───────────────────────────────────────────────────────────── */
  function initStickyHead() {
    document.querySelectorAll('.sec-head.sticky-head').forEach(head => {
      const sec = head.closest('section') || head.parentElement;
      const fill = document.createElement('i');
      fill.className = 'head-fill';
      head.appendChild(fill);
      let ticking = false;
      function paint() {
        const r = sec.getBoundingClientRect();
        const total = r.height - innerHeight;
        const p = total > 0 ? clamp(-r.top / total, 0, 1) : 1;
        fill.style.width = (p * 100).toFixed(1) + '%';
        ticking = false;
      }
      addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(paint); }
      }, { passive: true });
      paint();
    });
  }

  /* ─────────────────────────────────────────────────────────────
     13. COPY BUTTONS
     ───────────────────────────────────────────────────────────── */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        const done = () => {
          const old = btn.textContent;
          btn.textContent = 'Copied ✓';
          setTimeout(() => { btn.textContent = old; }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(() => { btn.textContent = text; });
        } else {
          const ta = document.createElement('textarea');
          ta.value = text; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = text; }
          ta.remove();
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
     14. ALL-PROJECTS PAGE — filters + live search
     ───────────────────────────────────────────────────────────── */
  function initProjectIndex() {
    const root = document.getElementById('apRoot');
    if (!root) return;
    const grid = root.querySelector('.ap-grid');
    const filters = root.querySelector('.ap-filters');
    const search = root.querySelector('#apSearch');
    const count = root.querySelector('.ap-count');
    const empty = root.querySelector('.ap-empty');
    if (!grid) return;

    const STATUS = {
      built: { cls: 'st-live', label: 'Live' },
      shipped: { cls: 'st-live', label: 'Shipped' },
      progress: { cls: 'st-dev', label: 'In Dev' },
      planned: { cls: 'st-ship', label: 'Planned' },
      client: { cls: 'st-ship', label: 'Client' }
    };

    let all = [];
    let active = 'all';
    let query = '';

    function card(p, i) {
      const st = STATUS[p.status] || { cls: 'st-ship', label: p.status || 'Built' };
      const url = p.page || p.link || (p.links && p.links[0] && p.links[0].url) || '#';
      const external = /^https?:/i.test(url);
      const tags = (p.stack || []).map(t => '<span class="chip">' + esc(t) + '</span>').join('');
      const cats = (p.cats || (p.cat ? String(p.cat).split(' ') : ['work'])).join(' ');
      return '<article class="ap-card" data-reveal="up" data-spot data-title="' + esc((p.title + ' ' + (p.summary || '') + ' ' + (p.desc || '') + ' ' + (p.stack || []).join(' ')).toLowerCase()) + '" data-cat="' + esc(cats) + '" data-tilt="6">' +
        '<div class="ap-top"><span class="ap-idx">/' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="p-status ' + st.cls + '"><span class="st-dot"></span>' + esc(st.label) + '</span></div>' +
        '<div><h3>' + esc(p.title) + '</h3>' + (p.role ? '<div class="ap-role">' + esc(p.role) + '</div>' : '') + '</div>' +
        '<p class="ap-desc">' + esc(p.desc || p.summary || '') + '</p>' +
        '<div class="ap-tags">' + tags + '</div>' +
        '<div class="ap-foot">' +
        '<a class="ap-go" href="' + esc(url) + '"' + (external ? ' target="_blank" rel="noopener"' : '') + '>' +
        (p.page ? 'Open project' : 'Visit live') + ' <span>→</span></a>' +
        (p.repo ? '<a class="ap-go" style="color:var(--mute)" href="' + esc(p.repo) + '" target="_blank" rel="noopener">Source <span>↗</span></a>' : '') +
        '</div></article>';
    }

    function apply() {
      let shown = 0;
      const q = query.trim().toLowerCase();
      Array.from(grid.children).forEach((el) => {
        const title = el.getAttribute('data-title') || '';
        const cats = (el.getAttribute('data-cat') || 'work').split(/\s+/);
        const okCat = active === 'all' || cats.indexOf(active) > -1;
        const okQ = !q || title.indexOf(q) > -1;
        const on = okCat && okQ;
        el.classList.toggle('hidden', !on);
        el.style.display = on ? '' : 'none';
        if (on) shown++;
      });
      if (count) count.textContent = shown + ' / ' + all.length + ' projects';
      if (empty) empty.style.display = shown ? 'none' : '';
    }

    function render(data) {
      all = Array.isArray(data) ? data : [];
      grid.innerHTML = all.map(card).join('');
      if (window.activateReveals) window.activateReveals();
      apply();
    }

    const FALLBACK = [
      { title: 'Hosteler', status: 'built', role: 'Creator / Full-stack Developer', desc: 'E-commerce platform for hostel students — essentials, cart, wishlist, student discounts, free pan-India delivery.', stack: ['Next.js', 'Node.js', 'PostgreSQL', 'Vercel'], link: 'https://www.hosteler.shop/' },
      { title: 'IMURUN', status: 'built', role: 'Creator / Maintainer', desc: 'A local-first AI coding agent for the terminal. Models run on your machine and your code never leaves it.', stack: ['TypeScript', 'Bun', 'RAG', 'MIT'], link: 'imurun.html', page: 'imurun.html' }
    ];

    fetch('/api/projects', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => render(Array.isArray(d) && d.length ? d : FALLBACK))
      .catch(() => render(FALLBACK));

    if (filters) {
      filters.addEventListener('click', (e) => {
        const b = e.target.closest('.ap-filter');
        if (!b) return;
        filters.querySelectorAll('.ap-filter').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        active = b.dataset.filter || 'all';
        apply();
      });
    }
    if (search) {
      let t = null;
      search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { query = search.value; apply(); }, 120);
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────
     15. YOUTUBE PLAYER — real controls over the IFrame API
     ───────────────────────────────────────────────────────────── */
  function loadYT() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve();
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  function initPlayer() {
    const root = document.getElementById('vp');
    if (!root) return;
    const videoId = root.getAttribute('data-video') || 'bDLHWa3ybqI';
    const frame = root.querySelector('.vplayer-frame');
    const poster = root.querySelector('.vp-poster');
    const playBtn = root.querySelector('.vp-play');
    const btnPlay = root.querySelector('[data-vp-play]');
    const btnMute = root.querySelector('[data-vp-mute]');
    const btnFull = root.querySelector('[data-vp-full]');
    const track = root.querySelector('.vp-track');
    const fill = root.querySelector('.vp-fill');
    const buf = root.querySelector('.vp-buffer');
    const handle = root.querySelector('.vp-handle');
    const time = root.querySelector('.vp-time');
    const chapters = Array.from(root.querySelectorAll('.vp-ch'));

    let player = null, started = false;

    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
      return m + ':' + String(s).padStart(2, '0');
    }

    function markChapter(t) {
      let active = -1;
      chapters.forEach((c, i) => { if (t >= parseFloat(c.getAttribute('data-t')) - 0.4) active = i; });
      chapters.forEach((c, i) => c.classList.toggle('on', i === active));
    }

    function paint() {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const t = player.getCurrentTime();
      const d = player.getDuration() || 0;
      const pct = d ? (t / d) * 100 : 0;
      if (fill) fill.style.width = pct.toFixed(2) + '%';
      if (handle) handle.style.left = pct.toFixed(2) + '%';
      if (time) time.textContent = fmt(t) + ' / ' + fmt(d);
      try {
        const b = player.getVideoLoadedFraction ? player.getVideoLoadedFraction() : 0;
        if (buf) buf.style.width = (b * 100).toFixed(2) + '%';
      } catch (e) { /* ignore */ }
      markChapter(t);
    }

    function start() {
      if (started) return;
      started = true;
      loadYT().then(() => {
        if (!window.YT) {  // API blocked — fall back to a plain embed
          const f = document.createElement('iframe');
          f.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
          f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          f.allowFullscreen = true;
          f.title = 'IMURUN — Your code. Your machine. Your model.';
          frame.appendChild(f);
          if (poster) poster.style.display = 'none';
          return;
        }
        player = new window.YT.Player('vpIframe', {
          videoId: videoId,
          playerVars: {
            autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1,
            iv_load_policy: 3, color: 'white'
          },
          events: {
            onReady: (e) => {
              e.target.playVideo();
              if (poster) poster.style.display = 'none';
              setInterval(paint, 250);
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.PLAYING && btnPlay) {
                btnPlay.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
              } else if (e.data === window.YT.PlayerState.PAUSED && btnPlay) {
                btnPlay.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
              }
            }
          }
        });
      });
    }

    if (poster) poster.addEventListener('click', start);
    if (playBtn) playBtn.addEventListener('click', start);

    if (btnPlay) btnPlay.addEventListener('click', () => {
      if (!player) { start(); return; }
      if (player.getPlayerState() === window.YT.PlayerState.PLAYING) player.pauseVideo();
      else player.playVideo();
    });

    if (btnMute) btnMute.addEventListener('click', () => {
      if (!player) return;
      if (player.isMuted()) { player.unMute(); btnMute.textContent = 'MUTE'; }
      else { player.mute(); btnMute.textContent = 'UNMUTE'; }
    });

    if (btnFull) btnFull.addEventListener('click', () => {
      const target = root.querySelector('.vplayer');
      if (!target) return;
      if (document.fullscreenElement) document.exitFullscreen();
      else if (target.requestFullscreen) target.requestFullscreen();
    });

    if (track) {
      const seek = (e) => {
        if (!player) return;
        const r = track.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
        const pct = clamp(x / r.width, 0, 1);
        const d = player.getDuration() || 0;
        player.seekTo(d * pct, true);
        paint();
      };
      let dragging = false;
      track.addEventListener('mousedown', (e) => { dragging = true; seek(e); });
      addEventListener('mousemove', (e) => { if (dragging) seek(e); });
      addEventListener('mouseup', () => { dragging = false; });
      track.addEventListener('touchstart', (e) => { dragging = true; seek(e); }, { passive: true });
      track.addEventListener('touchmove', (e) => { if (dragging) seek(e); }, { passive: true });
      track.addEventListener('touchend', () => { dragging = false; });
    }

    chapters.forEach((c) => {
      c.addEventListener('click', () => {
        const t = parseFloat(c.getAttribute('data-t')) || 0;
        if (!player) { start(); setTimeout(() => { if (player) player.seekTo(t, true); }, 900); }
        else player.seekTo(t, true);
      });
    });

    // keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (!player) return;
      if (e.key === ' ' && root.contains(document.activeElement)) { e.preventDefault(); btnPlay.click(); }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     BOOT
     ───────────────────────────────────────────────────────────── */
  function boot() {
    initRail();
    initReveals();
    initSplit();
    initScrub();
    initReel();
    initTilt();
    initSpotlight();
    initRailFill();
    initVelocity();
    initCounters();
    initStickyHead();
    initCopy();
    initProjectIndex();
    initPlayer();
  }

  // re-scan reveals after dynamic content is injected
  window.activateReveals = function () {
    const els = document.querySelectorAll('[data-reveal]:not(.in)');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    if (!window._rvIO) {
      window._rvIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const d = parseFloat(e.target.getAttribute('data-delay') || '0');
          if (d) e.target.style.transitionDelay = d + 'ms';
          e.target.classList.add('in');
          window._rvIO.unobserve(e.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    els.forEach(el => window._rvIO.observe(el));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
