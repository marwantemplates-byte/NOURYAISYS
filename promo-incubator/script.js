/* حاضنة الأعمال — introduction film (38 s, 1920x1080).
   Same engine as promo-v3/script31.js: one CSS-3D world, one keyframed camera (CAM, Hermite),
   every visual computed from t inside render(t). No CSS transitions, no timers. */
const $=id=>document.getElementById(id);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const P=(t,s,d)=>cl((t-s)/d);
const lerp=(a,b,e)=>a+(b-a)*e;
const PI=Math.PI;
const eo=x=>x>=1?1:1-Math.pow(2,-10*x);
const eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eio5=x=>x<.5?16*x**5:1-Math.pow(-2*x+2,5)/2;
const spr=(x,k=7,w=11)=>x<=0?0:x>=1?1:1-Math.exp(-k*x)*Math.cos(w*x);
const bo=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const pos=(el,x=0,y=0,z=0,rx=0,ry=0,rz=0,s=1)=>el.style.transform=`translate3d(${x}px,${y}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
const fx=(el,o=1)=>{el.style.opacity=o};
const pulse=(t,tc,d=.16)=>Math.sin(PI*P(t,tc,d));
const show=(el,v)=>el.style.display=v?'':'none';
const DUR=38, BEAT=.6;                 // 100 BPM

/* ---------------- world anchors ---------------- */
const N={x:-2600,y:0,z:300};           // notebook
const SCR={x:0,y:-330,z:30};           // laptop screen centre
const J={x:3000,y:0,z:300};            // journey paper (flat-lay)
const CH={x:J.x,z:J.z+620};            // chart hinge on the paper
const FIN={x:J.x,y:-540,z:J.z+620};    // final logo

/* ---------------- beat map ---------------- */
const T={
  dawn:0, bulb:.6, rays:2.25, idea:2.55, turn:3.7, q1:4.45, q2:4.85,
  lift:5.3, fold:5.6, plane:6.0, hit:7.55, cap1:7.9,
  pil:[11.2,12.8,14.4,16.0], stamp:17.0,
  flat:18.0, path:19.2, s1:19.8, s2:22.2, tick:23.4, s3:24.6, app:25.3,
  pop:27.6, bars:[28.2,28.8,29.4], foldBack:31.2,
  flare:32.2, logo:32.5, uni:33.5, pill:34.2, url:34.6,
};

/* ---------------- camera: [t, cx,cy,cz, dist, rx,ry,rz] ---------------- */
const CAM=[
 [-1.0, N.x+40, -40, N.z+40,  60, -62, -8,  2],
 [ 0.0, N.x+40, -40, N.z+40, 120, -60, -6,  1],
 [ 2.4, N.x+150, -30, N.z+20, 230, -58, -3,  0],
 [ 3.9, N.x+40, -30, N.z+30, 130, -60,  0,  0],
 [ 5.2, N.x+230, -60, N.z+40, 160, -54,  3,  0],
 [ 6.0, N.x+420,-300, N.z+60,-260, -30,  8, -1],
 [ 6.8, -1150,  -420,  260, -760, -14,  6,  0],
 [ 7.6,    0,  -360,   30, -380,  -6,  0,  0],
 [10.6,    0,  -360,   30, -220,  -5, -2,  0],
 [11.6,    0,  -240,  640, -780, -24,  0,  0],
 [14.2,   40,  -230,  700, -880, -25,  1,  0],
 [16.6,  -40,  -230,  700, -900, -25, -1,  0],
 [17.8,    0,  -220,  700, -920, -26,  0,  0],
 [19.0,  J.x,     0,  J.z, -560, -88,  0,  0],
 [22.0,  J.x+80,  0,  J.z, -520, -88,  0,  0],
 [24.3,  J.x-60,  0,  J.z, -520, -88,  0,  0],
 [24.9,  J.x-860, 0,  J.z+60,-190, -86,  0, -5],
 [26.6,  J.x-860, 0,  J.z+60,-130, -86,  0, -2],
 [28.2,  CH.x, -380, CH.z, -560, -12,  0,  0],
 [31.2,  CH.x, -380, CH.z, -500, -12,  2,  0],
 [32.4,  FIN.x,FIN.y,FIN.z,-520,  -4,  0,  0],
 [38.0,  FIN.x,FIN.y,FIN.z,-260,  -3,  0,  0],
 [39.0,  FIN.x,FIN.y,FIN.z,-220,  -3,  0,  0],
];
function camAt(t){
  const K=CAM;let i=0;while(i<K.length-2&&t>K[i+1][0])i++;
  const k0=K[Math.max(0,i-1)],k1=K[i],k2=K[i+1],k3=K[Math.min(K.length-1,i+2)];
  const u=cl((t-k1[0])/(k2[0]-k1[0])),u2=u*u,u3=u2*u,d=k2[0]-k1[0];
  const out=[];
  for(let c=1;c<8;c++){
    // Catmull-Rom tangents, clamped (monotone): no overshoot on holds or reversals
    let m1=(k2[c]-k0[c])/(k2[0]-k0[0]||1)*d, m2=(k3[c]-k1[c])/(k3[0]-k1[0]||1)*d;
    const dl=k2[c]-k1[c];                               // Fritsch–Carlson: tangents within [0, 3·secant]
    if(dl===0||(k2[c]-k1[c])*(k1[c]-k0[c])<0)m1=0; else m1=Math.sign(dl)*Math.min(Math.abs(m1),3*Math.abs(dl))*(Math.sign(m1)===Math.sign(dl)?1:0);
    if(dl===0||(k3[c]-k2[c])*(k2[c]-k1[c])<0)m2=0; else m2=Math.sign(dl)*Math.min(Math.abs(m2),3*Math.abs(dl))*(Math.sign(m2)===Math.sign(dl)?1:0);
    out.push((2*u3-3*u2+1)*k1[c]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[c]+(u3-u2)*m2);
  }
  return out;
}

/* ---------------- bokeh dust & light pools ---------------- */
let seed=17;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const PT=[];
for(let i=0;i<60;i++){const d=document.createElement('div');d.className='fv pt';
  const sz=lerp(8,26,rnd());
  const col=i%4?'255,255,255':'246,217,184';
  Object.assign(d.style,{width:'60px',height:'60px',left:'-30px',top:'-30px',background:`radial-gradient(closest-side,rgba(${col},1) 0%,rgba(${col},.85) 35%,rgba(${col},0) 100%)`});
  $('pts').appendChild(d);PT.push({d,sz,x:lerp(-4200,4800,rnd()),y:lerp(-1900,-420,rnd()),z:lerp(-1800,900,rnd()),sp:lerp(8,26,rnd()),ph:rnd()*6,o:lerp(.3,.75,rnd())});}
const GL=[[N.x,-500,-700,1900,.85],[0,-500,-900,2100,.85],[J.x,-700,-900,2600,.8],[1500,-300,-1200,1800,.6]].map(([x,y,z,s,a])=>{
  const d=document.createElement('div');d.className='fv';Object.assign(d.style,{left:-s/2+'px',top:-s/2+'px',width:s+'px',height:s+'px',borderRadius:'50%',background:`radial-gradient(closest-side,rgba(255,252,244,${a}),rgba(255,252,244,0))`});
  $('glows').appendChild(d);pos(d,x,y,z);return d;});

/* ---------------- captions: per-word mask reveal (never a plain fade) ---------------- */
function prepWords(root){root.querySelectorAll('.w').forEach(w=>{w.innerHTML=`<span class="wi" style="display:inline-block">${w.innerHTML}</span>`;Object.assign(w.style,{overflow:'hidden',padding:'0 .06em .22em',marginBottom:'-.22em',verticalAlign:'bottom'});});}
function words(root,t0,t,stg=.08){
  root.querySelectorAll('.wi').forEach((w,i)=>{const e=P(t,t0+i*stg,.6),k=spr(e,6,9);
    w.style.transform=`translateY(${lerp(115,0,k)}%)`;});
}
/* right-to-left wipe for a whole line */
const wipe=(el,p)=>{el.style.clipPath=`inset(-20% 0 -20% ${(1-p)*100}%)`;};
const typeStr=(s,t,t0,cps)=>{const a=[...s];return a.slice(0,Math.floor(cl((t-t0)*cps,0,a.length))).join('')};

/* ---------------- hero leaves (canvas, deterministic) ---------------- */
const LG=['#4F7D3A','#2E6B4A','#6E9440','#86A84B','#C9A24B','#D8B45E'];
const HL=[];for(let i=0;i<34;i++)HL.push({x0:rnd()*1700,v:lerp(26,60,rnd()),lane:(i+.5)/34*.86+.03,amp:lerp(10,26,rnd()),fq:lerp(.006,.012,rnd()),ph:rnd()*6,r0:rnd()*6,rs:lerp(.3,.7,rnd())*(rnd()<.5?-1:1),f0:rnd()*6,fs:lerp(.8,1.6,rnd()),sz:lerp(8,19,rnd()),c:LG[i%LG.length]});
function heroLeaves(t){
  const cv=$('hLeaves'),c=cv.getContext('2d'),k=cv.width/1440;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);
  for(const l of HL){const x=(l.x0+l.v*t)%1600-80,y=l.lane*886+Math.sin(x*l.fq+l.ph)*l.amp,fl=Math.cos(l.f0+l.fs*t);
    c.setTransform(k,0,0,k,0,0);c.translate(x,y);c.rotate((l.r0+l.rs*t)*.5);c.scale(l.sz,l.sz*(fl<0?Math.min(-.15,fl):Math.max(.15,fl)));
    c.globalAlpha=.85;c.beginPath();c.moveTo(-.9,0);c.bezierCurveTo(-.6,-.6,.5,-.55,1,0);c.bezierCurveTo(.5,.55,-.6,.6,-.9,0);c.fillStyle=l.c;c.fill();}
}

/* ---------------- PILLARS: four real objects ---------------- */
const ICONP='<svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#8A9096" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M5 20a7 7 0 0114 0"/></svg>';
const PIL=[
 {x:780, w:280,h:400,th:5, face:`<div style="position:absolute;inset:0;border-radius:26px;background:linear-gradient(170deg,#FFFFFF,#F1F2F4);box-shadow:inset 0 0 0 2px rgba(0,0,0,.06)">
     <div style="position:absolute;left:105px;top:22px;width:70px;height:16px;border-radius:8px;background:#C9CDD2;box-shadow:inset 0 2px 3px rgba(0,0,0,.25)"></div>
     <div style="position:absolute;left:20px;right:20px;top:58px;height:160px;border-radius:16px;background:#EEF0F2;display:flex;align-items:center;justify-content:center">${ICONP}</div>
     <div style="position:absolute;left:0;right:0;top:236px;text-align:center;font:900 60px Cairo;color:#1F1F1F">مؤطر</div>
     <div style="position:absolute;left:0;right:0;top:322px;text-align:center;font:700 28px Tajawal;color:#6A6F75">المرافقة</div></div>
     <svg style="position:absolute;left:40px;top:-70px;overflow:visible" width="200" height="90" viewBox="0 0 200 90"><path d="M84 0 L100 0 L110 88 L96 88 Z" fill="#3F5672"/><path d="M116 0 L100 0 L90 88 L104 88 Z" fill="#33465E"/><rect x="84" y="74" width="32" height="28" rx="6" fill="#B8BCC2"/></svg>`,
  t:'المرافقة', s:'مؤطرون يتابعونك خطوة بخطوة', edge:'#D6D9DD'},
 {x:260, w:300,h:420,th:14, face:`<div style="position:absolute;inset:0;border-radius:8px 14px 14px 8px;background:linear-gradient(160deg,#F2EAD8,#E6DBC3);box-shadow:inset 0 0 0 1px rgba(80,60,30,.12)">
     <div style="position:absolute;right:0;top:0;bottom:0;width:26px;border-radius:0 14px 14px 0;background:linear-gradient(90deg,#CDBE9E,#BFAE8A)"></div>
     <div style="position:absolute;right:58px;top:58px;width:180px;height:4px;background:#2B3440"></div>
     <div style="position:absolute;right:50px;left:30px;top:96px;text-align:right;font:900 50px/1.15 Cairo;color:#2B3440">دليل<br>التكوين</div>
     <div style="position:absolute;right:50px;top:236px;font:700 28px Tajawal;color:#5E5A50">دورات وورشات</div>
     <svg style="position:absolute;left:40px;bottom:36px" width="150" height="80" viewBox="0 0 150 80"><rect x="2" y="10" width="64" height="64" rx="8" fill="none" stroke="#8C836F" stroke-width="4"/><path d="M14 30h40M14 44h40M14 58h26" stroke="#8C836F" stroke-width="4" stroke-linecap="round"/><circle cx="110" cy="42" r="30" fill="none" stroke="#8C836F" stroke-width="4"/><path d="M110 26v16l10 8" stroke="#8C836F" stroke-width="4" stroke-linecap="round"/></svg>
     <div style="position:absolute;right:13px;top:110px;width:6px;height:26px;border-radius:2px;background:#9A9DA1"></div><div style="position:absolute;right:13px;bottom:110px;width:6px;height:26px;border-radius:2px;background:#9A9DA1"></div></div>`,
  t:'التكوين', s:'دورات وورشات حضورية وأونلاين', edge:'repeating-linear-gradient(90deg,#FFFDF7 0 3px,#E3DBC9 3px 5px)'},
 {x:-260, w:240,h:340,th:24, face:`<div style="position:absolute;inset:0;border-radius:26px;background:linear-gradient(165deg,#4A4D52,#2C2E32);box-shadow:inset 0 0 0 2px rgba(255,255,255,.08)">
     <div style="position:absolute;left:22px;right:22px;top:24px;height:78px;border-radius:10px;background:linear-gradient(180deg,#B8C2AE,#A2AD98);box-shadow:inset 0 3px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:flex-end;padding:0 16px;font:700 46px Tajawal;color:#2D332A;direction:ltr">0</div>
     <div style="position:absolute;left:22px;right:22px;top:122px;bottom:22px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${Array.from({length:16},(_,i)=>`<i style="border-radius:9px;background:${i%4===3?'#8A8E94':'#5D6167'};box-shadow:0 3px 0 #1E2023"></i>`).join('')}</div></div>`,
  t:'التوجيه نحو التمويل', s:'نعرّفك بآليات التمويل المتاحة', edge:'#1F2124', coins:true},
 {x:-780, w:360,h:440,th:8, face:`<div style="position:absolute;left:0;right:0;top:0;bottom:0;border-radius:6px 14px 14px 14px;background:linear-gradient(165deg,#DCC08F,#CBAA74);box-shadow:inset 0 0 0 1px rgba(90,60,20,.18)">
     <div style="position:absolute;left:-1px;top:-34px;width:150px;height:40px;border-radius:12px 12px 0 0;background:#D2B47F"></div>
     <div style="position:absolute;left:30px;right:30px;top:40px;height:3px;background:rgba(90,60,20,.18)"></div>
     <div style="position:absolute;right:34px;top:62px;font:700 26px Tajawal;color:#6E5531">ملف المشروع</div>
     <div id="imprint" style="position:absolute;left:36px;top:150px;width:290px;height:170px;border:7px solid #8E2F2A;border-radius:18px;transform:rotate(-8deg);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8E2F2A;mix-blend-mode:multiply">
       <div style="font:900 44px/1.2 Cairo">شهادة</div><div style="width:150px;height:4px;background:#8E2F2A;margin:4px 0 6px"></div><div style="font:900 40px/1.2 Cairo;white-space:nowrap">مؤسسة ناشئة</div></div></div>`,
  t:'القرار الوزاري 1275', s:'مسار «شهادة — مؤسسة ناشئة»', edge:'#B8955E'},
];
const PZ=1060;
PIL.forEach((p,i)=>{
  const g=document.createElement('div');g.className='o';
  g.innerHTML=`<div class="o pb">
      <div class="fv" style="left:${-p.w/2}px;top:${-p.h/2}px;width:${p.w}px;height:${p.h}px">${p.face}</div>
      <div class="fv" style="left:${-p.w/2+8}px;top:${p.h/2-1}px;width:${p.w-16}px;height:${p.th}px;transform-origin:50% 0;transform:rotateX(-90deg);background:${p.edge}"></div>
    </div>`;
  $('pil').appendChild(g);p.g=g;p.b=g.querySelector('.pb');
  const s=document.createElement('div');s.className='fv shd';Object.assign(s.style,{left:-p.w*.75+'px',top:-p.h*.7+'px',width:p.w*1.5+'px',height:p.h*1.4+'px'});
  const so=document.createElement('div');so.className='o';so.appendChild(s);$('pil').appendChild(so);p.sh=so;p.shd=s;
  const L=document.createElement('div');L.className='o';L.innerHTML=`<div class="fv lab" style="top:-60px"><div class="t">${p.t}</div><div class="s">${p.s}</div></div>`;$('pil').appendChild(L);p.L=L;p.Li=L.firstChild;
  if(p.coins){const c=document.createElement('div');c.className='o';
    const stacks=[[-40,0,7,'#C7A35A','#9C7C3A'],[60,40,4,'#C9CCD1','#959AA1'],[20,-80,5,'#C7A35A','#9C7C3A']];
    c.innerHTML=stacks.map(([x,z,n,c1,c2])=>Array.from({length:n},(_,k)=>`<div class="fv" style="left:${x-34}px;top:${z-34}px;width:68px;height:68px;border-radius:50%;transform:translateY(${-k*7-4}px) rotateX(90deg);background:${k===n-1?`radial-gradient(circle at 40% 35%,${c1},${c2})`:c2};box-shadow:0 0 0 2px ${c2}">${k===n-1?`<div style="position:absolute;inset:9px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)"></div>`:''}</div>`).join('')).join('');
    $('pil').appendChild(c);p.c=c;}
});
/* rubber stamp (wood handle + rubber block) */
const STAMP=document.createElement('div');STAMP.className='o';
STAMP.innerHTML=[['translateZ(70px)','#9C6B3F'],['rotateY(180deg) translateZ(70px)','#8A5D35'],['rotateY(90deg) translateZ(70px)','#A87547'],['rotateY(-90deg) translateZ(70px)','#A87547']].map(([tr,c])=>`<div class="fv" style="left:-70px;top:-60px;width:140px;height:60px;transform:${tr};background:${c}"></div>`).join('')+
  `<div class="fv" style="left:-70px;top:-70px;width:140px;height:140px;transform:translateY(-60px) rotateX(90deg);background:#B98552"></div>`+
  `<div class="fv" style="left:-22px;top:-200px;width:44px;height:150px;border-radius:20px;background:linear-gradient(90deg,#7A4E2A,#B07C4E,#7A4E2A)"></div>`+
  `<div class="fv" style="left:-44px;top:-260px;width:88px;height:88px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#C99A68,#7A4E2A)"></div>`;
