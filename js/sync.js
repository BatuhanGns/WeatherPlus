/* sync.js
   Formatters, toast, reverse geocoding, load()/syncOthers() (15-min sync) and sun tile helpers. */

const uvT=u=>tx(u<3?'uv.low':u<6?'uv.mod':u<8?'uv.high':u<11?'uv.vhigh':'uv.ext');
const aqT=i=>i?tx('aq.'+i):'';
const hhmm=s=>s?String(s).slice(-5):'--:--';
const key=s=>{const m=String(s||'').match(/(\d+)-(\d+)-(\d+)\D+(\d+)/);return m?m[1]+m[2].padStart(2,'0')+m[3].padStart(2,'0')+m[4].padStart(2,'0'):''};
const dn=t=>new Date(String(t).slice(0,10)+'T12:00').toLocaleDateString(LC,{weekday:'short'});
const t24=s=>{const iso=/T(\d+):(\d+)/.exec(s||'');if(iso)return iso[1].padStart(2,'0')+':'+iso[2];const m=/(\d+):(\d+)\s*(AM|PM)/i.exec(s||'');if(!m)return '—';let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;return String(h).padStart(2,'0')+':'+m[2]};
const num=v=>Number.isFinite(Number(v))?Number(v):null;
function toast(t){const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),3200)}

async function nameOf(la,lo){
  try{
    const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${la}&longitude=${lo}&localityLanguage=${LANGC}`);
    const j=await r.json();
    const a=[j.locality,j.city].filter((x,i,s)=>x&&s.indexOf(x)===i);
    return a.slice(0,2).join(', ')||null;
  }catch(e){return null}
}
const age=i=>Date.now()-(+LS.get('w_t'+i)||0);
async function load(){
  if(!loc||fetching)return;fetching=true;const my=loc,idx=ci;$('rf').classList.add('spin');
  try{
    const d=await fetchWeather(my.q);
    LS.set('w_cache'+idx,JSON.stringify(d));LS.set('w_t'+idx,String(Date.now()));
    if(loc===my)render(d);
  }catch(e){
    toast(navigator.onLine?tx('err.fetch')+': '+(e&&e.message||tx('err.unknown')):tx('err.offline'));
    if(loc===my&&firstRender){const c=LS.get('w_cache'+idx);if(c)try{render(JSON.parse(c),true)}catch(_){}}
  }finally{fetching=false;setTimeout(()=>$('rf').classList.remove('spin'),500)}
}
function syncOthers(){
  cities.forEach((c,i)=>{
    if(!c||i===ci||age(i)<SYNC)return;
    fetchWeather(c.q).then(d=>{if(cities[i]!==c)return;LS.set('w_cache'+i,JSON.stringify(d));LS.set('w_t'+i,String(Date.now()))}).catch(()=>{});
  });
}
function countTo(el,to){
  const from=lastTemp===null?to:lastTemp;lastTemp=to;
  if(reduce||from===to){el.textContent=to;return}
  const t0=performance.now();(function s(t){const k=Math.min((t-t0)/700,1),e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e);if(k<1)requestAnimationFrame(s)})(t0);
}
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const STARS=[[22,16,1.4],[58,38,1],[96,12,1.2],[140,30,1],[188,14,1.5],[226,34,1],[262,18,1.3],[40,64,1],[252,60,1.1],[120,54,.9],[206,56,1]];
const PTH='M20 90A130 64 0 0 1 280 90';
function scene(top,bot,gc,stars,inner){
  const st=stars?STARS.map((s,i)=>`<circle class="tw" style="animation-delay:${(i*.45).toFixed(2)}s" cx="${s[0]}" cy="${s[1]}" r="${s[2]}" fill="#fff"/>`).join(''):'';
  return `<svg class="arc" viewBox="0 0 300 120"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(${top})"/><stop offset="1" stop-color="rgb(${bot})"/></linearGradient><radialGradient id="gl"><stop offset="0" stop-color="${gc}" stop-opacity=".85"/><stop offset="1" stop-color="${gc}" stop-opacity="0"/></radialGradient></defs><rect width="300" height="120" rx="18" fill="url(#sk)"/>${st}${inner}<path d="M0 94Q50 86 100 92T200 91T300 89V120H0Z" fill="rgba(4,12,30,.4)"/></svg>`;
}
function sunTile(a,lt){
  const pm=s=>{const m=/T(\d+):(\d+)/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
  const sr=pm(a.sunrise),ss=pm(a.sunset),m=/(\d+):(\d+)\s*$/.exec(lt||''),now=m?+m[1]*60+ +m[2]:null;
  if(sr===null||ss===null||now===null)return '';
  const f=(now-sr)/(ss-sr),up=f>=0&&f<=1,k=Math.min(Math.max(f,0),1),e=Math.sin(Math.PI*k);
  const fm=x=>{const h=Math.floor(x/60),mm=x%60;return (h?h+' '+tx('u.h')+' ':'')+mm+' '+tx('u.min')};
  const x=150-130*Math.cos(Math.PI*k),y=90-64*e,w=up?Math.min(Math.max(1-Math.sqrt(e),0),1):1;
  const top=up?mix([40,120,230],[58,52,122],w):[8,12,40],bot=up?mix([140,205,255],[255,150,90],w):[38,48,110];
  const msg=up?tx('sun.toSet',{x:fm(ss-now)}):now<sr?tx('sun.toRise',{x:fm(sr-now)}):tx('sun.set');
  const inner=`<path d="${PTH}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`+(up?`<path d="${PTH}" pathLength="100" fill="none" stroke="#ffd877" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${f*100} 100"/><line x1="${x}" y1="${y}" x2="${x}" y2="90" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="2 4"/><circle cx="${x}" cy="90" r="2.5" fill="rgba(255,255,255,.7)"/><circle class="pl2" cx="${x}" cy="${y}" r="32" fill="url(#gl)"/>${SUN(x,y,12)}`:'');
  return `<div class="t wide glass press"><h4>${tx('sun.title')}</h4>${scene(top,bot,'#ffd877',!up,inner)}<div class="sun2"><div>${t24(a.sunrise)}<small>${tx('rise')}</small></div><p><b>${msg}</b><br><small>${up?`${tx('altitude')} %${Math.round(e*100)} · `:''}${tx('dayLen')} ${fm(ss-sr)}</small></p><div>${t24(a.sunset)}<small>${tx('set')}</small></div></div></div>`;
}
