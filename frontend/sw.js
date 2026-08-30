const CACHE='sasy-v27';
self.addEventListener('install', e=>self.skipWaiting());
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
        const c=await caches.open(CACHE);
        c.put(req, fresh.clone());
        return fresh;
      }catch(err){
        return (await caches.match(req)) || (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    const cached=await c.match(req);
    if(cached && cached.ok){
      fetch(req).then(r=>{ if(r.ok) c.put(req, r.clone()); }).catch(()=>{});
      return cached;
    }
    try{
      const fresh=await fetch(req);
      if(fresh.ok) c.put(req, fresh.clone());
      return fresh;
    }catch(err){ return cached || Response.error(); }
  })());
});
