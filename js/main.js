// ===== TYPING EFFECT =====
const typingPhrases=["AI Engineer (LLM Specialisation)","Building Intelligent Software","Python • C • Machine Learning • LLMs","Turning Ideas Into Reality"];
let phraseIdx=0,charIdx=0,isDeleting=false;
const typingEl=document.getElementById('typing-text');
function typeEffect(){const current=typingPhrases[phraseIdx];if(isDeleting){typingEl.textContent=current.substring(0,charIdx-1);charIdx--}else{typingEl.textContent=current.substring(0,charIdx+1);charIdx++}let speed=isDeleting?40:80;if(!isDeleting&&charIdx===current.length){speed=2000;isDeleting=true}else if(isDeleting&&charIdx===0){isDeleting=false;phraseIdx=(phraseIdx+1)%typingPhrases.length;speed=500}setTimeout(typeEffect,speed)}
typeEffect();

// ===== AUTO-UPDATING AGE =====
function updateAge(){const birthDate=new Date(2006,0,1);const now=new Date();let age=now.getFullYear()-birthDate.getFullYear();const m=now.getMonth()-birthDate.getMonth();if(m<0||(m===0&&now.getDate()<birthDate.getDate()))age--;const el=document.getElementById('age-display');if(el)el.textContent=age+'-year-old '}
updateAge();setInterval(updateAge,60000);

// ===== SCROLL PROGRESS =====
window.addEventListener('scroll',()=>{const h=document.documentElement;document.getElementById('scroll-progress').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100+'%'});

// ===== FADE-IN =====
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:0.1});
document.querySelectorAll('.fade-in').forEach(el=>observer.observe(el));

// ===== MOBILE MENU =====
function toggleMenu(show){const nav=document.getElementById('nav-links');if(show===false)nav.classList.remove('show');else nav.classList.toggle('show')}

// ===== ADMIN PANEL =====
const ADMIN_HASH_KEY='portfolio_admin_hash';
const ADMIN_EMAIL_KEY='portfolio_admin_email';
let currentAdminSection='hero';

async function sha256(m){const buf=new TextEncoder().encode(m);try{const hash=await crypto.subtle.digest('SHA-256',buf);return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){let h=0;for(let i=0;i<m.length;i++){h=((h<<5)-h)+m.charCodeAt(i);h|=0}return 'fallback_'+Math.abs(h).toString(16)}}

async function setupAdminHash(){
  if(!localStorage.getItem(ADMIN_EMAIL_KEY))localStorage.setItem(ADMIN_EMAIL_KEY,'shubham.mallick1440@gmail.com');
  if(!localStorage.getItem(ADMIN_HASH_KEY)){const h=await sha256('admin');localStorage.setItem(ADMIN_HASH_KEY,h)}
}
setupAdminHash();

function openAdminPanel(){document.getElementById('admin-modal').classList.add('active');document.getElementById('admin-email').value=localStorage.getItem(ADMIN_EMAIL_KEY)||'';document.getElementById('admin-password').value='';document.getElementById('login-error').style.display='none';document.getElementById('admin-email').focus()}
function closeAdminPanel(){document.getElementById('admin-modal').classList.remove('active')}

async function handleAdminLogin(){
  const email=document.getElementById('admin-email').value.trim(),pw=document.getElementById('admin-password').value;
  if(!email||!pw)return;
  const storedEmail=localStorage.getItem(ADMIN_EMAIL_KEY),hash=await sha256(pw),storedHash=localStorage.getItem(ADMIN_HASH_KEY);
  if(email===storedEmail&&hash===storedHash){closeAdminPanel();openEditPanel()}else{document.getElementById('login-error').style.display='block'}
}

function openEditPanel(){document.getElementById('edit-modal').classList.add('active');loadSectionData()}
function closeEditPanel(){document.getElementById('edit-modal').classList.remove('active')}

