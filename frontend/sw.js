const CACHE='sm-v33';
// keep the home page from the start: it is the offline fallback for pages never visited
self.addEventListener('install', e=>{ self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c=>c.add('/')).catch(()=>{})); });
self.addEventListener('activate', e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch', e=>{
  const req=e.request, url=new URL(req.url);
  if(req.method!=='GET') return;
  if(url.pathname.startsWith('/api/')) return;
  if(url.origin!==self.location.origin) return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        // only good pages are kept for offline use (never a 404/500 or a redirect)
        if(fresh.ok){ const c=await caches.open(CACHE); c.put(req, fresh.clone()).catch(()=>{}); }
        return fresh;
      }catch(err){
        // offline: this page if it was seen before, else the home page (cached under '/', the usual entry)
        return (await caches.match(req)) || (await caches.match('/')) || (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const cached=await c.match(req);
    if(cached && cached.ok){
      fetch(req).then(r=>{ if(r.ok) return c.put(req, r.clone()); }).catch(()=>{});
      return cached;
    }
    try{
      const fresh=await fetch(req);
      if(fresh.ok) c.put(req, fresh.clone()).catch(()=>{});
      return fresh;
    }catch(err){ return cached || Response.error(); }
  })());
});
