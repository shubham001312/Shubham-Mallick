/* ============================================================
   SHUBHAM MALLICK — TRANSFORMER ARCHITECTURE PORTFOLIO v2.0
   All JavaScript: Animations, Canvas Visualizations, Interactions
   ============================================================ */

// ============================================================
// 1. TYPING EFFECT (Hero Section)
// ============================================================
const typingPhrases = [
  "AI Engineer (LLM Specialisation)",
  "Transformer Architect",
  "Building Intelligent Systems",
  "Full Stack AI Developer"
];
let phraseIdx = 0, charIdx = 0, isDeleting = false;
const typingEl = document.getElementById('typing-text');

function typeEffect() {
  if (!typingEl) return;
  const current = typingPhrases[phraseIdx];
  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }
  let speed = isDeleting ? 40 : 80;
  if (!isDeleting && charIdx === current.length) {
    speed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    phraseIdx = (phraseIdx + 1) % typingPhrases.length;
    speed = 500;
  }
  setTimeout(typeEffect, speed);
}
typeEffect();

// ============================================================
// 2. AUTO-UPDATING AGE
// ============================================================
function updateAge() {
  const birthDate = new Date(2006, 0, 1);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  const el = document.getElementById('age-display');
  if (el) el.textContent = age + '-year-old ';
}
updateAge();
setInterval(updateAge, 60000);

// ============================================================
// 3. SCROLL PROGRESS BAR + NAV SHRINK + ACTIVE SECTION
// ============================================================
const progressBar = document.getElementById('scroll-progress');
const posFill = document.getElementById('pos-fill');
const posLabel = document.getElementById('pos-label');
const navEl = document.querySelector('nav');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-links a');

function updateScrollProgress() {
  const h = document.documentElement;
  const scrollTop = h.scrollTop || document.documentElement.scrollTop;
  const scrollHeight = h.scrollHeight - h.clientHeight;
  const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  
  if (progressBar) progressBar.style.width = pct + '%';
  if (posFill) posFill.style.width = pct + '%';
  if (posLabel) posLabel.textContent = Math.round(pct) + '%';
  
  if (navEl) navEl.classList.toggle('scrolled', scrollTop > 50);
  
  if (navLinks.length && sections.length) {
    let currentSection = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      const bottom = top + section.offsetHeight;
      if (scrollTop >= top && scrollTop < bottom) currentSection = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentSection);
    });
  }
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

