/* حاضنة الأعمال — kinetic typography in 3D space (35 s, 1920x1080, 60 fps).
   Engine of promo-v3/script31.js: one CSS-3D world, one keyframed camera, everything computed from t in render(t).
   The words never move once placed — the camera travels between them. */
const $=id=>document.getElementById(id);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const P=(t,s,d)=>cl((t-s)/d);
const lerp=(a,b,e)=>a+(b-a)*e;
const PI=Math.PI;
const eo=x=>x>=1?1:1-Math.pow(2,-10*x);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const sine=x=>.5-.5*Math.cos(PI*cl(x));
const pos=(el,x=0,y=0,z=0,rx=0,ry=0,rz=0,s=1)=>el.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
const DUR=35, BEAT=.6;                  // 100 BPM

/* ---------------- stickers (SVG, matte paper cut-outs: white border + soft shadow) ---------------- */
const ART={
bulb:{vb:'-14 -14 328 328',g:`
  <path d="M150 40 C 95 40 60 82 60 130 C 60 168 84 188 100 210 L 100 228 L 200 228 L 200 210 C 216 188 240 168 240 130 C 240 82 205 40 150 40 Z" fill="url(#gBulb)"/>
  <ellipse cx="116" cy="112" rx="14" ry="30" transform="rotate(-22 116 112)" fill="#FFFDF2" opacity=".75"/>
  <path d="M125 206 L132 150 L150 176 L168 150 L175 206" stroke="#A8741C" stroke-width="7" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <rect x="102" y="228" width="96" height="20" rx="7" fill="#A3A7AD"/><rect x="106" y="248" width="88" height="18" rx="7" fill="#8C9096"/>
  <path d="M122 266 h56 l-10 18 h-36 z" fill="#5F6368"/>
  <g stroke="#E2AE3C" stroke-width="11" stroke-linecap="round"><path d="M150 4 V24"/><path d="M60 38 L74 52"/><path d="M240 38 L226 52"/><path d="M22 130 H42"/><path d="M258 130 H278"/></g>`,
  defs:`<radialGradient id="gBulb" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#FFF4C8"/><stop offset=".55" stop-color="#F7D778"/><stop offset="1" stop-color="#E9B949"/></radialGradient>`},
uni:{vb:'0 0 380 300',g:`
  <rect x="18" y="266" width="344" height="16" rx="8" fill="#D8CBB2"/>
  <path d="M68 270 V64 L84 18 L100 64 V270 Z" fill="#F4ECDD"/><path d="M84 18 L100 64 V270 H88 V64 Z" fill="#E3D5BA"/>
  <path d="M280 270 V64 L296 18 L312 64 V270 Z" fill="#F4ECDD"/><path d="M296 18 L312 64 V270 H300 V64 Z" fill="#E3D5BA"/>
  <g fill="#C8B490"><rect x="79" y="88" width="10" height="26" rx="5"/><rect x="79" y="136" width="10" height="26" rx="5"/><rect x="291" y="88" width="10" height="26" rx="5"/><rect x="291" y="136" width="10" height="26" rx="5"/></g>
  <g fill="#D9CBAE"><rect x="62" y="196" width="44" height="9" rx="3"/><rect x="274" y="196" width="44" height="9" rx="3"/></g>
  <rect x="104" y="166" width="172" height="104" fill="#F2E9D7"/><rect x="232" y="166" width="44" height="104" fill="#E7DBC4"/>
  <g fill="#CDB893"><path d="M120 270 V232 a19 19 0 0 1 38 0 V270 Z"/><path d="M171 270 V228 a19 19 0 0 1 38 0 V270 Z"/><path d="M222 270 V232 a19 19 0 0 1 38 0 V270 Z"/></g>
  <g fill="#D7C6A6"><path d="M124 210 V196 a8 8 0 0 1 16 0 V210 Z"/><path d="M182 210 V194 a8 8 0 0 1 16 0 V210 Z"/><path d="M240 210 V196 a8 8 0 0 1 16 0 V210 Z"/></g>
  <rect x="138" y="150" width="104" height="20" rx="3" fill="#E9DEC9"/>
  <path d="M134 152 C 134 92 246 92 246 152 Z" fill="#EDE3D1"/><path d="M190 92 C 222 94 246 116 246 152 L 190 152 Z" fill="#E1D3B9"/>
  <g stroke="#D3C3A3" stroke-width="3" fill="none"><path d="M190 96 C 168 110 158 130 156 152"/><path d="M190 96 C 212 110 222 130 224 152"/><path d="M190 94 V152"/></g>
  <path d="M190 94 V74" stroke="#B9A57F" stroke-width="4"/><circle cx="190" cy="70" r="5" fill="#C9A24B"/>`},
hand:{vb:'0 0 340 250',g:`
  <path d="M0 200 L98 122 L134 166 L36 244 Z" fill="#3D4A5E"/><path d="M92 118 L104 108 L142 156 L130 166 Z" fill="#F4F1EA"/>
  <path d="M340 200 L242 122 L206 166 L304 244 Z" fill="#A9845A"/><path d="M248 118 L236 108 L198 156 L210 166 Z" fill="#F4F1EA"/>
  <path d="M212 152 C 192 174 150 178 128 162 L 120 142 C 150 138 176 122 206 120 Z" fill="#D7A378"/>
  <path d="M118 114 C 150 100 196 102 224 122 C 230 134 220 142 208 140 C 188 134 166 134 148 142 L 126 152 C 112 142 108 124 118 114 Z" fill="#EBC29C"/>
  <g stroke="#C99872" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M162 114 C 170 124 170 132 166 140"/><path d="M184 113 C 192 123 192 131 188 138"/><path d="M203 118 C 210 126 210 132 207 138"/><path d="M140 118 C 156 106 176 106 186 114"/></g>`},
note:{vb:'0 0 330 290',g:`
  <g transform="rotate(-6 160 150)">
   <rect x="52" y="32" width="216" height="236" rx="14" fill="#E4DBC8"/>
   <rect x="58" y="26" width="214" height="234" rx="12" fill="#FBF8F1"/>
   <g stroke="#C8CFD8" stroke-width="5" stroke-linecap="round"><path d="M92 84 H238"/><path d="M92 114 H238"/><path d="M92 144 H210"/><path d="M92 174 H238"/><path d="M92 204 H184"/></g>
   <path d="M98 232 C 120 214 140 240 162 222" stroke="#2F4A37" stroke-width="5" fill="none" stroke-linecap="round"/>
   <g fill="none" stroke="#8C9096" stroke-width="6">${[0,1,2,3,4,5,6,7].map(i=>`<circle cx="58" cy="${52+i*27}" r="9"/>`).join('')}</g>
  </g>
  <g transform="rotate(36 236 184)">
   <rect x="150" y="173" width="176" height="24" rx="12" fill="#34465A"/><rect x="286" y="163" width="32" height="9" rx="4" fill="#B8BCC2"/>
   <path d="M150 173 L150 197 L124 185 Z" fill="#C8CCD2"/><path d="M124 181 L124 189 L112 185 Z" fill="#2B2B2B"/>
  </g>`},
man:{vb:'0 0 240 330',g:`
  <circle cx="128" cy="38" r="23" fill="#24262A"/>
  <path d="M104 70 Q128 62 152 70 L 162 86 L 176 150 Q 178 160 170 162 L 164 162 L 152 108 L 150 176 L 106 176 L 104 110 L 86 150 Q 82 158 74 154 Q 68 150 72 142 L 92 86 Z" fill="#24262A"/>
  <path d="M122 70 L134 70 L128 104 Z" fill="#3A3D43"/>
  <path d="M108 172 L 130 172 L 118 240 L 96 316 L 76 314 L 96 238 Z" fill="#24262A"/>
  <path d="M126 172 L 150 172 L 166 236 L 194 306 L 176 314 L 146 244 Z" fill="#24262A"/>
  <path d="M72 312 h30 q5 6 -1 9 h-32 q-5 -5 3 -9 Z" fill="#24262A"/><path d="M174 306 l24 -3 q7 8 0 11 l-28 3 Z" fill="#24262A"/>
  <path d="M174 166 v-9 h24 v9" stroke="#24262A" stroke-width="6" fill="none"/>
  <rect x="158" y="164" width="56" height="42" rx="5" fill="#33363B"/>`},
money:{vb:'0 0 350 270',g:`
  ${[[-11,0,0],[3,14,-18],[-4,26,-34]].map(([r,dx,dy],i)=>`<g transform="translate(${dx} ${dy+70}) rotate(${r} 140 85)">
    <rect x="30" y="30" width="230" height="112" rx="10" fill="${['#9EBFA3','#A9C7AD','#93B79A'][i]}"/>
    <rect x="44" y="42" width="202" height="88" rx="6" fill="none" stroke="#7DA285" stroke-width="3"/>
    <circle cx="210" cy="86" r="26" fill="#C2DAC4" stroke="#7DA285" stroke-width="3"/>
    <path d="M66 70 H150 M66 90 H130 M66 110 H150" stroke="#7DA285" stroke-width="5" stroke-linecap="round"/></g>`).join('')}
  ${[0,1,2,3,4].map(k=>`<ellipse cx="282" cy="${236-k*13}" rx="44" ry="16" fill="${k===4?'#E2C273':'#D2AC58'}" stroke="#A88634" stroke-width="4"/>`).join('')}
  <ellipse cx="282" cy="184" rx="30" ry="10" fill="none" stroke="#B8963F" stroke-width="3"/>
  ${[0,1,2].map(k=>`<ellipse cx="200" cy="${248-k*13}" rx="40" ry="15" fill="${k===2?'#E2C273':'#D2AC58'}" stroke="#A88634" stroke-width="4"/>`).join('')}`},
grad:{vb:'0 0 340 300',g:`
  <g transform="rotate(-10 170 222)">
   <rect x="48" y="198" width="236" height="54" rx="27" fill="#F2E8D3"/>
   <ellipse cx="284" cy="225" rx="15" ry="27" fill="#E2D3B4"/><ellipse cx="284" cy="225" rx="6" ry="13" fill="#CDBA93"/>
   <rect x="150" y="193" width="26" height="64" fill="#8E2F2A"/>
   <path d="M163 252 l-20 36 l15 -6 l6 12 Z" fill="#7A2622"/><path d="M163 252 l18 36 l-15 -6 l-5 12 Z" fill="#7A2622"/>
  </g>
  <path d="M100 118 L100 158 Q170 190 240 158 L240 118 Z" fill="#2E2F33"/>
  <path d="M170 48 L322 102 L170 156 L18 102 Z" fill="#1F2023"/><path d="M170 48 L322 102 L170 112 L18 102 Z" fill="#2A2B2F"/>
  <circle cx="170" cy="102" r="8" fill="#C9A24B"/>
  <path d="M170 102 L292 110 L292 168" stroke="#C9A24B" stroke-width="6" fill="none" stroke-linejoin="round"/>
  <path d="M283 166 h18 l7 42 h-32 Z" fill="#C9A24B"/>`},
};
function sticker(key,w){
  const a=ART[key],id='art_'+key;
  const [vx,vy,vw,vh]=a.vb.split(' ').map(Number),h=w*vh/vw;
  return {h,html:`<svg class="stk" width="${w}" height="${h}" viewBox="${a.vb}" style="left:${-w/2}px;top:${-h/2}px"><defs>${a.defs||''}<g id="${id}">${a.g}</g></defs>
    <use href="#${id}" fill="#fff" stroke="#fff" stroke-width="22" stroke-linejoin="round" stroke-linecap="round"/><use href="#${id}"/></svg>`};
}

