/* ═══════════════════════ UTILITIES ═══════════════════════ */
const API_BASE='';
const touch = matchMedia('(hover:none)').matches;
const lowEnd = (!touch && ((navigator.deviceMemory && navigator.deviceMemory<=4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4))) || matchMedia('(max-width:820px)').matches;
const hero3DCapable = (navigator.deviceMemory===undefined || navigator.deviceMemory>=4) && (navigator.hardwareConcurrency===undefined || navigator.hardwareConcurrency>=4);
const SID = (()=>{ try{ let s=localStorage.getItem('sasy_sid'); if(!s){ s=(crypto.randomUUID?crypto.randomUUID():'s'+Date.now()+Math.random().toString(36).slice(2)); localStorage.setItem('sasy_sid',s);} return s; }catch(e){ return 'anon'; } })();
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp = (a,b,t)=>a+(b-a)*t;

/* ═══════════════════════ PROJECT ART ═══════════════════════
   Generated SVG posters (assets/img/art) — no screenshots. */
function artFor(title){
  const t=String(title||'').toLowerCase();
  const map=[['imurun','imurun'],['agents','agents'],['learnify','learnify'],['hosteler','hosteler'],
    ['chhaya','chhayataru'],['reciprocity','reciprocity'],['grbs','grbs'],['imutechz','web']];
  for(const [k,v] of map){ if(t.indexOf(k)>-1) return 'assets/img/art/'+v+'.svg'; }
  return 'assets/img/art/web.svg';
}
window.artFor=artFor;

/* ═══════════════════════ MAGNETIC BUTTONS ═══════════════════════ */
if(!touch){
  document.querySelectorAll('.magnet,[data-magnet]').forEach(el=>{
    const strength = parseFloat(el.getAttribute('data-magnet') || '0.25');
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*strength, dy=(e.clientY-r.top-r.height/2)*strength*1.35;
      el.style.transform=`translate(${dx}px,${dy}px)`;
    });
    el.addEventListener('mouseleave',()=>{el.style.transform='';});
  });
}

/* ═══════════════════════ LIVE IST CLOCK ═══════════════════════ */
setInterval(()=>{
  const t=new Date().toLocaleTimeString('en-GB',{timeZone:'Asia/Kolkata',hour12:false});
  document.querySelectorAll('.ist-clock').forEach(el=>el.textContent=t);
},1000);

/* ═══════════════════════ MARQUEES ═══════════════════════ */
(function(){
  const words=['Python','FastAPI','RAG pipelines','PostgreSQL','LLM agents','IMURUN','FISH engine','TypeScript','Local inference','Next.js','Docker','Supabase','Embeddings','Open source'];
  const build=(id,ghostEvery)=>{
    const t=document.getElementById(id); if(!t) return; let html='';
    for(let r=0;r<2;r++) words.forEach((w,i)=>{
      html+=`<span class="mq-item ${(i%ghostEvery===ghostEvery-1)?'ghost':''}">${w}<span class="dia">◆</span></span>`;
    });
    t.innerHTML=html;
  };
  build('mq1',3); build('mq2',4);
})();

/* ═══════════════════════ SCROLL REVEALS ═══════════════════════ */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    Array.from(e.target.querySelectorAll(':scope > *')).forEach((c,i)=>{c.style.transitionDelay=(i*70)+'ms';});
    e.target.classList.add('on'); io.unobserve(e.target);
  }
}),{threshold:.12});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* count-up stats */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting) return;
  const el=e.target,target=+el.dataset.count,t0=performance.now();
  (function tick(t){
    const p=Math.min(1,(t-t0)/1400), ease=1-Math.pow(1-p,3);
    el.textContent=Math.round(target*ease);
    if(p<1) requestAnimationFrame(tick);
  })(t0);
  cio.unobserve(el);
}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));

/* scrollspy (in-page anchors only)
   The nav links point at real pages (about.html, work, ...), NOT at #ids.
   An earlier version matched on '#'+section.id, so it stripped .active from
   every tab and the maroon pill faded out mid-transition. Anchor links are
   the only ones a section observer is allowed to touch. */
const spy=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    const hash='#'+e.target.id;
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a=>
      a.classList.toggle('active', a.getAttribute('href')===hash));
  }
}),{rootMargin:'-40% 0px -55% 0px'});
['capabilities','work','stack','contact','experience'].forEach(id=>{
  const el=document.getElementById(id); if(el) spy.observe(el);
});

/* capability card spotlight */
document.querySelectorAll('.cap,.feat').forEach(c=>{
  c.addEventListener('mousemove',e=>{
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  });
});