$('pil').appendChild(STAMP);

/* ---------------- JOURNEY stations ---------------- */
const SP=[{x:860,z:-200},{x:20,z:-200},{x:-860,z:-200}];
const SL=['سجّل وعرّف بمشروعك','تابع الدورات والأحداث','حوّل فكرتك إلى نموذج أولي'];
$('jLabs').innerHTML=SL.map((s,i)=>`<div class="fv stl" id="sl${i}" style="left:${SP[i].x-420}px;width:840px;top:300px"><span class="num" id="sn${i}">${i+1}</span>${s}</div>`).join('');
$('jPools').innerHTML=SP.map((p,i)=>`<div class="fv" id="pool${i}" style="left:${p.x-560}px;top:${p.z-470}px;width:1120px;height:1120px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,236,196,.55),rgba(255,236,196,0))"></div>`).join('');
// station 1: registration card
$('st1').innerHTML=`<div class="o" style="transform:translateY(-20px) rotateX(90deg)">
  <div class="fv shd" style="left:-330px;top:-300px;width:660px;height:700px;transform:translateZ(-2px)"></div>
  <div class="fv card" style="left:-280px;top:-310px;width:560px;height:620px;padding:30px 34px;direction:rtl;text-align:right">
    <div style="font:900 42px Cairo">سجّل في الحاضنة</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px"><i style="height:8px;border-radius:4px;background:#3C4043"></i><i id="r1b" style="height:8px;border-radius:4px;background:#DADCE0"></i></div>
    <div class="fl">الاسم واللقب</div><div class="in" id="r1n"></div>
    <div class="fl">التخصص</div><div class="in" id="r1s"></div>
    <div class="fl">فكرة المشروع</div><div class="in" id="r1i"></div>
    <div id="r1btn" style="margin-top:22px;height:62px;border-radius:14px;background:#1F1F1F;color:#fff;display:flex;align-items:center;justify-content:center;font:800 30px Cairo">إنشاء الحساب</div>
  </div>
  <div class="fv" id="r1ok" style="left:-330px;top:-360px;width:110px;height:110px;border-radius:50%;background:#1F1F1F;color:#fff;display:flex;align-items:center;justify-content:center;font:900 60px Cairo;box-shadow:0 10px 24px rgba(0,0,0,.25)">✓</div>
</div>`;
// station 2: tear-off calendar (4 Tuesdays) + course ticket
const DAYS=[3,10,17,24];
$('st2').innerHTML=`<div class="o" style="transform:translate3d(180px,-22px,0) rotateX(90deg) rotateZ(3deg)">
  <div class="fv shd" style="left:-230px;top:-200px;width:460px;height:520px"></div>
  <div class="fv" style="left:-180px;top:-230px;width:360px;height:420px;border-radius:16px;background:#E9E5DD;box-shadow:0 4px 0 #D4CEC2"></div>
  ${DAYS.map((d,i)=>`<div class="o calp" style="left:-170px;top:-200px;transform:translateZ(${(DAYS.length-i)*3}px)"><div class="f cal">
     <div style="height:80px;border-radius:14px 14px 0 0;background:#B5463A;color:#fff;display:flex;align-items:center;justify-content:center;font:900 40px Cairo">نوفمبر</div>
     <div style="text-align:center;font:900 170px/1.25 Cairo;color:#1F1F1F">${d}</div>
     <div style="text-align:center;font:700 34px Tajawal;color:#6A6F75">الثلاثاء</div></div>
     <div class="f cal" style="transform:rotateY(180deg);background:#F3F0EA"></div></div>`).join('')}
  <div class="fv" style="left:-140px;top:-216px;width:280px;height:18px;background:repeating-linear-gradient(90deg,#8D9197 0 10px,transparent 10px 22px)"></div>
</div>
<div class="o" style="transform:translate3d(-230px,-20px,60px) rotateX(90deg) rotateZ(-7deg)">
  <div class="fv shd" style="left:-260px;top:-130px;width:520px;height:260px"></div>
  <div class="fv" style="left:-220px;top:-95px;width:440px;height:190px;border-radius:18px;background:#FFFFFF;box-shadow:0 0 0 1px rgba(0,0,0,.06);direction:rtl;text-align:right;padding:22px 28px;-webkit-mask:radial-gradient(circle 14px at 100px 0,transparent 98%,#000) top/100% 51% no-repeat,radial-gradient(circle 14px at 100px 100%,transparent 98%,#000) bottom/100% 51% no-repeat">
    <div style="display:flex;gap:8px"><span style="font:800 20px Cairo;background:#EFE6D2;padding:2px 14px;border-radius:999px">دورة تكوينية</span><span style="font:800 20px Cairo;border:2px solid #CFCFCF;padding:0 14px;border-radius:999px">أونلاين</span></div>
    <div style="font:900 34px Cairo;margin-top:12px;margin-left:96px;white-space:nowrap">ورشة ريادة الأعمال</div>
    <div style="position:absolute;left:100px;top:16px;bottom:16px;border-left:3px dashed #D9D9D9"></div>
  </div>
  <div class="fv" id="tk" style="left:-250px;top:-110px;width:96px;height:96px;border-radius:50%;background:#1F1F1F;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 44px/1 Cairo"><span>✓</span><span style="font:800 18px Cairo;margin-top:2px">مسجّل</span></div>
</div>`;
// station 3: phone (face down → flips → prototype app)
$('st3').innerHTML=`<div class="fv shd" id="phS" style="left:-260px;top:-420px;width:520px;height:840px;transform:translateY(-18px) rotateX(90deg)"></div>
<div class="o" id="ph">
  <div class="f" style="left:-160px;top:-330px;width:320px;height:660px;border-radius:52px;transform:translateZ(-7px) rotateY(180deg);background:linear-gradient(150deg,#D9DBDE,#AEB2B8 60%,#9DA1A7);box-shadow:inset 0 0 0 3px #C4C7CB">
    <div style="position:absolute;left:28px;top:28px;width:120px;height:120px;border-radius:32px;background:#C6C9CD;box-shadow:inset 0 0 0 2px #B3B7BC">
      <i style="position:absolute;left:12px;top:12px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#3a4a5a 0 9px,#0a0a0a 10px 18px,#555 19px)"></i>
      <i style="position:absolute;left:12px;top:64px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#3a4a5a 0 9px,#0a0a0a 10px 18px,#555 19px)"></i></div></div>
  <div class="f" style="left:-160px;top:-330px;width:320px;height:660px;border-radius:52px;background:#0B0B0C;border:9px solid #1A1A1C;box-shadow:inset 0 0 0 2px #3A3A3D;overflow:hidden">
    <div style="position:absolute;inset:6px;border-radius:42px;overflow:hidden;background:#F5F6F8;direction:rtl;text-align:right">
      <div style="position:absolute;left:0;right:0;top:12px;margin:auto;width:96px;height:26px;border-radius:14px;background:#000"></div>
      <div class="ap" style="padding:62px 22px 0"><div style="font:900 32px Cairo;color:#1F1F1F">النموذج الأولي</div><div style="font:700 18px Tajawal;color:#80868B">الإصدار 0.1</div></div>
      <div class="ap" style="margin:16px 22px 0;height:150px;border-radius:20px;background:linear-gradient(135deg,#D7DEE6,#B8C4D1);display:flex;align-items:center;justify-content:center"><svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#6B7A8A" stroke-width="1.6"><path d="M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3zM9.5 19h5M10.5 21.5h3"/></svg></div>
      ${[0,1,2].map(i=>`<div class="ap" style="margin:14px 22px 0;height:62px;border-radius:16px;background:#FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,.08);display:flex;align-items:center;gap:12px;padding:0 14px"><i style="width:36px;height:36px;border-radius:10px;background:#E3E8EE"></i><span style="flex:1"><i style="display:block;height:10px;border-radius:5px;background:#C9D0D8;width:${[80,64,72][i]}%"></i><i style="display:block;height:8px;border-radius:4px;background:#E2E6EB;width:50%;margin-top:8px"></i></span></div>`).join('')}
      <div class="ap" style="position:absolute;left:22px;right:22px;bottom:26px;height:56px;border-radius:16px;background:#1F1F1F;color:#fff;display:flex;align-items:center;justify-content:center;font:800 24px Cairo">ابدأ</div>
      <div style="position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.22),rgba(255,255,255,0) 38%)"></div>
    </div></div>
</div>`;
// chart bars (RTL: idea on the right)
const BAR=[{x:1175,h:150,c:'#C9CCD1',l:'فكرة'},{x:760,h:300,c:'#80868B',l:'نموذج أولي'},{x:345,h:460,c:'#2F3134',l:'مؤسسة ناشئة'}];
$('bars').innerHTML=BAR.map((b,i)=>`<div id="bar${i}" style="position:absolute;bottom:152px;left:${b.x-110}px;width:220px;border-radius:18px 18px 4px 4px;background:${b.c}"></div>
  <div id="bl${i}" style="position:absolute;bottom:58px;left:${b.x-200}px;width:400px;text-align:center;font:900 46px Cairo;color:#1F1F1F">${b.l}</div>`).join('')+
  [968,553].map((x,i)=>`<div id="ba${i}" style="position:absolute;bottom:62px;left:${x-40}px;width:80px;text-align:center;font:900 46px Cairo;color:#9AA0A6">←</div>`).join('');

