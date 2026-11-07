/* metric-chart.js
   Hourly metric detail chart (double-tap a tile). */

const CFG={feels:{f:v=>TU(v)+'°'},hum:{f:v=>v+'%',lo:0,hi:100},wind:{f:v=>WV(v),lo:0,hiMin:30},uv:{f:v=>Math.round(v),lo:0,hi:11,col:11},vis:{f:v=>v>=10?Math.round(v):v,lo:0},pres:{f:v=>v},cloud:{f:v=>v+'%',lo:0,hi:100},aqi:{f:v=>v,lo:0,hi:6,col:6}};
const scol=f=>f<.2?'#5fd068':f<.4?'#ffd84d':f<.6?'#ff9a3d':f<.8?'#ff5a5a':'#b05aff';
let xm=null,tapT=0,tapK='';
function buildChart(k){
  const M=DD&&DD.metrics,c=CFG[k];if(!M||!M[k]||!M[k].length)return '<p class="nodata">'+tx('noHourly')+'</p>';
  const d0=Date.parse(String(M.start).replace(' ','T')),dn=Date.parse(String(DD.location.localtime).replace(' ','T'));
  const i0=Math.max(0,Math.floor((dn-d0)/36e5)),vals=M[k].slice(i0,i0+72);if(!vals.length)return '<p class="nodata">'+tx('noHourly')+'</p>';
  const ok=vals.filter(v=>v!=null),mn=Math.min(...ok),mx=Math.max(...ok);
  const lo=c.lo!==undefined?c.lo:mn,hi=c.hi!==undefined?c.hi:Math.max(mx,c.hiMin||0),rg=(hi-lo)||1,zb=c.lo!==undefined;
  return vals.map((v,j)=>{
    const t=new Date(d0+(i0+j)*36e5),hr=t.getHours();
    const lb=j===0?tx('now'):hr===0?t.toLocaleDateString(LC,{weekday:'short'}):String(hr).padStart(2,'0');
    const p=v==null?0:Math.round((zb?.06+.94*(v-lo)/rg:.15+.85*(v-lo)/rg)*100);
    const bg=c.col?scol(Math.min(Math.max((v-lo)/rg,0),1)):'linear-gradient(#cfeeff,#6db8ff)';
    const ar=k==='wind'&&M.wdir?`<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(${(M.wdir[i0+j]||0)+180}deg)"><path d="M12 20V5M6 11l6-6 6 6"/></svg>`:'';
    return `<div class="mc"><b>${lb}</b><span class="mv">${v==null?'—':c.f(v)}</span><div class="mb"><i style="height:${Math.min(Math.max(p,0),100)}%;background:${bg}"></i></div>${ar}</div>`}).join('');
}
function openX(k,quiet){
  const L=[...document.querySelectorAll('#tiles .t[data-m]')],i=L.findIndex(e=>e.dataset.m===k);if(i<0){xm=null;return}
  L.forEach(e=>{e.classList.remove('x');e.style.display=''});
  const t=L[i];xm=k;
  const gr=$('tiles').getBoundingClientRect(),tr=t.getBoundingClientRect(); // works with any tile order
  const nb=L.find(e=>e!==t&&Math.abs(e.getBoundingClientRect().top-tr.top)<4);if(nb)nb.style.display='none';
  t.style.transformOrigin=tr.left-gr.left<gr.width/4?'left center':'right center';
  t.querySelector('.chart').innerHTML=buildChart(k);t.classList.add('x');
  t.style.animation=quiet?'none':'';if(!quiet)t.scrollIntoView({block:'nearest',behavior:'smooth'});
}
function closeX(now){
  const t=document.querySelector('#tiles .t.x');xm=null;
  const fin=()=>{document.querySelectorAll('#tiles .t[data-m]').forEach(e=>{e.classList.remove('x');e.style.display='';e.style.animation='';if(!now&&!reduce)e.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],{duration:350,easing:'cubic-bezier(.2,1,.3,1)'})})};
  if(!t||reduce||now){fin();return}
  t.style.animation='none';
  t.animate([{opacity:1,transform:'none'},{opacity:.3,transform:'scaleX(.6)'}],{duration:220,easing:'ease-in'}).onfinish=fin;
}
$('tiles').addEventListener('click',e=>{
  if(e.target.closest('.xc')){closeX();return}
  const t=e.target.closest('.t[data-m]');if(!t||t.classList.contains('x')||!t.dataset.m)return;
  const n=Date.now();
  if(tapK===t.dataset.m&&n-tapT<400){openX(t.dataset.m);tapT=0}else{tapK=t.dataset.m;tapT=n}
});