/* ═══════════════════════ MINI 2D SIGNAL VIZ (project rows) ═══════════════════════ */
document.querySelectorAll('.p-viz canvas').forEach(cv=>{
  const ctx=cv.getContext('2d'); const mode=cv.dataset.viz;
  const fit=()=>{cv.width=cv.offsetWidth*2;cv.height=cv.offsetHeight*2;}; fit();
  addEventListener('resize',fit);
  let t=Math.random()*10;
  function frame(){
    const w=cv.width,h=cv.height,cx=w/2,cy=h/2;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='rgba(242,102,26,.9)';ctx.lineWidth=1.4;
    if(mode==='ring'){
      for(let k=0;k<3;k++){
        ctx.beginPath();
        ctx.globalAlpha=.9-k*.3;
        ctx.ellipse(cx,cy,(w*.36)+k*7*2,(w*.13)+k*5*2,t*(.6+k*.25),0,Math.PI*2);
        ctx.stroke();
      }
      ctx.globalAlpha=1;
      ctx.fillStyle='#f2661a';
      const a=t*1.4;
      ctx.beginPath();ctx.arc(cx+Math.cos(a)*w*.36,cy+Math.sin(a)*w*.13,3,0,7);ctx.fill();
    }
    else if(mode==='net'){
      const pts=[];
      for(let i=0;i<7;i++){
        const ang=i/7*Math.PI*2+t*.3;
        pts.push([cx+Math.cos(ang)*(w*.3+Math.sin(t+i)*14),cy+Math.sin(ang)*(h*.3)]);
      }
      ctx.globalAlpha=.35;
      for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){
        ctx.beginPath();ctx.moveTo(...pts[i]);ctx.lineTo(...pts[j]);ctx.stroke();
      }
      ctx.globalAlpha=1;
      pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,7);ctx.fillStyle='#f2661a';ctx.fill();});
    }
    else if(mode==='pulse'){
      ctx.beginPath();
      for(let x=0;x<=w;x+=4){
        const y=cy+Math.sin(x*.05-t*3)*h*.22*Math.sin(x/w*Math.PI)+Math.sin(x*.13+t)*h*.08;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    else{ /* scan */
      for(let y=0;y<h;y+=10){
        ctx.globalAlpha=.16+Math.sin(y*.4+t*2)*.1;
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
      }
      ctx.globalAlpha=.9;
      const sy=(t*30)%(h*1.6)-h*.3;
      const g=ctx.createLinearGradient(0,sy-16,0,sy+16);
      g.addColorStop(0,'rgba(242,102,26,0)');g.addColorStop(.5,'rgba(242,102,26,.5)');g.addColorStop(1,'rgba(242,102,26,0)');
      ctx.fillStyle=g;ctx.fillRect(0,sy-16,w,32);
    }
    ctx.globalAlpha=1;
  }
  if(lowEnd){ frame(); return; }   // mobile / low-end: render once, no animation loop
  let visible=true, rafId=null;
  function loop(){ t+=.02; frame(); if(visible && !document.hidden) rafId=requestAnimationFrame(loop); else rafId=null; }
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>{ visible=es[0].isIntersecting; if(visible && !rafId && !document.hidden) rafId=requestAnimationFrame(loop); },{threshold:0}).observe(cv);
  } else { rafId=requestAnimationFrame(loop); }
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden && visible && !rafId) rafId=requestAnimationFrame(loop); });
  rafId=requestAnimationFrame(loop);
});

