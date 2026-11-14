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
const fx=(el,o=1,b=0)=>{el.style.opacity=o;el.style.filter=b>.3?`blur(${b.toFixed(1)}px)`:'none'};
const pulse=(t,tc,d=.16)=>Math.sin(PI*P(t,tc,d));

const OFF=1.4, CORE=29.6;           // total = 31 s
const SCR={x:0,y:-325,z:0};
const SH={x:560,y:1250,z:-250,ry:-14};
const CALC={x:560,y:1660,z:-250};
const ROADY=3060;
const PH={x:-1500,y:2450,z:-900,ry:18};
const H={x:-550,y:3060};             // flat-lay desk centre (same ground as the road)
const FY=3060;
const FL0=19.6;                      // flat-lay start
const ROWY=-340+178+44;
const D=-0.85;                       // dropdown timing shift

/* van path */
function TX(t){
  if(t<9.0)return 1800;
  if(t<11.4)return lerp(1800,500,spr(P(t,9.0,1.3),6,7));
  if(t<14.4){const u=P(t,11.4,3.0),d=3.0,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*500+(-2*u3+3*u2)*-1150+(u3-u2)*d*-1000;}
  const k=Math.min(t,15.6)-14.4;return -1150-1000*k-900*k*k;
}

const CAM=[
 [-2.6,  0,-360,   0,-1300, -34, 30, -3],
 [-1.4,  0,-340,   0,-1000, -30, 24, -2],
 [ 0.0,  0,-330,   0, -650, -19, 18, -1],
 [ 1.3,  0,-330,   0, -120, -11,  6,  0],
 [ 2.3, -170,-335,  0, 250,  -6, -4,  0],
 [ 3.2,  -60,-325, 30, 120,  -6, -6,  0],
 [ 3.6,  -40,-330, 40, -60,  -6, -8,  1],
 [ 4.4,  280, 420,-120,-520,   2,-16,  2],
 [ 5.4,  520,1150,-250, -20,  -2,  9, -1],
 [ 5.9,  500,1190,-250,  60,  -3, 12,  0],
 [ 6.5,  360,1210,-250, 170,  -3, 10,  0],
 [ 7.3,  430,1300,-250,  20,  -5, 12,  0],
 [ 8.1,  560,1640,-250, -90, -14, 12,  0],
 [ 9.2,  560,1560,-250,-150, -10,  9,  0],
 [10.2,  540,2250, -80,-520, -12,  3,  1],
 [11.0,  500,2780,   0,-280, -15,  0,  0],
 [12.8, -300,2770,   0,-380, -12, -3,  0],
 [14.1,-1150,2790,   0,-320, -11, -7,  0],
 [14.8,-1500,2500,-900, -60,  -3,-24,  0],
 [16.5,-1500,2510,-900, -10,  -2,-14,  0],
 [18.4,-1500,2500,-900, -60,  -3,-20,  0],
 [19.5,-1480,2470,-900,-180,  -6,-15,  0],
 [21.0,  H.x,FY,   60,-1000, -58,  4,  0],
 [21.9,  H.x,FY,   60, -950, -55, -4,  0],
 [22.9,  H.x,FY-330,950,-520, -14,  0,  0],
 [24.4,  H.x,FY-330,950,-480, -12,  4,  0],
 [25.6,  H.x,FY-1150,700, -40,   2, -2,  0],
 [29.6,  H.x,FY-1150,700,  10,   2,  3,  0],
 [31.0,  H.x,FY-1150,700,  15,   2,  4,  0],
];
function camAt(t){
  const K=CAM;let i=0;while(i<K.length-2&&t>K[i+1][0])i++;
  const k0=K[Math.max(0,i-1)],k1=K[i],k2=K[i+1],k3=K[Math.min(K.length-1,i+2)];
  const u=cl((t-k1[0])/(k2[0]-k1[0])),u2=u*u,u3=u2*u,d=k2[0]-k1[0];
  const out=[];
  for(let c=1;c<8;c++){
    const m1=(k2[c]-k0[c])/(k2[0]-k0[0]||1)*d, m2=(k3[c]-k1[c])/(k3[0]-k1[0]||1)*d;
    out.push((2*u3-3*u2+1)*k1[c]+(u3-2*u2+u)*m1+(-2*u3+3*u2)*k2[c]+(u3-u2)*m2);
  }
  const w=eio(P(t,10.9,.7))*(1-eio(P(t,13.8,.5)));
  out[0]=lerp(out[0],TX(t-.12)-60,w);
  return out;
}