/* ---------------- the seven sentences (texts exactly as the brief) ---------------- */
const W=(s,c='')=>s.split(' ').map(x=>`<span class="w ${c}"><span class="wi">${x}</span></span>`).join(' ');
const S=[
 {x:0,    y:-430,z:0,     mode:'build', fs:120, html:`${W('عندك')} ${W('فكرة','acc')} ${W('مشروع؟')}`, tx:190, st:'bulb', sx:-560, sy:-20, sw:330, rz:-8},
 {x:1900, y:-520,z:-1800, mode:'mask',  fs:98,  html:`${W('حاضنة الأعمال…','acc')}<br>${W('معك من الفكرة إلى')} ${W('المؤسسة','gold')}`, tx:-210, st:'uni', sx:770, sy:-30, sw:400, rz:6},
 {x:-1800,y:-420,z:-3600, mode:'mask',  fs:108, html:`${W('المرافقة والمتابعة')}<br>${W('خطوة بخطوة','acc')}`, tx:190, st:'hand', sx:-560, sy:-10, sw:380, rz:-7},
 {x:1900, y:-500,z:-5400, mode:'mask',  fs:108, html:`${W('تكوين وورشات')}<br>${W('في')} ${W('ريادة الأعمال','acc')}`, tx:-200, st:'note', sx:560, sy:-10, sw:340, rz:8},
 {x:-1700,y:-440,z:-7200, mode:'build', fs:124, html:`${W('من طالب…')}<br>${W('إلى')} ${W('مقاول','gold')}`, tx:170, st:'man', sx:-470, sy:10, sw:250, rz:0, flip:true},
 {x:1900, y:-520,z:-9000, mode:'mask',  fs:94,  html:`${W('تمويل يصل إلى')} <span class="w gold"><span class="wi"><span class="num" id="n80" style="width:1.25em">80</span></span></span> ${W('مليون سنتيم…')}<br>${W('وحتى')} <span class="w gold"><span class="wi"><span class="num" id="n200" style="width:1.85em">200</span></span></span> ${W('مليون سنتيم')}`, tx:-230, st:'money', sx:800, sy:-10, sw:380, rz:7},
 {x:-1500,y:-460,z:-10800,mode:'mask',  fs:104, html:`${W('تتخرج بمشروعك:')}<br>${W('شهادة – مؤسسة ناشئة','acc')}`, tx:200, st:'grad', sx:-610, sy:-20, sw:370, rz:-8},
];
/* beat map: [enter, hold-from, hold-to] per sentence; sticker drop time */
const BM=[
 {in:.25, h0:0,    h1:3.4,  drop:1.2},
 {in:4.5, h0:4.6,  h1:8.6,  drop:5.4},
 {in:9.3, h0:9.4,  h1:12.6, drop:10.2},
 {in:13.7,h0:13.8, h1:16.8, drop:14.4},
 {in:17.7,h0:17.8, h1:21.0, drop:18.6},
 {in:22.1,h0:22.2, h1:26.0, drop:23.4},
 {in:26.9,h0:27.0, h1:30.0, drop:27.6},
];
const T={pull:30.0, pullHold:31.2, sweep:31.7, logo:32.1, uni:32.9, pill:33.6, end:35};
const L={x:120,y:-780,z:2300};             // final logo, in front of everything