/* ═══════════════════════ 3D HERO — NEURAL CORE (index only) ═══════════════════════ */
function startHero3D(){
  const canvas=document.getElementById('glcanvas');
  if(!canvas || !window.THREE) return;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  const DPR=Math.min(devicePixelRatio,touch?1.5:2);
  renderer.setPixelRatio(DPR);
  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0xF3EEE3,0.06);

  const cam=new THREE.PerspectiveCamera(50,1,.1,60);
  cam.position.set(0,0,7.6);

  scene.add(new THREE.AmbientLight(0xffffff,.6));
  const key=new THREE.PointLight(0x7A1F2B,2.2,30); key.position.set(6,4,6); scene.add(key);
  const rim=new THREE.PointLight(0x1E40AF,1.0,30); rim.position.set(-6,-3,-4); scene.add(rim);

  const world=new THREE.Group(); scene.add(world);
  function place(){
    const w=innerWidth;
    world.position.x = w>1200 ? 2.1 : w>820 ? 1.3 : 0;
    if(w<=820) world.position.y=.6; else world.position.y=0;
  }
  place();

  const coreGeo=new THREE.IcosahedronGeometry(1.5,1);
  const coreMat=new THREE.MeshPhongMaterial({
    color:0x3A1A20, emissive:0x3A0E16, emissiveIntensity:.7,
    shininess:80, flatShading:true, transparent:true, opacity:.96
  });
  const core=new THREE.Mesh(coreGeo,coreMat); world.add(core);

  const edges=new THREE.LineSegments(
    new THREE.EdgesGeometry(coreGeo),
    new THREE.LineBasicMaterial({color:0x7A1F2B,transparent:true,opacity:.5})
  );
  edges.scale.setScalar(1.004); world.add(edges);

  function glowTex(color){
    const c=document.createElement('canvas');c.width=c.height=128;
    const x=c.getContext('2d');
    const g=x.createRadialGradient(64,64,0,64,64,64);
    g.addColorStop(0,color);g.addColorStop(.35,color.replace('1)','.45)'));g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(c);
  }
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({
    map:glowTex('rgba(242,102,26,1)'),transparent:true,opacity:.32,
    blending:THREE.NormalBlending,depthWrite:false
  }));
  halo.scale.setScalar(7.4); world.add(halo);

  const rings=[];
  function makeOrbit(radius,tilt,count,ph,spd,op){
    const grp=new THREE.Group();
    grp.rotation.x=tilt;
    const ringPts=[];
    for(let i=0;i<=64;i++){
      const a=i/64*Math.PI*2;
      ringPts.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));
    }
    const ring=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineBasicMaterial({color:0x7A1F2B,transparent:true,opacity:op})
    );
    grp.add(ring);
    const lines=[];
    for(let i=0;i<count;i++){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
      const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xB5444F,transparent:true,opacity:.85}));
      grp.add(l);
      lines.push({m:l,ph:ph+i*(Math.PI*2/count),spd,spdMul:.8+Math.random()*.5,radius});
    }
    world.add(grp);
    rings.push({grp,lines,dir:spd>0?1:-1});
  }
  makeOrbit(2.35,.42,4,0,.7,.3);
  makeOrbit(2.75,-.55,3,2.1,-.45,.16);
  makeOrbit(2.05,1.25,2,4,1.1,.1);

  function gauss(){let u=0,v=0;while(u===0)u=Math.random();while(v===0)v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(6.28318*v);}
  const N = touch?600:1200;
  const hudPts=document.getElementById('hudPts'); if(hudPts) hudPts.textContent=N;
  const ptsPos=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    let x=gauss(),y=gauss(),z=gauss();
    const n=1.6/Math.sqrt(x*x+y*y+z*z+.0001);
    const r=3.05*(.9+Math.random()*.28);
    ptsPos[i*3]=x*n*r; ptsPos[i*3+1]=y*n*r; ptsPos[i*3+2]=z*n*r;
  }
  const ptsGeo=new THREE.BufferGeometry();
  ptsGeo.setAttribute('position',new THREE.BufferAttribute(ptsPos,3));
  const shell=new THREE.Points(ptsGeo,new THREE.PointsMaterial({
    color:0x7A1F2B,size:.032,map:glowTex('rgba(242,102,26,1)'),
    transparent:true,opacity:.32,blending:THREE.NormalBlending,depthWrite:false
  }));
  world.add(shell);

  const starGeo=new THREE.BufferGeometry();
  const sp=new Float32Array(300*3);
  for(let i=0;i<300;i++){
    const v=new THREE.Vector3().randomDirection().multiplyScalar(9+Math.random()*9);
    sp[i*3]=v.x;sp[i*3+1]=v.y;sp[i*3+2]=v.z;
  }
  starGeo.setAttribute('position',new THREE.BufferAttribute(sp,3));
  scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({
    color:0x9A8C84,size:.025,transparent:true,opacity:.4,depthWrite:false
  })));

  let mx=0,my=0,smx=0,smy=0;
  let scrollE=0, hoverBoost=0, hoverTarget=0;
  addEventListener('mousemove',e=>{
    mx=e.clientX/innerWidth*2-1; my=e.clientY/innerHeight*2-1;
  });
  let lastY=scrollY;
  addEventListener('scroll',()=>{
    scrollE=Math.min(1.6,scrollE+Math.abs(scrollY-lastY)*.004);
    lastY=scrollY;
  },{passive:true});
  document.querySelectorAll('.proj').forEach(p=>{
    p.addEventListener('mouseenter',()=>hoverTarget=1);
    p.addEventListener('mouseleave',()=>hoverTarget=0);
  });
  window.neuralPulse=function(strength){
    hoverBoost=Math.max(strength||1.6,hoverBoost);
  };

  function resize(){
    const w=canvas.parentElement.clientWidth,h=canvas.parentElement.clientHeight;
    renderer.setSize(w,h,false);
    cam.aspect=w/h;cam.updateProjectionMatrix();
    place();
  }
  resize(); addEventListener('resize',resize);

  const clock=new THREE.Clock();
  let pulseT=0;
  let heroInView=true, heroVisible=true, heroPaused=true, heroRunning=false;
  let _lastHeroFrame=0;
  const _heroFrameMs=33; // cap at ~30fps
  function updateHeroPause(){
    heroPaused = !heroVisible || !heroInView;
    if(!heroPaused && !heroRunning){ heroRunning=true; requestAnimationFrame(tick); }
  }
  document.addEventListener('visibilitychange',()=>{ heroVisible=!document.hidden; updateHeroPause(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>{ heroInView=es[0].isIntersecting; updateHeroPause(); },{threshold:0}).observe(canvas);
  }
  function tick(ts){
    if(heroPaused){ heroRunning=false; return; }
    if(ts-_lastHeroFrame<_heroFrameMs){ requestAnimationFrame(tick); return; }
    _lastHeroFrame=ts;
    const dt=Math.min(clock.getDelta(),.05);
    const t=clock.elapsedTime;

    scrollE=lerp(scrollE,0,dt*1.8);
    hoverBoost=lerp(hoverBoost,hoverTarget,dt*3);
    const energy=1+scrollE+hoverBoost;

    smx=lerp(smx,mx,dt*3); smy=lerp(smy,my,dt*3);
    if(!touch){ world.rotation.x=smy*.14; world.rotation.y=smx*.22; }

    core.rotation.y+=dt*.12*energy;
    core.rotation.z+=dt*.05;
    edges.rotation.copy(core.rotation);
    const breath=1+Math.sin(t*1.6)*.025+hoverBoost*.02;
    core.scale.setScalar(breath); edges.scale.setScalar(breath*1.004);
    halo.material.opacity=.28+Math.sin(t*1.6)*.07+hoverBoost*.18;
    if(pulseT>0){
      pulseT-=dt;
      const s=1+Math.sin((1-pulseT/.9)*Math.PI)*.35;
      halo.scale.setScalar(7.4*s);
    } else halo.scale.setScalar(lerp(halo.scale.x,7.4,dt*4));

    rings.forEach((R,ri)=>{
      R.lines.forEach(L=>{
        L.ph+=dt*L.spd*L.spdMul*energy*R.dir;
        const half=.16+hoverBoost*.05;
        const a1=L.ph-half,a2=L.ph+half;
        const pos=L.m.geometry.attributes.position.array;
        pos[0]=Math.cos(a1)*L.radius; pos[1]=0; pos[2]=Math.sin(a1)*L.radius;
        pos[3]=Math.cos(a2)*L.radius; pos[4]=0; pos[5]=Math.sin(a2)*L.radius;
        L.m.geometry.attributes.position.needsUpdate=true;
        L.m.material.opacity=.65+hoverBoost*.3;
      });
      R.grp.rotation.z+=dt*.05*(ri%2?-1:1)*energy;
      R.grp.rotation.x+=dt*.02*(ri%2?1:-1);
    });

    shell.rotation.y+=dt*.045*energy;
    shell.rotation.x=Math.sin(t*.3)*.06;
    shell.material.opacity=.3+hoverBoost*.18;

    cam.position.x=lerp(cam.position.x,smx*.5,dt*2);
    cam.position.y=lerp(cam.position.y,-smy*.35,dt*2);
    cam.lookAt(world.position.x*.4,world.position.y*.4,0);

    renderer.render(scene,cam);
    requestAnimationFrame(tick);
  }
  updateHeroPause();
}
function ensureThree(cb){
  if(window.THREE){ cb(); return; }
  if(!hero3DCapable){ document.documentElement.classList.add('no-3d'); return; }
  const s=document.createElement('script');
  s.src=API_BASE+'assets/js/three.min.js'; s.defer=true;
  s.onload=()=>cb();
  s.onerror=()=>{ document.documentElement.classList.add('no-3d'); };
  document.head.appendChild(s);
}
if(document.getElementById('glcanvas')) ensureThree(startHero3D);