// Admin tab clicks
document.querySelectorAll('.admin-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentAdminSection=tab.dataset.section;
    loadSectionData();
  });
});

// Default data for each section
const sectionDefaults={
  hero:()=>JSON.stringify({name:'Shubham Mallick',headline:'AI Engineer (LLM Specialisation)',description:'AI Engineer and developer from Kolkata, building intelligent software at the intersection of AI/ML and modern web development. Passionate about LLMs, Computer Vision, and creating tools that make a difference.',tags:['Python','C/C++','Machine Learning','LLMs','Computer Vision','JavaScript','MySQL'],photoUrl:'https://avatars.githubusercontent.com/u/226120019?v=4'},null,2),
  about:()=>JSON.stringify({text1:"I'm an AI Engineering student at Budge Budge Institute of Technology (MAKAUT), specializing in Artificial Intelligence. My journey started at Jawahar Navodaya Vidyalaya, North 24 Parganas, where I discovered my passion for technology and problem-solving.",text2:"Today, I focus on building intelligent systems — from LLM-powered applications and computer vision pipelines to modern web platforms. I believe in learning by building, and every project on this portfolio represents a step in that journey."},null,2),
  education:()=>JSON.stringify([{date:'2025 — Present',title:'B.Tech in CSE (Artificial Intelligence)',school:'Budge Budge Institute of Technology',detail:'under MAKAUT — Currently in 1st year, specializing in AI/ML.'},{date:'2023 — 2025',title:'Higher Secondary (12th Grade)',school:'Jawahar Navodaya Vidyalaya, North 24 Parganas',detail:'Completed 12th grade in 2025.'},{date:'Earlier',title:'Secondary (10th Grade)',school:'Jawahar Navodaya Vidyalaya, North 24 Parganas',detail:'Built the foundation.'}],null,2),
  skills:()=>JSON.stringify([{icon:'🐍',name:'Programming Languages',skills:['Python','C','C++','JavaScript','TypeScript','Dart','HTML5/CSS3']},{icon:'🤖',name:'AI / Machine Learning',skills:['PyTorch','OpenCV','YOLO','LangChain','HuggingFace','OpenAI API','LLMs']},{icon:'🌐',name:'Web Development',skills:['React','Node.js','Flask','FastAPI','REST APIs','WebSocket','PWA']},{icon:'🔧',name:'Tools & Platforms',skills:['Git / GitHub','Docker','Linux','MySQL','MongoDB','Vercel','HuggingFace Spaces','GitHub Pages']}],null,2),
  projects:()=>JSON.stringify([{emoji:'🗺️',title:'GRBS — AI/ML Roadmap',desc:'A comprehensive, interactive AI/ML learning roadmap tracker with 18 phases, curated resources (English + Hindi), progress tracking, activity heatmap, and a PWA for offline access.',tags:['JavaScript','PWA','Chart.js','HTML/CSS'],demo:'https://shubham001312.github.io/GRBS/',source:'https://github.com/shubham001312/GRBS'},{emoji:'🧠',title:'CUET AI Assistant',desc:'An AI-powered assistant built with Python and deployed on HuggingFace Spaces. Features intelligent conversational capabilities and smart query handling.',tags:['Python','HuggingFace','LLM','Gradio'],demo:'https://huggingface.co/spaces/shubham001312/cuet-ai',source:'https://github.com/shubham001312/cuet-ai'},{emoji:'📰',title:'NewsBuzz',desc:'A modern news aggregator that fetches and displays real-time news from multiple sources with category filtering and search.',tags:['JavaScript','REST API','HTML/CSS','Responsive'],demo:'https://shubham001312.github.io/newsbuzz/',source:'https://github.com/shubham001312/newsbuzz'},{emoji:'📱',title:'Guzu — Android Browser',desc:'A lightweight, privacy-focused Android browser built with Flutter/Dart with multiple search engine support.',tags:['Dart','Flutter','Android','WebView'],source:'https://github.com/shubham001312/guzu--ANDROID_SOURCE_CODE'}],null,2),
  certs:()=>JSON.stringify([{name:'Google AI Essentials',issuer:'Google · Coursera',date:'Issued May 2026',credential:'7E70JFWK9SYF',image:'assets/cert-google-ai-essentials.png'},{name:'Google AI Professional',issuer:'Google · Coursera',date:'Issued May 2026',credential:'7L7FT1QN9CEI',image:'assets/cert-google-ai-professional.png'}],null,2),
  contact:()=>JSON.stringify({email:'gmail.shubham@gmail.com',linkedin:'https://linkedin.com/in/shubham-mallick-061298378',github:'https://github.com/shubham001312',twitter:'https://x.com/shubham_1440'},null,2),
  meta:()=>JSON.stringify({title:'Shubham Mallick | AI Engineer & Developer',description:'Portfolio of Shubham Mallick — AI Engineer specializing in LLMs, Computer Vision, and Full Stack Development.'},null,2),
  credentials:()=>JSON.stringify({email:localStorage.getItem(ADMIN_EMAIL_KEY)||'',newPassword:''},null,2)
};

