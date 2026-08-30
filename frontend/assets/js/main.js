/* ═══════════════════════ UTILITIES ═══════════════════════ */
const API_BASE='';
const touch = matchMedia('(hover:none)').matches;
const lowEnd = (!touch && ((navigator.deviceMemory && navigator.deviceMemory<=4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency<=4))) || matchMedia('(max-width:820px)').matches;
const hero3DCapable = (navigator.deviceMemory===undefined || navigator.deviceMemory>=4) && (navigator.hardwareConcurrency===undefined || navigator.hardwareConcurrency>=4);
const SID = (()=>{ try{ let s=localStorage.getItem('sasy_sid'); if(!s){ s=(crypto.randomUUID?crypto.randomUUID():'s'+Date.now()+Math.random().toString(36).slice(2)); localStorage.setItem('sasy_sid',s);} return s; }catch(e){ return 'anon'; } })();
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp = (a,b,t)=>a+(b-a)*t;

/* ═══════════════════════ PRELOADER ═══════════════════════ */
(function(){
  const loaderEl=document.getElementById('loader');
  if(loaderEl && sessionStorage.getItem('sasy_booted')){ loaderEl.classList.add('done'); document.body.style.overflow=''; return; }
  const lines=[
    ['> initializing core renderer','OK'],
    ['> mounting /projects — 4 entries','OK'],
    ['> loading neural_core.obj — 2400 pts','OK'],
    ['> auth: guest session granted','OK'],
    ['> welcome, visitor','—']
  ];
  const box=document.getElementById('bootLines');
  const num=document.getElementById('bootNum');
  const bar=document.getElementById('bootbar');
  let li=0;
  const lineTimer=setInterval(()=>{
    if(li<lines.length){
      const [txt,st]=lines[li];
      const d=document.createElement('div');
      d.innerHTML=txt+' <span style="color:'+(st==='OK'?'var(--mar)':'var(--amb)')+'"> ['+st+']</span>';
      box.appendChild(d); li++;
    } else clearInterval(lineTimer);
  },170);
  let p=0;
  const pct=setInterval(()=>{
    p=Math.min(100,p+Math.random()*14+4);
    num.textContent=String(Math.floor(p)).padStart(2,'0');
    bar.style.width=p+'%';
    if(p>=100){
      clearInterval(pct);
       setTimeout(()=>{
         document.getElementById('loader').classList.add('done');
         document.body.style.overflow='';
         try{ sessionStorage.setItem('sasy_booted','1'); }catch(e){}
       },350);
    }
  },110);
})();

/* ═══════════════════════ CUSTOM CURSOR ═══════════════════════ */
if(!touch){
  const dot=document.querySelector('.cur-dot'), ring=document.querySelector('.cur-ring');
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,rafId=null;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
    dot.style.transform=`translate(${mx}px, ${my}px) translate(-50%,-50%)`;});
  (function cur(){rx=lerp(rx,mx,.14);ry=lerp(ry,my,.14);
    ring.style.transform=`translate(${rx}px, ${ry}px) translate(-50%,-50%)`;rafId=requestAnimationFrame(cur);})();
  document.querySelectorAll('a,button,.proj,.sk,input,.cap').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cur-hover'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cur-hover'));
  });
}

/* ═══════════════════════ MAGNETIC BUTTONS ═══════════════════════ */
if(!touch){
  document.querySelectorAll('.magnet').forEach(el=>{
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*.25, dy=(e.clientY-r.top-r.height/2)*.35;
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
  const words=['PYTHON','FASTAPI','RAG PIPELINES','POSTGRESQL','LLM AGENTS','NEXT.JS','DOCKER','LANGCHAIN','SUPABASE','EMBEDDINGS'];
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

/* scrollspy (per-page anchors) */
const spy=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    document.querySelectorAll('.nav-links a').forEach(a=>
      a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id));
  }
}),{rootMargin:'-40% 0px -55% 0px'});
['capabilities','work','stack','contact','experience'].forEach(id=>{
  const el=document.getElementById(id); if(el) spy.observe(el);
});