// ============================================================
// 4. ATTENTION MATRIX CANVAS (Hero Right)
// ============================================================
function initAttentionCanvas() {
  const canvas = document.getElementById('attn-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  let w, h, cells = 8;
  let animId;

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }

  function draw(t) {
    const time = t / 1000;
    ctx.clearRect(0, 0, w, h);
    const cellW = w / cells;
    const cellH = h / cells;
    
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const x = i * cellW;
        const y = j * cellH;
        const score = (Math.sin(i * 0.8 + time * 0.6) * Math.cos(j * 0.7 + time * 0.5) * 0.5 + 0.5);
        const r = Math.round(79 + (6 - 79) * score);
        const g = Math.round(70 + (182 - 70) * score);
        const b = Math.round(229 + (212 - 229) * score);
        const alpha = 0.15 + score * 0.6;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        // Fallback if roundRect not supported
        if (ctx.roundRect) {
          ctx.roundRect(x + 3, y + 3, cellW - 6, cellH - 6, 4);
        } else {
          ctx.rect(x + 3, y + 3, cellW - 6, cellH - 6);
        }
        ctx.fill();
        
        if (score > 0.7) {
          ctx.strokeStyle = `rgba(129, 140, 248, ${(score - 0.7) * 0.6})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.font = '9px Fira Code, monospace';
    ctx.fillText('Q', 8, h - 6);
    ctx.fillText('K', w - 16, 14);
    ctx.fillText('V', w - 16, h - 6);
    
    animId = requestAnimationFrame(draw);
  }

  resize();
  draw(0);
  window.addEventListener('resize', resize);
  return { destroy: () => { if (animId) cancelAnimationFrame(animId); } };
}

initAttentionCanvas();

// ============================================================
// 5. EMBEDDING SPACE CANVAS (GitHub Section)
// ============================================================
let embedAnimation = null;

function initEmbedCanvas(repos) {
  const canvas = document.getElementById('embed-canvas');
  if (!canvas) return null;
  
  // Destroy previous animation
  if (embedAnimation && typeof embedAnimation.destroy === 'function') {
    embedAnimation.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;
  let w, h, particles = [];
  let animId;
  let mouseX = -9999, mouseY = -9999;
  let hoveredParticle = null;
  let legendLanguages = [];

  const langColors = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6',
    'HTML': '#e34c26', 'CSS': '#563d7c', 'C': '#555555', 'C++': '#f34b7d',
    'Dart': '#00B4AB', 'Java': '#b07219', 'Shell': '#89e051',
    'Jupyter Notebook': '#DA5B0B', 'default': '#6e7681'
  };

  // Mouse tracking for hover tooltips
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }
  function onMouseLeave() {
    mouseX = -9999;
    mouseY = -9999;
    hoveredParticle = null;
  }
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }

  function createParticles() {
    particles = [];
    const data = repos && repos.length ? repos : [];
    const count = Math.max(data.length, 20);
    const langSet = new Set();
    for (let i = 0; i < count; i++) {
      const lang = data[i] ? (data[i].language || 'default') : 'default';
      const stars = data[i] ? (data[i].stargazers_count || 0) : Math.floor(Math.random() * 10);
      if (lang) langSet.add(lang);
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        size: 4 + Math.min(stars, 20) * 1.5,
        color: langColors[lang] || langColors['default'],
        alpha: 0.3 + Math.random() * 0.4,
        name: data[i] ? (data[i].name || '') : '',
        language: lang,
        stars: stars
      });
    }
    legendLanguages = Array.from(langSet).sort();
  }

  function drawLegend() {
    if (legendLanguages.length === 0) return;
    
    const langList = legendLanguages;
    const itemH = 16;
    ctx.font = '8px Fira Code, monospace';
    const titleW = ctx.measureText('Languages').width;
    const maxLangW = Math.max(...langList.map(l => ctx.measureText(l).width));
    const boxW = Math.max(titleW, maxLangW) + 36;
    const boxH = langList.length * itemH + 14;
    
    // Position in top-right corner
    const legendX = w - boxW - 12;
    const legendY = 26;
    
    // Background
    ctx.fillStyle = 'rgba(10, 10, 18, 0.75)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(legendX, legendY, boxW, boxH, 6);
    } else {
      ctx.rect(legendX, legendY, boxW, boxH);
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Title
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText('Languages', legendX + 8, legendY + 11);
    
    // Items
    langList.forEach((lang, i) => {
      const y = legendY + 22 + i * itemH;
      const color = langColors[lang] || langColors['default'];
      // Circle
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(legendX + 12, y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      // Label
      ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
      ctx.fillText(lang, legendX + 22, y + 1);
    });
  }

  function drawTooltip() {
    if (!hoveredParticle) return;
    const p = hoveredParticle;
    
    const lines = [
      p.name || 'unknown',
      'Language: ' + (p.language || 'unknown'),
      'Stars: ' + (p.stars || 0)
    ];
    const maxW = Math.max(100, ...lines.map(l => ctx.measureText(l).width));
    const lineH = 14;
    const padX = 10, padY = 8;
    const boxW = maxW + padX * 2;
    const boxH = lines.length * lineH + padY * 2;
    
    let tx = p.x + 12;
    let ty = p.y - 10;
    // Clamp to stay within canvas
    if (tx + boxW > w - 10) tx = p.x - boxW - 12;
    if (tx < 6) tx = 6;
    if (ty + boxH > h - 10) ty = h - boxH - 10;
    if (ty < 10) ty = 10;
    
    // Background
    ctx.fillStyle = 'rgba(10, 10, 18, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(tx, ty, boxW, boxH, 6);
    } else {
      ctx.rect(tx, ty, boxW, boxH);
    }
    ctx.fill();
    ctx.strokeStyle = p.color + '66';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Lines
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px Fira Code, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(lines[0], tx + padX, ty + padY + 10);
    ctx.fillStyle = p.color;
    ctx.fillText(lines[1], tx + padX, ty + padY + 10 + lineH);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    
    // Connections
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - dist / 100) * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Find hovered particle
    hoveredParticle = null;
    if (mouseX > 0 && mouseY > 0) {
      let minDist = 20;
      particles.forEach(p => {
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          hoveredParticle = p;
        }
      });
    }
    
    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      
      // Highlight hovered particle
      const isHovered = p === hoveredParticle;
      const glowMult = isHovered ? 4 : 2;
      const alphaMult = isHovered ? 1 : 1;
      
      // Glow
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * glowMult);
      grad.addColorStop(0, p.color + (isHovered ? '55' : '33'));
      grad.addColorStop(1, p.color + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * glowMult, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = p.color;
      ctx.globalAlpha = isHovered ? 1 : p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, isHovered ? p.size * 1.3 : p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Hovered ring
      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    
    // Static labels
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.font = '9px Fira Code, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('t-SNE projection of repositories', 8, 16);
    ctx.textAlign = 'right';
    ctx.fillText('size ∝ stars · color ∝ language', w - 8, h - 8);
    
    // Draw legend (with top label offset)
    drawLegend();
    
    // Draw tooltip on top of everything
    drawTooltip();
    
    animId = requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw(0);
  window.addEventListener('resize', resize);
  
  embedAnimation = { 
    destroy: () => { 
      if (animId) cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    }
  };
  return embedAnimation;
}

// Initial embed canvas with empty data
initEmbedCanvas([]);

// ============================================================
// 6. DARK/LIGHT MODE TOGGLE
// ============================================================
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const sun = document.querySelector('.sun-icon');
  const moon = document.querySelector('.moon-icon');
  if (sun && moon) {
    sun.style.display = isDark ? 'none' : 'block';
    moon.style.display = isDark ? 'block' : 'none';
  }
}

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (!saved && prefersDark);
  if (isDark) {
    document.body.classList.add('dark');
    const moon = document.querySelector('.moon-icon');
    const sun = document.querySelector('.sun-icon');
    if (sun) sun.style.display = 'none';
    if (moon) moon.style.display = 'block';
  }
})();

// ============================================================
// 7. MOBILE MENU TOGGLE
// ============================================================
function toggleMenu(show) {
  const nav = document.getElementById('nav-links');
  if (!nav) return;
  if (show === false) nav.classList.remove('show');
  else nav.classList.toggle('show');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

// ============================================================
// 8. SCROLL REVEAL (IntersectionObserver)
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

function applyStaggerAnimations() {
  document.querySelectorAll('.project-card, .skill-category, .cert-card, .timeline-item, .stat-card, .contact-line, .blog-preview-card, .quality-item').forEach((el, i) => {
    el.style.transitionDelay = (i * 80) + 'ms';
    el.classList.add('reveal');
    staggerObserver.observe(el);
  });
}

setTimeout(applyStaggerAnimations, 300);

// ============================================================
// 9. TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (type === 'success') toast.style.borderLeft = '3px solid #10b981';
  if (type === 'error') toast.style.borderLeft = '3px solid #ef4444';
  if (type === 'info') toast.style.borderLeft = '3px solid var(--accent)';
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
}

// ============================================================
// 10. GITHUB API INTEGRATION WITH CACHING
// ============================================================
const GITHUB_USER = 'shubham001312';
const GH_CACHE_KEY = 'gh_stats_cache_v2';
const GH_CACHE_TTL = 3600000;

const langColorMap = {
  'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6',
  'C': '#555555', 'C++': '#f34b7d', 'Dart': '#00B4AB',
  'HTML': '#e34c26', 'CSS': '#563d7c', 'Java': '#b07219',
  'Shell': '#89e051', 'Jupyter Notebook': '#DA5B0B', 'default': '#6e7681'
};

function renderStats(user, totalStars) {
  const repoEl = document.getElementById('stat-repos');
  const followersEl = document.getElementById('stat-followers');
  const starsEl = document.getElementById('stat-stars');
  if (repoEl) repoEl.textContent = user.public_repos ?? '—';
  if (followersEl) followersEl.textContent = user.followers ?? '—';
  if (starsEl) starsEl.textContent = totalStars ?? '—';
}

function renderLangs(repos) {
  const langsCard = document.getElementById('github-langs-card');
  if (!langsCard) return;
  const langMap = {};
  repos.forEach(r => { if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1; });
  const sorted = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const total = sorted.reduce((s, l) => s + l[1], 0);
  const barsHtml = sorted.map(([lang, count]) => {
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    const c = langColorMap[lang] || '#6e7681';
    return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;color:var(--text-muted)"><span>' + lang + '</span><span>' + pct + '%</span></div><div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="height:100%;width:' + pct + '%;background:' + c + ';border-radius:3px"></div></div></div>';
  }).join('');
  langsCard.innerHTML = '<div style="padding:1.5rem;background:var(--bg-card);border-radius:12px"><h3 style="font-family:Space Grotesk,sans-serif;font-size:16px;margin-bottom:12px;color:var(--accent)">Top Languages</h3>' + barsHtml + '</div>';
}

async function loadGithubStats() {
  try {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(GH_CACHE_KEY)); } catch(e) {}
    
    if (cached && Date.now() - cached.ts < GH_CACHE_TTL) {
      renderStats(cached.user, cached.totalStars);
      renderLangs(cached.repos);
      initEmbedCanvas(cached.repos);
      return;
    }
    
    const userRes = await fetch('https://api.github.com/users/' + GITHUB_USER);
    const user = await userRes.json();
    const reposRes = await fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100');
    const repos = await reposRes.json();
    if (!Array.isArray(repos) || user.public_repos === undefined) return;
    
    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const trimmed = repos.map(r => ({ name: r.name, language: r.language, stargazers_count: r.stargazers_count || 0 }));
    
    try {
      localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ user, repos: trimmed, totalStars, ts: Date.now() }));
    } catch(e) {}
    
    renderStats(user, totalStars);
    renderLangs(repos);
    initEmbedCanvas(trimmed);
    applyStaggerAnimations();
  } catch(e) {
    console.log('GitHub API fallback:', e.message);
  }
}

loadGithubStats();

function clearGithubCache() {
  try { localStorage.removeItem(GH_CACHE_KEY); } catch(e) {}
  loadGithubStats();
}

// ============================================================
// 11. ADMIN PANEL (SHA-256 Auth)
// ============================================================
const ADMIN_HASH_KEY = 'portfolio_admin_hash_v2';
const ADMIN_EMAIL_KEY = 'portfolio_admin_email_v2';
let currentAdminSection = 'hero';

async function sha256(message) {
  const buf = new TextEncoder().encode(message);
  try {
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch(e) {
    let h = 0;
    for (let i = 0; i < message.length; i++) { h = ((h << 5) - h) + message.charCodeAt(i); h |= 0; }
    return 'fallback_' + Math.abs(h).toString(16);
  }
}

async function setupAdminHash() {
  if (!localStorage.getItem(ADMIN_EMAIL_KEY)) localStorage.setItem(ADMIN_EMAIL_KEY, 'shubham.mallick1440@gmail.com');
  if (!localStorage.getItem(ADMIN_HASH_KEY)) {
    const h = await sha256('admin@1440');
    localStorage.setItem(ADMIN_HASH_KEY, h);
  }
}
setupAdminHash();

function openAdminPanel() {
  const modal = document.getElementById('admin-modal');
  if (!modal) return;
  modal.classList.add('active');
  const emailInput = document.getElementById('admin-email');
  if (emailInput) emailInput.value = localStorage.getItem(ADMIN_EMAIL_KEY) || '';
  const pwInput = document.getElementById('admin-password');
  if (pwInput) pwInput.value = '';
  const err = document.getElementById('login-error');
  if (err) err.style.display = 'none';
  if (emailInput) emailInput.focus();
}

function closeAdminPanel() {
  const m = document.getElementById('admin-modal');
  if (m) m.classList.remove('active');
}

async function handleAdminLogin() {
  const email = document.getElementById('admin-email')?.value.trim();
  const pw = document.getElementById('admin-password')?.value;
  if (!email || !pw) return;
  const storedEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
  const hash = await sha256(pw);
  const storedHash = localStorage.getItem(ADMIN_HASH_KEY);
  if (email === storedEmail && hash === storedHash) {
    closeAdminPanel();
    const editModal = document.getElementById('edit-modal');
    if (editModal) editModal.classList.add('active');
    loadSectionData();
  } else {
    const err = document.getElementById('login-error');
    if (err) err.style.display = 'block';
  }
}

function closeEditPanel() {
  const m = document.getElementById('edit-modal');
  if (m) m.classList.remove('active');
}

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    currentAdminSection = this.dataset.section;
    loadSectionData();
  });
});

const sectionDefaults = {
  hero: () => JSON.stringify({ name: 'Shubham Mallick', headline: 'AI Engineer & Full Stack Developer', description: 'AI Engineer and developer from Kolkata, building intelligent software at the intersection of AI/ML and modern web development.', tags: ['Python', 'C/C++', 'Machine Learning', 'LLMs', 'Computer Vision', 'JavaScript', 'React', 'Firebase', 'PWA'], photoUrl: 'https://avatars.githubusercontent.com/u/226120019?v=4' }, null, 2),
  about: () => JSON.stringify({ text1: "I'm an AI Engineering student at Budge Budge Institute of Technology (MAKAUT), specializing in Artificial Intelligence.", text2: "Today, I focus on building intelligent systems — from LLM-powered applications and computer vision pipelines to modern web platforms." }, null, 2),
  education: () => JSON.stringify([{ date: '2025 — Present', title: 'B.Tech in CSE (Artificial Intelligence)', school: 'Budge Budge Institute of Technology', detail: 'under MAKAUT — Currently in 1st year.' }, { date: '2023 — 2025', title: 'Higher Secondary (12th Grade)', school: 'JNV North 24 Parganas', detail: 'Completed in 2025.' }, { date: 'Earlier', title: 'Secondary (10th Grade)', school: 'JNV North 24 Parganas', detail: 'Built the foundation.' }], null, 2),
  skills: () => JSON.stringify([{ icon: '🐍', name: 'Programming Languages', skills: ['Python', 'C', 'C++', 'JavaScript', 'TypeScript', 'Dart', 'HTML5/CSS3'] }, { icon: '🤖', name: 'AI / Machine Learning', skills: ['PyTorch', 'OpenCV', 'YOLO', 'LangChain', 'HuggingFace', 'OpenAI API', 'LLMs'] }, { icon: '🌐', name: 'Web Development', skills: ['React', 'Node.js', 'Flask', 'FastAPI', 'REST APIs', 'WebSocket', 'PWA'] }, { icon: '🔧', name: 'Tools & Platforms', skills: ['Git / GitHub', 'Docker', 'Linux', 'MySQL', 'MongoDB', 'Vercel', 'HuggingFace Spaces', 'GitHub Pages'] }], null, 2),
  certs: () => JSON.stringify([{ name: 'Google AI Essentials', issuer: 'Google · Coursera', date: 'Issued May 2026', credential: '7E70JFWK9SYF', image: 'assets/cert-google-ai-essentials.png' }, { name: 'Google AI Professional', issuer: 'Google · Coursera', date: 'Issued May 2026', credential: '7L7FT1QN9CEI', image: 'assets/cert-google-ai-professional.png' }], null, 2),
  contact: () => JSON.stringify({ email: 'gmail.shubham@gmail.com', linkedin: 'https://linkedin.com/in/shubham-mallick-061298378', github: 'https://github.com/shubham001312', twitter: 'https://x.com/shubham_1440' }, null, 2),
  meta: () => JSON.stringify({ title: 'Shubham Mallick | AI Engineer & Developer', description: 'Portfolio of Shubham Mallick — AI Engineer specializing in LLMs, Computer Vision, and Full Stack Development.' }, null, 2),
  credentials: () => JSON.stringify({ email: localStorage.getItem(ADMIN_EMAIL_KEY) || '', newPassword: '' }, null, 2)
};

function loadSectionData() {
  const err = document.getElementById('edit-error');
  if (err) err.style.display = 'none';
  const stored = localStorage.getItem('portfolio_' + currentAdminSection);
  const content = document.getElementById('edit-content');
  if (content) content.value = stored || (sectionDefaults[currentAdminSection] ? sectionDefaults[currentAdminSection]() : '');
}

function saveSectionData() {
  const content = document.getElementById('edit-content')?.value;
  if (!content) return;
  
  if (currentAdminSection === 'credentials') {
    try {
      const d = JSON.parse(content);
      if (!d.newPassword || d.newPassword.length < 4) {
        const err = document.getElementById('edit-error');
        if (err) { err.textContent = 'Password must be at least 4 characters.'; err.style.display = 'block'; }
        return;
      }
      if (d.email && d.newPassword) {
        localStorage.setItem(ADMIN_EMAIL_KEY, d.email);
        sha256(d.newPassword).then(hash => {
          localStorage.setItem(ADMIN_HASH_KEY, hash);
          const err = document.getElementById('edit-error');
          if (err) err.style.display = 'none';
          showToast('Credentials updated!', 'success');
          closeEditPanel();
        });
      }
    } catch(e) {
      const err = document.getElementById('edit-error');
      if (err) { err.textContent = 'Invalid JSON.'; err.style.display = 'block'; }
    }
    return;
  }
  
  try {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) JSON.parse(content);
    localStorage.setItem('portfolio_' + currentAdminSection, content);
    const err = document.getElementById('edit-error');
    if (err) err.style.display = 'none';
    showToast('Changes saved! Refresh to see updates.', 'success');
    closeEditPanel();
  } catch(e) {
    const err = document.getElementById('edit-error');
    if (err) { err.textContent = 'Invalid JSON format.'; err.style.display = 'block'; }
  }
}

document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', function(e) { if (e.target === this) this.classList.remove('active'); });
});

// ============================================================
// 12. SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ============================================================
// 13. BUTTON HANDLERS (Resume, Notify)
// ============================================================
document.querySelectorAll('.resume-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
      e.preventDefault();
      showToast('Resume PDF coming soon! 📄', 'info');
    }
  });
});

document.querySelectorAll('.notify-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'mailto:gmail.shubham@gmail.com?subject=Blog%20Notification%20Request';
  });
});

// ============================================================
// 14. BLOG MODAL — Coming Soon Detail + Subscribe
// ============================================================
const blogArticles = [
  {
    title: 'Building GPT from Scratch',
    readingTime: '12 min read',
    date: 'June 2026',
    desc: "I'm working on this piece and will publish it soon. Leave your email below and I'll notify you the moment it goes live.",
    emoji: '🧠'
  },
  {
    title: 'Fine-Tuning LLMs on RTX 3050',
    readingTime: '15 min read',
    date: 'July 2026',
    desc: "This guide covers QLoRA, quantization, and practical tips for training LLMs on limited consumer hardware. Subscribe to get notified when it's ready.",
    emoji: '⚡'
  },
  {
    title: 'RAG Systems from Scratch',
    readingTime: '10 min read',
    date: 'July 2026',
    desc: "A deep dive into building production-grade retrieval-augmented generation pipelines. Drop your email below and I'll ping you when the article goes live.",
    emoji: '🔍'
  }
];

let blogCanvasAnim = null;

function openBlogModal(index) {
  const article = blogArticles[index];
  if (!article) return;
  
  const modal = document.getElementById('blog-modal');
  if (!modal) return;
  
  // Populate content
  const titleEl = document.getElementById('blog-modal-title');
  const readingEl = document.getElementById('blog-modal-reading-time');
  const dateEl = document.getElementById('blog-modal-date');
  const descEl = document.getElementById('blog-modal-desc');
  
  if (titleEl) titleEl.textContent = article.emoji + ' ' + article.title;
  if (readingEl) readingEl.textContent = article.readingTime;
  if (dateEl) dateEl.textContent = 'Expected ' + article.date;
  if (descEl) descEl.textContent = article.desc;
  
  // Show modal
  modal.classList.add('active');
  
  // Init canvas animation
  initBlogModalCanvas();
  
  // Clear form
  const form = document.getElementById('blog-subscribe-form');
  if (form) form.reset();
}

function closeBlogModal() {
  const modal = document.getElementById('blog-modal');
  if (modal) modal.classList.remove('active');
  
  // Destroy canvas animation
  if (blogCanvasAnim && typeof blogCanvasAnim.destroy === 'function') {
    blogCanvasAnim.destroy();
    blogCanvasAnim = null;
  }
}

function initBlogModalCanvas() {
  const canvas = document.getElementById('blog-modal-canvas');
  if (!canvas) return;
  
  // Destroy previous
  if (blogCanvasAnim && typeof blogCanvasAnim.destroy === 'function') {
    blogCanvasAnim.destroy();
  }
  
  const ctx = canvas.getContext('2d');
  let w = canvas.parentElement.clientWidth || 400;
  let h = 100;
  let animId;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  
  const tokens = [];
  const tokenStrs = ['<BOS>', 'Build', 'ing', 'GPT', 'from', 'Scratch', '<EOS>', '<PAD>'];
  for (let i = 0; i < tokenStrs.length; i++) {
    tokens.push({
      x: (i + 0.5) * (w / tokenStrs.length),
      y: h / 2 + (Math.random() - 0.5) * 30,
      text: tokenStrs[i],
      phase: Math.random() * Math.PI * 2
    });
  }
  
  function draw(t) {
    const time = t / 1000;
    ctx.clearRect(0, 0, w, h);
    
    // Draw attention lines between tokens
    ctx.lineWidth = 1;
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const alpha = (Math.sin(time * 0.5 + i * 0.3 + j * 0.7) * 0.3 + 0.3);
        ctx.strokeStyle = 'rgba(129, 140, 248, ' + alpha.toFixed(2) + ')';
        ctx.beginPath();
        ctx.moveTo(tokens[i].x, tokens[i].y);
        ctx.lineTo(tokens[j].x, tokens[j].y);
        ctx.stroke();
      }
    }
    
    // Draw tokens
    tokens.forEach((token, idx) => {
      const yOff = Math.sin(time * 1.2 + token.phase) * 8;
      ctx.fillStyle = '#818cf8';
      ctx.font = '10px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6 + Math.sin(time * 0.8 + idx * 0.5) * 0.3;
      ctx.fillText(token.text, token.x, token.y + yOff + 4);
      ctx.globalAlpha = 1;
    });
    
    animId = requestAnimationFrame(draw);
  }
  
  draw(0);
  blogCanvasAnim = { destroy: function() { if (animId) cancelAnimationFrame(animId); } };
}

// Subscribe form handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('blog-subscribe-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('subscribe-name')?.value.trim();
      const email = document.getElementById('subscribe-email')?.value.trim();
      if (!name || !email) return;
      
      // Store subscriber in localStorage
      const subscribers = JSON.parse(localStorage.getItem('blog_subscribers') || '[]');
      const exists = subscribers.some(s => s.email === email);
      if (!exists) {
        subscribers.push({ name: name, email: email, subscribedAt: new Date().toISOString(), articles: [] });
        try { localStorage.setItem('blog_subscribers', JSON.stringify(subscribers)); } catch(e) {}
      }
      
      showToast('🎉 You\'re subscribed! I\'ll notify you when the article is published.', 'success');
      closeBlogModal();
    });
  }
  
  // Close blog modal on overlay click
  const blogModal = document.getElementById('blog-modal');
  if (blogModal) {
    blogModal.addEventListener('click', function(e) {
      if (e.target === this) closeBlogModal();
    });
  }
});

// ============================================================
// 15. SYSTEM READY INITIALIZATION
// ============================================================
setTimeout(function() {
  showToast('⚡ System Ready — Transformer v2.0', 'info');
}, 1500);

// Fix cert image loading - show placeholder on error, preserving parent structure
document.querySelectorAll('.cert-card img').forEach(img => {
  img.addEventListener('error', function() {
    var placeholder = document.createElement('div');
    placeholder.style.cssText = 'padding:2rem;text-align:center;background:var(--surface-hover);border-bottom:1px solid var(--border)';
    placeholder.innerHTML = '<div style="font-size:2.5rem">🏆</div>';
    this.parentNode.insertBefore(placeholder, this);
    this.remove();
  });
});

console.log('%c⚡ Transformer Portfolio v2.0', 'font-size:20px;font-weight:bold;color:#818cf8');
console.log('%cShubham Mallick — AI Engineer', 'font-size:14px;color:#94a3b8');