function loadSectionData(){
  document.getElementById('edit-error').style.display='none';
  const stored=localStorage.getItem('portfolio_'+currentAdminSection);
  document.getElementById('edit-content').value=stored||sectionDefaults[currentAdminSection]();
}

function saveSectionData(){
  const content=document.getElementById('edit-content').value;
  if(currentAdminSection==='credentials'){
    try{
      const d=JSON.parse(content);
      if(!d.newPassword||d.newPassword.length<4){document.getElementById('edit-error').textContent='Password must be at least 4 characters.';document.getElementById('edit-error').style.display='block';return}
      if(d.email&&d.newPassword){
        localStorage.setItem(ADMIN_EMAIL_KEY,d.email);
        sha256(d.newPassword).then(hash=>{localStorage.setItem(ADMIN_HASH_KEY,hash);document.getElementById('edit-error').style.display='none';alert('Credentials updated!');closeEditPanel()});
      }else{document.getElementById('edit-error').textContent='Provide both email and newPassword.';document.getElementById('edit-error').style.display='block'}
    }catch(e){document.getElementById('edit-error').textContent='Invalid JSON. Example: {"email":"...","newPassword":"..."}';document.getElementById('edit-error').style.display='block'}
    return;
  }
  try{
    if(content.trim().startsWith('{')||content.trim().startsWith('['))JSON.parse(content);
    localStorage.setItem('portfolio_'+currentAdminSection,content);
    document.getElementById('edit-error').style.display='none';
    alert('Saved! Refresh to see changes.');
    closeEditPanel();
  }catch(e){document.getElementById('edit-error').textContent='Invalid JSON format.';document.getElementById('edit-error').style.display='block'}
}