/* ═══════════════════════ PROJECT HOVER → 3D PULSE ═══════════════════════ */
document.querySelectorAll('.proj').forEach((p,i)=>{
  p.addEventListener('mouseenter',()=>{ if(window.neuralPulse) window.neuralPulse(.9+i*.15); });
});
document.querySelectorAll('.cap').forEach((c,i)=>{
  c.addEventListener('mouseenter',()=>{ if(window.neuralPulse) window.neuralPulse(.3+i*.2); });
});

/* ═══════════════════════ DYNAMIC PROJECTS (from backend) ═══════════════════════ */
(function(){
  const list=document.getElementById('projList'); if(!list) return;
  const modal=document.getElementById('projModal');
  const STATUS={built:{cls:'st-live',label:'Live'},shipped:{cls:'st-live',label:'Shipped'},progress:{cls:'st-dev',label:'In Dev'},planned:{cls:'st-ship',label:'Planned'},client:{cls:'st-ship',label:'Client'}};
  const VIZ=['ring','net','pulse','scan'];
  function row(p,i){
    const st=STATUS[p.status]||{cls:'st-ship',label:p.status};
    const tags=(p.stack||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('');
    const url=p.link||(p.links&&p.links[0]&&p.links[0].url)||'#';
    const flag=p.flag?`<span class="p-flag">${esc(p.flag)}</span>`:'';
    const pager=p.page?`<span class="p-page">PAGE ↗</span>`:'';
    return `<article class="proj${p.page?' has-page':''}" data-url="${esc(url)}" tabindex="0">
      <span class="p-num">/${String(i+1).padStart(2,'0')}</span>
      <div class="p-main"><div class="p-title">${esc(p.title)} ${flag} ${pager}</div>
        <p class="p-desc">${esc(p.desc)}</p>
        <div class="p-tags">${tags}</div></div>
      <div class="p-viz"><img src="${artFor(p.title)}" alt="" loading="lazy"></div>
      <span class="p-status ${st.cls}"><span class="st-dot"></span>${st.label}</span>
      <span class="p-arr">↗</span></article>`;
  }
  function openProject(p){
    if(!modal) return;
    modal.querySelector('#projTitle').textContent=p.title||'Project';
    modal.querySelector('#projMeta').textContent=[p.status,p.role].filter(Boolean).join(' · ');
    modal.querySelector('#projDetail').textContent=p.detail||p.desc||'';
    const stack=modal.querySelector('#projStack'); stack.innerHTML='';
    (p.stack||[]).forEach(s=>{ const c=document.createElement('span'); c.className='chip'; c.textContent=s; stack.appendChild(c); });
    const high=modal.querySelector('#projHigh'); high.innerHTML='';
    (p.highlights||[]).forEach(h=>{ const li=document.createElement('li'); li.textContent=h; high.appendChild(li); });
    const links=modal.querySelector('#projLinks'); links.innerHTML='';
    const mk=(href,label,primary)=>{
      const a=document.createElement('a');
      a.href=href; a.textContent=label;
      if(primary) a.className='otw-live';
      else { a.target='_blank'; a.rel='noopener'; }
      links.appendChild(a);
    };
    // a project with its own page wins — clicking it lands on that page
    if(p.page){ mk(p.page,'Open project page →',true); }
    else { const u=p.link||(p.links&&p.links[0]&&p.links[0].url); if(u) mk(u,'Visit live ↗',true); }
    if(p.repo) mk(p.repo,'Source code ↗');
    if(p.docs) mk(p.docs,'Read the docs ↗');
    if(p.video) mk(p.video,'Watch the video ↗');
    (p.links||[]).forEach(l=>mk(l.url,l.label+' ↗'));
    modal.hidden=false; requestAnimationFrame(()=>modal.classList.add('open')); document.body.style.overflow='hidden';
  }
  function closeProject(){ if(!modal) return; modal.classList.remove('open'); setTimeout(()=>{ modal.hidden=true; },300); document.body.style.overflow=''; }
  function render(data){
    if(!data||!data.length){ list.innerHTML='<p class="p-empty">Projects are taking a breather — check back soon.</p>'; return; }
    list.innerHTML=data.map(row).join('');
    try{ if(window.activateViz) window.activateViz(); }catch(e){ /* viz is decorative — never blank the grid */ }
    document.querySelectorAll('.proj').forEach((el,i)=>{
      el.addEventListener('mouseenter',()=>{ if(window.neuralPulse) window.neuralPulse(.9+i*.15); });
      el.addEventListener('click',e=>{
        if(e.target.closest('a')) return;
        const p=data[i]; if(!p) return;
        // projects that own a page open it directly — the rest use the detail modal
        if(p.page){ location.href=p.page; return; }
        openProject(p);
      });
      el.addEventListener('keydown',e=>{
        if(e.key==='Enter'){ e.preventDefault(); const p=data[i]; if(!p) return;
          if(p.page){ location.href=p.page; return; } openProject(p); }
      });
    });
  }
  if(modal){
    modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeProject));
    modal.addEventListener('click',e=>{ if(e.target===modal) closeProject(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) closeProject(); });
  }
  fetch('/api/projects',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{
    if(Array.isArray(d)&&d.length) d.forEach((p,i)=>{ if(!p.flag&&(i<2)) p.flag='Flagship'; });
    render(Array.isArray(d)?d:[]);
  }).catch(()=>render([]));
})();

