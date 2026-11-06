const V='weatherplus-v17',SHELL=['./', 'index.html', 'manifest.webmanifest', 'css/style.css', 'js/core.js', 'js/api.js', 'js/icons.js', 'js/themes.js', 'js/particles.js', 'js/sync.js', 'js/metric-chart.js', 'js/render.js', 'js/lifecycle.js', 'js/cities.js', 'js/i18n.js', 'js/app.js', 'languages/index.json', 'languages/en.json', 'images/icon-192.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(u)))));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    for(const k of await caches.keys())if(k!==V)await caches.delete(k);
    // Remove any push subscription left over from an older version
    try{const s=await self.registration.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(_){}
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  const put=x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x};
  if(r.mode==='navigate'){
    // Pages: network first (always the latest code), fall back to cache when offline
    e.respondWith(fetch(r).then(put).catch(()=>caches.match(r,{ignoreSearch:true}).then(h=>h||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(h=>{
    const n=fetch(r).then(put).catch(()=>h);
    return h||n;
  }));
});
