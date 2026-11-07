/* settings.js
   Settings sheet (swipe right on the first city, or tap the sliders button), units, volume, effects
   and the layout editor (show/hide/reorder page sections and detail tiles). */

const APP_VERSION='1.2.0';
const open_=id=>$(id).classList.add('on'),close_=id=>$(id).classList.remove('on');
function refreshAll(){lastJson='';if(DD){try{render(DD,RSTALE)}catch(e){}}}

/* ---- layout ---- */
function applyLayout(){
  const app=$('app'),foot=document.querySelector('.foot'),el={hourly:'secHourly',days:'secDays',tiles:'tiles'};
  LAY.s.forEach(id=>{const e=$(el[id]);app.insertBefore(e,foot);e.hidden=LAY.hs.includes(id)});
}
function drawLayout(){
  const row=(g,id,name,list,hid)=>{const i=list.indexOf(id),off=hid.includes(id);
    return `<div class="sr lr${off?' off':''}" data-g="${g}" data-id="${id}"><span class="lnm">${esc(name)}</span>`+
      `<button class="lmv" data-d="-1" ${i===0?'disabled':''}><svg viewBox="0 0 24 24"><path d="M6 15l6-6 6 6"/></svg></button>`+
      `<button class="lmv" data-d="1" ${i===list.length-1?'disabled':''}><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>`+
      `<label class="sw"><input type="checkbox" ${off?'':'checked'}><i></i></label></div>`};
  const sn={hourly:'hourly',days:'sec.days',tiles:'lay.tiles'};
  $('layS').innerHTML=LAY.s.map(id=>row('s',id,tx(sn[id]),LAY.s,LAY.hs)).join('');
  $('layT').innerHTML=LAY.t.map(id=>row('t',id,id==='sky'?tx('sky.name'):tx('tile.'+id),LAY.t,LAY.ht)).join('');
}
function commitLay(){saveLay();applyLayout();refreshAll();drawLayout()}
$('layout').addEventListener('click',e=>{
  const b=e.target.closest('.lmv'),r=e.target.closest('.lr');if(!b||!r||b.disabled)return;
  const list=r.dataset.g==='s'?LAY.s:LAY.t,i=list.indexOf(r.dataset.id),j=i+ +b.dataset.d;
  if(j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];commitLay();
});
$('layout').addEventListener('change',e=>{
  const r=e.target.closest('.lr');if(!r)return;
  const hid=r.dataset.g==='s'?LAY.hs:LAY.ht,id=r.dataset.id,i=hid.indexOf(id);
  if(e.target.checked){if(i>=0)hid.splice(i,1)}else if(i<0)hid.push(id);commitLay();
});
$('layReset').onclick=()=>{LAY=layDefault();commitLay()};
$('layDone').onclick=()=>{close_('layout');openSettings()};
$('layout').addEventListener('click',e=>{if(e.target===$('layout')){close_('layout');openSettings()}});

/* ---- settings sheet ---- */
function syncSettingsUI(){
  $('setSound').checked=snd.on;$('setVol').value=Math.round(PREF.vol*100);$('setFx').checked=PREF.fx!==false;
  [['segTemp','temp'],['segWind','wind']].forEach(([id,k])=>$(id).querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===PREF[k])));
  const l=LANGS.find(x=>x.code===LANGC);$('setLangName').textContent=l?l.name:LANGC;
  $('appVer').textContent='v'+APP_VERSION;
}
function openSettings(){syncSettingsUI();open_('settings')}
$('setBtn').onclick=openSettings;
$('setClose').onclick=()=>close_('settings');
$('settings').addEventListener('click',e=>{if(e.target===$('settings'))close_('settings')});
$('setSound').onchange=e=>setSoundOn(e.target.checked,true);
$('setVol').oninput=e=>{PREF.vol=e.target.value/100;saveSet();applyVolume()};
$('setFx').onchange=e=>{PREF.fx=e.target.checked;saveSet();document.body.classList.toggle('nofx',!PREF.fx)};
[['segTemp','temp'],['segWind','wind']].forEach(([id,k])=>$(id).onclick=e=>{
  const b=e.target.closest('button');if(!b)return;PREF[k]=b.dataset.v;saveSet();syncSettingsUI();refreshAll();
});
$('setLayout').onclick=()=>{close_('settings');drawLayout();open_('layout')};
$('setLang').onclick=()=>{close_('settings');openLang(false)};
document.body.classList.toggle('nofx',PREF.fx===false);
applyLayout();
