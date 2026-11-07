/* i18n.js
   Language system: loads languages/*.json, tx() translator, language picker. */

let LD=null,LEN=null,LANGC='en',LC='en-US',LANGS=[],RSTALE=false,LANGFIRST=false;
const getJ=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()}); // served from the service-worker cache
const langsP=getJ('languages/index.json').then(a=>{LANGS=a}).catch(()=>{LANGS=[{code:'en',name:'English',english:'English'},{code:'tr',name:'Türkçe',english:'Turkish'}]}); // loaded in the background
const tx=(k,v)=>{let r=(LD&&LD.s&&LD.s[k])??(LEN&&LEN.s&&LEN.s[k])??k;if(v)for(const a in v)r=r.split('{'+a+'}').join(v[a]);return r};
const WG={57:56,67:66,86:85,99:96,81:80};
const wtxt=cc=>{const k=cc&&cc.wmo!=null?(WG[cc.wmo]||cc.wmo):null;return (k!=null&&((LD&&LD.wmo&&LD.wmo[k])||(LEN&&LEN.wmo&&LEN.wmo[k])))||(cc&&cc.text)||tx('unknown')};
const dirOf=c=>{const a=LD&&LD.dirs;return a&&a.length===16?a[Math.round((c.wind_degree||0)/22.5)%16]:(c.wind_dir||'—')};
const fold=x=>String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function applyStatic(){
  document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tx(e.dataset.i18n));
  document.querySelectorAll('[data-i18n-ph]').forEach(e=>e.placeholder=tx(e.dataset.i18nPh));
  document.querySelectorAll('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',tx(e.dataset.i18nAria)));
  document.documentElement.style.setProperty('--hx',JSON.stringify(tx('hourlyForecast')));
}
async function setLang(code){
  const pe=LEN?null:getJ('languages/en.json').catch(()=>null),pl=code==='en'?null:getJ('languages/'+code+'.json').catch(()=>null); // fetch both in parallel
  if(pe)LEN=await pe;
  if(code==='en')LD=LEN;else{LD=await pl;if(!LD){LD=LEN;code='en'}}
  LANGC=code;LC=(LD&&LD.meta&&LD.meta.locale)||code;
  document.documentElement.lang=code;
  applyStatic();
  lastJson='';
  if(DD){try{render(DD,RSTALE)}catch(e){}}else $('upd').textContent=tx('loading');
}
function langList(f){
  f=fold(f||'');const dev=(navigator.language||'en').slice(0,2).toLowerCase();
  const a=LANGS.filter(x=>!f||fold(x.name+' '+x.english+' '+x.code).includes(f))
    .sort((p,q)=>(q.code===LANGC)-(p.code===LANGC)||(q.code===dev)-(p.code===dev));
  $('lg').innerHTML=a.length?a.map(x=>`<button data-c="${esc(x.code)}">${esc(x.name)}<small>${esc(x.english)}${x.code===LANGC?' ✓':''}</small></button>`).join(''):'<div class="msg">'+tx('noResults')+'</div>';
}
function openLang(first){LANGFIRST=!!first;$('lClose').style.display=first?'none':'block';$('lq').value='';$('lang').classList.add('on');langsP.then(()=>langList($('lq').value))}
$('lClose').onclick=()=>$('lang').classList.remove('on');
$('lang').addEventListener('click',e=>{if(e.target===$('lang')&&!LANGFIRST)$('lang').classList.remove('on')});
$('lq').addEventListener('input',()=>langList($('lq').value));
$('lg').onclick=async e=>{
  const b=e.target.closest('button[data-c]');if(!b)return;
  await setLang(b.dataset.c);LS.set('w_lang',LANGC);$('lang').classList.remove('on');
  if(LANGFIRST){LANGFIRST=false;boot()}
};
