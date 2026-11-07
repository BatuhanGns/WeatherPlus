/* core.js
   Shared helpers and app state: $, localStorage wrapper, city list, constants. */

const tmo=ms=>typeof AbortSignal!=='undefined'&&AbortSignal.timeout?AbortSignal.timeout(ms):undefined;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $=id=>document.getElementById(id);
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const MAXC=5,SYNC=15*60e3;
/* user settings (units, volume, effects) */
const PREF=(()=>{let o={};try{o=JSON.parse(LS.get('w_set')||'{}')||{}}catch(e){}return Object.assign({vol:.6,temp:'c',wind:'kmh',fx:true},o)})();
const saveSet=()=>LS.set('w_set',JSON.stringify(PREF));
const TU=v=>Math.round(PREF.temp==='f'?v*9/5+32:v);                       // temperature for display
const WV=v=>Math.round(v*({kmh:1,mph:.621371,ms:.277778}[PREF.wind]||1)); // wind speed for display
const windU=()=>tx('u.'+(PREF.wind||'kmh'));
/* layout: order + visibility of page sections and detail tiles */
const LAY_S=['hourly','days','tiles'],LAY_T=['feels','hum','wind','uv','vis','pres','cloud','aqi','sky'];
const layDefault=()=>({s:[...LAY_S],hs:[],t:[...LAY_T],ht:[]});
let LAY=(()=>{let o=null;try{o=JSON.parse(LS.get('w_layout')||'null')}catch(e){}if(!o)return layDefault();
  const fix=(a,all)=>[...new Set([...(Array.isArray(a)?a:[]).filter(x=>all.includes(x)),...all])]; // keep saved order, append new items
  return{s:fix(o.s,LAY_S),hs:(o.hs||[]).filter(x=>LAY_S.includes(x)),t:fix(o.t,LAY_T),ht:(o.ht||[]).filter(x=>LAY_T.includes(x))}})();
const saveLay=()=>LS.set('w_layout',JSON.stringify(LAY));
let cities=(()=>{let a=JSON.parse(LS.get('w_cities')||'null');if(!Array.isArray(a)){const o=JSON.parse(LS.get('w_loc')||'null');a=o?[o]:[]}return a.filter(Boolean).slice(0,MAXC)})(),ci=0,loc=cities[0]||null,timer=null,fetching=false,lastTemp=null,firstRender=true,lastJson='';