prepWords($('cap1'));
/* desk: 800px tiles with one continuous grain (a single huge plane gets clipped where it crosses the camera) */
const TS=400,CK=1200,DT=[];
for(let X=-6800;X<7600;X+=CK)for(let Z=-3600;Z<2400;Z+=CK){
  const c=document.createElement('div');c.className='fv';Object.assign(c.style,{left:X+'px',top:Z+'px',width:CK+'px',height:CK+'px'}); // flat chunk = one polygon
  for(let x=X;x<X+CK;x+=TS)for(let z=Z;z<Z+CK;z+=TS){const d=document.createElement('div');d.className='dt';
    const far=cl((-(z+TS/2)-2000)/1400);Object.assign(d.style,{left:(x-X)+'px',top:(z-Z)+'px',backgroundPosition:`${-x-6800}px ${-z-3600}px`,opacity:(1-far*far).toFixed(3)});c.appendChild(d);}
  $('deskFlat').appendChild(c);c.cx=X+300+CK/2;c.cz=Z+CK/2;c.o0=1;DT.push(c);}

/* project a world point through the same CSS camera transform (perspective 2000px) → screen offset from centre */
function project(c,x,y,z){
  const r=PI/180;x-=c.cx;y-=c.cy;z-=c.cz;
  let a=c.rz*r,X=x*Math.cos(a)-y*Math.sin(a),Y=x*Math.sin(a)+y*Math.cos(a);x=X;y=Y;
  a=c.ry*r;X=x*Math.cos(a)+z*Math.sin(a);let Z=-x*Math.sin(a)+z*Math.cos(a);x=X;z=Z;
  a=c.rx*r;Y=y*Math.cos(a)-z*Math.sin(a);Z=y*Math.sin(a)+z*Math.cos(a);y=Y;z=Z+c.dist;
  if(z>1850)return null;const k=2000/(2000-z);return {x:x*k,y:y*k};
}