S.forEach((s,i)=>{
  const g=document.createElement('div');g.className='o';
  g.innerHTML=`<div class="fv shd" style="left:-700px;top:-260px;width:1400px;height:520px;transform:translate3d(${s.tx}px,${-s.y}px,0) rotateX(90deg)"></div>
    <div class="fv txt" style="left:${s.tx-1100}px;width:2200px;top:-200px;font-size:${s.fs}px;${s.mode==='build'?'transform-style:preserve-3d':''}">${s.html}</div>
    <div class="o stkO"><div class="fv shd stkS" style="left:-220px;top:-120px;width:440px;height:240px"></div><div class="o stkP">${sticker(s.st,s.sw).html}</div></div>`;
  $('items').appendChild(g);s.g=g;s.txt=g.querySelector('.txt');s.words=[...g.querySelectorAll('.w')];s.wi=[...g.querySelectorAll('.wi')];
  s.stkO=g.querySelector('.stkO');s.stkP=g.querySelector('.stkP');s.stkS=g.querySelector('.stkS');s.svg=g.querySelector('.stk');s.shd=g.querySelector('.shd');
  if(s.mode==='mask')s.words.forEach(w=>w.classList.add('m'));
  s.h=sticker(s.st,s.sw).h;
});
/* after layout: every word becomes its own plane at its measured place (robust compositing, true depth moves) */
const centerText=()=>S.forEach(s=>{
  s.txt.style.top=(-s.txt.offsetHeight/2)+'px';
  const L0=s.txt.offsetLeft,T0=s.txt.offsetTop,fs=getComputedStyle(s.txt).fontSize;
  s.wds=s.words.map(w=>{const d=document.createElement('div');d.className='fv txt';
    Object.assign(d.style,{left:L0+w.offsetLeft+'px',top:T0+w.offsetTop+'px',width:w.offsetWidth+'px',height:w.offsetHeight+'px',fontSize:fs,lineHeight:getComputedStyle(s.txt).lineHeight,
      padding:'0',clipPath:s.mode==='mask'?'inset(-40% -35% 0 -35%)':'none'});
    d.innerHTML=`<span class="${w.className.replace(' m','')}" style="display:block;padding-bottom:.16em">${w.innerHTML}</span>`;
    s.g.appendChild(d);return d;});
  s.wi=s.wds.map(d=>d.querySelector('.wi'));s.wi.forEach(e=>e.style.display='inline-block');
  s.txt.remove();
});

