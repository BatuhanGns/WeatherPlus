/* app.js
   Entry point: boot(), first-run language flow and service worker registration. */

function boot(){
  try{localStorage.removeItem('w_push')}catch(e){}
  if(LS.get('w_ver')!=='8'){for(let i=0;i<MAXC;i++){LS.set('w_cache'+i,'');LS.set('w_t'+i,'0')}LS.set('w_cache','');LS.set('w_ver','8')}
  if(loc){const c=LS.get('w_cache0');if(c){try{render(JSON.parse(c),true)}catch(e){}}saveC();dots();start();if(cities.some(c=>c.geo))locate(true)}else{dots();openSetup(false,0)}
}
(async()=>{
  const sv=LS.get('w_lang');          // returning user: no waiting for the language list
  await setLang(sv||'en');
  if(sv)boot();else{await langsP;openLang(true)}
})();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{}));
