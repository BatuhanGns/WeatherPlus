/* icons.js
   Animated SVG weather icons and condition-code helpers. */

const SUN=(x,y,r)=>{let s='';for(let i=0;i<8;i++){const a=i*Math.PI/4,c=Math.cos(a),n=Math.sin(a);s+=`<line x1="${x+c*(r+5)}" y1="${y+n*(r+5)}" x2="${x+c*(r+9)}" y2="${y+n*(r+9)}"/>`}
 return `<g class="rays" style="transform-origin:${x}px ${y}px" stroke="#ffc94d" stroke-width="3" stroke-linecap="round">${s}</g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#gS)"/>`};
const MOON='<path d="M38 10a20 20 0 1 0 14 30 16 16 0 0 1-14-30z" fill="url(#gM)"/>';
const CL=(f='gC',t='')=>`<g transform="${t}"><path class="cl" d="M20 48a10 10 0 0 1-1.5-19.9A14 14 0 0 1 45.5 31 8.5 8.5 0 0 1 46 48z" fill="url(#${f})"/></g>`;
const drops=[0,1,2].map(i=>`<line class="rn" style="animation-delay:${i*.35}s" x1="${24+i*8}" y1="50" x2="${22+i*8}" y2="57" stroke="#7cc4ff" stroke-width="3" stroke-linecap="round"/>`).join('');
const flakes=[0,1,2].map(i=>`<circle class="sn" style="animation-delay:${i*.8}s" cx="${24+i*8}" cy="54" r="2.2" fill="#fff"/>`).join('');
function ic(kind,day){
  let b;
  switch(kind){
    case'clear':b=day?SUN(32,32,12):MOON;break;
    case'partly':b=(day?SUN(23,23,9):'<g transform="translate(-3 -3) scale(.8)">'+MOON+'</g>')+CL('gC','translate(4 6)');break;
    case'fog':b=CL('gC','translate(0 -4)')+[0,1,2].map(i=>`<line x1="${16+i*3}" y1="${46+i*6}" x2="${48-i*3}" y2="${46+i*6}" stroke="#fff" stroke-opacity=".8" stroke-width="3" stroke-linecap="round"/>`).join('');break;
    case'rain':b=CL('gD','translate(0 -6)')+drops;break;
    case'snow':b=CL('gC','translate(0 -6)')+flakes;break;
    case'storm':b=CL('gD','translate(0 -8)')+'<polygon class="bl" points="35,40 27,53 33,53 29,62 41,47 34,47" fill="#ffd84d"/>';break;
    default:b=CL('gD','translate(7 -6) scale(.8)')+CL('gC','translate(0 2)');
  }
  return `<svg class="ic" viewBox="0 0 64 64">${b}</svg>`;
}
const SET=a=>new Set(a);
const C_FOG=SET([1030,1135,1147]),C_STORM=SET([1087,1273,1276,1279,1282]);
const C_SNOW=SET([1066,1114,1117,1210,1213,1216,1219,1222,1225,1255,1258,1237,1261,1264,1204,1207,1069,1072,1168,1171]);
const C_RAIN=SET([1063,1150,1153,1180,1183,1186,1189,1192,1195,1198,1201,1240,1243,1246,1249,1252]);
function kindOf(code){return C_STORM.has(code)?'storm':C_SNOW.has(code)?'snow':C_RAIN.has(code)?'rain':C_FOG.has(code)?'fog':code===1000?'clear':code===1003?'partly':'cloud'}
$('sIcon').innerHTML=ic('partly',1);