/* capability card spotlight */
document.querySelectorAll('.cap').forEach(c=>{
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
    ctx.strokeStyle='rgba(122,31,43,.85)';ctx.lineWidth=1.4;
    if(mode==='ring'){
      for(let k=0;k<3;k++){
        ctx.beginPath();
        ctx.globalAlpha=.9-k*.3;
        ctx.ellipse(cx,cy,(w*.36)+k*7*2,(w*.13)+k*5*2,t*(.6+k*.25),0,Math.PI*2);
        ctx.stroke();
      }
      ctx.globalAlpha=1;
      ctx.fillStyle='#7A1F2B';
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
      pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,7);ctx.fillStyle='#7A1F2B';ctx.fill();});
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
      g.addColorStop(0,'rgba(122,31,43,0)');g.addColorStop(.5,'rgba(122,31,43,.5)');g.addColorStop(1,'rgba(122,31,43,0)');
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
    map:glowTex('rgba(122,31,43,1)'),transparent:true,opacity:.32,
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
    color:0x7A1F2B,size:.032,map:glowTex('rgba(122,31,43,1)'),
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
ensureThree(startHero3D);

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
    return `<article class="proj" data-url="${esc(url)}" tabindex="0">
      <span class="p-num">/${String(i+1).padStart(2,'0')}</span>
      <div class="p-main"><div class="p-title">${esc(p.title)} ${flag}</div>
        <p class="p-desc">${esc(p.desc)}</p>
        <div class="p-tags">${tags}</div></div>
      <div class="p-viz"><canvas data-viz="${VIZ[i%VIZ.length]}"></canvas></div>
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
    const url=p.link||(p.links&&p.links[0]&&p.links[0].url);
    if(url){ const a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; a.textContent='Visit live ↗'; a.className='otw-live'; links.appendChild(a); }
    (p.links||[]).forEach(l=>{ const a=document.createElement('a'); a.href=l.url; a.target='_blank'; a.rel='noopener'; a.textContent=l.label+' ↗'; links.appendChild(a); });
    modal.hidden=false; requestAnimationFrame(()=>modal.classList.add('open')); document.body.style.overflow='hidden';
  }
  function closeProject(){ if(!modal) return; modal.classList.remove('open'); setTimeout(()=>{ modal.hidden=true; },300); document.body.style.overflow=''; }
  function render(data){
    if(!data||!data.length){ list.innerHTML='<p class="p-empty">Projects are taking a breather — check back soon.</p>'; return; }
    list.innerHTML=data.map(row).join('');
    try{ if(window.activateViz) window.activateViz(); }catch(e){ /* viz is decorative — never blank the grid */ }
    document.querySelectorAll('.proj').forEach((el,i)=>{
      el.addEventListener('mouseenter',()=>{ if(window.neuralPulse) window.neuralPulse(.9+i*.15); });
      el.addEventListener('click',e=>{ if(e.target.closest('a')) return; openProject(data[i]); });
      el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); openProject(data[i]); } });
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
        ctx.clearRect(0,0,w,h); ctx.strokeStyle='rgba(122,31,43,.85)';ctx.lineWidth=1.4;
        if(mode==='ring'){
          for(let k=0;k<3;k++){ctx.beginPath();ctx.globalAlpha=.9-k*.3;ctx.ellipse(cx,cy,(w*.36)+k*7*2,(w*.13)+k*5*2,t*(.6+k*.25),0,Math.PI*2);ctx.stroke();}
          ctx.globalAlpha=1;ctx.fillStyle='#7A1F2B';const a=t*1.4;ctx.beginPath();ctx.arc(cx+Math.cos(a)*w*.36,cy+Math.sin(a)*w*.13,3,0,7);ctx.fill();
        } else if(mode==='net'){
          const pts=[];for(let i=0;i<7;i++){const ang=i/7*Math.PI*2+t*.3;pts.push([cx+Math.cos(ang)*(w*.3+Math.sin(t+i)*14),cy+Math.sin(ang)*(h*.3)]);}
          ctx.globalAlpha=.35;for(let i=0;i<7;i++)for(let j=i+1;j<7;j++){ctx.beginPath();ctx.moveTo(pts[i][0],pts[i][1]);ctx.lineTo(pts[j][0],pts[j][1]);ctx.stroke();}
          ctx.globalAlpha=1;pts.forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],2.4,0,7);ctx.fillStyle='#7A1F2B';ctx.fill();});
        } else if(mode==='pulse'){
          ctx.beginPath();for(let x=0;x<=w;x+=4){const y=cy+Math.sin(x*.05-t*3)*h*.22*Math.sin(x/w*Math.PI)+Math.sin(x*.13+t)*h*.08;x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
        } else {
          const hS=Math.max(2,h);
          for(let y=0;y<hS;y+=10){ctx.globalAlpha=.16+Math.sin(y*.4+t*2)*.1;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
          ctx.globalAlpha=.9;const sy=((t*30)%(hS*1.6))-hS*.3;
          const g=ctx.createLinearGradient(0,sy-16,0,sy+16);
          g.addColorStop(0,'rgba(122,31,43,0)');g.addColorStop(.5,'rgba(122,31,43,.5)');g.addColorStop(1,'rgba(122,31,43,0)');ctx.fillStyle=g;ctx.fillRect(0,sy-16,w,32);
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
      return `<div class="mx-row"><div class="mx-label"><span class="t">${esc(cat.category)}</span><span class="s">0x0${data.indexOf(cat)+1} — Auto</span></div><div class="mx-items">${items}</div></div>`;
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
      {t:'  hire        — internship pitch'},
      {t:'  email       — open mail client'},
      {t:'  github      — open repositories'},
      {t:'  pulse       — excite the 3D core ↑'},
      {t:'  matrix      — ???'},
      {t:'  clear       — wipe screen'}
    ]),
    whoami:()=>print([
      {c:'g',t:'shubham_mallick'},
      {t:'role      → python backend × applied ai'},
      {t:'base      → north 24 parganas, west bengal, in'},
      {t:'status    → open to internships (2025–26)'},
      {t:'motto     → "shipped, not just built."'}
    ]),
    skills:()=>print([
      {c:'g',t:'[core]'},  {t:'  python · fastapi · postgresql · rag · langchain'},
      {c:'a',t:'[working]'},{t:'  next.js · react · docker · supabase · openrouter · pytest'},
      {t:'depth: honest — see the Stack page for the full matrix.'}
    ]),
    projects:()=>print([
      {c:'g',t:'INDEXING…'},
      {t:' [01] VEDA      — personal AI system · RAG · multi-agent'},
      {t:' [02] LEARNIFY  — ai study copilot · fastapi + next.js'},
      {t:' [03] GRBS      — roadmap builder · live in prod'},
      {t:' [04] NEWSBUZZ  — ai news pipeline · in dev'},
      {c:'a',t:'→ open the Projects page for live links.'}
    ]),
    hire:()=>print([
      {c:'g',t:'PITCH.TXT LOADED ✓'},
      {t:'targets : python dev / backend / ai-ml internships'},
      {t:'proof   : 12+ projects · 6 deployed · zero templates'},
      {t:'speed   : learns by shipping, not watching'},
      {c:'a',t:'next step → run `email`'}
    ]),
    email:()=>{print([{c:'g',t:'opening mail client…'}]);
      setTimeout(()=>location.href='mailto:shubham.mallick1440@gmail.com',600);},
    github:()=>{print([{c:'g',t:'routing to github…'}]);
      setTimeout(()=>window.open('https://github.com/shubham001312','_blank'),600);},
    linkedin:()=>{print([{c:'g',t:'routing to linkedin…'}]);
      setTimeout(()=>window.open('https://www.linkedin.com/in/shubham-mallick-061298378','_blank'),600);},
    pulse:()=>{ if(window.neuralPulse) window.neuralPulse(2.2);
      print([{c:'g',t:'⚡ neural core excited — check the hero.'}]);},
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
          {t:'backend × ai · west bengal, in · open to internships'},
          {c:'a',t:'type `help` to explore this shell.'}
        ]);
      });
    }
  }),{threshold:.35}).observe(document.getElementById('term'));
})();

/* ═══════════════════════ MISC ═══════════════════════ */
const toTop=document.getElementById('toTop'); if(toTop) toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* ═══════════════════════ OPEN_TO_WORK MODAL ═══════════════════════ */
(()=>{
  const openBtn=document.getElementById('otwOpen');
  const modal=document.getElementById('otwModal');
  if(!openBtn || !modal) return;
  const open=()=>{ modal.hidden=false; requestAnimationFrame(()=>modal.classList.add('open')); document.body.style.overflow='hidden'; };
  const close=()=>{ modal.classList.remove('open'); setTimeout(()=>{ modal.hidden=true; },300); document.body.style.overflow=''; };
  openBtn.addEventListener('click',e=>{ e.preventDefault(); open(); });
  modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',close));
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && modal.classList.contains('open')) close(); });
  const copyBtn=document.getElementById('otwCopy');
  if(copyBtn) copyBtn.addEventListener('click',()=>{
    const email='shubham.mallick1440@gmail.com';
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(email).then(()=>{ copyBtn.textContent='Copied!'; setTimeout(()=>copyBtn.textContent='Copy email',1500); })
        .catch(()=>{ copyBtn.textContent=email; });
    } else { copyBtn.textContent=email; }
  });
})();

/* Service worker — auto-update, old caches purged on activate */
  if('serviceWorker' in navigator){
    let _swReload=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(_swReload) return; _swReload=true; location.reload(); });
    addEventListener('load',()=>{ navigator.serviceWorker.register(API_BASE+'sw.js').catch(()=>{}); });
  }

function esc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ══════════════════════════ SASY — AI buddy ══════════════════════════ */
(function(){
  const fab=document.getElementById('sasy'); if(!fab) return;
  const bubble=document.getElementById('sasyBubble');
  const chat=document.getElementById('chat');
  const msgs=document.getElementById('chatMsgs');
  const form=document.getElementById('chatForm');
  const text=document.getElementById('chatText');
  const closeBtn=document.getElementById('chatClose');
  const micBtn=document.getElementById('chatMic');
  const soundBtn=document.getElementById('chatSound');

  /* ---- synthesized sound (no external files) ---- */
  let AC=null, soundOn=true;
  function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return AC; }
  function tone(freq,dur,type,vol,when){
    const c=ac(); if(!c) return;
    const t=c.currentTime+(when||0);
    const o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(vol||0.07,t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t+dur+0.03);
  }
  const sfx={
    click(){ tone(420,0.06,'triangle',0.06); },
    pop(){ tone(300,0.08,'sine',0.07); tone(620,0.08,'sine',0.05,0.05); },
    happy(){ [523,659,784].forEach((f,i)=>tone(f,0.18,'triangle',0.07,i*0.07)); },
    calm(){ tone(330,0.5,'sine',0.05); tone(247,0.6,'sine',0.04,0.06); },
    bloom(){ [392,494,587,784].forEach((f,i)=>tone(f,0.4,'sine',0.05,i*0.05)); },
    sad(){ [440,392,330,262].forEach((f,i)=>tone(f,0.3,'sine',0.06,i*0.12)); },
    angry(){ tone(120,0.25,'sawtooth',0.06); tone(90,0.3,'square',0.05,0.05); },
    hear(){ tone(700,0.1,'sine',0.05); tone(950,0.1,'sine',0.04,0.08); },
    type(){ tone(1250,0.02,'square',0.02); }
  };
  function play(name){ if(soundOn && sfx[name]) sfx[name](); }


  function listen(cb){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R){ cb(null,true); return; }
    try{
      const sr=new R(); sr.lang='en-IN'; sr.interimResults=false; sr.maxAlternatives=1;
      sr.onresult=e=>cb(e.results[0][0].transcript);
      sr.onerror=()=>cb(null,true);
      sr.start();
    }catch(e){ cb(null,true); }
  }

  /* ---- mood (reacts to the talk) ---- */
  function moodOf(reply,user){
    const r=(reply||'').toLowerCase(), u=(user||'').toLowerCase();
    if(/sorry|can't|cannot|don't know|not sure|unable|no (info|data)|i don't|i am not sure/.test(r)) return 'sad';
    if(/(angry|rude|stupid|worst|hate|useless|bad|dumb)/.test(u)) return 'angry';
    if(/great|awesome|cool|love|excited|congrat|nice|thank|welcome/.test(r)) return 'happy';
    if(/calm|relax|chill|easy|simple|peace|slow/.test(r+u)) return 'calm';
    if(/\?$/.test(r.trim())||/how (do|can)|what (is|are)|should|could|would/.test(r)) return 'happy';
    if(r.length<50) return 'happy';
    return 'talk';
  }
  const MOOD_SFX={happy:'happy',sad:'sad',angry:'angry',calm:'calm',talk:'bloom',excited:'happy'};
  let curMood='';
  function setMood(m){ if(!m) return; fab.classList.remove('m-happy','m-sad','m-angry','m-think','m-talk','m-calm','m-excited'); fab.classList.add('m-'+m); curMood=m; play(MOOD_SFX[m]||'bloom'); }
  function think(){ fab.classList.remove('m-happy','m-sad','m-angry','m-talk','m-calm','m-excited'); fab.classList.add('m-think'); }

  /* ---- chat via backend /api/chat ---- */
  const _histKey='sasy_chat_history';
  let history=[];
  try{ const saved=localStorage.getItem(_histKey); if(saved) history=JSON.parse(saved); }catch(e){}
  function _saveHistory(){ try{ localStorage.setItem(_histKey,JSON.stringify(history)); }catch(e){} }
  async function askSASY(msg){
    think();
    try{
      const r=await fetch(API_BASE+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,history:history,session:SID})});
      const d=await r.json();
      const reply=d.reply||"(no reply)";
      history.push({role:'user',content:msg},{role:'assistant',content:reply});
      if(history.length>20) history=history.slice(-20);
      _saveHistory();
      setMood(moodOf(reply,msg));
      return reply;
    }catch(e){ setMood('sad'); return "I'm having trouble reaching my brain right now — try again in a moment!"; }
  }

  /* ---- chat panel ---- */
  function renderMd(s){
    s=s.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>');
    s=s.replace(/\*(.+?)\*/g,'<i>$1</i>');
    s=s.replace(/`(.+?)`/g,'<code>$1</code>');
    s=s.replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    s=s.replace(/\n/g,'<br>');
    return s;
  }
  function addMsg(who,txt,typing){
    const d=document.createElement('div');
    d.className='tl '+(who==='u'?'u':'b')+(typing?' typing':'');
    const p=document.createElement('span'); p.className='p';
    p.textContent = who==='u' ? 'visitor@~$' : 'sasy@~$';
    const c=document.createElement('span'); c.className='c'; c.innerHTML=renderMd(txt);
    d.appendChild(p); d.appendChild(document.createTextNode(' ')); d.appendChild(c);
    msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; return d;
  }
  const PRESETS={ '/projects':'What projects has Shubham built?', '/skills':"What is Shubham's tech stack and skills?", '/resume':'Give me a short summary of Shubham\'s profile.', '/contact':'How do I contact Shubham?' };
  let cmdHist=[], hi=-1, _chatBusy=false, _chatQueue=[];
  function handleSlash(raw){
    const c=(raw.split(' ')[0]||'').toLowerCase();
    if(c==='/clear'){ msgs.innerHTML=''; return; }
    if(c==='/help'){ addMsg('b','commands: /projects /skills /resume /contact /clear — or just ask anything'); return; }
    const q=PRESETS[c]; if(q){ sendUser(q); } else { addMsg('b',"unknown command: "+c+"   (try /help)"); }
  }
  function sendUser(v){
    if(!v) return;
    addMsg('u',v);
    if(v.charAt(0)==='/'){ handleSlash(v); return; }
    if(_chatBusy){ _chatQueue.push(v); return; }
    _processChat(v);
  }
  function _processChat(v){
    _chatBusy=true;
    const t=addMsg('b','',true);
    askSASY(v).then(reply=>{
      const m=moodOf(reply,v); setMood(m);
      t.classList.remove('typing');
      typeOut(t.querySelector('.c'), reply, ()=>{
        bubbleSay(reply);
        _chatBusy=false;
        if(_chatQueue.length){ const next=_chatQueue.shift(); _processChat(next); }
      });
    });
  }
  let bubT;
  function bubbleSay(txt){ if(!bubble) return; bubble.textContent=txt.slice(0,90); bubble.classList.add('show'); clearTimeout(bubT); bubT=setTimeout(()=>bubble.classList.remove('show'),3400); }
  function typeOut(el, txt, done){
    const wrap=el.parentElement; wrap.classList.add('typing');
    let i=0; const len=txt.length;
    const step=Math.max(10, Math.min(30, 800/len));
    el.textContent='';
    (function tick(){
      if(i<=len){ el.textContent=txt.slice(0,i); i++; msgs.scrollTop=msgs.scrollHeight; setTimeout(tick, step); }
      else { wrap.classList.remove('typing'); el.innerHTML=renderMd(txt); if(done) done(); }
    })();
  }
  function openChat(){
    chat.hidden=false; chat.classList.add('open'); play('pop');
    fab.classList.add('m-wave'); setTimeout(()=>fab.classList.remove('m-wave'),600);
    fab.classList.add('chat-open');
    if(!msgs.children.length){
      // Restore previous messages from history
      if(history.length>0){
        history.forEach(h=>{
          if(h.role==='user') addMsg('u',h.content);
          else if(h.role==='assistant') addMsg('b',h.content);
        });
      } else {
        const g="Hello! I'm SASY, Shubham's personal assistant. Ask me anything about him — his projects, skills, or availability. Happy to help!"; addMsg('b',g);
      }
    }
    setTimeout(()=>text.focus(),200);
  }
  function closeChat(){ chat.classList.remove('open'); fab.classList.remove('chat-open'); setTimeout(()=>{ if(!chat.classList.contains('open')) chat.hidden=true; },300); }

  form.addEventListener('submit',e=>{
    e.preventDefault(); const v=text.value.trim(); if(!v) return;
    cmdHist.push(v); hi=cmdHist.length; sendUser(v); text.value='';
  });
  text.addEventListener('keydown',e=>{
    if(!cmdHist.length) return;
    if(e.key==='ArrowUp'){ hi=Math.max(0,hi-1); text.value=cmdHist[hi]; e.preventDefault(); }
    else if(e.key==='ArrowDown'){ hi=Math.min(cmdHist.length-1,hi+1); text.value=cmdHist[hi]; e.preventDefault(); }
  });
  document.querySelectorAll('#chatQuick button').forEach(b=>{
    b.addEventListener('click',()=>{ ac(); if(!chat.classList.contains('open')) openChat(); const c=b.dataset.cmd; if(c){ handleSlash(c); } else { sendUser(b.dataset.q); } });
  });

  closeBtn.addEventListener('click',()=>{ closeChat(); play('click'); });
  fab.addEventListener('click',()=>{ if(!dragged){ ac(); play('pop'); openChat(); } });
  if(micBtn) micBtn.addEventListener('click',()=>{
    ac(); play('hear'); micBtn.classList.add('live');
    listen((tr,err)=>{ micBtn.classList.remove('live'); if(err){ bubbleSay('Mic not available in this browser.'); } else if(tr){ cmdHist.push(tr); hi=cmdHist.length; sendUser(tr); } });
  });
  if(soundBtn) soundBtn.addEventListener('click',()=>{ soundOn=!soundOn; const volIcon=soundBtn.querySelector('.icon-vol'); const muteIcon=soundBtn.querySelector('.icon-mute'); if(volIcon) volIcon.style.display=soundOn?'':'none'; if(muteIcon) muteIcon.style.display=soundOn?'none':''; play('click'); });

  /* ---- drag (you can move it) ---- */
  const _small=window.matchMedia && window.matchMedia('(max-width:860px)').matches;
  const _isTiny=window.matchMedia && window.matchMedia('(max-width:480px)').matches;
  const _sasyH=_isTiny?60:(_small?72:88), _navReserve=_small?94:0;
  let x=_small?window.innerWidth-_sasyH-12:window.innerWidth-130;
  let y=_small?window.innerHeight-_navReserve-_sasyH-14:window.innerHeight-100;
  let tx=x, ty=y, dragging=false, dragged=false, hovering=false, ox=0, oy=0;
  function place(){ fab.style.left=x+'px'; fab.style.top=y+'px'; }
  if(_small){ fab.style.right='auto'; }
  place();
  fab.addEventListener('pointerenter',()=>{ hovering=true; });
  fab.addEventListener('pointerleave',()=>{ hovering=false; });
  fab.addEventListener('pointerdown',e=>{ dragging=true; dragged=false; fab.classList.add('drag'); try{fab.setPointerCapture(e.pointerId);}catch(_){} ox=e.clientX-x; oy=e.clientY-y; play('click'); });
  fab.addEventListener('pointermove',e=>{
    if(!dragging) return;
    const nx=e.clientX-ox, ny=e.clientY-oy;
    if(Math.abs(nx-x)>3||Math.abs(ny-y)>3) dragged=true;
    const maxX=window.innerWidth-_sasyH-8, maxY=window.innerHeight-(_small?(_navReserve+_sasyH+10):90);
    x=Math.max(8,Math.min(maxX,nx)); y=Math.max(6,Math.min(maxY,ny)); place();
  });
  fab.addEventListener('pointerup',()=>{ dragging=false; fab.classList.remove('drag'); setTimeout(()=>{ dragged=false; },60); });
  fab.addEventListener('pointercancel',()=>{ dragging=false; fab.classList.remove('drag'); });

  /* ---- autonomous roam disabled: the icon is draggable only, no self-movement ---- */
  function roam(){ /* intentionally empty */ }
  setInterval(()=>{
    if(!dragging && !hovering && curMood!=='think' && curMood!=='talk' && !chat.classList.contains('open')){
      const moods=['calm','calm','happy','calm']; setMood(moods[Math.floor(Math.random()*moods.length)]);
    }
  },15000);

  /* expose to terminal */
  window.SASY={ask:askSASY, mood:setMood, think, bubble:bubbleSay, play};
})();

/* ═══════════════════════ SASY PARTICLE ANIMATION ═══════════════════════ */
(function startSasyFx(){
  const canvas=document.getElementById('sasyFx');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const sasy=document.getElementById('sasy');
  if(!sasy) return;

  let w=0,h=0,dpr=1,rafId=null,running=false,lastFrame=0;
  const particles=[];
  const COLORS=['#7A1F2B','#F3EEE3','#C8102E','#1E40AF'];
  const FPS=24;
  const frameInterval=1000/FPS;

  function resize(){
    const rect=sasy.getBoundingClientRect();
    dpr=Math.min(window.devicePixelRatio||1,2);
    w=Math.round(rect.width*dpr);
    h=Math.round(rect.height*dpr);
    canvas.width=w; canvas.height=h;
    canvas.style.width=rect.width+'px';
    canvas.style.height=rect.height+'px';
    if(ctx) ctx.scale(dpr,dpr);
  }

  function initParticles(){
    particles.length=0;
    const cx=w/dpr/2, cy=h/dpr/2;
    const count=12;
    for(let i=0;i<count;i++){
      const angle=(i/count)*Math.PI*2 + Math.random()*0.3;
      const radius=32 + Math.random()*14;
      particles.push({
        angle,
        radius,
        speed:0.004 + Math.random()*0.006,
        size:2 + Math.random()*2,
        color:COLORS[Math.floor(Math.random()*COLORS.length)],
        phase:Math.random()*Math.PI*2
      });
    }
  }

  function draw(){
    if(!ctx) return;
    ctx.clearRect(0,0,w,h);
    const cx=w/dpr/2, cy=h/dpr/2;
    for(let i=0;i<particles.length;i++){
      const p=particles[i];
      p.angle+=p.speed;
      const x=cx+Math.cos(p.angle)*p.radius;
      const y=cy+Math.sin(p.angle)*p.radius;
      const alpha=0.3 + 0.4*Math.sin(p.angle*2 + p.phase);
      ctx.globalAlpha=alpha;
      ctx.beginPath();
      ctx.arc(x,y,p.size,0,Math.PI*2);
      ctx.fillStyle=p.color;
      ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  function loop(ts){
    if(!running) return;
    if(ts-lastFrame>=frameInterval){
      draw();
      lastFrame=ts;
    }
    rafId=requestAnimationFrame(loop);
  }

  function start(){
    if(running) return;
    resize();
    initParticles();
    running=true;
    loop();
  }

  function stop(){
    running=false;
    if(rafId) cancelAnimationFrame(rafId);
    rafId=null;
  }

  let visible=true;
  const observer=new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible && !document.hidden) start(); else stop();
  },{threshold:0});
  observer.observe(sasy);

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && visible) start(); else stop();
  });

  addEventListener('resize',()=>{
    if(running){
      resize();
      initParticles();
    }
  });

  start();
})();