/* re-init 2D viz for dynamically added canvases */
(function(){
  window.activateViz=function(){
    const lowEnd = (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) || (navigator.hardwareConcurrency||4)<=4;
    document.querySelectorAll('.p-viz canvas:not([data-on])').forEach(cv=>{
      cv.setAttribute('data-on','1');
      let ctx; try{ ctx=cv.getContext('2d'); }catch(e){ ctx=null; }
      if(!ctx) return;
      const mode=cv.dataset.viz||'scan';
      let t=Math.random()*10, raf=null, visible=false;
      const fit=()=>{ const w=Math.max(2,Math.round(cv.offsetWidth*2)), h=Math.max(2,Math.round(cv.offsetHeight*2)); cv.width=w; cv.height=h; };
      fit();
      const ro=new ResizeObserver(()=>{ fit(); if(lowEnd) draw(); else if(visible && raf==null) raf=requestAnimationFrame(draw); });
      try{ ro.observe(cv); }catch(e){}
      const io=new IntersectionObserver(es=>es.forEach(e=>{
        visible=e.isIntersecting;
        if(visible && !lowEnd && raf==null) raf=requestAnimationFrame(draw);
        else if(!visible && raf){ cancelAnimationFrame(raf); raf=null; }
      }),{threshold:0.01});
      try{ io.observe(cv); }catch(e){}
      function draw(){
        raf=null;
        const w=cv.width,h=cv.height; if(w<3||h<3) return;   // not laid out yet — skip, RO will refit
        t+=.02; const cx=w/2,cy=h/2;
        ctx.clearRect(0,0,w,h); ctx.strokeStyle='rgba(242,102,26,.9)';ctx.lineWidth=1.4;
        if(mode==='ring'){
          for(let k=0;k<3;k++){ctx.beginPath();ctx.globalAlpha=.9-k*.3;ctx.ellipse(cx,cy,(w*.36)+k*7*2,(w*.13)+k*5*2,t*(.6+k*.25),0,Math.PI*2);ctx.stroke();}
          ctx.globalAlpha=1;ctx.fillStyle='#f2661a';const a=t*1.4;ctx.beginPath();ctx.arc(cx+Math.cos(a)*w*.36,cy+Math.sin(a)*w*.13,3,0,7);ctx.fill();
        } else if(mode==='net'){
          const pts=[];for(let i=0;i<7;i++){const ang=i/7*Math.PI*2+t*.3;pts.push([cx+Math.cos(ang)*(w*.3+Math.sin(t+i)*14),cy+Math.sin(ang)*(h*.3)]);}
          ctx.globalAlpha=.35;for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);ctx.lineTo(pts[j][0],pts[j][1]);ctx.stroke();}
          ctx.globalAlpha=1;pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,7);ctx.fillStyle='#f2661a';ctx.fill();});
        } else if(mode==='pulse'){
          ctx.beginPath();for(let x=0;x<=w;x+=4){const y=cy+Math.sin(x*.05-t*3)*h*.22*Math.sin(x/w*Math.PI)+Math.sin(x*.13+t)*h*.08;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
        } else {
          const hS=Math.max(2,h);
          for(let y=0;y<hS;y+=10){ctx.globalAlpha=.16+Math.sin(y*.4+t*2)*.1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
          ctx.globalAlpha=.9;const sy=((t*30)%(hS*1.6))-hS*.3;
          const g=ctx.createLinearGradient(0,sy-16,0,sy+16);
          g.addColorStop(0,'rgba(242,102,26,0)');g.addColorStop(.5,'rgba(242,102,26,.5)');g.addColorStop(1,'rgba(242,102,26,0)');ctx.fillStyle=g;ctx.fillRect(0,sy-16,w,32);
        }
        ctx.globalAlpha=1;
        if(lowEnd || document.hidden) return;   // phones: one static frame; tab hidden: paused
        raf=requestAnimationFrame(draw);
      }
      if(lowEnd) draw();
      else if(visible) raf=requestAnimationFrame(draw);
      addEventListener('resize',()=>{ fit(); if(lowEnd) draw(); else if(visible && raf==null) raf=requestAnimationFrame(draw); });
    });
  };
})();

