/* app.js
   Entry point: boot(), first-run language flow and service worker registration. */

function boot(){
  try{localStorage.removeItem('w_push')}catch(e){}
  if(LS.get('w_ver')!=='8'){for(let i=0;i<MAXC;i++){LS.set('w_cache'+i,'');LS.set('w_t'+i,'0')}LS.set('w_cache','');LS.set('w_ver','8')}
  if(loc){const c=LS.get('w_cache0');if(c){try{render(JSON.parse(c),true)}catch(e){}}saveC();dots();start();if(cities.some(c=>c.geo))locate(true)}else{dots();openSetup(false,0)}
}
(async()=>{
  try{LANGS=await getJ('languages/index.json')}catch(e){LANGS=[{code:'en',name:'English',english:'English'},{code:'tr',name:'Türkçe',english:'Turkish'}]}
  const sv=LS.get('w_lang'),ok=sv&&LANGS.some(x=>x.code===sv);
  await setLang(ok?sv:'en');
  if(ok)boot();else openLang(true);
})();
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