/* ======================================================================= */
function render(t){
  const [cx,cy,cz,dist,rx,ry,rz]=camAt(t);
  const hx=Math.sin(t*.9)*.35,hy=Math.cos(t*.7)*.3;           // breathing handheld
  $('world').style.transform=`translateZ(${dist}px) rotateX(${rx+hy}deg) rotateY(${ry+hx}deg) rotateZ(${rz}deg) translate3d(${-cx}px,${-cy}px,${-cz}px)`;
  GL.forEach((g,i)=>{g.style.opacity=(.8+.2*Math.sin(t*1.1+i*2))*cl(1-(Math.abs(rx)-40)/25);g.style.visibility=Math.abs(rx)>64?'hidden':'visible';});
  pos($('desk'),300,0,0);
  // only the tiles around the camera target are kept (headless GPU tile budget)
  // keep only the desk tiles the camera actually sees (headless GPU tile budget)
  const cam={cx,cy,cz,dist,rx:rx+hy,ry:ry+hx,rz};
  DT.forEach(d=>{const q=project(cam,d.cx,0,d.cz),v=q&&Math.abs(q.x)<2300&&Math.abs(q.y)<1700?'visible':'hidden';if(d.style.visibility!==v)d.style.visibility=v;});
  PT.forEach(p=>{const dz=Math.abs(p.z-cz);const def=Math.min(3.2,1+dz/900);pos(p.d,p.x+Math.sin(t*.6+p.ph)*40,p.y-t*p.sp,p.z,0,0,0,p.sz/30*def);p.d.style.opacity=p.o/def*(1-P(t,T.flare,.4))*cl(1-(Math.abs(rx)-40)/25);const yy=p.y-t*p.sp,q=project(cam,p.x,yy,p.z),near=!q||project(cam,p.x,yy,p.z+400)===null;p.d.style.visibility=(Math.abs(rx)>64||near||Math.abs(q.x)>1400||Math.abs(q.y)>900)?'hidden':'visible';});

  /* ---- night → morning ---- */
  const dawn=eio(P(t,0,2.2));
  $('night').style.opacity=.78*(1-dawn);
  const sb=lerp(-30,40,P(t,0,6));
  $('sun').style.background=`repeating-linear-gradient(118deg,rgba(255,226,170,0) ${sb}%,rgba(255,226,170,.55) ${sb+6}%,rgba(255,226,170,0) ${sb+14}%,rgba(255,226,170,0) ${sb+20}%)`;
  $('sun').style.opacity=dawn*(1-P(t,8,2));

  /* ================= HOOK: notebook ================= */
  pos($('nb'),N.x,N.y,N.z);show($('nb'),t<12);
  const page={x:4,y:-370};                                        // right page origin (nbFlat local)
  const bp=$('bulbP'),bl=bp.getTotalLength(),pb=eio(P(t,T.bulb,1.6));
  bp.style.strokeDashoffset=1-pb;
  $('rays').style.strokeDashoffset=1-eio(P(t,T.rays,.3));
  const h1=$('h1'),h1w=h1.offsetWidth,pi=P(t,T.idea,1.0);wipe(h1,pi);
  const h2=$('h2'),h3=$('h3'),q1=P(t,T.q1,.35),q2=P(t,T.q2,.55);wipe(h2,q1);wipe(h3,q2);
  // pencil tip path (nbFlat local x,z)
  let tip;
  if(t<T.rays){const pt=bp.getPointAtLength(pb*bl);tip={x:page.x+150+pt.x,y:page.y+96+pt.y};}
  else if(t<T.idea){const e=eio(P(t,T.rays,.3));tip={x:page.x+150+lerp(130,230,e),y:page.y+96+lerp(-38,40,e)};}
  else if(t<T.turn){const ex=564-70-h1w*pi;tip={x:ex,y:page.y+470+60+Math.sin(pi*40)*14};}
  else if(t<T.q1){const e=eio(P(t,T.turn,T.q1-T.turn));tip={x:lerp(564-70-h1w,500,e),y:lerp(page.y+530,page.y+300,e)};}
  else if(t<T.q2){tip={x:500-h2.offsetWidth*q1,y:page.y+300+Math.sin(q1*30)*12};}
  else {const lift=eio(P(t,5.25,.6));tip={x:500-h3.offsetWidth*q2+lift*500,y:page.y+455+Math.sin(q2*40)*12+lift*260};}
  const tipUp=t<T.idea?0:(t>T.turn&&t<T.q1-.05?40*Math.sin(PI*P(t,T.turn,T.q1-T.turn)):0)+(t>5.25?eio(P(t,5.25,.6))*160:0);
  const wob=Math.sin(t*23)*1.2;
  pos($('pencil'),tip.x,-4-tipUp,tip.y);
  $('pencilR').style.transform=`rotateY(${-38+wob}deg) rotateZ(${-34}deg) rotateX(-55deg)`;
  $('pencilS').style.transform=`translate3d(14px,${2+tipUp}px,10px) rotateX(90deg) rotateZ(${38-wob}deg)`;$('pencilS').style.opacity=.5;
  show($('pencil'),t<6.2);
  // page turn (left leaf rotates about the spine onto the right page)
  const tu=eio5(P(t,T.turn,.75));
  $('leaf').style.transform=`translateZ(${1.5+Math.sin(tu*PI)*6}px) rotateY(${tu*180}deg)`;
  const shade=Math.sin(tu*PI);$('leafF').style.filter=`brightness(${1-.12*shade})`;$('leafB').style.filter=`brightness(${1-.12*shade})`;
  show($('leaf'),t<T.lift+.02);

  /* ================= sheet lifts, folds → paper plane ================= */
  const sh=$('sheet');
  const lf=eio(P(t,T.lift,.55)),fd=eio(P(t,T.fold,.45));
  const S0={x:N.x+284,y:-4,z:N.z};
  pos(sh,S0.x+lf*60,S0.y-lf*230,S0.z+lf*40,lerp(90,40,lf),lf*-10,lf*8,lerp(1,.62,fd));
  $('shL').style.transform=`rotateY(${-fd*82}deg)`;$('shR').style.transform=`rotateY(${fd*82}deg)`;
  show(sh,t>=T.lift&&t<T.plane+.08);
  // plane flight: cubic bezier from the folded sheet to the laptop screen
  const pf=P(t,T.plane,T.hit-T.plane),pe=eio(pf);
  const B=[{x:S0.x+60,y:-234,z:S0.z+40},{x:N.x+1250,y:-900,z:N.z+380},{x:-900,y:-760,z:520},{x:SCR.x,y:SCR.y,z:SCR.z+10}];
  const bz=(k,u)=>{const v=1-u;return v*v*v*B[0][k]+3*v*v*u*B[1][k]+3*v*u*u*B[2][k]+u*u*u*B[3][k]};
  const px=bz('x',pe),py=bz('y',pe),pz=bz('z',pe),u2=cl(pe+.01),dx=bz('x',u2)-px,dy=bz('y',u2)-py,dz=bz('z',u2)-pz;
  const yaw=-Math.atan2(dz,dx)*180/PI,pitch=-Math.atan2(dy,Math.hypot(dx,dz))*180/PI,bank=Math.sin(pf*PI*2)*22;
  const pin=P(t,T.hit-.18,.18);
  $('plane').style.transform=`translate3d(${px}px,${py}px,${pz}px) rotateY(${yaw}deg) rotateZ(${pitch}deg) rotateX(${bank}deg) scale(${lerp(lerp(1.3,1.9,Math.sin(pf*PI)),.5,pin)})`;
  show($('plane'),t>=T.plane&&t<T.hit);
  pos($('planeS'),px,-2,pz,0,yaw,0,lerp(.7,1.4,cl(-py/900)));$('planeS').style.opacity=(t>=T.plane&&t<T.hit?.55*(1-cl(-py/1000)):0);

  /* ================= LAPTOP + platform ================= */
  pos($('laptop'),0,0,0);
  $('scrOff').style.opacity=1-P(t,T.hit,.35);
  $('scrFlash').style.opacity=.85*pulse(t,T.hit-.05,.45);
  if(t>T.hit-.1&&t<19){heroLeaves(t);const sw=k=>Math.sin(t*k);$('swL').style.transform=`skewX(${(.5*sw(1.1)+.18*sw(2.3)).toFixed(3)}deg)`;$('swR').style.transform=`skewX(${(-.45*sw(1.3)+.15*sw(2.7)).toFixed(3)}deg)`;}
  pos($('cap1'),0,-790,40);words($('cap1'),T.cap1,t,.09);
  const c1out=eio(P(t,11.0,.5));$('cap1').style.opacity=1-c1out;show($('cap1'),t>T.cap1-.1&&t<11.6);

  /* ================= PILLARS ================= */
  PIL.forEach((p,i)=>{
    const t0=T.pil[i],f=P(t,t0,.75),e=eio(f);
    const land={x:p.x,y:-p.th-44,z:PZ+(i%2?20:-10)};
    const arc=Math.sin(f*PI)*-420;
    const bounce=t>t0+.75?Math.exp(-(t-t0-.75)*9)*Math.sin((t-t0-.75)*24)*-18:0;
    const x=lerp(SCR.x+(i-1.5)*60,land.x,e),y=lerp(SCR.y,land.y,e)+arc+bounce,z=lerp(SCR.z+20,land.z,e);
    const sq=t>t0+.75?1-.08*Math.exp(-(t-t0-.75)*10):1;
    pos(p.g,x,y,z,lerp(-6,90,eio(P(t,t0+.12,.6))),lerp(-14+i*9,0,e),lerp(i%2?8:-8,i%2?-4:3,e),lerp(.25,1,eo(f))*sq);
    show(p.g,t>=t0&&t<19.2);
    pos(p.sh,land.x,-1,land.z,90);p.shd.style.opacity=.55*e;show(p.sh,t>=t0&&t<19.2);
    if(p.c){pos(p.c,land.x+210,0,land.z+40,0,-20,0,Math.max(0,spr(P(t,t0+.45,.6),6,9)));show(p.c,t>=t0+.45&&t<19.2);}
    // label: billboard facing the camera, right-to-left wipe
    pos(p.L,p.x,-40,PZ+390,-(rx),0,0);
    const lp=eio(P(t,t0+.55,.6));wipe(p.Li,lp);p.Li.style.transform=`translateY(${lerp(40,0,lp)}px)`;
    show(p.L,t>=t0+.5&&t<18.9);
  });
  // stamp slams the folder
  const st=T.stamp,dn=eio(P(t,st-.45,.45)),up=eio(P(t,st+.12,.5));
  const F=PIL[3];
  pos(STAMP,F.x-10,lerp(-620,-F.th-4,dn)-up*520+Math.sin(PI*P(t,st,.1))*6,PZ-30,0,-12,0,1);
  show(STAMP,t>st-.5&&t<st+.7);
  const imp=$('imprint');imp.style.opacity=t>=st?1:0;imp.style.transform=`rotate(-8deg) scale(${t>=st?lerp(1.08,1,eo(P(t,st,.25))):1})`;

  /* ================= JOURNEY: overhead flat-lay ================= */
  pos($('jr'),J.x,0,J.z);show($('jr'),t>17.75);
  $('pathI').style.strokeDashoffset=1-eio(P(t,T.path,.6))*.0-0;
  // ink path draws in three legs, each before its station
  const legs=[[T.path,T.s1-.05,0,.02],[T.s1+1.6,T.s2-.05,.02,.5],[T.tick+.4,T.s3,.5,1]];
  let L=0;legs.forEach(([a,b,l0,l1])=>{if(t>=a)L=lerp(l0,l1,eio(P(t,a,b-a)));});
  $('pathI').style.strokeDashoffset=1-L;
  const pth=$('pathI'),ptd=pth.getPointAtLength(L*pth.getTotalLength());
  $('pathDot').setAttribute('cx',ptd.x);$('pathDot').setAttribute('cy',ptd.y);$('pathDot').setAttribute('opacity',t>T.path?1:0);
  const ST=[T.s1,T.s2,T.s3];
  ST.forEach((s,i)=>{const e=P(t,s,.6);
    $('pool'+i).style.opacity=.15+.85*eio(e);
    const sl=$('sl'+i);wipe(sl,eio(P(t,s+.1,.6)));
    $('sn'+i).style.transform=`scale(${Math.max(0,bo(P(t,s,.45)))})`;});
  // station positions on the paper (flat local x,z → world)
  pos($('st1'),SP[0].x,0,SP[0].z);pos($('st2'),SP[1].x,0,SP[1].z);
  // 1. registration card fills itself
  const s1=T.s1,c=s=>`<i class="caret"></i>`;
  const n1=typeStr('أ. ب.',t,s1+.25,10),n2=typeStr('اقتصاد إسلامي',t,s1+.7,18),n3=typeStr('عندي فكرة…',t,s1+1.25,16);
  const on=(a,b)=>t>=a&&t<b;
  $('r1n').innerHTML=n1+(on(s1+.2,s1+.65)?c():'');$('r1n').classList.toggle('on',on(s1+.2,s1+.65));
  $('r1s').innerHTML=n2+(on(s1+.65,s1+1.2)?c():'');$('r1s').classList.toggle('on',on(s1+.65,s1+1.2));
  $('r1i').innerHTML=n3+(on(s1+1.2,s1+1.85)?c():'');$('r1i').classList.toggle('on',on(s1+1.2,s1+1.85));
  $('r1btn').style.transform=`scale(${1-.06*pulse(t,s1+1.95)})`;
  $('r1b').style.background=t>s1+2.0?'#3C4043':'#DADCE0';
  $('r1ok').style.transform=`scale(${Math.max(0,bo(P(t,s1+2.05,.45)))})`;
  // 2. calendar flips its pages, the ticket gets a ✓
  [...document.querySelectorAll('.calp')].forEach((pg,i)=>{if(i>=3){pg.style.transform=`translateZ(${(4-i)*3}px)`;return;}
    const e=eio(P(t,T.s2+.25+i*.3,.42)),g=P(t,T.s2+.25+i*.3+.3,.35);pg.style.transformOrigin='170px 0';pg.style.transform=`translate3d(0,${-g*g*260}px,${(4-i)*3+Math.sin(e*PI)*40+g*120}px) rotateX(${e*176+g*30}deg)`;pg.style.opacity=1-g;pg.style.visibility=g>=1?'hidden':'visible';});
  $('tk').style.transform=`scale(${Math.max(0,bo(P(t,T.tick,.45)))}) rotate(-8deg)`;
  // 3. whip pan + the phone flips from its back to its screen
  const fl=spr(P(t,T.s3,1.0),5,7),lift3=Math.sin(PI*P(t,T.s3,.7));
  pos($('st3'),SP[2].x,0,SP[2].z);
  pos($('ph'),0,-26-lift3*260,0,90,lerp(180,0,fl),lerp(-18,4,fl));
  $('phS').style.opacity=.6-lift3*.35;
  [...document.querySelectorAll('.ap')].forEach((a,i)=>{const e=P(t,T.app+i*.12,.45);a.style.transform=`translateY(${lerp(30,0,spr(e,7,10))}px)`;a.style.opacity=cl(e*3);});
  const jOut=eio(P(t,27.0,.8));
  ['st1','st2','st3'].forEach((id,i)=>{$(id).style.opacity=1-jOut*.0;});

  /* ================= GROWTH: pop-up chart ================= */
  const upc=spr(P(t,T.pop,.9),5,8),down=eio(P(t,T.foldBack,.6));
  pos($('chart'),CH.x,-20,CH.z,lerp(90,0,upc)+90*down,0,0,1);
  show($('chart'),t>=T.pop&&down<1);
  BAR.forEach((b,i)=>{const e=spr(P(t,T.bars[i],.7),6,9);$('bar'+i).style.height=Math.max(0,b.h*e)+'px';
    wipe($('bl'+i),eio(P(t,T.bars[i]+.1,.5)));});
  [0,1].forEach(i=>$('ba'+i).style.opacity=P(t,T.bars[i+1],.3));
  $('trend').style.strokeDashoffset=1-eio(P(t,T.bars[2]+.4,.8));$('trendA').style.opacity=P(t,T.bars[2]+1.1,.15);

  /* ================= LIGHT FLARE + brand reveal ================= */
  const fl2=P(t,T.flare,.9);$('flare').style.opacity=Math.sin(fl2*PI)*.97;$('flare').style.transform=`scale(${lerp(.4,1.7,eo(fl2))})`;
  const sk=P(t,T.flare-.1,.8);$('streak').style.opacity=Math.sin(sk*PI);$('streak').style.transform=`translateX(${lerp(-200,2600,eio(sk))}px)`;
  const after=t>=T.flare+.45;
  pos($('final'),FIN.x,FIN.y,FIN.z);show($('final'),after);
  $('stage').style.background=after?'radial-gradient(90% 110% at 50% 42%,#FFFFFF 0%,#F8F6F1 55%,#ECE7DE 100%)':'';
  show($('jr'),t>17.75&&!after);
  const dk=after?1-.75*eio(P(t,T.flare+.45,.8)):1;if(DT._k!==dk){DT._k=dk;DT.forEach(d=>d.style.opacity=(d.o0*dk).toFixed(3));}show($('pil'),t<19.3);
  // logo: badge springs in, name wipes right→left (Arabic stays connected)
  const lb=P(t,T.logo,.7);$('fBadge').style.transform=`scale(${Math.max(0,spr(lb,6,9))}) rotate(${lerp(-12,0,eo(lb))}deg)`;
  const ln=eio(P(t,T.logo+.25,.9));wipe($('fName'),ln);$('fName').style.display='inline-block';$('fName').style.transform=`translateX(${lerp(-40,0,ln)}px)`;
  $('fRule').style.transform=`scaleX(${eio(P(t,T.uni-.2,.6))})`;
  const fu=eio(P(t,T.uni,.7));wipe($('fUni'),fu);$('fUni').style.transform=`translateY(${lerp(30,0,fu)}px)`;
  const fp=P(t,T.pill,.7);$('fPill').style.transform=`translateY(${lerp(120,0,spr(fp,6,9))}px) scale(${lerp(.85,1,eo(fp))})`;$('fPill').style.clipPath=`inset(${(1-eo(fp))*100}% -40px -40px -40px)`;
  const fw=P(t,T.url,1.0);$('fUrl').textContent=typeStr('incubator-platform-beryl.vercel.app',t,T.url,40);
  const spn=((t-35.4)/1.6)%1;$('shine').style.left=lerp(-200,1000,t>35.4?eio(spn):0)+'px';$('shine').style.opacity=t>35.4?1:0;
}

window.render=render;window.DUR=DUR;window.T=T;
window.ready=(async()=>{
  await Promise.all(['900 40px Cairo','800 40px Cairo','700 40px Tajawal','700 40px "Reem Kufi"','700 40px "Aref Ruqaa"'].flatMap(f=>[document.fonts.load(f,'ابت'),document.fonts.load(f,'Abc')]));
  await document.fonts.ready;
  await new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src='img/hero-desktop.jpg';});
  render(0);return true;})();