// ===== APPLY SAVED CONTENT ON LOAD =====
function sanitize(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML}
function applySavedContent(){
  // Hero
  const hd=localStorage.getItem('portfolio_hero');
  if(hd)try{const d=JSON.parse(hd);if(d.name)document.getElementById('hero-name').textContent=sanitize(d.name);if(d.headline)typingPhrases[0]=d.headline;if(d.description){document.getElementById('hero-desc').innerHTML="I'm a <strong id=\"age-display\"></strong>"+sanitize(d.description);updateAge()}if(d.photoUrl)document.getElementById('profile-photo').src=d.photoUrl;if(d.tags){const t=document.getElementById('hero-tags');t.innerHTML=d.tags.map(tag=>'<span class="tag">'+sanitize(tag)+'</span>').join('')}}catch(e){}
  // About
  const ad=localStorage.getItem('portfolio_about');
  if(ad)try{const d=JSON.parse(ad);const el=document.getElementById('about-text');if(d.text1)el.querySelector('p:first-of-type').textContent=sanitize(d.text1);if(d.text2)el.querySelectorAll('p')[1].textContent=sanitize(d.text2)}catch(e){}
  // Education
  const ed=localStorage.getItem('portfolio_education');
  if(ed)try{const items=JSON.parse(ed);const t=document.getElementById('education-timeline');t.innerHTML=items.map(i=>'<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-date">'+sanitize(i.date)+'</div><h4>'+sanitize(i.title)+'</h4><p><strong>'+sanitize(i.school)+'</strong> '+sanitize(i.detail)+'</p></div>').join('')}catch(e){}
  // Skills
  const sk=localStorage.getItem('portfolio_skills');
  if(sk)try{const cats=JSON.parse(sk);const g=document.getElementById('skills-grid');g.innerHTML=cats.map(c=>'<div class="skill-category"><h3><span class="cat-icon">'+sanitize(c.icon)+'</span> '+sanitize(c.name)+'</h3><div class="skill-tags">'+c.skills.map(s=>'<span class="skill-tag">'+sanitize(s)+'</span>').join('')+'</div></div>').join('')}catch(e){}
  // Projects
  const pd=localStorage.getItem('portfolio_projects');
  if(pd)try{const projs=JSON.parse(pd);const g=document.getElementById('projects-grid');g.innerHTML=projs.map(p=>'<div class="project-card"><div class="project-emoji">'+sanitize(p.emoji)+'</div><h3 class="project-title">'+sanitize(p.title)+'</h3><p class="project-desc">'+sanitize(p.desc)+'</p><div class="project-tags">'+p.tags.map(t=>'<span class="project-tag">'+sanitize(t)+'</span>').join('')+'</div><div class="project-links">'+(p.demo?'<a href="'+sanitize(p.demo)+'" class="project-link" target="_blank">Live Demo →</a>':'')+(p.source?'<a href="'+sanitize(p.source)+'" class="project-link" target="_blank">Source Code →</a>':'')+'</div></div>').join('')}catch(e){}
  // Certs
  const cd=localStorage.getItem('portfolio_certs');
  if(cd)try{const certs=JSON.parse(cd);const g=document.getElementById('certs-grid');g.innerHTML=certs.map(c=>'<div class="cert-card"><img src="'+sanitize(c.image)+'" alt="'+sanitize(c.name)+'" loading="lazy"><div class="cert-info"><div class="cert-name">'+sanitize(c.name)+'</div><div class="cert-issuer">'+sanitize(c.issuer)+'</div><div class="cert-date">'+sanitize(c.date)+' · Credential ID: '+sanitize(c.credential)+'</div></div></div>').join('')}catch(e){}
  // Contact
  const ct=localStorage.getItem('portfolio_contact');
  if(ct)try{const d=JSON.parse(ct);const links=document.querySelectorAll('.contact-line');if(d.email){links[0].href='mailto:'+encodeURIComponent(d.email);links[0].querySelector('.contact-value').textContent=sanitize(d.email)}if(d.linkedin){links[1].href=d.linkedin}if(d.github){links[2].href=d.github}if(d.twitter){links[3].href=d.twitter}}catch(e){}
  // Meta
  const mt=localStorage.getItem('portfolio_meta');
  if(mt)try{const d=JSON.parse(mt);if(d.title)document.title=sanitize(d.title);if(d.description)document.querySelector('meta[name="description"]').content=sanitize(d.description)}catch(e){}
}
applySavedContent();