/* bokeh dust & light pools */
let seed=11;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
const PT=[];
for(let i=0;i<90;i++){const d=document.createElement('div');d.className='f pt';
  const z=lerp(-1600,900,rnd()),sz=lerp(8,26,rnd());
  Object.assign(d.style,{width:sz+'px',height:sz+'px',background:i%4?'#FFFFFF':'#F3C9A6'});
  $('pts').appendChild(d);PT.push({d,x:lerp(-2600,1700,rnd()),y:lerp(-1500,4400,rnd()),z,sp:lerp(8,30,rnd()),ph:rnd()*6,o:lerp(.35,.8,rnd())});}
const GL=[[0,-350,-600,1700,.9],[560,1300,-800,1800,.8],[-300,2900,-900,2000,.7],[-1500,2450,-1300,1800,.85],[H.x,FY-900,-600,2400,.8]].map(([x,y,z,s,a])=>{
  const d=document.createElement('div');d.className='f';Object.assign(d.style,{left:-s/2+'px',top:-s/2+'px',width:s+'px',height:s+'px',borderRadius:'50%',background:`radial-gradient(closest-side,rgba(255,255,255,${a}),rgba(255,255,255,0))`});
  $('glows').appendChild(d);pos(d,x,y,z);return d;});

/* road signs */
const SIGNX=[250,-230,-700,-1150],SIGNN=['Yalidine','ZR Express','DHD','World Express'];
const SIGNT=SIGNX.map(x=>{for(let t=9;t<16;t+=.01)if(TX(t)<x+420)return t;return 99;});
const SG=SIGNX.map((x,i)=>{const o=document.createElement('div');o.className='o';
  o.innerHTML=`<div class="f" style="left:-6px;top:-220px;width:12px;height:220px;background:linear-gradient(90deg,#B8BBC0,#E6E7E9,#A9ADB3);border-radius:6px"></div><div class="f sign">${SIGNN[i]} <span class="chk">✓</span></div>`;
  $('signs').appendChild(o);return o;});
const SPD=[0,1,2,3].map(i=>{const d=document.createElement('div');d.className='f';d.style.cssText=`left:0;top:${-300+i*70}px;width:${[260,180,300,160][i]}px;height:8px;border-radius:8px;background:rgba(120,110,100,.35)`;$('speed').appendChild(d);return d;});

/* parcel box (kraft cardboard cube) */
const BS=170,BH=BS/2;
[['translateZ','',BH,'#C9A274'],['rotateY(180deg) translateZ','',BH,'#B48D60'],['rotateY(90deg) translateZ','',BH,'#BC956A'],['rotateY(-90deg) translateZ','',BH,'#BC956A'],['rotateX(90deg) translateZ','',BH,'#D8B489'],['rotateX(-90deg) translateZ','',BH,'#A98257']].forEach(([tr,_,h,c],i)=>{
  const f=document.createElement('div');f.className='f';
  f.style.cssText=`left:${-BH}px;top:${-BH}px;width:${BS}px;height:${BS}px;background:${c};transform:${tr}(${h}px);box-shadow:inset 0 0 0 2px rgba(90,60,30,.25)`;
  f.innerHTML=i===4||i===0?`<div style="position:absolute;left:${BS/2-16}px;top:0;bottom:0;width:32px;background:rgba(240,225,200,.7)"></div>`:'';
  if(i===0)f.innerHTML+=`<div style="position:absolute;left:18px;bottom:18px;font-family:Tajawal;font-weight:700;font-size:20px;color:#5a3e22;direction:ltr">#1042</div>`;
  $('box').appendChild(f);});