/* ═══════════════════════ DYNAMIC SKILLS MATRIX (from backend) ═══════════════════════ */
(function(){
  const matrix=document.getElementById('matrix'); if(!matrix) return;
  function dots(level){return level>=80?'●●●':level>=65?'●●○':'●○○';}
  function render(data){
    matrix.innerHTML=data.map(cat=>{
      const items=cat.items.map(s=>{
        const core=s.level>=65;
        return `<span class="sk ${core?'sk-core':'sk-use'}"><i>${dots(s.level)}</i>${esc(s.name)}</span>`;
      }).join('');
      return `<div class="mx-row"><div class="mx-label"><span class="t">${esc(cat.category||cat.cat)}</span><span class="s">${String(data.indexOf(cat)+1).padStart(2,'0')} · ${cat.items.length} skills</span></div><div class="mx-items">${items}</div></div>`;
    }).join('');
  }
  const fb=[
    {category:'Backend',items:[{name:'Python',level:90},{name:'FastAPI',level:85},{name:'PostgreSQL',level:72},{name:'SQLAlchemy',level:70},{name:'REST Design',level:70},{name:'pytest',level:70}]},
    {category:'AI / ML',items:[{name:'RAG Pipelines',level:80},{name:'LangChain',level:70},{name:'Embeddings',level:70},{name:'NLP',level:70},{name:'Deep Learning',level:55},{name:'LLM Agents',level:70}]},
    {category:'Frontend',items:[{name:'Next.js',level:60},{name:'React',level:60},{name:'Tailwind',level:60},{name:'shadcn/ui',level:55},{name:'HTML / CSS / JS',level:82}]},
    {category:'Infra & Tools',items:[{name:'Git',level:70},{name:'Docker',level:55},{name:'Supabase',level:70},{name:'OpenRouter',level:70},{name:'Vercel',level:70},{name:'Linux',level:55}]}
  ];
  fetch('/api/skills',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>render(Array.isArray(d)&&d.length?d:fb)).catch(()=>render(fb));
})();

