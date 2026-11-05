const V='hava-v15',SHELL=['./','index.html','manifest.webmanifest','languages/index.json','languages/en.json'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    // Eski sürümden kalan push aboneliğini temizle
    try{const s=await self.registration.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(_){}
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const put=x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x};
  if(r.mode==='navigate'){
    // Sayfa: önce ağ (her açılışta en güncel kod), çevrimdışıysa önbellek
    e.respondWith(fetch(r).then(put).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(h=>{
    const n=fetch(r).then(put).catch(()=>h);
    return h||n;
  }));
});
