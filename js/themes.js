/* themes.js
   Sky color themes that change with weather and time of day. */

const THEMES={
 'clear-day':{g:['#1558d6','#3b94f0','#82c3f7'],o:['#7cc4ff','#ffd27a','#9bd0ff'],tc:'#1558d6',fx:'none',cl:.25},
 'clear-night':{g:['#050818','#141a47','#3a2d6b'],o:['#4b5bd6','#7a4fc2','#2a6fb0'],tc:'#101436',fx:'stars',cl:0},
 'cloud-day':{g:['#3d566f','#5f7b97','#8aa3bb'],o:['#a9c2d9','#e5edf4','#7d9bb7'],tc:'#3d566f',fx:'none',cl:.9},
 'cloud-night':{g:['#151d29','#27364a','#43556b'],o:['#4a6a8c','#3a4f6a','#6a7fa0'],tc:'#1c2735',fx:'stars',cl:.4},
 'rain':{g:['#1f3042','#38536d','#5d7e99'],o:['#4a82b0','#6a90ad','#3a6288'],tc:'#2a4057',fx:'rain',cl:.6},
 'storm':{g:['#100f1b','#27263f','#4a4066'],o:['#5a4a9c','#3a3f7a','#7a5a9c'],tc:'#1a1928',fx:'storm',cl:.5},
 'snow':{g:['#566f8c','#7c97b4','#a7bdd3'],o:['#d5e6f7','#ffffff','#9fbad6'],tc:'#566f8c',fx:'snow',cl:.8},
 'fog':{g:['#4d5a63','#6f7d86','#97a4ac'],o:['#b4bfc5','#dde3e6','#8e9aa1'],tc:'#4d5a63',fx:'fog',cl:1}
};
function themeOf(code,day){
  const k=kindOf(code);
  if(k==='storm'||k==='snow'||k==='rain'||k==='fog')return k;
  if(k==='cloud')return day?'cloud-day':'cloud-night';
  return day?'clear-day':'clear-night';
}
let curTheme='';
function setTheme(t){
  if(t===curTheme)return;curTheme=t;
  const T=THEMES[t],r=document.documentElement.style;
  r.setProperty('--o1',T.o[0]);r.setProperty('--o2',T.o[1]);r.setProperty('--o3',T.o[2]);r.setProperty('--cl',T.cl);r.setProperty('--g0',T.g[0]);r.setProperty('--g1',T.g[1]);r.setProperty('--g2',T.g[2]);
  document.querySelector('meta[name=theme-color]').content=T.tc;setFx(T.fx);
}