/* ═══════════════════════ INTERACTIVE TERMINAL ═══════════════════════ */
(function(){
  const body=document.getElementById('termBody');
  const input=document.getElementById('termInput');
  if(!body||!input) return;
  const P='<span class="p">➜ ~</span> ';
  function line(cls,html){
    const d=document.createElement('div');
    d.className='tl '+cls; d.innerHTML=html;
    body.appendChild(d); body.scrollTop=body.scrollHeight;
  }
  function typeIn(cmd,cb){
    const d=document.createElement('div');d.className='tl';
    d.innerHTML=P+'<span class="c"></span>';
    body.appendChild(d);
    const span=d.querySelector('.c');let i=0;
    const iv=setInterval(()=>{
      span.textContent=cmd.slice(0,++i);
      body.scrollTop=body.scrollHeight;
      if(i>=cmd.length){clearInterval(iv);setTimeout(cb,120);}
    },28);
  }
  function print(lines){
    lines.forEach((l,i)=>setTimeout(()=>line(l.c||'dim',l.t),i*90));
    return lines.length*90+150;
  }
  const CMD={
    help:()=>print([
      {c:'g',t:'AVAILABLE COMMANDS:'},
      {t:'  whoami      — identity check'},
      {t:'  skills      — dump stack'},
      {t:'  projects    — list shipped work'},
      {t:'  now         — what he is doing now'},
      {t:'  email       — open mail client'},
      {t:'  github      — open repositories'},
      {t:'  pulse       — wake SASY up'},
      {t:'  matrix      — ???'},
      {t:'  clear       — wipe screen'}
    ]),
    whoami:()=>print([
      {c:'g',t:'shubham_mallick'},
      {t:'role      → ai developer @ potion labs, kolkata · founder, imutechz'},
      {t:'base      → north 24 parganas, west bengal, in'},
      {t:'status    → ai developer intern @ potion labs · open to collaborations'},
      {t:'motto     → "shipped, not just built."'}
    ]),
    skills:()=>print([
      {c:'g',t:'[core]'},  {t:'  python · fastapi · postgresql · rag · langchain'},
      {c:'a',t:'[working]'},{t:'  next.js · react · docker · supabase · openrouter · pytest'},
      {t:'depth: honest — see the Stack page for the full matrix.'}
    ]),
    projects:()=>print([
      {c:'g',t:'INDEXING…'},
      {t:' [01] IMURUN   — local-first ai chat · own c++ engine, fish · mit'},
      {t:' [02] LEARNIFY — check & mate lms · team · innova 5.0'},
      {t:' [03] HOSTELER — e-commerce for hostel students · live'},
      {t:' [04] GRBS     — roadmap builder · live in prod'},
      {c:'a',t:'→ open the Work page (/work.html) for every build.'}
    ]),
    now:()=>print([
      {c:'g',t:'NOW.TXT ✓'},
      {t:'role    : ai developer intern @ potion labs ai technologies, kolkata (on-site)'},
      {t:'also    : ai intern @ autom8x / swot management (us) · founder, imutechz'},
      {t:'open to : collaborations & open-source contributions'},
      {c:'a',t:'reach   → founder@imutechz.in (run `email`)'}
    ]),
    email:()=>{print([{c:'g',t:'opening mail client…'}]);
      setTimeout(()=>location.href='mailto:founder@imutechz.in',600);},
    github:()=>{print([{c:'g',t:'routing to github…'}]);
      setTimeout(()=>window.open('https://github.com/shubham001312','_blank'),600);},
    linkedin:()=>{print([{c:'g',t:'routing to linkedin…'}]);
      setTimeout(()=>window.open('https://www.linkedin.com/in/shubham-mallick-061298378','_blank'),600);},
    pulse:()=>{ if(window.SASY) window.SASY.mood('excited');
      print([{c:'g',t:'⚡ SASY is awake — look bottom-right.'}]);},
    matrix:()=>{
      print([{c:'g',t:'wake up, neo…'},{t:'the portfolio has you.'},
             {c:'g',t:'follow the maroon phosphor. 🐰'}]);
      document.body.style.setProperty('--mar','#1E40AF');
    },
    sudo:()=>print([{c:'err',t:'[sudo] guest is not in the sudoers file. this incident will be reported to shubham.'}]),
    clear:()=>{body.innerHTML='';},
  };
  function exec(raw){
    const cmd=raw.trim().toLowerCase();
    if(!cmd) return;
    typeIn(cmd,()=>{
      if(/^(ask|sasy|ai)\b/.test(cmd)){
        const q=cmd.replace(/^(ask|sasy|ai)\s*/,'');
        if(!q){ print([{t:"Type a question, e.g. ask what is Shubham building"}]); body.scrollTop=body.scrollHeight; return; }
        print([{c:'g',t:'$ '+cmd}]);
        if(window.SASY){ window.SASY.think(); window.SASY.ask(q).then(r=>{ print([{t:r}]); window.SASY.bubble(r); }); }
        else print([{t:'(SASY offline)'}]);
        body.scrollTop=body.scrollHeight; return;
      }
      if(CMD[cmd]) CMD[cmd]();
      else if(CMD[cmd.split(' ')[0]]) CMD[cmd.split(' ')[0]]();
      else if(window.SASY){
        print([{c:'g',t:'$ '+cmd}]);
        window.SASY.think();
        window.SASY.ask(cmd).then(r=>{ print([{t:r}]); window.SASY.bubble(r); });
      }
      else print([{c:'err',t:'command not found: '+cmd},{t:'try `help`'}]);
      body.scrollTop=body.scrollHeight;
    });
  }
  input.addEventListener('keydown',e=>{ if(e.key==='Enter'){exec(input.value);input.value='';} });
  let booted=false;
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!booted){
      booted=true;
      typeIn('whoami',()=>{
        print([
          {c:'g',t:'shubham_mallick'},
          {t:'ai developer intern @ potion labs · kolkata · founder, imutechz'},
          {c:'a',t:'type `help` to explore this shell.'}
        ]);
      });
    }
  }),{threshold:.35}).observe(document.getElementById('term'));
})();

/* ═══════════════════════ MISC ═══════════════════════ */
const toTop=document.getElementById('toTop'); if(toTop) toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* Service worker — auto-update, old caches purged on activate */
  if('serviceWorker' in navigator){
    let _swReload=false; const _hadCtl=!!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(_swReload||!_hadCtl) return; _swReload=true; location.reload(); });
    addEventListener('load',()=>{ navigator.serviceWorker.register(API_BASE+'sw.js').catch(()=>{}); });
  }

function esc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* SASY, the assistant, lives in assets/js/assistant.js; sounds in assets/js/sound.js. */
