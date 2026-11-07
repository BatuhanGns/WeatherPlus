/* particles.js
   Canvas particle effects (rain, snow, stars...). */

const cv=$('fx'),cx=cv.getContext('2d');let W=0,H=0,P=[],mode='none',flash=0,tk=0;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function size(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',size);size();
function setFx(m){
  mode=m;P=[];const n={rain:110,storm:190,snow:80,stars:70}[m]||0;
  for(let i=0;i<n;i++){
    if(m==='snow')P.push({x:Math.random()*W,y:Math.random()*H,r:1.5+Math.random()*3,v:.4+Math.random(),s:Math.random()*6});
    else if(m==='stars')P.push({x:Math.random()*W,y:Math.random()*H*.7,r:.5+Math.random()*1.5,s:Math.random()*6});
    else P.push({x:Math.random()*W,y:Math.random()*H,l:12+Math.random()*16,v:(m==='storm'?16:11)+Math.random()*7});
  }
}
(function loop(){
  requestAnimationFrame(loop);tk+=.016;cx.clearRect(0,0,W,H);if(reduce||!P.length||PREF.fx===false)return;
  if(mode==='rain'||mode==='storm'){
    cx.strokeStyle='rgba(210,230,255,.45)';cx.lineWidth=1.2;cx.beginPath();
    for(const p of P){cx.moveTo(p.x,p.y);cx.lineTo(p.x-p.l*.18,p.y+p.l);p.y+=p.v;p.x-=p.v*.18;if(p.y>H){p.y=-20;p.x=Math.random()*(W+60)}}
    cx.stroke();
    if(mode==='storm'){if(Math.random()<.004)flash=.5;if(flash>0){cx.fillStyle=`rgba(220,230,255,${flash})`;cx.fillRect(0,0,W,H);flash-=.03}}
  }else if(mode==='snow'){
    cx.fillStyle='rgba(255,255,255,.85)';
    for(const p of P){cx.beginPath();cx.arc(p.x+Math.sin(tk+p.s)*14,p.y,p.r,0,6.3);cx.fill();p.y+=p.v;if(p.y>H+6){p.y=-8;p.x=Math.random()*W}}
  }else if(mode==='stars'){
    for(const p of P){cx.fillStyle=`rgba(255,255,255,${.35+.6*Math.abs(Math.sin(tk*.9+p.s))})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.3);cx.fill()}
  }
})();
function spec(e){const t=e.target.closest&&e.target.closest('.glass');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')}
addEventListener('pointermove',spec,{passive:true});addEventListener('pointerdown',spec,{passive:true});
