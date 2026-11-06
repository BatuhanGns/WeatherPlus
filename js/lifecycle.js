/* lifecycle.js
   start() timer, visibility/online listeners, refresh button, install prompt. */

function start(){clearInterval(timer);load();syncOthers();timer=setInterval(()=>{if(!document.hidden){if(age(ci)>=SYNC)load();syncOthers()}},60000)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&loc){if(cities.some(c=>c.geo))locate(true);if(age(ci)>60000)load();syncOthers()}});
addEventListener('pageshow',e=>{if(e.persisted&&loc&&age(ci)>60000)load()});
addEventListener('online',()=>load());
$('rf').onclick=()=>load();

let dip=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('inst').hidden=false});
$('inst').onclick=async()=>{if(!dip)return;dip.prompt();try{await dip.userChoice}catch(e){}dip=null;$('inst').hidden=true};
addEventListener('appinstalled',()=>{$('inst').hidden=true;dip=null});
