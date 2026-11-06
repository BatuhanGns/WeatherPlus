/* core.js
   Shared helpers and app state: $, localStorage wrapper, city list, constants. */

const tmo=ms=>typeof AbortSignal!=='undefined'&&AbortSignal.timeout?AbortSignal.timeout(ms):undefined;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $=id=>document.getElementById(id);
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const MAXC=5,SYNC=15*60e3;
let cities=(()=>{let a=JSON.parse(LS.get('w_cities')||'null');if(!Array.isArray(a)){const o=JSON.parse(LS.get('w_loc')||'null');a=o?[o]:[]}return a.filter(Boolean).slice(0,MAXC)})(),ci=0,loc=cities[0]||null,timer=null,fetching=false,lastTemp=null,firstRender=true,lastJson='';