/* ---------------- camera: [t, cx,cy,cz, dist, rx,ry,rz] ---------------- */
const CAM=[];
S.forEach((s,i)=>{
  const b=BM[i],cx=s.x+(s.tx+s.sx)/2*.6,cy=s.y+10;
  const side=i%2?-1:1;
  if(i>0){const p=S[i-1],pb=BM[i-1];                        // in-between: dolly + truck with a gentle yaw toward the move
    const tm=(pb.h1+b.h0)/2,whip=i===2;
    CAM.push([tm,(p.x+s.x)/2,(p.y+s.y)/2-40,(p.z+s.z)/2,whip?-520:-760,-5,(s.x>p.x?-1:1)*(whip?7:5),0]);}
  CAM.push([b.h0,cx,cy,s.z,-330,-3,side*1.5,0]);
  CAM.push([b.h1,cx,cy,s.z,-170,-2.5,-side*1.5,0]);
});
CAM.push([T.pullHold,40,-560,-4600,-8600,-14,-6,0]);
CAM.push([T.sweep,   40,-560,-4600,-8700,-14,-5,0]);
CAM.push([33.2,      L.x,L.y,L.z,-420,-2,0,0]);
CAM.push([T.end,     L.x,L.y,L.z,-250,-2,0,0]);
CAM.push([T.end+1,   L.x,L.y,L.z,-230,-2,0,0]);
CAM.unshift([-1,CAM[0][1],CAM[0][2],CAM[0][3],-380,-3,2,0]);
function camAt(t){
  const K=CAM;let i=0;while(i<K.length-2&&t>K[i+1][0])i++;
  const k0=K[Math.max(0,i-1)],k1=K[i],k2=K[i+1],k3=K[Math.min(K.length-1,i+2)];
  const u=cl((t-k1[0])/(k2[0]-k1[0])),u2=u*u,u3=u2*u,d=k2[0]-k1[0];
  const out=[];
  for(let c=1;c<8;c++){
    let m1=(k2[c]-k0[c])/(k2[0]-k0[0]||1)*d, m2=(k3[c]-k1[c])/(k3[0]-k1[0]||1)*d;
    const dl=k2[c]-k1[c];                                     // monotone (Fritsch–Carlson): no overshoot
    if(dl===0||(k2[c]-k1[c])*(k1[c]-k0[c])<0)m1=0; else m1=Math.sign(dl)*Math.min(Math.abs(m1),3*Math.abs(dl))*(Math.sign(m1)===Math.sign(dl)?1:0);
    if(dl===0||(k3[c]-k2[c])*(k2[c]-k1[c])<0)m2=0; else m2=Math.sign(dl)*Math.min(Math.abs(m2),3*Math.abs(dl))*(Math.sign(m2)===Math.sign(dl)?1:0);
    out.push((2*u3-3*u2+1)*k1[c]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[c]+(u3-u2)*m2);
  }
  return out;
}
function project(c,x,y,z){
  const r=PI/180;x-=c.cx;y-=c.cy;z-=c.cz;
  let a=c.rz*r,X=x*Math.cos(a)-y*Math.sin(a),Y=x*Math.sin(a)+y*Math.cos(a);x=X;y=Y;
  a=c.ry*r;X=x*Math.cos(a)+z*Math.sin(a);let Z=-x*Math.sin(a)+z*Math.cos(a);x=X;z=Z;
  a=c.rx*r;Y=y*Math.cos(a)-z*Math.sin(a);Z=y*Math.sin(a)+z*Math.cos(a);y=Y;z=Z+c.dist;
  if(z>1850)return null;const k=2000/(2000-z);return {x:x*k,y:y*k,depth:2000-z};
}