/* links lying on the desk (svg x→x, y→z) */
const NS='http://www.w3.org/2000/svg';
const LP=['M120 -330 C 300 -330, 430 -300, 430 -200','M430 200 C 430 420, 300 560, 140 600','M-140 600 C -330 600, -430 480, -430 330',
          'M0 -120 L0 -300','M120 0 L200 0','M0 120 L0 470','M-120 0 L-270 0'];
const LINKS=LP.map((d,i)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('fill','none');
  p.setAttribute('stroke',i<3?'#2B2B2B':'#BDB6AC');p.setAttribute('stroke-width',i<3?10:6);p.setAttribute('stroke-linecap','round');
  p.setAttribute('pathLength','1');p.setAttribute('stroke-dasharray','1');p.setAttribute('stroke-dashoffset','1');$('lsvg').appendChild(p);return p;});
const PUL=[];for(let i=0;i<6;i++){const c=document.createElementNS(NS,'circle');c.setAttribute('r','16');c.setAttribute('fill','#E8792B');c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','5');$('lsvg').appendChild(c);PUL.push(c);}

function words(capId,t0,t,stg=.09,tout=99){
  const ox=P(t,tout,.45);
  [...$(capId).querySelectorAll('.w')].forEach((w,i)=>{
    const e=P(t,t0+i*stg,.7),k=spr(e,6,9);
    w.style.transform=`translateY(${lerp(70,0,k)-eio(ox)*60}px) rotateX(${lerp(-80,0,eo(e))}deg)`;
    w.style.opacity=cl(e*3)*(1-ox);const b=(1-eo(e))*10+ox*12;w.style.filter=b>.3?`blur(${b}px)`:'none';
  });
}
const typeStr=(s,t,t0,cps)=>{const n=Math.floor(cl((t-t0)*cps,0,s.length));return [...s].slice(0,n).join('')};
const show=(el,v)=>el.style.display=v?'':'none';

function render(T){
  const t=T-OFF;
  const [cx,cy,cz,dist,rx,ry,rz]=camAt(t);
  const hx=Math.sin(t*.9)*.6,hy=Math.cos(t*.7)*.5;
  $('world').style.transform=`translateZ(${dist}px) rotateX(${rx+hy}deg) rotateY(${ry+hx}deg) rotateZ(${rz}deg) translate3d(${-cx}px,${-cy}px,${-cz}px)`;
  pos($('bgo'),0,0,-2200);
  PT.forEach(p=>{const y=p.y-t*p.sp,dz=Math.abs(p.z-cz);pos(p.d,p.x+Math.sin(t*.6+p.ph)*40,y,p.z);fx(p.d,p.o,Math.min(18,3+dz/60));});
  GL.forEach((g,i)=>{g.style.opacity=(.8+.2*Math.sin(t*1.1+i*2))*(1-P(t,FL0-.6,.4));g.style.display=t>FL0-.2?'none':'';});
  const sw=((T+1.5)%6.5)/2.2;$('sweep').style.background=sw<1?`linear-gradient(115deg,rgba(255,255,255,0) ${lerp(-20,100,sw)}%,rgba(255,255,255,.55) ${lerp(-10,110,sw)}%,rgba(255,255,255,0) ${lerp(0,120,sw)}%)`:'none';

  const fl=i=>eio(P(t,FL0+i*.14,1.5));        // flat-lay progress per station

  /* hook */
  const hx2=eio(P(T,1.2,.5));$('hook').style.transform=`scale(${1+T*.04+hx2*.5})`;$('hook').style.opacity=1-hx2;$('hook').style.filter=hx2>.01?`blur(${hx2*18}px)`:'none';show($('hook'),T<=1.75);
  words('hook',.05,T,.11,1.25);

  /* ---- laptop ---- */
  const f0=fl(0);
  pos($('deskO'),0,0,0);$('desk').style.opacity=1-P(t,4,1);show($('desk'),t<5.2);
  pos($('cap1'),0,-860,60);words('cap1',.55,t,.09,3.3);
  pos($('laptop'),lerp(0,H.x,f0),lerp(0,FY,f0),lerp(0,-700,f0),0,lerp(0,8,f0),0,lerp(1,.55,f0));
  const lid=spr(P(t,.05,1.25),5.5,8);
  $('lid').style.transform=`rotateX(${lerp(-90,0,lid)+90*f0}deg)`;
  $('scrOff').style.opacity=1-P(t,.75,.35);
  const CP=[[700,560],[520,330],[520,330],[230,300],[230,300],[230,300],[230,515],[300,600]];
  const CT=[.7,1.35,1.55,1.85,2.0,2.95,3.2,3.6];
  let cxp=CP[0][0],cyp=CP[0][1];
  for(let i=0;i<CT.length-1;i++){if(t>=CT[i]){const e=eio(P(t,CT[i],CT[i+1]-CT[i]));cxp=lerp(CP[i][0],CP[i+1][0],e);cyp=lerp(CP[i][1],CP[i+1][1],e);}}
  $('cur').style.transform=`translate(${cxp}px,${cyp}px) scale(${1-.2*Math.max(pulse(t,1.4),pulse(t,3.05))})`;
  $('cur').style.opacity=cl((t-.8)*4)*(1-P(t,3.25,.2));
  $('buy').style.transform=`scale(${1-.08*pulse(t,1.42)})`;
  const r1=P(t,1.48,.55);$('buyRip').style.transform=`scale(${eo(r1)*9})`;$('buyRip').style.opacity=r1>0?.8*(1-r1):0;
  $('form').style.transform=`translateX(${lerp(-470,0,spr(P(t,1.55,.6),7,10))}px)`;
  const T0=typeStr('أمين ب.',t,1.75,14),T1=typeStr('0550 12 34 56',t,2.15,26),T2=typeStr('وهران',t,2.65,14);
  const caret='<i class="caret"></i>';
  $('f0').innerHTML=T0+(t>=1.7&&t<2.15?caret:'');$('f0').classList.toggle('on',t>=1.7&&t<2.15);
  $('f1').innerHTML=T1+(t>=2.15&&t<2.65?caret:'');$('f1').classList.toggle('on',t>=2.15&&t<2.65);
  $('f2t').innerHTML=T2+(t>=2.65&&t<3.0?caret:'');$('f2').classList.toggle('on',t>=2.65&&t<3.0);
  $('conf').style.transform=`scale(${1-.08*pulse(t,3.07)})`;
  const r2=P(t,3.12,.5);$('confRip').style.transform=`scale(${eo(r2)*12})`;$('confRip').style.opacity=r2>0?.8*(1-r2):0;
  $('confT').textContent=t>3.15?'✓ تم الطلب':'تأكيد الطلب';
  const sc=P(t,3.2,.35);
  $('scard').style.transform=`scale(${lerp(.6,1,spr(sc,7,10))})`;$('scard').style.opacity=t<3.62?cl(sc*3):0;
  $('scard').style.boxShadow=`0 20px 50px rgba(0,0,0,${.25*sc}),0 0 0 ${sc*3}px rgba(232,121,43,.6)`;
  const uiB=sc*(1-P(t,6,1));$('ui').style.filter=uiB>0.01?`blur(${uiB*5}px) brightness(${1-uiB*.15})`:'none';

  /* ---- sheet ---- */
  const sb=P(t,3.85,1.0),sbs=spr(sb,6,9),f1=fl(1);
  pos($('sheet'),lerp(SH.x,H.x+430,f1),lerp(SH.y+lerp(260,0,eo(sb)),FY-10,f1),lerp(SH.z,0,f1),lerp(lerp(-35,0,sbs),90,f1),lerp(SH.ry+lerp(25,0,sbs),0,f1),lerp(0,-5,f1),lerp(1,.45,f1)*lerp(.7,1,sbs));
  fx($('shF'),cl(sb*2.5));
  [...$('hdr').children].forEach((c,i)=>{const e=P(t,4.2+i*.05,.45);c.style.transform=`translateY(${lerp(-50,0,spr(e,7,10))}px)`;c.style.opacity=cl(e*3);});
  const push=spr(P(t,5.05,.6),7,10)*88;
  ['rA','rB','rC'].forEach((id,i)=>{const e=P(t,4.45+i*.1,.45);$(id).style.transform=`translate(${lerp(-120,0,eo(e))}px,${push}px)`;$(id).style.opacity=cl(e*2.5);});
  ['nA','nB','nC'].forEach((id,i)=>$(id).textContent=(t>5.2?i+3:i+2));
  const land=P(t,5.25,.35);
  $('rN').style.opacity=land>0?1:0;
  const conf=t>=8.1+D;
  $('rNhl').style.opacity=cl(.15+.85*(1-P(t,5.6,1.3))+.8*(1-P(t,8.1+D,1.0))*(conf?1:0)+.7*pulse(t,9.1,.4));
  const bn=$('bNew');bn.className='badge '+(conf?'b-ok':'b-new');bn.textContent=conf?'Confirmée':'Nouvelle';
  bn.style.transform=`scale(${conf?lerp(1.4,1,spr(P(t,8.1+D,.6),6,10)):1})`;
  const mo=spr(P(t,7.3+D,.4),7,10)*(1-eio(P(t,8.05+D,.2)));
  $('menu').style.transform=`scaleY(${Math.max(0,mo)})`;$('menu').style.opacity=cl(mo*3);
  const hv=t<7.65+D?0:t<8.05+D?1:-1;
  [0,1,2,3].forEach(i=>$('mi'+i).style.background=i===hv?'#F1F3F4':'transparent');
  const c2a=eio(P(t,6.6+D,.6)),c2b=eio(P(t,7.6+D,.3)),c2c=eio(P(t,8.35+D,.6));
  const c2x=lerp(lerp(lerp(620,95,c2a),95,c2b),420,c2c),c2y=lerp(lerp(lerp(600,225,c2a),355,c2b),640,c2c);
  $('cur2').style.transform=`translate(${c2x}px,${c2y}px) scale(${1-.2*Math.max(pulse(t,7.22+D),pulse(t,7.98+D))})`;
  $('cur2').style.opacity=cl((t-6.5-D)*5)*(1-P(t,8.6+D,.3));
  pos($('cap2'),SH.x,SH.y-560,SH.z+40,0,SH.ry);words('cap2',5.15,t,.08,8.0);
  const gw=pulse(t,8.1,1.2);$('cW').style.background=`rgba(232,121,43,${.25*gw})`;$('wil').style.boxShadow=`0 0 0 ${gw*12}px rgba(232,121,43,${gw*.25})`;

  /* calc card */
  const ca=P(t,7.3,.7);
  pos($('calc'),CALC.x,CALC.y,CALC.z,0,SH.ry);
  $('calcF').style.transform=`rotateX(${lerp(-95,0,spr(ca,6,9))+eio(P(t,11.6,.6))*-95}deg)`;$('calcF').style.opacity=cl(ca*3)*(1-P(t,11.9,.3));
  $('v1').textContent=Math.round(3900*eo(P(t,7.8,.8))/10)*10;
  $('v2').textContent=Math.round(600*eo(P(t,8.1,.8))/10)*10;
  $('v3').textContent=Math.round(4500*eo(P(t,8.45,.9))/10)*10;

  /* ---- card 1 : laptop -> sheet ---- */
  const lift=P(t,3.55,.55),fly=P(t,4.05,1.25),L=eio(lift),F=eio5(fly);
  const rowW={x:SH.x,y:SH.y+ROWY,z:SH.z+4};
  const x=lerp(SCR.x,rowW.x,F)+Math.sin(F*PI)*-260, y=lerp(SCR.y-L*40,rowW.y,F)-Math.sin(F*PI)*120, z=lerp(SCR.z+L*380,rowW.z,F)+Math.sin(F*PI)*260;
  const m=eo(land),cw=lerp(560,950,m),ch=lerp(176,88,m),cf=$('cardF');
  cf.style.width=cw+'px';cf.style.height=ch+'px';cf.style.margin=`${-ch/2}px 0 0 ${-cw/2-m*25}px`;cf.style.borderRadius=lerp(28,0,m)+'px';
  cf.style.background=m>0?`rgb(${lerp(255,230,m)},${lerp(255,244,m)},${lerp(255,234,m)})`:'#fff';
  [...cf.children].forEach(c=>c.style.opacity=1-cl(m*2));
  pos($('card'),x,y,z,Math.sin(F*PI)*18-L*(1-F)*8,lerp(lerp(0,-18,L),SH.ry,F)+Math.sin(F*PI)*-25,Math.sin(F*PI)*-10-L*(1-F)*4);
  fx(cf,t<3.62||t>6?0:1-P(t,5.45,.25));
  cf.style.boxShadow=`0 ${lerp(20,60,Math.sin(F*PI))}px ${lerp(40,90,Math.sin(F*PI))}px rgba(40,30,20,${.18+.12*Math.sin(F*PI)}),0 0 0 3px rgba(232,121,43,${.8*(1-m)})`;
  trail(t);

  /* ---- NEW: row folds into a parcel and drops into the van ---- */
  const rl=P(t,9.2,.5),rle=eio(rl);
  const c2f=$('card2F');
  const pw=lerp(950,BS,rle),ph=lerp(88,BS,rle);
  c2f.style.width=pw+'px';c2f.style.height=ph+'px';c2f.style.margin=`${-ph/2}px 0 0 ${-pw/2}px`;
  c2f.style.borderRadius=lerp(0,8,rle)+'px';c2f.style.background=`rgb(${lerp(230,201,rle)},${lerp(244,162,rle)},${lerp(234,116,rle)})`;
  [...c2f.children].forEach(c=>c.style.opacity=1-cl(rle*2));
  pos($('card2'),rowW.x,rowW.y-rle*60,rowW.z+rle*260,0,lerp(SH.ry,0,rle),rle*-8);
  fx(c2f,t>=9.2&&t<9.72?1:0);c2f.style.boxShadow=`0 30px 60px rgba(40,30,20,.25),0 0 0 3px rgba(232,121,43,${1-rle})`;
  const tx=TX(t);
  const fe=P(t,9.72,1.05),g=fe*fe;                         // gravity
  const roof={x:500,y:ROADY-340-BH,z:0};
  let bx=lerp(rowW.x,roof.x,eio(fe)),by=lerp(rowW.y-60,roof.y,g),bz=lerp(rowW.z+260,roof.z,eio(fe)),bs=1,bo2=1;
  const hop=P(t,10.77,.32);by-=Math.sin(hop*PI)*90;           // bounce on the roof
  const sink=eio(P(t,11.1,.35));by+=sink*170;bs=lerp(1,.8,sink);bo2=1-sink;
  pos($('box'),bx,by,bz,fe*-260-hop*40,fe*200+hop*90,fe*40,bs*(1-.12*pulse(t,10.77,.12)));
  [...$('box').children].forEach(f=>f.style.opacity=(t>=9.72&&t<11.45)?bo2:0);
  show($('box'),t>=9.72&&t<11.45);

  /* ---- road / van / signs ---- */
  const roadO=cl((t-9.0)*1.5)*(1-eio(P(t,FL0-.3,.6)));
  pos($('road'),0,ROADY,0);$('roadF').style.opacity=roadO;
  const f3=fl(3);
  const bump=Math.sin(PI*P(t,11.1,.35));
  const drv=t>11.4&&t<15.6?Math.sin(t*40)*2:0;
  pos($('truck'),lerp(tx,H.x,f3),lerp(ROADY,FY,f3)-bump*18+drv,lerp(0,640,f3),0,lerp(0,-22,f3),0,lerp(1,.5,f3));
  $('truck').style.transform+=` scaleY(${1-.06*bump})`;
  [...$('truck').children].forEach(f=>f.style.opacity=t<8.8?0:1);
  $('cargoFlash').style.opacity=.7*pulse(t,11.15,.4);
  const wr=-(tx-1800)/60*180/PI;$('wh1').style.transform=`translateZ(134px) rotate(${wr}deg)`;$('wh2').style.transform=`translateZ(134px) rotate(${wr}deg)`;
  const vel=Math.abs(TX(t)-TX(t-.05))/.05;
  pos($('speed'),tx+300,ROADY-60,140);
  SPD.forEach((d,i)=>{const ph2=(t*2.6+i*.31)%1;d.style.transform=`translateX(${ph2*320}px) scaleX(${1-ph2*.6})`;d.style.opacity=cl(vel/900)*(1-ph2)*(1-f3);});
  SG.forEach((o,i)=>{const e=P(t,SIGNT[i],.6);pos(o,SIGNX[i],ROADY,-330,0,0,0,Math.max(0,spr(e,6,9)));
    [...o.children].forEach(f=>f.style.opacity=(e>0?1:0)*(1-eio(P(t,14.6,.5))));show(o,t<15.2);
    o.querySelector('.chk').style.transform=`scale(${Math.max(0,bo(P(t,SIGNT[i]+.35,.4)))})`;});
  pos($('cap3'),-250,ROADY-860,-300);words('cap3',11.5,t,.1,13.9);

  /* ---- NEW: whip pan + phone flips from back to screen ---- */
  const f2=fl(2);
  const AR=[15.9,17.0,18.2,18.9];let prot=0;AR.forEach(ti=>{if(t>ti)prot+=Math.exp(-(t-ti)*5)*Math.sin((t-ti)*26)*2.2});
  const flip=spr(P(t,14.45,1.1),5,7);
  pos($('phone'),lerp(PH.x,H.x-430,f2),lerp(PH.y+lerp(-200,0,eio(P(t,14.2,.6))),FY-285,f2),lerp(PH.z,-40,f2),lerp(0,-6,f2),lerp(PH.ry+lerp(180,0,flip),24,f2),prot+lerp(-14,0,flip),lerp(1,.45,f2));
  const pv=t<14.2?0:cl((t-14.2)*5);$('phF').style.opacity=pv;$('phBack').style.opacity=pv;show($('phBack'),t<15.8);show($('phone'),t>=14.2);
  AR.forEach((ti,i)=>{const b=$('bb'+i);b.style.display=t>=ti?'block':'none';const p=P(t,ti,.5);
    b.style.transform=p>=1?'none':`scale(${Math.max(0,spr(p,7,11))})`;b.style.opacity=cl(p*4);});
  const TW=[[15.35,15.9],[16.4,17.0],[17.6,18.2]],tw=TW.find(([a,b])=>t>=a&&t<b),typ=$('typ');
  typ.style.display=tw?'flex':'none';$('waSt').textContent=tw?'يكتب…':'متصل';
  if(tw){[...typ.children].forEach((d,i)=>d.style.transform=`translateY(${-Math.max(0,Math.sin(t*14-i*.9))*9}px)`);typ.style.transform=`scale(${spr(P(t,tw[0],.35),7,11)})`;}
  pos($('cap4'),PH.x+40,PH.y-830,PH.z+30,0,PH.ry);words('cap4',15.7,t,.1,19.4);

  /* ---- NEW: overhead flat-lay on the desk ---- */
  pos($('desk2'),H.x,FY+40,0);$('desk2F').style.opacity=eio(P(t,FL0-.2,.8));show($('desk2F'),t>FL0-.25);
  pos($('links'),H.x,FY+20,0,90);
  LINKS.forEach((p,i)=>p.setAttribute('stroke-dashoffset',1-eio(P(t,20.7+i*.1,.7))));
  PUL.forEach((c,i)=>{const pth=LINKS[i%3];const u=((t-21.4)*.65+i*.17)%1;const on=t>21.4;const pt=pth.getPointAtLength(u*pth.getTotalLength());
    c.setAttribute('cx',pt.x);c.setAttribute('cy',pt.y);c.setAttribute('opacity',on?Math.sin(u*PI)*cl((t-21.4)*2):0);});
  const hp=spr(P(t,20.3,.9),6,9);
  pos($('hub'),H.x,FY-14,0,90,0,0,Math.max(0,hp)*.8);
  ['hubGlow','hubRing','hubC'].forEach(id=>$(id).style.opacity=t<20.3?0:1);show($('hub'),t>=20.3);
  $('hubRing').style.transform=`rotate(${t*30}deg)`;

  /* ---- NEW: chart pops up from the desk like a pop-up book, then folds back ---- */
  const up=spr(P(t,21.9,.9),5,8),down=eio(P(t,24.5,.6));
  pos($('chart'),H.x,FY,950,lerp(90,0,up)+90*down,0,0,.95);
  $('chartF').style.opacity=t<21.9||down>=1?0:1;
  $('rnum').textContent=Math.round(lerp(35,8,eio(P(t,22.5,1.4))))+'%';
  [.98,.8,.62,.46,.32,.2].forEach((h,i)=>$('b'+i).style.height=(400*h*eo(P(t,22.3+i*.08,.6)))+'px');
  $('tl').style.strokeDashoffset=1-eio(P(t,22.8,.8));$('tla').style.opacity=P(t,23.5,.15);
  pos($('cap5'),H.x,FY-880,950);words('cap5',22.5,t,.12,24.4);
  show($('dimF'),false);
  ['roadF','calcF','chartF','cardF','card2F'].forEach(id=>{const e=$(id);e.style.display=(+e.style.opacity>0.001)?'block':'none';});

  /* ---- NEW: light flare reveal of the logo ---- */
  const fl2=P(t,24.75,.9);$('flare').style.opacity=Math.sin(fl2*PI)*.95;$('flare').style.transform=`scale(${lerp(.4,1.6,eo(fl2))})`;
  pos($('final'),H.x,FY-1150,700);
  const tf=t-(-6.6);   // final animations start ≈ core 25.2
  [...$('logoT').children].forEach((w,i)=>{const e=P(t,25.15+i*.06,.7),k=spr(e,6,9);w.style.transform=`translateY(${lerp(120,0,k)}px) scale(${lerp(1.6,1,eo(e))})`;w.style.opacity=cl(e*3);w.style.filter=e<1?`blur(${(1-eo(e))*16}px)`:'none';});
  const fs=P(t,25.7,.6);$('fSub').style.opacity=fs;$('fSub').style.letterSpacing=lerp(30,8,eo(fs))+'px';
  [...$('fSlog').querySelectorAll('.w')].forEach((w,i)=>{const e=P(t,25.95+i*.12,.7),k=spr(e,6,9);w.style.transform=`translateY(${lerp(80,0,k)}px) rotateX(${lerp(-80,0,eo(e))}deg)`;w.style.opacity=cl(e*3);w.style.filter=e<1?`blur(${(1-eo(e))*10}px)`:'none';});
  [['fC1',26.8],['fC2',27.05]].forEach(([id,s])=>{const e=P(t,s,.7);$(id).style.transform=`translateY(${lerp(120,0,spr(e,6,9))+Math.sin(t*2+s)*5}px)`;$(id).style.opacity=cl(e*2.5);});
  const sp=((t-27.6)/1.4)%1;$('shine').style.left=lerp(-160,700,t>27.6?sp:0)+'px';$('shine').style.opacity=t>27.6?1:0;
}

const TR=[];for(let i=0;i<12;i++){const d=document.createElement('div');d.className='f';d.style.cssText='left:-12px;top:-12px;width:24px;height:24px;border-radius:50%;background:#E8792B';$('trail').appendChild(d);TR.push(d);}
function trail(t){
  const rowW={x:SH.x,y:SH.y+ROWY,z:SH.z+4};
  TR.forEach((d,i)=>{
    const tt=t-i*.03;
    const fl=eio5(P(tt,4.05,1.25)),Li=eio(P(tt,3.55,.55));
    const x=lerp(SCR.x,rowW.x,fl)+Math.sin(fl*PI)*-260,y=lerp(SCR.y-Li*40,rowW.y,fl)-Math.sin(fl*PI)*120,z=lerp(SCR.z+Li*380,rowW.z,fl)+Math.sin(fl*PI)*260;
    pos(d,x,y,z,0,0,0,1-i/14);d.style.opacity=(tt<6&&fl>.02&&fl<.97)?(1-i/12)*.55:0;
  });
}

window.render=render;window.DUR=CORE+OFF;
window.ready=(async()=>{
  await Promise.all(['800 40px Cairo','900 40px Cairo','600 40px Cairo','700 40px Tajawal'].flatMap(f=>[document.fonts.load(f,'ابت'),document.fonts.load(f,'Abc')]));
  await document.fonts.ready;render(0);return true;})();
