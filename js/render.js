/* render.js
   UI rendering: day list, sun/moon tiles and render() that paints the whole screen. */

let DD=null,exp=false,xt;
function drawDays(){
  if(!DD)return;const c=DD.current,f=DD.forecast.forecastday;
  $('dayT').textContent=tx('days',{n:exp?14:7});
  const fd=f.slice(0,exp?14:7);
  const temps=fd.flatMap(x=>[x.day.mintemp_c,x.day.maxtemp_c]).filter(Number.isFinite);
  const mn=Math.min(...temps),mx=Math.max(...temps),rg=(mx-mn)||1;
  $('days').innerHTML=fd.map((x,i)=>{
    const nm=i===0?tx('today'):new Date(x.date+'T12:00').toLocaleDateString(LC,{weekday:'long'});
    const a=(x.day.mintemp_c-mn)/rg*100,b=Math.max((x.day.maxtemp_c-mn)/rg*100,a+10);
    const rp=x.day.rain??Math.max(0,...(x.hour||[]).map(h=>h.chance_of_rain||0));
    const sub=[exp&&new Date(x.date+'T12:00').toLocaleDateString(LC,{day:'numeric',month:'short'}),rp>=20&&tx('rainPct',{p:rp})].filter(Boolean).join(' · ');
    const dot=i===0?`<u style="left:${Math.min(Math.max((c.temp_c-mn)/rg*100,0),100)}%"></u>`:'';
    return `<div class="d"><b>${nm}${sub?`<span class="rainp">${sub}</span>`:''}</b>${ic(kindOf(x.day.condition&&x.day.condition.code),1)}<span class="lo">${Math.round(x.day.mintemp_c)}°</span><div class="bar"><i style="left:${a}%;right:${100-b}%"></i>${dot}</div><span class="hi">${Math.round(x.day.maxtemp_c)}°</span></div>`}).join('');
}
function setExp(v){
  exp=v;$('more').classList.toggle('open',v);
  const el=$('days'),h0=el.offsetHeight,n0=el.children.length;drawDays();
  if(!reduce){
    const h1=el.offsetHeight;el.style.overflow='hidden';
    el.animate([{height:h0+'px'},{height:h1+'px'}],{duration:480,easing:'cubic-bezier(.2,1,.3,1)'}).onfinish=()=>{el.style.overflow=''};
    [...el.children].slice(n0).forEach((r,i)=>r.animate([{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'none'}],{duration:420,delay:i*40,easing:'ease-out',fill:'backwards'}));
  }
  armX();
}
function armX(){clearTimeout(xt);if(exp)xt=setTimeout(()=>setExp(false),60000)}
['pointerdown','touchmove','scroll'].forEach(e=>addEventListener(e,armX,{passive:true}));
$('more').onclick=()=>setExp(!exp);

