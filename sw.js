/* sw.js — Weather+ service worker
   - App shell (HTML/CSS/JS/icons/languages): precached, served from cache instantly, refreshed in the background.
   - Sounds: cached ONCE in their own cache that survives app updates (no re-downloading ~800 KB files).
   If you replace a sound file, bump SOUND_CACHE. If you change any other cached file, bump V. */
const V='weatherplus-v20';
const SOUND_CACHE='weatherplus-sound-v2'; // v2: sounds re-encoded to 128 kbps
const SHELL=['./','index.html','manifest.webmanifest','css/style.css',
  'js/core.js','js/api.js','js/icons.js','js/themes.js','js/particles.js','js/sound.js','js/sync.js','js/metric-chart.js','js/render.js','js/lifecycle.js','js/cities.js','js/settings.js','js/i18n.js','js/app.js',
  'images/icon.svg','images/icon-192.png'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(V);
    const add=u=>c.add(new Request(u,{cache:'reload'})); // bypass the HTTP cache so we never precache stale files
    await Promise.allSettled(SHELL.map(add));
    // precache every language listed in languages/index.json (works offline, scales automatically)
    try{
      await add('languages/index.json');
      const list=await (await c.match('languages/index.json')).json();
      await Promise.allSettled(list.map(l=>add('languages/'+l.code+'.json')));
    }catch(_){}
  })());
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    for(const k of keys)if(k!==V&&k!==SOUND_CACHE)await caches.delete(k); // old sounds are stale (re-encoded), so they are not migrated
    // Remove any push subscription left over from an older version
    try{const s=await self.registration.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(_){}
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||r.headers.has('range'))return;
  const put=(x,name=V)=>{if(x&&x.ok&&x.status===200){const c=x.clone();caches.open(name).then(h=>h.put(r,c))}return x};

  if(u.pathname.includes('/sound/')){ // cache first, never revalidate
    e.respondWith(caches.open(SOUND_CACHE).then(c=>c.match(r).then(h=>h||fetch(r).then(x=>put(x,SOUND_CACHE)))));
    return;
  }
  if(r.mode==='navigate'){ // open instantly from cache, update in the background (no waiting on a slow network)
    e.respondWith((async()=>{
      const h=await caches.match(r,{ignoreSearch:true})||await caches.match('./');
      const net=fetch(r).then(put).catch(()=>null);
      if(h){e.waitUntil(net);return h}
      return (await net)||Response.error();
    })());
    return;
  }
  e.respondWith(caches.match(r).then(h=>{ // stale-while-revalidate
    const n=fetch(r).then(put).catch(()=>h);
    if(h){e.waitUntil(n);return h}
    return n;
  }));
});
