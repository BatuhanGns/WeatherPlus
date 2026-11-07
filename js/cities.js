/* cities.js
   City slots (up to 5), setup sheet, geolocation, city search and swipe. */

const saveC=()=>LS.set('w_cities',JSON.stringify(cities));
let sSlot=0;
function openSetup(c,slot){
  sSlot=slot||0;const has=!!cities[sSlot];
  $('setup').classList.add('on');
  $('closeBtn').style.display=(cities.length||sSlot>0)?'block':'none';
  $('delBtn').style.display=sSlot>0&&has?'block':'none';
  $('sTitle').textContent=(!has&&sSlot===0)?tx('welcome'):has?tx('changeCity',{n:sSlot+1}):tx('addCity',{n:sSlot+1});
  $('sSub').textContent=sSlot?tx('syncSub'):tx('welcomeSub');
  $('geoBtn').style.display=$('sOr').style.display=sSlot?'none':'';
  $('msg').textContent='';
}
function closeSetup(){$('setup').classList.remove('on');$('sg').innerHTML='';$('q').value=''}
function dots(){$('dots').innerHTML=Array.from({length:MAXC},(_,i)=>i).map(i=>`<i data-i="${i}" class="${i===ci?'on':''}${cities[i]?'':' em'}"></i>`).join('')}
function slideAnim(dir){
  if(!dir||reduce)return;
  [...$('app').children].filter(e=>!e.classList.contains('top')&&e.id!=='dots').forEach((e,i)=>e.animate([{opacity:0,transform:`translateX(${dir>0?40:-40}px)`},{opacity:1,transform:'none'}],{duration:450,delay:i*45,easing:'cubic-bezier(.2,1,.3,1)',fill:'backwards'}));
}
function showCity(i,dir){
  ci=i;loc=cities[i];lastJson='';lastTemp=null;closeX(true);
  exp=false;$('more').classList.remove('open');clearTimeout(xt);
  let ok=false;const c=LS.get('w_cache'+i);
  if(c){try{render(JSON.parse(c),true);ok=true}catch(e){}}
  document.body.classList.toggle('ld',!ok);
  if(!ok)$('cityName').textContent=loc.name||'';
  fetching=false;start();dots();slideAnim(dir);
}
function goCity(i,dir){if(i<0||i>=MAXC)return;if(!cities[i]){openSetup(false,i);return}showCity(i,dir)}
function swipe(dx){if(dx<0)goCity(ci+1,1);else if(ci===0)openSettings();else goCity(ci-1,-1)} // swipe right on the first city = Settings
function pick(l){
  const s=sSlot;cities[s]=l;saveC();LS.set('w_cache'+s,'');LS.set('w_t'+s,'0');closeSetup();
  showCity(s,s>ci?1:s<ci?-1:0);
}
function locate(silent){
  if(!navigator.geolocation){if(!silent)$('msg').textContent=tx('geoUnsupported');return}
  navigator.geolocation.getCurrentPosition(async p=>{
    const la=p.coords.latitude.toFixed(3),lo=p.coords.longitude.toFixed(3),q=la+','+lo;
    if(silent){
      const gi=cities.findIndex(c=>c.geo);if(gi<0)return;
      const name=await nameOf(la,lo)||(cities[gi].q===q&&cities[gi].name)||cities[gi].name||null;
      cities[gi]={q,geo:true,name};saveC();
      if(gi===ci){loc=cities[gi];load()}
        }else{pick({q,geo:true,name:await nameOf(la,lo)})}
  },()=>{if(!silent)$('msg').textContent=tx('geoDenied')},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
}
$('geoBtn').onclick=()=>{$('msg').textContent=tx('locating');locate(false)};
$('cityBtn').onclick=()=>openSetup(true,ci);
$('delBtn').onclick=()=>{if(sSlot<1||!cities[sSlot])return;const s=sSlot;cities.splice(s,1);saveC();for(let i=s;i<MAXC;i++){LS.set('w_cache'+i,'');LS.set('w_t'+i,'0')}closeSetup();showCity(s-1,-1)};
$('dots').onclick=e=>{const i=+(e.target.dataset||{}).i;if(isNaN(i)||i===ci||i>cities.length)return;goCity(i,i>ci?1:-1)};
{const hero=document.querySelector('.hero');let sx=0,sy=0,on=false;hero.addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;on=true});hero.addEventListener('pointerup',e=>{if(!on)return;on=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6)swipe(dx)});hero.addEventListener('pointercancel',()=>{on=false})}
$('closeBtn').onclick=closeSetup;
let st;
$('q').addEventListener('input',e=>{
  clearTimeout(st);const v=e.target.value.trim();if(v.length<2){$('sg').innerHTML='';return}
  st=setTimeout(async()=>{
    try{
      const r=await fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(v)+'&count=8&language='+LANGC+'&format=json');if(!r.ok)throw 0;const j=await r.json();const a=(j.results||[]).map(x=>({name:x.name,region:x.admin1||'',country:x.country||'',lat:x.latitude,lon:x.longitude}));
      $('sg').innerHTML=a.length?a.map((x,i)=>`<button data-i="${i}">${esc(x.name)}<small>${esc([x.region,x.country].filter(Boolean).join(', '))}</small></button>`).join(''):'<div class="msg">'+tx('noResults')+'</div>';
      $('sg').querySelectorAll('button').forEach(b=>b.onclick=()=>{const x=a[b.dataset.i];pick({q:(+x.lat).toFixed(2)+','+(+x.lon).toFixed(2),name:x.name})});
      $('msg').textContent='';
    }catch(err){$('msg').textContent=tx('searchFail')}
  },300);
});