function phaseG(p){
  const r=15,pw=p<.5?p:1-p,c=Math.cos(2*Math.PI*pw),rx=Math.abs(c)*r,sw=c>0?0:1;
  return `<circle cx="20" cy="20" r="15" fill="rgba(255,255,255,.2)"/><path d="M20 5A15 15 0 0 1 20 35A${rx.toFixed(2)} 15 0 0 ${sw} 20 5z" fill="#f3efd2" ${p>.5?'transform="translate(40 0) scale(-1 1)"':''}/>`;
}
const phaseIc=p=>`<svg viewBox="0 0 40 40" width="30" height="30">${phaseG(p)}</svg>`;
function skyTile(f,lt){
  const a=f[0].astro||{},mm=s=>{const m=/T(\d+):(\d+)/.exec(s||'');return m?+m[1]*60+ +m[2]:null};
  const sr=mm(a.sunrise),ss=mm(a.sunset),n=/(\d+):(\d+)\s*$/.exec(lt||''),now=n?+n[1]*60+ +n[2]:null;
  if(sr!==null&&ss!==null&&now!==null&&now>=sr&&now<=ss)return sunTile(a,lt);
  return moonTile(f,lt)||sunTile(a,lt);
}
function moonTile(f,lt){
  const ev=[];f.slice(0,4).forEach(x=>{const a=x.astro||{};if(a.moonrise)ev.push([Date.parse(a.moonrise),1]);if(a.moonset)ev.push([Date.parse(a.moonset),0])});
  ev.sort((p,q)=>p[0]-q[0]);
  const now=Date.parse(String(lt).replace(' ','T'));if(!ev.length||isNaN(now))return '';
  let pi=-1;ev.forEach((e,i)=>{if(e[0]<=now)pi=i});
  const pv=ev[pi],nx=ev[pi+1],up=pv?pv[1]===1:!!(nx&&nx[1]===0);
  let rise=null,set=null;
  if(up){set=nx?nx[0]:null;rise=pv?pv[0]:(set?set-12*36e5:null)}
  else{rise=nx&&nx[1]===1?nx[0]:null;const s2=ev[pi+2];set=s2&&s2[1]===0?s2[0]:null}
  const fr=up&&rise&&set?Math.min(Math.max((now-rise)/(set-rise),0),1):null;
  const fm=ms=>{const x=Math.round(ms/6e4),h=Math.floor(x/60),m=x%60;return (h?h+' '+tx('u.h')+' ':'')+m+' '+tx('u.min')};
  const tm=ms=>{if(!ms)return '—';const d=new Date(ms);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
  const msg=up?(set?tx('moon.toSet',{x:fm(set-now)}):tx('moon.up')):(rise?tx('moon.toRise',{x:fm(rise-now)}):tx('moon.none'));
  const p=num((f[0].astro||{}).moon_phase),P='M20 88A130 72 0 0 1 280 88';
  let nm='',il='';
  if(p!==null){nm=tx('moon.'+(p<.03||p>.97?0:p<.22?1:p<.28?2:p<.47?3:p<.53?4:p<.72?5:p<.78?6:7));il=Math.round((1-Math.cos(2*Math.PI*p))/2*100)}
  const k=fr===null?0:fr,x=150-130*Math.cos(Math.PI*k),y=90-64*Math.sin(Math.PI*k);
  const mk=(cx,cy,o)=>p!==null?`<g opacity="${o}" transform="translate(${cx-20} ${cy-20})">${phaseG(p)}</g>`:`<circle cx="${cx}" cy="${cy}" r="10" fill="#f3efd2" opacity="${o}"/>`;
  const inner=`<path d="${PTH}" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>`+
    (fr!==null?`<path d="${PTH}" pathLength="100" fill="none" stroke="#b9c6ff" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="${fr*100} 100"/><line x1="${x}" y1="${y}" x2="${x}" y2="90" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-dasharray="2 4"/><circle cx="${x}" cy="90" r="2.5" fill="rgba(255,255,255,.7)"/><circle class="pl2" cx="${x}" cy="${y}" r="34" fill="url(#gl)"/>${mk(x,y,1)}`:(!up&&rise?mk(20,90,.45):''));
  return `<div class="t wide glass press"><h4>${tx('moon.title')}</h4>${scene([8,12,40],[38,48,110],'#cfd8ff',true,inner)}<div class="sun2"><div>${tm(rise)}<small>${tx('rise')}</small></div><p>${p!==null?phaseIc(p)+`<br><b>${nm}</b> · %${il}<br>`:''}<small>${msg}${fr!==null?` · ${tx('altitude')} %${Math.round(Math.sin(Math.PI*fr)*100)}`:''}</small></p><div>${tm(set)}<small>${tx('set')}</small></div></div></div>`;
}
function render(d,stale){RSTALE=!!stale;
  document.body.classList.remove('ld');
  if(!d||!d.current||!d.location||!d.forecast||!Array.isArray(d.forecast.forecastday)||!d.forecast.forecastday.length)throw new Error(tx('err.invalid'));
  const c=d.current,l=d.location,f=d.forecast.forecastday,cc=c.condition||{};
  const js=JSON.stringify(d)+(stale?1:0);
  $('upd').textContent=tx('updated',{t:hhmm(c.last_updated)})+(stale?' ('+tx('saved')+')':'');
  $('cityName').textContent=(loc&&loc.name)||tx('location');
  if(js===lastJson)return;lastJson=js;
  const day=c.is_day===1;
  $('hIcon').innerHTML=ic(kindOf(cc.code),day);
  countTo($('temp'),Math.round(c.temp_c));
  $('cond').textContent=wtxt(cc);
  $('hl').textContent=tx('hiLo',{hi:Math.round(f[0].day.maxtemp_c),lo:Math.round(f[0].day.mintemp_c)});
  setTheme(themeOf(cc.code,day));

  // hourly strip
  const nowK=key(l.localtime);
  const hrs=f.flatMap(x=>x.hour||[]).filter(h=>h&&key(h.time)>=nowK).slice(0,72);
  const nx=hrs.slice(0,12);let pk=null;nx.forEach((x,i)=>{if(!pk||x.chance_of_rain>pk.c)pk={c:x.chance_of_rain,i,t:x.time}});
  const ra=$('rain'),dp='<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" fill="#7cc4ff"/></svg>';
  if(pk&&pk.c>=30){ra.innerHTML=dp+(pk.i===0?tx('rain.now',{p:pk.c}):tx('rain.at',{t:String(pk.t).slice(11,16),p:pk.c}));ra.hidden=false}else ra.hidden=true;
  const sl=$('hours').scrollLeft;
  $('hours').innerHTML=hrs.length?hrs.map((h,i)=>{
    const hr=+(String(h.time).match(/\s(\d+)/)||[0,12])[1],dy=h.is_day!==undefined?h.is_day===1:(hr>=6&&hr<20);
    return `<div class="h ${i?(hr===0?'dayb':''):'now'}"><b>${i?(hr===0?dn(h.time):String(hr).padStart(2,'0')):tx('now')}</b>${ic(kindOf(h.condition&&h.condition.code),dy)}<span>${Math.round(h.temp_c)}°</span><small>${h.chance_of_rain>=20?'%'+h.chance_of_rain:''}</small></div>`}).join('')
    :'<p class="nodata">'+tx('hoursPending')+'</p>';
  $('hours').scrollLeft=sl;

  DD=d;drawDays();
  // metric tiles
  const ast=f[0].astro||{},aq=c.air_quality&&c.air_quality['us-epa-index'];
  const p=num(c.pressure_mb),v=num(c.vis_km),uv=num(c.uv)||0;
  const T=(h,body,sub)=>`<div class="t glass press" data-m="${h}"><button class="xc" aria-label="${tx('close')}"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button><h4>${tx('tile.'+h)}</h4>${body}<p>${sub||''}</p><div class="chart"></div></div>`;
  const S=(val,u)=>`<strong>${val}<em>${u||''}</em></strong>`;
  $('tiles').innerHTML=
   T('feels',S(Math.round(c.feelslike_c)+'°'),c.feelslike_c>c.temp_c+1?tx('feels.hot'):c.feelslike_c<c.temp_c-1?tx('feels.cold'):tx('feels.same'))+
   T('hum',S(c.humidity,'%'),tx('dew',{x:Math.round(c.dewpoint_c)}))+
   T('wind',`<div class="row">${S(Math.round(c.wind_kph),tx('u.kmh'))}<div class="cmp"><svg id="wa" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M6 11l6-6 6 6"/></svg></div></div>`,`${dirOf(c)}${c.gust_kph?`, ${tx('gust',{x:Math.round(c.gust_kph)})}`:''}`)+
   T('uv',S(Math.round(uv))+`<div class="sc"><u style="left:${Math.min(uv/11,1)*100}%"></u></div>`,uvT(uv))+
   T('vis',S(v!==null?v:'—','km'),v>=10?tx('vis.clear'):v>=4?tx('vis.mod'):v!==null?tx('vis.low'):'')+
   T('pres',S(p>0?Math.round(p):'—','hPa'),p>0?(p<1009?tx('pres.low'):p>1022?tx('pres.high'):tx('pres.norm')):tx('noData'))+
   T('cloud',S(num(c.cloud)??'—','%'),num(c.cloud)===null?tx('noData'):tx('cloud.'+(c.cloud<20?0:c.cloud<60?1:c.cloud<90?2:3)))+
   T('aqi',S(aq||'—')+(aq?`<div class="sc"><u style="left:${(aq-.5)/6*100}%"></u></div>`:''),aq?aqT(aq):tx('noData'))+skyTile(f,l.localtime);
  if(xm)openX(xm,true);
  requestAnimationFrame(()=>{const w=$('wa');if(w)w.style.transform=`rotate(${(c.wind_degree||0)+180}deg)`});
  if(firstRender){firstRender=false;document.body.classList.add('go')}
}
