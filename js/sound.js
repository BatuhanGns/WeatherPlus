/* sound.js
   Ambient weather sound: picks a looping track from sound/ for the current weather,
   plays it gapless with the Web Audio API and cross-fades when the weather changes.
   Browsers block audio until the first tap, so playback starts on the first user interaction. */

const SND_FILES={nature:'sound/nature.mp3',night:'sound/night.mp3',rain:'sound/rain.mp3',snow:'sound/snowstorm.mp3',storm:'sound/thunder_rain.mp3',wind:'sound/wind.mp3'};
const SND_VOLUME=.6,SND_FADE=2.5; // 0..1 and cross-fade seconds
const SND_UNLOCK=['pointerup','touchend','click','keydown'];
const sndPref=LS.get('w_sound');
const snd={ctx:null,cur:null,out:new Set(),want:null,buf:{},
  on:sndPref==='1'?true:sndPref==='0'?false:!(navigator.connection&&navigator.connection.saveData)}; // Data Saver => off until the user turns it on

// weather theme + current conditions -> which track to play
function soundFor(theme,c){
  if(theme==='storm')return 'storm';
  if(theme==='rain')return 'rain';
  if(theme==='snow')return 'snow';
  if(c&&((+c.wind_kph||0)>=30||(+c.gust_kph||0)>=50))return 'wind';
  return c&&c.is_day===0?'night':'nature';
}
function setSound(key){snd.want=key;syncSound()}

async function loadBuf(key){
  if(snd.buf[key])return snd.buf[key];
  const r=await fetch(SND_FILES[key]);if(!r.ok)throw new Error(r.status);
  const ab=await r.arrayBuffer();
  return snd.buf[key]=await new Promise((ok,no)=>snd.ctx.decodeAudioData(ab,ok,no));
}
async function syncSound(){
  if(!snd.ctx||!snd.on||!snd.want)return;
  const key=snd.want;
  if(snd.cur&&snd.cur.key===key)return;
  let buf;
  try{buf=await loadBuf(key)}catch(e){console.warn('sound:',key,e);return}
  if(snd.want!==key||!snd.on||(snd.cur&&snd.cur.key===key))return; // changed while loading
  const ctx=snd.ctx,t=ctx.currentTime,src=ctx.createBufferSource(),g=ctx.createGain();
  src.buffer=buf;src.loop=true;src.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(SND_VOLUME,t+SND_FADE);
  src.start(t);
  const old=snd.cur;snd.cur={key,src,g};
  if(old)fadeOut(old);
  for(const k in snd.buf)if(k!==key)delete snd.buf[k]; // keep decoded audio small
}
function fadeOut(o,dur=SND_FADE){
  const t=snd.ctx.currentTime;snd.out.add(o);
  o.g.gain.cancelScheduledValues(t);o.g.gain.setValueAtTime(o.g.gain.value,t);o.g.gain.linearRampToValueAtTime(0,t+dur);
  o.src.onended=()=>snd.out.delete(o);
  try{o.src.stop(t+dur+.05)}catch(e){}
}
function stopAllSound(){ // instant mute (a 0.12 s fade avoids a click); also silences tracks still cross-fading out
  if(snd.cur){fadeOut(snd.cur,.12);snd.cur=null}
  snd.out.forEach(o=>fadeOut(o,.12));
}

// mute / unmute button (choice is remembered)
function setSoundOn(v,silent){
  snd.on=v;LS.set('w_sound',v?'1':'0');
  $('sndBtn').classList.toggle('off',!v);
  if(!silent)toast(tx(v?'soundOn':'soundOff'));
  if(v){if(snd.ctx&&snd.ctx.state!=='running')snd.ctx.resume().catch(()=>{});syncSound()}
  else if(snd.ctx){stopAllSound();setTimeout(()=>{if(!snd.on&&snd.ctx)snd.ctx.suspend().catch(()=>{})},300)} // suspend = no battery use while muted
}

// autoplay policy: the AudioContext can only start after a user gesture
function unlockSound(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  if(!snd.ctx)snd.ctx=new AC();
  snd.ctx.resume().then(()=>{
    if(snd.ctx.state!=='running')return;
    SND_UNLOCK.forEach(e=>removeEventListener(e,unlockSound,true));
    syncSound();
  }).catch(()=>{});
}
SND_UNLOCK.forEach(e=>addEventListener(e,unlockSound,true));
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&snd.ctx&&snd.on&&snd.ctx.state!=='running')snd.ctx.resume().catch(()=>{});
});
$('sndBtn').classList.toggle('off',!snd.on);
$('sndBtn').onclick=()=>setSoundOn(!snd.on);