/* ---------------- helpers ---------------- */
// sticker paper drop: falls, one small overshoot (squash) and settles; contact shadow tightens
function drop(t,t0){
  const p=P(t,t0,.75);
  if(p<=0)return {y:-300,s:1,sq:0,v:0};
  let y,sq=0;
  if(p<.5){const e=eio(p/.5);y=lerp(-300,7,e);}
  else{const e=eo((p-.5)/.5);y=lerp(7,0,e);sq=Math.sin(PI*cl((p-.5)/.22))*.05;}
  return {y,sq,v:1};
}
const setBlur=(el,b)=>{const v=b>.15?`blur(${b.toFixed(2)}px)`:'none';if(el._b!==v){el._b=v;el.style.filter=v;}};
const setBlurStk=(el,b)=>{const base='drop-shadow(0 14px 16px rgba(70,50,25,.20)) drop-shadow(0 2px 3px rgba(70,50,25,.18))';const v=b>.15?`${base} blur(${b.toFixed(2)}px)`:base;if(el._b!==v){el._b=v;el.style.filter=v;}};

/* ======================================================================= */
function render(t){
  const [cx,cy,cz,dist,rx,ry,rz]=camAt(t);
  $('world').style.transform=`translateZ(${dist}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) translate3d(${-cx}px,${-cy}px,${-cz}px)`;
  // tiny natural handheld drift (±2 px, slow)
  $('drift').style.transform=`translate(${(1.4*Math.sin(t*.47)+.5*Math.sin(t*1.13)).toFixed(2)}px,${(1.1*Math.cos(t*.39)+.4*Math.sin(t*.97)).toFixed(2)}px)`;
  const cam={cx,cy,cz,dist,rx,ry,rz};

  // camera speed (for the whip-pan background blur)
  const a=camAt(Math.max(0,t-1/120)),b=camAt(Math.min(DUR,t+1/120));
  const vel=Math.hypot(b[0]-a[0],b[2]-a[2])*60;               // world px / s
  const whip=t>8.5&&t<9.5?cl((vel-1500)/2500)*5:0;           // only the S2→S3 whip blurs (background only)
  // which sentence is in focus
  let cur=0;BM.forEach((m,i)=>{if(t>=m.in-.4)cur=i;});
  const focus=2000-dist;

  S.forEach((s,i)=>{
    const m=BM[i];
    pos(s.g,s.x,s.y,s.z);
    // depth of field: far layers slightly soft, the current sentence always razor sharp
    const q=project(cam,s.x+s.tx,s.y,s.z);
    let blur=0;if(q&&i!==cur){blur=cl((Math.abs(q.depth-focus)-500)/900,0,2.6);}
    if(i!==cur)blur=Math.max(blur,whip);
    if(t>T.pull)blur=0;
    s.wds.forEach(d=>setBlur(d,blur));setBlurStk(s.svg,blur);
    const far=q?cl(1-(q.depth-focus-1700)/1500):1, endFade=1-eio(P(t,T.sweep+.1,.7));
    const vis=(t>T.pull-.3?1:far)*endFade;
    s.g.style.opacity='';[s.txt,s.svg,s.shd,s.stkS].forEach(e=>{const o=(e===s.stkS?1:1)*vis;e.dataset.v=o;});
    s.svg.style.opacity=vis;
    const on=vis>.004?'':'none';if(s.g.style.display!==on)s.g.style.display=on;
    // --- words ---
    if(s.mode==='build'){                                         // MAGIC: words slide in on depth and lock in place
      s.wds.forEach((w,k)=>{const n=s.wds.length,e=eio(P(t,m.in+k*.14,.75));
        const off=(k-(n-1)/2);
        w.style.transform=`translate3d(${lerp(off*-24,0,e)}px,${lerp(26,0,e)}px,${lerp(820,0,e)+k*1.5}px)`;
        w.style.opacity=cl(e*2.2)*vis;});
    } else {                                                      // mask reveal, word by word (right → left)
      s.wi.forEach((w,k)=>{const e=eo(P(t,m.in+k*.09,.55));w.style.transform=`translateY(${lerp(112,0,e)}%)`;});s.wds.forEach((d,k)=>{d.style.opacity=vis;d.style.transform=`translateZ(${k*1.5}px)`;});
    }
    // --- sticker: lands with a paper drop ---
    const d=drop(t,m.drop);
    const walk=s.st==='man'?-lerp(0,26,sine(P(t,m.drop+.6,2.4))):0;
    pos(s.stkO,s.sx+s.tx*0+walk,s.sy,90);
    s.stkP.style.transform=`translate3d(0,${d.y}px,0) rotateZ(${s.rz+(d.v?lerp(-4,0,cl((d.y+300)/307)):0)}deg) scale(${s.flip?-1:1},1) scale(${1+d.sq},${1-d.sq})`;
    s.stkP.style.visibility=d.v?'visible':'hidden';
    const land=cl(1-(-d.y)/300);
    s.stkS.style.transform=`translate3d(0,${-s.sy+s.h*0+ -s.y}px,0) rotateX(90deg) scale(${lerp(1.7,1,land)})`;
    s.stkS.style.opacity=(d.v?lerp(.25,1,land):0)*vis;
    s.shd.style.opacity=cl(P(t,m.in,1.0))*.6*vis;
  });
  // MAGIC: funding numbers count up as the camera passes
  const n1=Math.round(80*eo(P(t,22.8,1.3))),n2=Math.round(200*eo(P(t,23.3,1.5)));
  if($('n80').textContent!==String(n1))$('n80').textContent=n1;
  if($('n200').textContent!==String(n2))$('n200').textContent=n2;

  /* ---- soft daylight drifting across ---- */
  const lb=lerp(-10,40,t/DUR);
  $('light').style.background=`linear-gradient(112deg,rgba(255,244,222,0) ${lb}%,rgba(255,244,222,.55) ${lb+12}%,rgba(255,244,222,0) ${lb+30}%)`;
  // film grain: jumps every frame, deterministic
  const fr=Math.floor(t*60);$('grain').style.backgroundPosition=`${(fr*137)%260}px ${(fr*71)%260}px`;

  /* ---- final: light sweep reveals the logo (brand colours only here) ---- */
  const sw=P(t,T.sweep,1.1);
  $('sweep').style.opacity=Math.sin(PI*sw);
  $('sweep').style.transform=`translateX(${lerp(2100,-1100,eio(sw))}px)`;
  pos($('logo'),L.x,L.y,L.z);pos($('wash'),L.x,L.y,L.z-260);
  const wash=eio(P(t,T.sweep+.15,.9));$('washF').style.opacity=wash;$('wash').style.display=t>T.sweep?'':'none';
  $('logo').style.visibility=t>=T.logo?'visible':'hidden';
  const rv=eio(P(t,T.logo,1.0));                               // reveal follows the sweep, right → left
  $('lgRow').style.clipPath=`inset(-30% 0 -30% ${(1-rv)*100}%)`;
  $('lgBadge').style.transform=`scale(${lerp(.9,1,eo(P(t,T.logo+.55,.5)))})`;
  $('lgRule').style.transform=`scaleX(${eio(P(t,T.uni-.2,.6))})`;
  const ue=eio(P(t,T.uni,.7));$('lgUni').style.clipPath=`inset(-30% 0 -30% ${(1-ue)*100}%)`;
  const pe=P(t,T.pill,.75);let py;                             // one small overshoot only
  if(pe<.55)py=lerp(110,-6,eio(pe/.55));else py=lerp(-6,0,eo((pe-.55)/.45));
  $('lgPill').style.transform=`translateY(${py}px)`;$('lgPill').style.clipPath=`inset(${(1-eo(pe))*100}% -60px -60px -60px)`;
  const sp=P(t,34.1,.8);$('shine').style.left=lerp(-200,1100,eio(sp))+'px';$('shine').style.opacity=sp>0&&sp<1?1:0;
}

window.render=render;window.DUR=DUR;window.T=T;window.BM=BM;
window.ready=(async()=>{
  await Promise.all(['900 40px Cairo','800 40px Cairo','700 40px Tajawal','700 40px "Reem Kufi"'].flatMap(f=>[document.fonts.load(f,'ابت'),document.fonts.load(f,'Abc 0123')]));
  await document.fonts.ready;centerText();render(0);return true;})();