// ===== LIVE GITHUB STATS (fallback when image service is down) =====
const GITHUB_USER='shubham001312';
const GH_CACHE_KEY='gh_stats_cache';
const GH_CACHE_TTL=3600000; // 1 hour in ms
function getLangColors(){return{Python:'#3572A5',JavaScript:'#f1e05a',C:'#555555','C++':'#f34b7d',TypeScript:'#3178c6',Dart:'#00B4AB',HTML:'#e34c26',CSS:'#563d7c',Java:'#b07219',Shell:'#89e051'}}
function renderStats(u,totalStars){
  const repoEl=document.getElementById('stat-repos');
  const followersEl=document.getElementById('stat-followers');
  const starsEl=document.getElementById('stat-stars');
  if(repoEl)repoEl.textContent=u.public_repos??'—';
  if(followersEl)followersEl.textContent=u.followers??'—';
  if(starsEl)starsEl.textContent=totalStars??'—';
  const statsCard=document.getElementById('github-stats-card');
  if(statsCard){statsCard.innerHTML='<div style="padding:1.5rem;background:var(--surface);border-radius:8px;"><h3 style=\'font-family:Space Grotesk,sans-serif;font-size:16px;margin-bottom:12px;color:var(--accent)\'>GitHub Overview</h3><div style=\'display:flex;gap:24px;flex-wrap:wrap;font-size:14px;\'><div>📦 <strong>'+(u.public_repos??0)+'</strong> Repos</div><div>👥 <strong>'+(u.followers??0)+'</strong> Followers</div><div>⭐ <strong>'+totalStars+'</strong> Stars</div><div>🔀 <strong>'+(u.public_gists??0)+'</strong> Gists</div></div></div>'}
}
function renderLangs(repos){
  const langsCard=document.getElementById('github-langs-card');
  if(!langsCard)return;
  const langMap={};repos.forEach(r=>{if(r.language){langMap[r.language]=(langMap[r.language]||0)+1}});
  const sorted=Object.entries(langMap).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const total=sorted.reduce((s,l)=>s+l[1],0);
  const colors=getLangColors();
  const barsHtml=sorted.map(([lang,count])=>{
    const pct=Math.round(count/total*100);const c=colors[lang]||'#6e7681';
    return '<div style=\'margin-bottom:8px;\'>'+'<div style=\'display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;color:var(--muted)\'>'+'<span>'+lang+'</span><span>'+pct+'%</span></div>'+'<div style=\'height:6px;background:var(--border);border-radius:3px;overflow:hidden;\'>'+'<div style=\'height:100%;width:'+pct+'%;background:'+c+';border-radius:3px;\'></div></div></div>';
  }).join('');
  langsCard.innerHTML='<div style="padding:1.5rem;background:var(--surface);border-radius:8px;"><h3 style=\'font-family:Space Grotesk,sans-serif;font-size:16px;margin-bottom:12px;color:var(--accent)\'>Top Languages</h3>'+barsHtml+'</div>';
}
async function loadGithubStats(){
  try{
    // Check cache first
    let cached=null;
    try{cached=JSON.parse(localStorage.getItem(GH_CACHE_KEY))}catch(e){}
    if(cached&&Date.now()-cached.ts<GH_CACHE_TTL){
      try{renderStats(cached.user,cached.totalStars);renderLangs(cached.repos);return}catch(e){}
    }
    // Fetch fresh data
    const u=await fetch('https://api.github.com/users/'+GITHUB_USER).then(r=>r.json());
    const repos=await fetch('https://api.github.com/users/'+GITHUB_USER+'/repos?per_page=100').then(r=>r.json());
    if(!Array.isArray(repos)||u.public_repos===undefined)return; // don't cache errors
    const totalStars=repos.reduce((s,r)=>s+(r.stargazers_count||0),0);
    const trimmed=repos.map(r=>({language:r.language,stargazers_count:r.stargazers_count||0}));
    try{localStorage.setItem(GH_CACHE_KEY,JSON.stringify({user:u,repos:trimmed,totalStars:totalStars,ts:Date.now()}))}catch(e){}
    renderStats(u,totalStars);renderLangs(repos);
  }catch(e){console.log('GitHub API fallback failed:',e)}
}
loadGithubStats();

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('active')})});
