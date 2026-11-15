/* Campus-model film — one CSS-3D world, one keyframed camera, every frame computed in render(t).
   Coordinates: x → right, y → down (ground of the model board = 0, up is negative), z → toward the first camera. */
const $ = (id) => document.getElementById(id);
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const P = (t, s, d) => cl((t - s) / d);
const lerp = (a, b, e) => a + (b - a) * e;
const PI = Math.PI, D2R = PI / 180;
const es = (x) => 0.5 - 0.5 * Math.cos(PI * cl(x));                       // sine in-out
const eio = (x) => (x = cl(x), x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);   // cubic in-out
const eo3 = (x) => 1 - Math.pow(1 - cl(x), 3);
const spr = (x, k = 5, w = 6) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-k * x) * Math.cos(w * x);   // one soft overshoot
const pulse = (t, a, d) => Math.sin(PI * P(t, a, d));
const T3 = (x, y, z) => `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px)`;
const W1 = $('world'), W2 = $('world2');
const DUR = 45.5;

/* ------------------------------------------------------------------ helpers */
function mk(parent, cls, css, html) {
  const d = document.createElement('div'); if (cls) d.className = cls;
  if (css) d.style.cssText = css; if (html) d.innerHTML = html; parent.appendChild(d); return d;
}
function grp(parent, x = 0, y = 0, z = 0, extra = '') { const g = mk(parent, 'o'); g.style.transform = T3(x, y, z) + ' ' + extra; return g; }
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

/* warm sun from the left, slightly from the front, fairly low; cool sky fill */
const LIGHT = (() => { const v = [-0.8, -0.62, 0.42], n = Math.hypot(...v); return v.map((c) => c / n); })();
function shade(rgb, n) {     // n = world normal of the face
  const d = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
  const sky = 0.70 + 0.10 * Math.max(0, -n[1]);
  const r = rgb[0] * (sky * .96 + d * .36 * 1.04), g = rgb[1] * (sky * .98 + d * .36 * .97), b = rgb[2] * (sky * 1.03 + d * .36 * .84);
  return `rgb(${Math.min(255, r) | 0},${Math.min(255, g) | 0},${Math.min(255, b) | 0})`;
}
const CARD = [246, 242, 233], BALSA = [228, 205, 160], WOOD2 = [196, 160, 114], CORK = [200, 164, 120], GREY = [214, 210, 202];
const rotN = (n, ay) => [n[0] * Math.cos(ay) + n[2] * Math.sin(ay), n[1], -n[0] * Math.sin(ay) + n[2] * Math.cos(ay)];

/* static shadow list (drawn once into the board canvas) */
const SHADOWS = [];
const SX = 0.95, SZ = 0.32;            // ground offset of a point per unit of height (sun from the left)

/* a box: base centre (x, yb, z), size w (x) × d (z) × h (up), optional yaw (deg) */
function box(parent, o) {
  const { x = 0, yb = 0, z = 0, w, d, h, ry = 0, mat = CARD, tex = {}, noShadow, open = {} } = o;
  const g = grp(parent, x, yb, z, `rotateY(${ry}deg)`);
  const ay = ry * D2R;
  const F = (cond, css, n, extraBg) => { if (cond) return null; const e = mk(g, 'f', css); e.style.background = (extraBg ? extraBg + ',' : '') + shade(mat, rotN(n, ay)); return e; };
  const faces = {};
  faces.top = F(open.top, `left:${-w / 2}px;top:${-d / 2}px;width:${w}px;height:${d}px;transform:translateY(${-h}px) rotateX(90deg)`, [0, -1, 0], tex.top);
  faces.front = F(open.front, `left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)`, [0, 0, 1], tex.front);
  faces.back = F(open.back, `left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px;transform:translateZ(${-d / 2}px) rotateY(180deg)`, [0, 0, -1], tex.back);
  faces.right = F(open.right, `left:${-d / 2}px;top:${-h}px;width:${d}px;height:${h}px;transform:translateX(${w / 2}px) rotateY(90deg)`, [1, 0, 0], tex.side);
  faces.left = F(open.left, `left:${-d / 2}px;top:${-h}px;width:${d}px;height:${h}px;transform:translateX(${-w / 2}px) rotateY(-90deg)`, [-1, 0, 0], tex.side);
  if (!noShadow && yb >= -1) SHADOWS.push({ k: 'box', x, z, w, d, h, ay, y0: -yb });
  g.faces = faces; return g;
}
/* n-sided prism (octagonal shafts, drums, columns) */
function prism(parent, o) {
  const { x = 0, yb = 0, z = 0, r, h, n = 8, mat = CARD, top = true, tex, noShadow } = o;
  const g = grp(parent, x, yb, z);
  const fw = 2 * r * Math.tan(PI / n) + 1, ri = r;
  for (let i = 0; i < n; i++) {
    const a = (i + .5) * 2 * PI / n;
    const e = mk(g, 'f', `left:${-fw / 2}px;top:${-h}px;width:${fw}px;height:${h}px;transform:rotateY(${a / D2R}deg) translateZ(${ri}px)`);
    e.style.background = (tex ? tex + ',' : '') + shade(mat, [Math.sin(a), 0, Math.cos(a)]);
  }
  if (top) {
    const R = r / Math.cos(PI / n), pts = [];
    for (let i = 0; i < n; i++) { const a = i * 2 * PI / n; pts.push(`${(50 + 50 * Math.sin(a)).toFixed(2)}% ${(50 + 50 * Math.cos(a)).toFixed(2)}%`); }
    const e = mk(g, 'f', `left:${-R}px;top:${-R}px;width:${2 * R}px;height:${2 * R}px;clip-path:polygon(${pts.join(',')});transform:translateY(${-h}px) rotateX(90deg)`);
    e.style.background = shade(mat, [0, -1, 0]);
  }
  if (!noShadow) SHADOWS.push({ k: 'cyl', x, z, r, h, y0: -yb });
  return g;
}
/* billboards: spheres (domes, foam trees) always face the camera */
const BB = [];
function sphere(parent, x, y, z, r, kind = 'card') {
  const g = grp(parent);
  const grad = kind === 'card'
    ? 'radial-gradient(circle at 34% 30%,#fffdf8 0%,#f3eee4 34%,#ddd5c7 66%,#bfb6a6 100%)'
    : kind === 'olive'
      ? 'radial-gradient(circle at 34% 30%,#c8cfac 0%,#a5b088 38%,#86926b 72%,#6d7856 100%)'
      : 'radial-gradient(circle at 34% 30%,#c9d8a8 0%,#a1b57e 38%,#7f9863 72%,#66804f 100%)';
  const e = mk(g, 'f', `left:${-r}px;top:${-r}px;width:${2 * r}px;height:${2 * r}px;border-radius:50%`);
  e.style.background = kind === 'card' ? grad : `url(${NOISE}) 0 0/96px 96px,${grad}`;
  if (kind !== 'card') e.style.backgroundBlendMode = 'multiply';
  BB.push({ g, x, y, z, m: 'full' });
  return g;
}

/* ------------------------------------------------------------------ textures */
const NOISE = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  const im = x.createImageData(96, 96);
  for (let i = 0; i < im.data.length; i += 4) { const v = 200 + rnd() * 55; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); return c.toDataURL();
})();
function woodCanvas(w, h, s, base, dark, seedv, ring = 1) {
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
  const g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, c.width, c.height);
  let sd = seedv; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  // planks
  const ph = 260 * s * ring;
  for (let y0 = 0; y0 < c.height; y0 += ph) {
    g.fillStyle = `rgba(${dark},${(r() * .08).toFixed(3)})`; g.fillRect(0, y0, c.width, ph);
    g.fillStyle = `rgba(${dark},.22)`; g.fillRect(0, y0, c.width, Math.max(1, 1.6 * s));
  }
  for (let i = 0; i < c.height * 1.2; i++) {
    const y = r() * c.height, a = r() * .10 + .02, amp = r() * 6 * s, fr = r() * .004 + .001, ph2 = r() * 6;
    g.strokeStyle = `rgba(${dark},${a.toFixed(3)})`; g.lineWidth = r() * 1.6 * s + .4; g.beginPath();
    for (let x = 0; x <= c.width; x += 24) { const yy = y + Math.sin(x * fr + ph2) * amp; x ? g.lineTo(x, yy) : g.moveTo(x, yy); }
    g.stroke();
  }
  return c;
}

/* ------------------------------------------------------------------ the world */
const DY = -1300;                 // student's desk top (higher than the model table)
const BW = 4800, BD = 3200;       // model board
const ST = {                      // stations
  main: { x: 0, z: -650 }, A: { x: -1450, z: 330 }, T: { x: -800, z: 900 }, K: { x: 1250, z: 640 },
  chart: { x: 660, z: 40 }, D: { x: 1560, z: -720 }, phone: { x: 1900, z: 1060 },
};

/* table (big wooden surface under the board) */
{
  const c = woodCanvas(2400, 2000, .5, '#9c7652', '70,45,20', 99, 1.4);
  c.className = 'f';
  { const g = c.getContext('2d'); g.globalCompositeOperation = 'destination-in';
    const rg = g.createRadialGradient(c.width / 2, c.height / 2, 0, c.width / 2, c.height / 2, c.width / 2);
    rg.addColorStop(0, '#000'); rg.addColorStop(.55, '#000'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.setTransform(1, 0, 0, c.height / c.width, 0, 0); g.fillStyle = rg; g.fillRect(0, 0, c.width, c.width); g.setTransform(1, 0, 0, 1, 0, 0); }
  c.style.cssText = `left:-4800px;top:-4000px;width:9600px;height:8000px;transform:translateY(40px) rotateX(90deg)`;
  // scale canvas 3600*.5 → 14400: use css size
  W1.appendChild(c);
}
/* board: foam-core base with the printed ground (paths, felt grass, plaza, soft shadows) */
const board = box(W1, { x: 0, yb: 40, z: 0, w: BW, d: BD, h: 40, mat: [238, 235, 228], noShadow: true });
const GS = 0.6;                   // ground canvas scale
const gc = document.createElement('canvas'); gc.width = BW * GS; gc.height = BD * GS;
board.faces.top.style.background = 'none';
gc.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%';
board.faces.top.appendChild(gc);

/* desk with the sheet */
const DESKN0 = W1.children.length;
{
  const desk = box(W1, { x: 0, yb: DY + 70, z: 3600, w: 3400, d: 1800, h: 70, mat: [205, 168, 122], noShadow: true });
  const c = woodCanvas(3400, 1800, .7, '#cfa77a', '96,62,28', 31, .8);
  desk.faces.top.style.background = 'none';
  c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%'; desk.faces.top.appendChild(c);
  const sh = mk(grp(W1, 0, DY - 1, 0), 'f', `left:-420px;top:-480px;width:840px;height:960px;transform:translate3d(30px,0,3270px) rotateX(90deg);background:radial-gradient(closest-side,rgba(60,35,10,.26),rgba(60,35,10,.12) 70%,rgba(60,35,10,0))`);
  // pencil + ruler
  const pen = box(W1, { x: 420, yb: DY, z: 3390, w: 420, d: 16, h: 16, ry: 18, mat: [222, 190, 140], noShadow: true });
  const tip = box(W1, { x: 420 - 200 * Math.cos(18 * D2R) - 18, yb: DY, z: 3390 + 200 * Math.sin(18 * D2R) + 6, w: 36, d: 10, h: 10, ry: 18, mat: [70, 66, 62], noShadow: true });
  const rul = box(W1, { x: -430, yb: DY, z: 3310, w: 70, d: 640, h: 5, ry: -8, mat: [236, 230, 214], tex: { top: 'repeating-linear-gradient(0deg,rgba(40,40,40,.55) 0 2px,transparent 2px 20px) 0 0/22px 100% no-repeat' }, noShadow: true });
  mk(grp(W1, 0, DY - 1, 0), 'f', `left:-260px;top:-30px;width:520px;height:60px;transform:translate3d(440px,0,3410px) rotateY(18deg) translateY(14px) rotateX(90deg);background:radial-gradient(closest-side,rgba(60,35,10,.35),rgba(60,35,10,0))`);
}

const DESKEL = [...W1.children].slice(DESKN0);
/* main building: the mosque-university (wide arcaded block, portal, drum + dome, two minarets) */
const ARCH = (c) => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='64' height='120'><path d='M14 112V52a18 18 0 0 1 36 0v60' fill='${c}' stroke='rgba(80,70,55,.35)' stroke-width='2'/></svg>`)}") 0 18px/64px 120px repeat-x`;
const WIN = (c) => `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='46' height='60'><rect x='12' y='14' width='22' height='32' rx='2' fill='${c}' stroke='rgba(80,70,55,.3)' stroke-width='1.5'/></svg>`)}") 6px 4px/46px 60px repeat`;
{
  const M = ST.main, g = W1;
  box(g, { x: M.x, z: M.z, w: 1400, d: 480, h: 240, tex: { front: ARCH('rgba(150,138,118,.35)'), back: ARCH('rgba(150,138,118,.3)'), side: ARCH('rgba(150,138,118,.3)') } });
  box(g, { x: M.x, yb: -240, z: M.z, w: 1440, d: 520, h: 14 });                 // cornice
  box(g, { x: M.x, z: M.z + 270, w: 380, d: 80, h: 330, tex: { front: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='380' height='330'><path d='M110 330V170a80 80 0 0 1 160 0v160' fill='rgba(150,138,118,.42)' stroke='rgba(80,70,55,.4)' stroke-width='3'/><path d='M80 330V160a110 110 0 0 1 220 0v170' fill='none' stroke='rgba(80,70,55,.22)' stroke-width='2'/></svg>`)}") 0 0/100% 100% no-repeat` } });
  prism(g, { x: M.x, yb: -254, z: M.z - 40, r: 190, h: 110, n: 16, tex: `repeating-linear-gradient(90deg,transparent 0 30px,rgba(80,70,55,.18) 30px 34px)` });
  sphere(g, M.x, -364, M.z - 40, 196, 'card');
  box(g, { x: M.x, yb: -540, z: M.z - 40, w: 8, d: 8, h: 70, mat: [190, 170, 120], noShadow: true });
  for (const sx of [-1, 1]) {
    const mx = M.x + sx * 790, mz = M.z + 240;
    prism(g, { x: mx, z: mz, r: 50, h: 820, n: 8, tex: `repeating-linear-gradient(0deg,transparent 0 120px,rgba(80,70,55,.2) 120px 123px)` });
    prism(g, { x: mx, yb: -820, z: mz, r: 70, h: 20, n: 8, noShadow: true });
    prism(g, { x: mx, yb: -840, z: mz, r: 40, h: 110, n: 8, noShadow: true, tex: WIN('rgba(150,138,118,.4)') });
    prism(g, { x: mx, yb: -950, z: mz, r: 52, h: 14, n: 8, noShadow: true });
    sphere(g, mx, -964, mz, 40, 'card');
    box(g, { x: mx, yb: -1000, z: mz, w: 5, d: 5, h: 40, mat: [190, 170, 120], noShadow: true });
    SHADOWS.push({ k: 'cyl', x: mx, z: mz, r: 46, h: 1000, y0: 0 });
  }
  // two wings behind (faculties)
  box(g, { x: M.x - 1050, z: M.z - 330, w: 560, d: 320, h: 190, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
  box(g, { x: M.x + 1050, z: M.z - 330, w: 560, d: 320, h: 190, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
}
/* a few other campus blocks and pavilions */
box(W1, { x: -1980, z: -1150, w: 520, d: 380, h: 170, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
box(W1, { x: 2030, z: -1250, w: 480, d: 300, h: 150, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
box(W1, { x: -2050, z: 1150, w: 380, d: 320, h: 130, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
box(W1, { x: 760, z: 1260, w: 420, d: 240, h: 120, tex: { front: WIN('rgba(150,138,118,.35)'), side: WIN('rgba(150,138,118,.3)') } });
{ // small domed gazebo on the plaza
  const gx = -760, gz = -40;
  box(W1, { x: gx, z: gz, w: 220, d: 220, h: 10, mat: BALSA });
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(W1, { x: gx + a * 88, yb: -10, z: gz + b * 88, w: 14, d: 14, h: 120, noShadow: true });
  prism(W1, { x: gx, yb: -130, z: gz, r: 112, h: 14, n: 8, noShadow: true });
  sphere(W1, gx, -144, gz, 80, 'card');
  SHADOWS.push({ k: 'box', x: gx, z: gz, w: 200, d: 200, h: 150, ay: 0, y0: 0, soft: .45 });
}

/* station A — المرافقة : open pavilion, a table, two faceless figures */
const FIG_SIT = (flip) => `<svg viewBox="0 0 70 120" width="70" height="120" style="display:block;transform:scaleX(${flip ? -1 : 1})"><g fill="#efebe3" stroke="#b9b1a3" stroke-width="1.6" stroke-linejoin="round"><circle cx="30" cy="16" r="11"/><path d="M22 30 Q30 26 38 31 L44 62 Q46 70 40 72 L60 74 Q66 75 66 82 L66 116 L58 116 L57 86 L30 86 Q20 86 20 74 Z"/><path d="M36 40 L54 56 L58 54" fill="none" stroke-width="7" stroke="#efebe3" stroke-linecap="round"/></g></svg>`;
const FIG_STAND = `<svg viewBox="0 0 50 150" width="50" height="150" style="display:block"><g fill="#efebe3" stroke="#b9b1a3" stroke-width="1.6" stroke-linejoin="round"><circle cx="25" cy="14" r="11"/><path d="M14 30 Q25 25 36 30 L40 84 L34 86 L33 146 L27 146 L25 96 L23 146 L17 146 L16 86 L10 84 Z"/></g></svg>`;
function figure(parent, x, z, svg, w, h, ry = 0) {
  const g = grp(parent, x, 0, z, `rotateY(${ry}deg)`);
  mk(g, 'f v', `left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px`, svg);
  SHADOWS.push({ k: 'box', x, z, w: w * .7, d: 14, h: h * .9, ay: ry * D2R, y0: 0, soft: .7 });
  return g;
}
{
  const { x, z } = ST.A;
  box(W1, { x, z, w: 560, d: 440, h: 14, mat: BALSA });
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(W1, { x: x + a * 250, yb: -14, z: z + b * 190, w: 16, d: 16, h: 190, noShadow: true });
  box(W1, { x, yb: -204, z, w: 620, d: 500, h: 18 });
  SHADOWS.push({ k: 'box', x, z, w: 620, d: 500, h: 222, ay: 0, y0: 0, soft: .6 });
  box(W1, { x, yb: -14, z: z + 10, w: 150, d: 90, h: 54, mat: BALSA, noShadow: true });
  // figures sit on two little stools, facing each other across the table
  box(W1, { x: x - 125, yb: -14, z: z + 10, w: 36, d: 36, h: 26, mat: BALSA, noShadow: true });
  box(W1, { x: x + 125, yb: -14, z: z + 10, w: 36, d: 36, h: 26, mat: BALSA, noShadow: true });
  const fA = grp(W1, x - 118, -14, z + 10); mk(fA, 'f v', `left:-45px;top:-110px;width:70px;height:120px`, FIG_SIT(false));
  const fB = grp(W1, x + 118, -14, z + 10); mk(fB, 'f v', `left:-25px;top:-110px;width:70px;height:120px`, FIG_SIT(true));
  // a small paper sheet on the table
  mk(grp(W1, x, -69, z + 10), 'f', `left:-30px;top:-20px;width:60px;height:40px;background:#fffefa;transform:rotateX(90deg) rotateZ(8deg);box-shadow:0 0 0 1px rgba(0,0,0,.05)`);
}

/* station T — التكوين : a small hall whose roof lifts like a lid */
const HALL = { w: 640, d: 440, h: 210 };
const hallLid = (() => {
  const { x, z } = ST.T, { w, d, h } = HALL;
  const g = grp(W1, x, 0, z);
  // floor
  mk(g, 'f', `left:${-w / 2}px;top:${-d / 2}px;width:${w}px;height:${d}px;transform:translateY(-2px) rotateX(90deg);background:repeating-linear-gradient(90deg,#d8bb8c 0 38px,#cfb183 38px 40px)`);
  // walls (double-sided card)
  const wall = (css, n, inner) => { const e = mk(g, 'f v', css); e.style.background = `${WIN('rgba(150,138,118,.35)')},${shade(CARD, n)}`; return e; };
  wall(`left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px;transform:translateZ(${d / 2}px)`, [0, 0, 1]);
  wall(`left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px;transform:translateZ(${-d / 2}px)`, [0, 0, -1]);
  wall(`left:${-d / 2}px;top:${-h}px;width:${d}px;height:${h}px;transform:translateX(${w / 2}px) rotateY(90deg)`, [1, 0, 0]);
  wall(`left:${-d / 2}px;top:${-h}px;width:${d}px;height:${h}px;transform:translateX(${-w / 2}px) rotateY(-90deg)`, [-1, 0, 0]);
  SHADOWS.push({ k: 'box', x, z, w, d, h, ay: 0, y0: 0 });
  // board on the back wall (inside)
  mk(g, 'f', `left:-150px;top:-170px;width:300px;height:105px;transform:translateZ(${-d / 2 + 3}px);background:#fbfaf6;border:6px solid #b9ab94;border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,.15)`,
    `<div style="margin:22px 26px 0;height:4px;background:#c9c3b8;width:60%"></div><div style="margin:12px 26px 0;height:4px;background:#d7d1c6;width:80%"></div><div style="margin:12px 26px 0;height:4px;background:#d7d1c6;width:45%"></div>`);
  // a standing teacher figure next to the board
  const tf = grp(g, 190, -2, -d / 2 + 60); mk(tf, 'f v', `left:-20px;top:-118px;width:40px;height:120px`, FIG_STAND.replace('width="50" height="150"', 'width="40" height="120"'));
  // rows of tiny chairs facing the board
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const cx = (c - 2) * 92, cz = -30 + r * 92;
    box(g, { x: cx, yb: -2, z: cz, w: 40, d: 38, h: 24, mat: BALSA, noShadow: true });
    const bk = mk(g, 'f v', `left:${cx - 20}px;top:-66px;width:40px;height:42px;transform:translateZ(${cz + 19}px);border-radius:3px 3px 0 0`);
    bk.style.background = shade(BALSA, [0, 0, 1]);
  }
  // lid hinged on the back top edge
  const lid = grp(g, 0, -h, -d / 2);
  const inner = box(lid, { x: 0, yb: 0, z: d / 2 + 10, w: w + 30, d: d + 30, h: 18, noShadow: true, tex: { top: 'linear-gradient(0deg,rgba(0,0,0,.035),rgba(0,0,0,0))' } });
  // underside of the lid (visible when lifted)
  const und = mk(lid, 'f', `left:${-(w + 30) / 2}px;top:${-(d + 30) / 2}px;width:${w + 30}px;height:${d + 30}px;transform:translateZ(${d / 2 + 10}px) rotateX(-90deg)`);
  und.style.background = 'linear-gradient(0deg,#ebe6dc,#f7f4ee)';
  return lid;
})();

/* station K — التمويل : a small bank-like kiosk with columns and a pediment */
{
  const { x, z } = ST.K;
  box(W1, { x, z, w: 440, d: 320, h: 30, mat: GREY });
  box(W1, { x, yb: 0, z: z + 185, w: 220, d: 50, h: 15, mat: GREY, noShadow: true });
  box(W1, { x, yb: -30, z: z - 30, w: 360, d: 200, h: 170, tex: { front: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='170'><rect x='150' y='70' width='60' height='100' rx='3' fill='rgba(140,128,110,.45)'/></svg>`)}") 0 0/100% 100%` }, noShadow: true });
  for (let i = 0; i < 4; i++) prism(W1, { x: x - 150 + i * 100, yb: -30, z: z + 125, r: 15, h: 170, n: 8, noShadow: true, top: false });
  box(W1, { x, yb: -200, z, w: 450, d: 330, h: 22 });
  SHADOWS.push({ k: 'box', x, z, w: 440, d: 320, h: 290, ay: 0, y0: 0 });
  const pg = grp(W1, x, -222, z);
  const tri = (zz, ry, n) => { const e = mk(pg, 'f', `left:-225px;top:-70px;width:450px;height:70px;clip-path:polygon(0 100%,50% 0,100% 100%);transform:translateZ(${zz}px) rotateY(${ry}deg)`); e.style.background = `linear-gradient(0deg,rgba(0,0,0,.05),rgba(0,0,0,0)),${shade(CARD, n)}`; };
  tri(165, 0, [0, 0, 1]); tri(-165, 180, [0, 0, -1]);
  const L = Math.hypot(165, 70), a = Math.atan2(70, 165) / D2R;
  const sl = (zm, b, n) => { const e = mk(pg, 'f', `left:-230px;top:${-L / 2}px;width:460px;height:${L}px;transform:translate3d(0,-35px,${zm}px) rotateX(${b}deg) rotateX(90deg)`); e.style.background = `repeating-linear-gradient(90deg,transparent 0 22px,rgba(80,70,55,.12) 22px 24px),${shade(CARD, n)}`; };
  sl(82, -a, [0, -.92, .4]); sl(-82, a, [0, -.92, -.4]);
}

/* trees: palms along the main axis, foam olive trees around */
function palm(x, z, h, ry = 0) {
  box(W1, { x, z, w: 14, d: 14, h, mat: [176, 140, 98], noShadow: true });
  const top = grp(W1, x, -h, z, `rotateY(${ry}deg)`);
  for (let i = 0; i < 8; i++) {
    const L = 120 + (i % 3) * 18;
    const e = mk(top, 'f v', `left:0;top:-12px;width:${L}px;height:24px;transform-origin:0 50%;transform:rotateY(${i * 45}deg) rotateZ(${22 + (i % 2) * 14}deg) rotateX(90deg);clip-path:polygon(0 50%,20% 0,100% 50%,20% 100%)`);
    e.style.background = `repeating-linear-gradient(90deg,rgba(0,0,0,.10) 0 2px,transparent 2px 9px),linear-gradient(90deg,#6f8a52,#93ab6f)`;
  }
  SHADOWS.push({ k: 'cyl', x, z, r: 8, h, y0: 0 });
  SHADOWS.push({ k: 'blob', x: x + h * SX, z: z + h * SZ, r: 120, a: .22 });
}
function foam(x, z, r, h, kind = 'foam') {
  box(W1, { x, z, w: 10, d: 10, h: h - r * .6, mat: [176, 140, 98], noShadow: true });
  sphere(W1, x, -h, z, r, kind);
  SHADOWS.push({ k: 'blob', x: x + h * SX, z: z + h * SZ, r: r * 1.05, a: .3 });
}
for (let i = 0; i < 4; i++) { palm(-300, 1400 - i * 300, 300 + (i % 2) * 30, i * 17); palm(300, 1400 - i * 300, 290 + ((i + 1) % 2) * 30, i * 29); }
[[-1100, -60, 70, 150], [-1330, 1300, 80, 170], [-1900, 300, 90, 190], [-2100, -400, 80, 160], [-1780, 680, 60, 130], [-420, 560, 60, 140], [-560, 1380, 70, 150],
 [1000, 1160, 70, 150], [1430, 1380, 70, 150], [2180, 330, 70, 150], [2200, -350, 70, 150], [950, -100, 60, 130], [1900, -820, 70, 140], [-500, -1320, 80, 160],
 [600, -1350, 70, 150], [1300, -1300, 80, 170], [-1550, -1350, 70, 150], [-2150, 1450, 60, 130], [0, -1450, 70, 140]]
  .forEach(([x, z, r, h], i) => foam(x, z, r, h, i % 3 === 1 ? 'olive' : 'foam'));

/* rolled diploma with a ribbon (cylinder made of an axis-billboard + end caps) */
const DIP = { x: ST.D.x, z: ST.D.z, L: 420, r: 46 };
const dip = (() => {
  const g = grp(W1, DIP.x, -DIP.r, DIP.z);
  const body = mk(g, 'o'); const bf = mk(body, 'f v', `left:${-DIP.L / 2}px;top:${-DIP.r}px;width:${DIP.L}px;height:${2 * DIP.r}px;background:linear-gradient(180deg,#fffdf6 0%,#f6efdf 30%,#e5d9c1 70%,#c9b997 100%)`);
  mk(bf, '', `position:absolute;left:${DIP.L / 2 - 22}px;top:-2px;width:44px;bottom:-2px;background:linear-gradient(180deg,#a83a3a,#8e2a2a 60%,#6a1c1c)`);
  const caps = [-1, 1].map((s) => { const c = mk(g, 'f v', `left:${-DIP.r}px;top:${-DIP.r}px;width:${2 * DIP.r}px;height:${2 * DIP.r}px;border-radius:50%;transform:translateX(${s * DIP.L / 2}px) rotateY(90deg);background:repeating-radial-gradient(circle at 46% 50%,#efe5cf 0 6px,#d9cbb0 6px 7.5px)`); return c; });
  // ribbon tails lying on the board
  const tails = grp(W1, DIP.x, -1, DIP.z + 40);
  mk(tails, 'f', `left:-14px;top:0;width:28px;height:120px;transform:rotateX(90deg) rotateZ(-24deg) translateY(30px);background:linear-gradient(#8e2a2a,#a83a3a);clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)`);
  mk(tails, 'f', `left:-14px;top:0;width:28px;height:110px;transform:rotateX(90deg) rotateZ(20deg) translateY(30px);background:linear-gradient(#8e2a2a,#a83a3a);clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%)`);
  SHADOWS.push({ k: 'box', x: DIP.x, z: DIP.z, w: DIP.L, d: 70, h: 80, ay: 0, y0: 0, soft: .9 });
  return { body };
})();

/* coins next to the kiosk */
const COIN = { r: 40, th: 11 };
const STACKS = [{ x: 1130, z: 930, n: 3 }, { x: 1240, z: 965, n: 5 }, { x: 1350, z: 930, n: 7 }];
let coinT = 23.05; STACKS.forEach((s) => { s.t = []; for (let i = 0; i < s.n; i++) { s.t.push(coinT); coinT += .105; } });
STACKS.forEach((s) => {
  s.g = grp(W1, s.x, 0, s.z);
  s.body = mk(s.g, 'f v', `left:${-COIN.r}px;width:${2 * COIN.r}px;background:repeating-linear-gradient(0deg,rgba(80,55,15,.28) 0 1.5px,transparent 1.5px ${COIN.th}px),linear-gradient(90deg,#9a7a3a,#e8cf8e 30%,#c9a45a 62%,#86662b)`);
  s.topG = grp(W1, s.x, 0, s.z);
  s.top = mk(s.topG, 'f', `left:${-COIN.r}px;top:${-COIN.r}px;width:${2 * COIN.r}px;height:${2 * COIN.r}px;border-radius:50%;transform:rotateX(90deg);background:radial-gradient(circle at 40% 38%,#f4e2a8,#d4b06a 55%,#b08a44);box-shadow:inset 0 0 0 5px rgba(140,105,40,.45)`);
  s.fall = grp(W1, s.x, 0, s.z);
  s.fTop = mk(s.fall, 'f', `left:${-COIN.r}px;top:${-COIN.r}px;width:${2 * COIN.r}px;height:${2 * COIN.r}px;border-radius:50%;transform:rotateX(90deg);background:radial-gradient(circle at 40% 38%,#f4e2a8,#d4b06a 55%,#b08a44);box-shadow:inset 0 0 0 5px rgba(140,105,40,.45)`);
  s.shadow = mk(grp(W1, s.x + 22, -1, s.z + 8), 'f', `left:-48px;top:-48px;width:96px;height:96px;border-radius:50%;transform:rotateX(90deg);background:radial-gradient(closest-side,rgba(60,40,10,.38),rgba(60,40,10,0))`);
});

/* phone lying on the board — flips from its back to its screen */
const PHN = { w: 460, h: 920, th: 22 };
const phone = (() => {
  const { x, z } = ST.phone;
  const g = grp(W1, x, -PHN.th / 2, z);
  const r = mk(g, 'o');
  const fr = mk(r, 'f', `left:${-PHN.w / 2}px;top:${-PHN.h / 2}px;width:${PHN.w}px;height:${PHN.h}px;border-radius:58px;transform:translateZ(${PHN.th / 2}px);background:#16171a;padding:16px;box-shadow:inset 0 0 0 3px #3b3d42`);
  fr.innerHTML = `<div style="position:absolute;inset:16px;border-radius:44px;background:linear-gradient(180deg,#fbfaf7,#f2efe8);overflow:hidden;direction:rtl">
    <div style="position:absolute;top:18px;left:50%;width:120px;height:32px;margin-left:-60px;border-radius:16px;background:#16171a"></div>
    <div style="position:absolute;top:110px;right:44px;left:44px;font-family:'Reem Kufi';font-weight:700;font-size:58px;color:#1c1b19">التمويل</div>
    <div style="position:absolute;top:196px;right:44px;left:44px;height:3px;background:#e2ddd2"></div>
    <div style="position:absolute;top:236px;right:44px;left:20px;font-family:Tajawal;font-weight:700;font-size:50px;color:#3a3833">تمويل يصل إلى</div>
    <div style="position:absolute;top:300px;right:40px;left:10px;white-space:nowrap;color:#1c1b19"><span id="n80" style="font-family:Cairo;font-weight:800;font-size:100px;line-height:1.3;display:inline-block;min-width:112px;text-align:center">80</span> <span style="font-family:Tajawal;font-weight:700;font-size:40px">مليون سنتيم…</span></div>
    <div style="position:absolute;top:478px;right:44px;left:44px;height:3px;background:#e2ddd2"></div>
    <div style="position:absolute;top:510px;right:40px;left:10px;white-space:nowrap;color:#1c1b19"><span style="font-family:Tajawal;font-weight:700;font-size:50px;color:#3a3833">وحتى</span> <span id="n200" style="font-family:Cairo;font-weight:800;font-size:112px;line-height:1.3;display:inline-block;min-width:190px;text-align:center">200</span></div>
    <div style="position:absolute;top:668px;right:44px;left:20px;font-family:Tajawal;font-weight:700;font-size:52px;color:#1c1b19;white-space:nowrap">مليون سنتيم</div>
    <div style="position:absolute;bottom:22px;left:50%;width:150px;height:7px;margin-left:-75px;border-radius:4px;background:#2b2b2e;opacity:.6"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(125deg,rgba(255,255,255,.35) 0%,rgba(255,255,255,0) 34%)"></div>
  </div>`;
  const bk = mk(r, 'f', `left:${-PHN.w / 2}px;top:${-PHN.h / 2}px;width:${PHN.w}px;height:${PHN.h}px;border-radius:58px;transform:translateZ(${-PHN.th / 2}px) rotateY(180deg);background:linear-gradient(150deg,#6d6a66,#4e4c49 50%,#3f3d3b);box-shadow:inset 0 0 0 3px rgba(255,255,255,.08)`,
    `<div style="position:absolute;left:34px;top:34px;width:150px;height:150px;border-radius:40px;background:#3a3836;box-shadow:inset 0 0 0 2px rgba(255,255,255,.12)"><i style="position:absolute;left:18px;top:18px;width:52px;height:52px;border-radius:50%;background:#151515;box-shadow:0 0 0 5px #57534f"></i><i style="position:absolute;left:18px;top:82px;width:52px;height:52px;border-radius:50%;background:#151515;box-shadow:0 0 0 5px #57534f"></i></div>`);
  // edges
  const edge = (css) => mk(r, 'f v', css + ';background:linear-gradient(90deg,#55575c,#9a9ca1 50%,#55575c)');
  edge(`left:${-PHN.th / 2}px;top:${-PHN.h / 2 + 50}px;width:${PHN.th}px;height:${PHN.h - 100}px;transform:translateX(${PHN.w / 2}px) rotateY(90deg)`);
  edge(`left:${-PHN.th / 2}px;top:${-PHN.h / 2 + 50}px;width:${PHN.th}px;height:${PHN.h - 100}px;transform:translateX(${-PHN.w / 2}px) rotateY(90deg)`);
  edge(`left:${-PHN.w / 2 + 50}px;top:${-PHN.th / 2}px;width:${PHN.w - 100}px;height:${PHN.th}px;transform:translateY(${PHN.h / 2}px) rotateX(90deg)`);
  edge(`left:${-PHN.w / 2 + 50}px;top:${-PHN.th / 2}px;width:${PHN.w - 100}px;height:${PHN.th}px;transform:translateY(${-PHN.h / 2}px) rotateX(90deg)`);
  const sh = mk(grp(W1, x + 14, -1, z + 6), 'f', `left:${-PHN.w / 2 - 30}px;top:${-PHN.h / 2 - 30}px;width:${PHN.w + 60}px;height:${PHN.h + 60}px;transform:rotateX(90deg);background:radial-gradient(closest-side,rgba(50,35,20,.42),rgba(50,35,20,.30) 75%,rgba(50,35,20,0))`);
  return { g, r, sh };
})();

/* pop-up chart on the plaza: فكرة → نموذج أولي → مؤسسة ناشئة (read right → left) */
const ICON = {
  idea: `<svg viewBox="0 0 48 48" width="96" height="96" fill="none" stroke="#2b2925" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M24 7a12 12 0 0 0-7 21.8V33h14v-4.2A12 12 0 0 0 24 7z"/><path d="M19 38h10M21 42h6"/></svg>`,
  proto: `<svg viewBox="0 0 48 48" width="96" height="96" fill="none" stroke="#2b2925" stroke-width="2.6" stroke-linejoin="round"><path d="M24 6 40 15v18L24 42 8 33V15z"/><path d="M8 15l16 9 16-9M24 24v18"/></svg>`,
  firm: `<svg viewBox="0 0 48 48" width="96" height="96" fill="none" stroke="#2b2925" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"><path d="M8 42V18l12-6v30M20 42V8l20 8v26M6 42h36"/><path d="M26 20h6M26 27h6M26 34h6M13 24h2M13 31h2"/></svg>`,
};
const CH = (() => {
  const { x, z } = ST.chart;
  const g = grp(W1, x, 0, z);
  const base = mk(g, 'f', `left:-600px;top:-240px;width:1200px;height:480px;transform:translateY(-3px) rotateX(90deg);background:#fbf9f3;border-radius:8px;box-shadow:0 0 0 1px rgba(80,70,55,.12),0 6px 18px rgba(60,45,30,.15)`,
    `<div style="position:absolute;inset:14px;border:2px dashed rgba(120,110,95,.25);border-radius:6px"></div><div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(120,110,95,.18)"></div>`);
  const cols = [
    { dx: 390, h: 300, t: 'فكرة', ic: ICON.idea },
    { dx: 0, h: 420, t: 'نموذج أولي', ic: ICON.proto },
    { dx: -390, h: 560, t: 'مؤسسة ناشئة', ic: ICON.firm },
  ].map((c) => {
    const pg = grp(g, c.dx, -3, 0);
    const pn = mk(pg, 'o'); pn.style.transformOrigin = '0 0';
    const front = mk(pn, 'f', `left:-170px;top:${-c.h}px;width:340px;height:${c.h}px;border-radius:10px 10px 2px 2px;background:linear-gradient(180deg,#fffdf8,#f1ece2);box-shadow:inset 0 0 0 2px rgba(120,110,95,.12)`,
      `<div style="position:absolute;top:28px;left:0;right:0;text-align:center;font-family:'Reem Kufi';font-weight:700;font-size:56px;color:#1c1b19;white-space:nowrap">${c.t}</div><div style="position:absolute;top:120px;left:0;right:0;display:flex;justify-content:center">${c.ic}</div>`);
    const back = mk(pn, 'f', `left:-170px;top:${-c.h}px;width:340px;height:${c.h}px;border-radius:10px 10px 2px 2px;transform:rotateY(180deg);background:${shade(CARD, [0, 0, -1])}`);
    const sh = mk(pg, 'f', `left:-170px;top:0;width:340px;height:${c.h}px;transform-origin:50% 0;transform:translateY(-2px) rotateX(90deg);background:linear-gradient(180deg,rgba(60,45,30,.0),rgba(60,45,30,.0))`);
    return { pg, pn, sh, h: c.h };
  });
  const arrows = [195, -195].map((dx) => {
    const ag = grp(g, dx, -3, 30); const an = mk(ag, 'o');
    mk(an, 'f', `left:-50px;top:-150px;width:100px;height:60px`, `<svg viewBox="0 0 100 60" width="100" height="60"><path d="M92 30H14M34 10 12 30l22 20" fill="none" stroke="#2b2925" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
    mk(an, 'f', `left:-3px;top:-92px;width:6px;height:92px;background:#8b8177;border-radius:3px`);
    return an;
  });
  return { g, base, cols, arrows };
})();

/* dotted path of the plane (drawn in the overhead flat-lay) */
const PATHPTS = [[0, 2700], [0, 1200], [-60, 300], [-200, -150], [-700, 300], [-1450, 330], [-1350, 820], [-800, 900], [-150, 760], [500, 700], [1250, 640], [1300, 200], [1450, -380], [1560, -720]];
const DOTS = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const holder = mk(grp(W1, 0, -4, 0), 'f', `left:-2400px;top:-1600px;width:4800px;height:3200px;transform:rotateX(90deg)`);
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-2400 -1600 4800 3200'); svg.setAttribute('width', 4800); svg.setAttribute('height', 3200); holder.appendChild(svg);
  // Catmull-Rom → bezier
  const p = PATHPTS; let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  const path = document.createElementNS(NS, 'path'); path.setAttribute('d', d);
  const L = path.getTotalLength(), dots = [];
  for (let s = 0; s < L; s += 46) {
    const q = path.getPointAtLength(s), c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); c.setAttribute('r', 11); c.setAttribute('fill', '#2f2b27'); c.setAttribute('opacity', 0);
    svg.appendChild(c); dots.push({ c, u: s / L });
  }
  const rings = [[0, -250], [ST.A.x, ST.A.z], [ST.T.x, ST.T.z], [ST.K.x, ST.K.z], [ST.D.x, ST.D.z]].map(([x, y]) => {
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 0); c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#2f2b27'); c.setAttribute('stroke-width', 9); svg.appendChild(c); return c;
  });
  return { holder, dots, rings };
})();

/* ------------------------------------------------------------------ ground canvas (drawn once) */
function drawGround() {
  const g = gc.getContext('2d'), s = GS;
  g.setTransform(s, 0, 0, s, BW / 2 * s, BD / 2 * s);           // world (x,z) → canvas
  g.fillStyle = '#ece8df'; g.fillRect(-BW / 2, -BD / 2, BW, BD);
  // felt lawns
  const lawn = (x, z, w, d, r) => { g.beginPath(); g.roundRect(x - w / 2, z - d / 2, w, d, r); g.fill(); };
  g.fillStyle = '#b3bf93';
  lawn(-1500, -900, 1500, 900, 80); lawn(1500, -880, 1500, 960, 80); lawn(-1500, 750, 1500, 1300, 80); lawn(1500, 1050, 1500, 900, 80); lawn(-2050, 0, 600, 600, 60); lawn(2050, 0, 600, 700, 60);
  // plaza (light wood) and the main axis
  g.fillStyle = '#e3cfa8'; lawn(0, -150, 1900, 560, 30); lawn(660, 60, 1300, 560, 30);
  // cork paths
  g.strokeStyle = '#cfb18a'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = 130;
  const pth = (pts) => { g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(x, z) : g.moveTo(x, z)); g.stroke(); };
  pth([[0, 1600], [0, -300]]); pth([[-60, 250], [-1450, 330], [-2300, 330]]); pth([[-800, 900], [-300, 900]]); pth([[-1450, 330], [-1450, 900], [-1120, 900]]); pth([[0, 640], [1250, 640], [2300, 640]]); pth([[1250, 640], [1250, -400], [1560, -720]]); pth([[-1450, 330], [-1450, -500], [-1980, -900]]);
  // speckles (cork / felt texture)
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '90,70,40' : '255,255,255'},${(rnd() * .10).toFixed(3)})`; g.fillRect(rnd() * BW - BW / 2, rnd() * BD - BD / 2, 3 + rnd() * 4, 3 + rnd() * 4); }
  // long soft shadows
  const hull = (pts) => {           // monotone chain
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of pts.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  const poly = (pts) => { g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(x, z) : g.moveTo(x, z)); g.closePath(); g.fill(); };
  const passes = [[22, .26], [6, .16]];
  for (const [bl, al] of passes) {
    g.filter = `blur(${bl * s}px)`;
    for (const o of SHADOWS) {
      const a = al * (o.soft || 1);
      g.fillStyle = `rgba(62,48,32,${a})`;
      if (o.k === 'box') {
        const c = Math.cos(o.ay), sn = Math.sin(o.ay), base = [];
        for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const lx = u * o.w / 2, lz = v * o.d / 2; base.push([o.x + lx * c + lz * sn, o.z - lx * sn + lz * c]); }
        const h = o.h + (o.y0 || 0);
        poly(hull(base.concat(base.map(([x, z]) => [x + h * SX, z + h * SZ]))));
      } else if (o.k === 'cyl') {
        const pts = []; for (let i = 0; i < 16; i++) { const a2 = i * PI / 8; pts.push([o.x + o.r * Math.cos(a2), o.z + o.r * Math.sin(a2)]); }
        poly(hull(pts.concat(pts.map(([x, z]) => [x + o.h * SX, z + o.h * SZ]))));
      } else if (o.k === 'blob' && bl > 10) {
        g.fillStyle = `rgba(62,48,32,${o.a})`; g.beginPath(); g.ellipse(o.x, o.z, o.r * 1.15, o.r * .8, .3, 0, 2 * PI); g.fill();
      }
    }
  }
  // contact shadows (ambient occlusion at the feet of every object)
  g.filter = `blur(${3 * s}px)`; g.fillStyle = 'rgba(50,38,25,.30)';
  for (const o of SHADOWS) if (o.k === 'box' && !o.soft) { g.save(); g.translate(o.x, o.z); g.rotate(-o.ay); g.fillRect(-o.w / 2 - 6, -o.d / 2 - 6, o.w + 12, o.d + 12); g.restore(); }
  g.filter = 'none';
}

/* ------------------------------------------------------------------ the paper sheet → paper plane */
const SW = 440, SHH = 600, KEEL = 74;
const plane = (() => {
  const g = grp(W1);                       // position
  const ori = mk(g, 'o');                  // yaw/pitch/bank
  const pap = mk(ori, 'o'); pap.style.transform = 'rotateX(90deg)';
  const pp = mk(pap, 'o'); pp.style.transform = `translate(${-SW / 2}px,${-SHH * .5}px)`;
  const art = `<div style="position:absolute;inset:0;background:linear-gradient(170deg,#fffefb,#f7f4ec);"></div>
    <div style="position:absolute;left:46px;right:46px;top:250px;text-align:center;font-family:'Aref Ruqaa';font-weight:700;font-size:62px;color:#262421;direction:rtl;white-space:nowrap">عندي فكرة مشروع</div>
    <div style="position:absolute;left:120px;right:120px;top:352px;height:3px;border-radius:2px;background:rgba(38,36,33,.55)"></div>`;
  const backArt = `<div style="position:absolute;inset:0;background:linear-gradient(170deg,#f1eee6,#e7e3da)"></div>`;
  const panel = (parent, pts, front = true) => {
    const cp = `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(',')})`;
    const f = mk(parent, 'f', `width:${SW}px;height:${SHH}px;clip-path:${cp}`, art);
    const mir = `polygon(${pts.map(([x, y]) => `${SW - x}px ${y}px`).join(',')})`;
    const b = mk(parent, 'f', `width:${SW}px;height:${SHH}px;clip-path:${mir};transform:rotateY(180deg)`, backArt);
    return { f, b };
  };
  const C = SW / 2;
  const flat = mk(pp, 'f', `width:${SW}px;height:${SHH}px;box-shadow:0 0 0 1px rgba(0,0,0,.04)`, art);
  const panels = mk(pp, 'o');
  const sides = [1, -1].map((s) => {
    const X = (u) => C + s * u;            // lateral offset from the centre line
    const half = mk(panels, 'o'); half.style.transformOrigin = `${C}px 0 0`;
    const keel = panel(half, [[X(0), 0], [X(0), SHH], [X(KEEL), SHH]]);
    const wing = mk(half, 'o'); wing.style.transformOrigin = `${C}px 0 0`;
    const wp = panel(wing, [[X(0), 0], [X(C), C], [X(C), SHH], [X(KEEL), SHH]]); wp.X = X;
    const flap = mk(half, 'o'); flap.style.transformOrigin = `${C}px 0 0`;
    const fp = panel(flap, [[X(0), 0], [X(C), 0], [X(C), C]]);
    // crease line on the wing (visible once folded)
    const cr = mk(wing, 'f', `width:${SW}px;height:${SHH}px;clip-path:polygon(${X(0)}px 0,${X(C)}px ${C}px,${X(C) - s * 3}px ${C + 3}px,${X(0)}px 4px);background:rgba(120,110,95,.35);transform:translateZ(.6px)`);
    return { s, half, wing, flap, fp, cr, wp };
  });
  // flight shadow on the ground
  const shG = grp(W1); const sh = mk(shG, 'f', `left:-170px;top:-260px;width:340px;height:520px;clip-path:polygon(50% 0,100% 88%,50% 76%,0 88%);background:rgba(50,38,25,.5);transform:rotateX(90deg)`);
  return { g, ori, sides, shG, sh, flat, panels };
})();

/* ------------------------------------------------------------------ labels (sharp layer, never blurred) */
const LABELS = [];
function label(o) {
  const { x, y = 0, z, post = 70, html, w, posts = 2 } = o;
  const g = grp(W2, x, y, z); const r = mk(g, 'lab');
  const card = mk(r, 'card', `bottom:${post}px;${w ? `width:${w}px;` : ''}`, html);
  if (post > 0) for (let i = 0; i < posts; i++) mk(r, 'post', `left:${posts === 1 ? 0 : (i ? 1 : -1) * (o.pw || 150)}px;height:${post + 14}px`);
  let hang = null;
  if (o.hang) {   // a second paper strip hanging under the card on two threads; swings down into place
    hang = mk(r, 'lab'); hang.style.cssText = `position:absolute;left:0;top:${-post + 6}px;transform-style:preserve-3d;transform-origin:0 0`;
    mk(hang, '', `position:absolute;left:-150px;top:0;width:2px;height:34px;background:#6b635a`);
    mk(hang, '', `position:absolute;left:148px;top:0;width:2px;height:34px;background:#6b635a`);
    const hc = mk(hang, 'card', `top:30px;bottom:auto`, o.hang.html);
  }
  const L = { g, r, card, x, y, z, mode: 'pop', lean: .8, ...o, hangEl: hang }; LABELS.push(L); return L;
}
const LB = {
  main: label({ x: 0, z: 170, post: 150, pw: 330, html: `<div style="padding:24px 70px 28px"><div class="t" style="font-size:104px">حاضنة الأعمال</div><div class="rule" style="width:62%"></div><div class="s" style="font-size:50px">جامعة الأمير عبد القادر للعلوم الإسلامية</div></div>`,
    hang: { html: `<div style="padding:8px 46px 14px"><div class="s" style="font-size:56px;color:#1c1b19">من فكرة إلى مؤسسة</div></div>`, tin: 9.6 }, tin: 8.55, tout: 12.25, lean: .82 }),
  A: label({ x: -1020, z: 440, post: 110, pw: 120, html: `<div style="padding:16px 46px 20px"><div class="t" style="font-size:76px">المرافقة</div><div class="s" style="font-size:46px">مؤطرون يتابعونك خطوة بخطوة</div></div>`, tin: 13.65, tout: 16.95 }),
  T: label({ x: -260, z: 1160, post: 90, pw: 120, html: `<div style="padding:16px 46px 20px"><div class="t" style="font-size:76px">التكوين</div><div class="s" style="font-size:46px">دورات وورشات حضورية وأونلاين</div></div>`, tin: 19.2, tout: 21.95 }),
  K: label({ x: 880, z: 860, post: 80, pw: 60, html: `<div style="padding:14px 50px 18px"><div class="t" style="font-size:76px">التمويل</div></div>`, tin: 22.85, tout: 28.75 }),
  D: label({ x: 1560, z: -980, post: 250, pw: 160, html: `<div style="padding:16px 46px 20px"><div class="s" style="font-size:54px;color:#1c1b19">تخرّج بمشروعك: شهادة – مؤسسة ناشئة</div></div>`, tin: 39.35, tout: 42.15 }),
};
// overhead name tags (lie flat, face the overhead camera)
const OV = [['المرافقة', ST.A.x, ST.A.z - 330], ['التكوين', ST.T.x, ST.T.z + 330], ['التمويل', ST.K.x, ST.K.z - 300], ['مؤسسة ناشئة', ST.chart.x, ST.chart.z - 40]].map(([t, x, z], i) =>
  label({ x, z, post: 0, html: `<div style="padding:16px 50px 20px"><div class="t" style="font-size:110px">${t}</div></div>`, tin: 31.0 + i * .35, tout: 33.05, mode: 'flat' }));

/* ------------------------------------------------------------------ camera */
/* key: [t, cx, cy, cz, dist, rx, ry, rz, ease]   ease for the segment ending at this key:
   'L' = slow linear drift (a rest), 'S' = sine in-out, 'C' = cubic in-out.  via: intermediate poses (spline). */
const K = (t, cx, cy, cz, dist, rx, ry, rz = 0, e = 'S', via) => ({ t, p: [cx, cy, cz, dist, rx, ry, rz], e, via });
const CAM = [
  K(0.0, 0, DY - 10, 3250, -170, -54, -5, 0),
  K(2.45, 0, DY - 20, 3240, -120, -55, -2, 0, 'L'),
  K(4.45, 0, DY - 300, 3200, -380, -27, 0, 0, 'S'),
  K(9.05, 0, -470, -240, -640, -11, 0, 0, 'S'),
  K(12.05, 20, -480, -250, -590, -11, 1.5, 0, 'L'),
  K(14.15, -1290, -190, 330, -260, -15, 13, 0, 'S', [[-650, -360, 120, -560, -13, 8, 0]]),
  K(16.65, -1285, -190, 330, -215, -15, 11, 0, 'L'),
  K(18.75, -720, -160, 930, -330, -42, 14, 0, 'S'),
  K(21.85, -720, -160, 930, -290, -43, 12.5, 0, 'L'),
  K(22.75, 1330, -160, 700, -320, -22, 14, 0, 'S'),
  K(24.0, 1340, -160, 700, -300, -23, 13, 0, 'L'),
  K(25.95, 1900, -20, 1060, -160, -70, 5, 0, 'S'),
  K(28.75, 1900, -20, 1060, -120, -71, 5, 0, 'L'),
  K(30.95, 250, 0, 40, -3150, -90, 0, 0, 'C', [[1300, -80, 600, -1500, -80, 2, 0]]),
  K(32.95, 250, 0, 40, -3020, -90, 0, 0, 'L'),
  K(35.0, 660, -290, 40, -330, -14, -3, 0, 'C', [[620, -150, 0, -1500, -50, -1, 0]]),
  K(37.25, 660, -290, 40, -300, -14, -4, 0, 'L'),
  K(39.3, 1540, -170, -720, -250, -20, -11, 0, 'S', [[1150, -260, -360, -500, -18, -7, 0]]),
  K(41.65, 1540, -170, -720, -215, -20, -10, 0, 'L'),
  K(44.2, 600, -380, -150, -2350, -36, -6, 0, 'S'),
  K(45.5, 600, -380, -150, -2450, -37, -6.5, 0, 'L'),
];
function crSpline(pts, u) {       // uniform Catmull-Rom across a list of poses
  const n = pts.length - 1, x = u * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
  const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n, i + 2)];
  return p1.map((_, c) => {
    const m1 = (p2[c] - p0[c]) / (i === 0 ? 1 : 2), m2 = (p3[c] - p1[c]) / (i + 1 === n ? 1 : 2);
    const f2 = f * f, f3 = f2 * f;
    return (2 * f3 - 3 * f2 + 1) * p1[c] + (f3 - 2 * f2 + f) * m1 * (i === 0 ? 0 : 1) + (-2 * f3 + 3 * f2) * p2[c] + (f3 - f2) * m2 * (i + 1 === n ? 0 : 1);
  });
}
function camAt(t) {
  const base = camKeys(t);
  const wf = eio(P(t, 4.3, .8)) * (1 - eio(P(t, 7.5, 1.55)));
  if (wf <= 0) return base;
  const q = planePos(t) || [0, DY - 290, 3220];
  const fol = [q[0] * .85, q[1] + 60, q[2] - 120, lerp(-380, -560, P(t, 4.5, 3.5)), lerp(-27, -31, eio(P(t, 4.5, 1.5))), 0, 0];
  return base.map((v, c) => lerp(v, fol[c], wf));
}
function camKeys(t) {
  if (t <= CAM[0].t) return CAM[0].p.slice();
  for (let i = 1; i < CAM.length; i++) {
    const k = CAM[i], k0 = CAM[i - 1];
    if (t <= k.t) {
      const u = (t - k0.t) / (k.t - k0.t);
      const e = k.e === 'L' ? u : k.e === 'C' ? eio(u) : es(u);
      if (k.via) return crSpline([k0.p, ...k.via, k.p], e);
      return k0.p.map((v, c) => lerp(v, k.p[c], e));
    }
  }
  return CAM[CAM.length - 1].p.slice();
}

/* ------------------------------------------------------------------ plane path (Hermite through timed keys, like the reference van) */
const PK = [
  [4.45, 0, DY - 290, 3220], [5.6, 0, DY - 250, 2450], [6.9, 60, -1050, 1450], [8.0, 260, -820, 600], [9.05, 330, -730, 40],
  [10.55, 60, -720, -40], [12.05, -330, -700, 40],
  [13.1, -950, -600, 40], [14.15, -1660, -470, 170], [16.65, -1420, -440, 470],
  [17.7, -1200, -620, 600], [18.75, -1080, -760, 620], [20.3, -820, -790, 590], [21.0, -560, -770, 590],
  [22.0, 400, -660, 560], [22.75, 1000, -600, 400], [25.0, 1230, -620, 330], [28.75, 1480, -650, 260],
  [30.95, 1200, -820, -250], [32.95, 760, -900, -640], [35.0, 340, -940, -820], [37.25, -60, -900, -900],
  [38.3, 800, -560, -820], [39.25, 1500, -150, -730], [39.7, 1528, -142, -722], [41.0, 1528, -142, -722],
];
function planePos(t) {
  if (t <= PK[0][0]) return null;
  let i = 0; while (i < PK.length - 2 && t > PK[i + 1][0]) i++;
  const k0 = PK[Math.max(0, i - 1)], k1 = PK[i], k2 = PK[i + 1], k3 = PK[Math.min(PK.length - 1, i + 2)];
  const d = k2[0] - k1[0], u = cl((t - k1[0]) / d), u2 = u * u, u3 = u2 * u;
  const out = [];
  for (let c = 1; c < 4; c++) {
    const m1 = i === 0 ? 0 : (k2[c] - k0[c]) / (k2[0] - k0[0]) * d, m2 = i + 2 >= PK.length - 1 && k3 === k2 ? 0 : (k3[c] - k1[c]) / (k3[0] - k1[0] || 1) * d;
    out.push((2 * u3 - 3 * u2 + 1) * k1[c] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * k2[c] + (u3 - u2) * m2);
  }
  return out;
}

/* ------------------------------------------------------------------ grain */
const GRAIN = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = rnd() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); $('grain').style.background = `url(${c.toDataURL()}) 0 0/256px 256px`; return true;
})();

/* ------------------------------------------------------------------ render(t) */
function planeOrient(t) {
  t = Math.min(t, 39.15);                       // after touch-down the heading is frozen
  const a = planePos(t - .04) || [0, DY - 290, 3221], b = planePos(t + .04) || [0, DY - 290, 3220];
  const vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2], vh = Math.hypot(vx, vz);
  const yaw = vh > .05 ? Math.atan2(-vx, -vz) : 0;
  const pitch = Math.atan2(-vy, Math.max(vh, 1e-3));
  return [yaw, pitch, vh];
}
function render(T) {
  const t = T;
  let [cx, cy, cz, dist, rx, ry, rz] = camAt(t);
  // a breath of natural drift (never shaking)
  rx += Math.sin(t * .41) * .25; ry += Math.sin(t * .29 + 1) * .35;
  const cam = `translateZ(${dist.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) rotateZ(${rz.toFixed(3)}deg) translate3d(${(-cx).toFixed(2)}px,${(-cy).toFixed(2)}px,${(-cz).toFixed(2)}px)`;
  W1.style.transform = cam; W2.style.transform = cam;
  const deskOn = t < 8.6 || t > 99; DESKEL.forEach((e) => e.style.display = deskOn ? '' : 'none');
  const BBf = `rotateZ(${-rz}deg) rotateY(${-ry}deg) rotateX(${-rx}deg)`;
  for (const b of BB) b.g.style.transform = T3(b.x, b.y, b.z) + ' ' + BBf;

  /* ---- sheet folds into a plane, then flies ---- */
  const fl = eio(P(t, 2.5, .62));                 // corners fold in
  const hf = eio(P(t, 3.2, .75));                 // fold in half (mountain)
  const wo = spr(P(t, 3.85, .9), 4.5, 6);         // wings open out
  const folding = t >= 2.48;
  plane.flat.style.display = folding ? 'none' : ''; plane.panels.style.display = folding ? '' : 'none';
  for (const s of plane.sides) {
    s.flap.style.transform = `rotate3d(${s.s},1,0,${(-s.s * 180 * fl).toFixed(2)}deg)`;
    const fo = 1 - P(t, 3.12, .18); s.fp.f.style.opacity = s.fp.b.style.opacity = fo; s.flap.style.display = fo <= 0 ? 'none' : '';
    s.half.style.transform = `rotateY(${(s.s * 90 * hf).toFixed(2)}deg)`;
    s.wing.style.transform = `rotate3d(${s.s * KEEL},${SHH},0,${(-s.s * 90 * wo).toFixed(2)}deg)`;
    const C = SW / 2, tuck = eio(P(t, 3.45, .55)), TIP = C * .94, X = s.wp.X;
    const wpts = [[X(0), 0], [X(lerp(C, TIP * C / SHH, tuck)), C], [X(lerp(C, TIP, tuck)), SHH], [X(KEEL), SHH]];
    s.wp.f.style.clipPath = `polygon(${wpts.map(([x, y]) => `${x.toFixed(1)}px ${y}px`).join(',')})`;
    s.wp.b.style.clipPath = `polygon(${wpts.map(([x, y]) => `${(SW - x).toFixed(1)}px ${y}px`).join(',')})`;
    s.cr.style.opacity = cl((fl - .9) * 10) * .9 * (1 - tuck);
  }
  const lift = eio(P(t, 3.0, 1.25));
  let pp = planePos(t), yaw = 0, pitch = 0, bank = 0;
  const p0 = [0, DY - 1 - lift * 289, 3220 + 30 * (1 - lift)];
  if (!pp) pp = p0;
  const [yw, pt, vh] = planeOrient(t);
  yaw = yw;
  // bank from the turn rate
  const [ya] = planeOrient(t - .12), [yb2] = planeOrient(t + .12);
  let dy = yb2 - ya; while (dy > PI) dy -= 2 * PI; while (dy < -PI) dy += 2 * PI;
  bank = cl(-dy / .24 * .55, -.55, .55);
  pitch = cl(pt, -.5, .5) * .8;
  const settle = P(t, 39.25, .7);
  if (t > 39.25) { pitch = lerp(pitch, -.06 + .05 * Math.exp(-settle * 4) * Math.sin(settle * 14), eo3(settle)); bank = lerp(bank, .04, eo3(settle)); }
  const hover = t < 4.45 ? Math.sin(P(t, 3.6, .9) * PI) * 6 : 0;
  const wob = t > 4.45 && t < 39.2 ? Math.sin(t * 2.3) * .04 : 0;
  plane.g.style.transform = T3(pp[0], pp[1] - hover, pp[2]);
  plane.ori.style.transform = `rotateY(${(yaw / D2R).toFixed(2)}deg) rotateX(${(-pitch / D2R).toFixed(2)}deg) rotateZ(${((bank + wob) / D2R).toFixed(2)}deg)`;
  // plane shadow on desk or board
  const overDesk = pp[2] > 2700 && Math.abs(pp[0]) < 1700;
  const gy = overDesk ? DY : 0, hgt = Math.max(0, gy - pp[1]);
  plane.shG.style.transform = T3(pp[0] + hgt * SX * .6, gy - 2, pp[2] + hgt * SZ * .6) + ` rotateY(${(yaw / D2R).toFixed(2)}deg)`;
  plane.sh.style.opacity = (cl(1 - hgt / 1600) * .34 * cl((t - 4.0) * 2)).toFixed(3);
  plane.sh.style.filter = `blur(${(6 + hgt * .025).toFixed(1)}px)`;
  plane.sh.style.transform = `rotateX(90deg) scale(${(.55 + .45 * wo).toFixed(3)},1)`;

  /* ---- hall roof lifts like a lid ---- */
  const lidUp = spr(P(t, 18.35, 1.4), 4.2, 5.5) * (1 - eio(P(t, 22.4, 1.2)));
  hallLid.style.transform = T3(0, -HALL.h, -HALL.d / 2) + ` rotateX(${(lidUp * 74).toFixed(2)}deg)`;

  /* ---- coins stack up ---- */
  STACKS.forEach((s) => {
    let n = 0, fallY = null;
    s.t.forEach((tc, i) => { const f = P(t, tc, .34); if (f >= 1) n = i + 1; else if (f > 0 && fallY === null) { const yTop = -(i + 1) * COIN.th; fallY = lerp(yTop - 300, yTop, f * f); } });
    // landed coins settle with a tiny soft bounce
    const lastT = n ? s.t[n - 1] + .34 : 0, bounce = n ? Math.exp(-(t - lastT) * 9) * Math.sin((t - lastT) * 22) * 3 : 0;
    const H = n * COIN.th, e = Math.min(COIN.r * 3, COIN.r * Math.tan(Math.abs(rx) * D2R));
    s.body.style.display = n ? '' : 'none'; s.top.style.display = n ? '' : 'none';
    s.body.style.top = `${-H - bounce}px`; s.body.style.height = `${H + e}px`;
    s.body.style.borderRadius = `0 0 ${COIN.r}px ${COIN.r}px / 0 0 ${e}px ${e}px`;
    s.g.style.transform = T3(s.x, 0, s.z) + ` rotateY(${-ry}deg)`;
    s.topG.style.transform = T3(s.x, -H - bounce, s.z);
    s.fall.style.display = fallY === null ? 'none' : ''; if (fallY !== null) s.fall.style.transform = T3(s.x, fallY, s.z);
    s.shadow.style.opacity = n ? .9 : 0;
  });

  /* ---- phone flips from its back to its screen ---- */
  const fu = P(t, 24.45, 1.15), fs = spr(fu, 4.5, 6);
  const arc = Math.sin(PI * cl(fu * 1.1)) * 230;
  phone.r.style.transform = `translateY(${(-arc).toFixed(2)}px) rotateX(90deg) rotateY(${(180 - 180 * fs).toFixed(2)}deg)`;
  phone.sh.style.opacity = (1 - arc / 330).toFixed(3);
  $('n80').textContent = Math.round(lerp(10, 80, eo3(P(t, 25.2, 1.5))));
  $('n200').textContent = Math.round(lerp(20, 200, eo3(P(t, 25.9, 1.8))));

  /* ---- dotted path in the flat-lay ---- */
  const dp = P(t, 30.75, 1.9);
  DOTS.holder.style.display = t > 30.5 && t < 41 ? '' : 'none';
  const dOut = 1 - P(t, 33.2, .8);
  DOTS.dots.forEach((d) => { const v = P(dp, d.u - .02, .04); d.c.setAttribute('opacity', (v * dOut).toFixed(3)); d.c.setAttribute('r', (11 * (.5 + .5 * spr(v, 5, 6))).toFixed(2)); });
  DOTS.rings.forEach((r, i) => { const v = spr(P(t, 30.9 + i * .38, .8), 5, 6); r.setAttribute('r', (v * 64).toFixed(2)); r.setAttribute('opacity', (dOut * cl(v * 3)).toFixed(3)); });

  /* ---- pop-up chart rises from the table, then folds back ---- */
  const chDown = eio(P(t, 37.0, .75));
  CH.g.style.display = t > 32.6 && t < 38.2 ? '' : 'none';
  CH.base.style.opacity = cl(P(t, 32.9, .5)) * (1 - P(t, 37.5, .5));
  CH.cols.forEach((c, i) => {
    const up = spr(P(t, 33.55 + i * .28, 1.1), 4.5, 6);
    c.pn.style.transform = `rotateX(${(lerp(-90, 0, up) * (1 - chDown) - 90 * chDown).toFixed(2)}deg)`;
    c.pn.style.opacity = (cl(up * 4) * (1 - P(t, 37.45, .3))).toFixed(3);
  });
  CH.arrows.forEach((a, i) => { const up = spr(P(t, 34.15 + i * .28, 1.0), 4.5, 6); a.style.opacity = (cl(up * 4) * (1 - P(t, 37.45, .3))).toFixed(3); a.style.transform = `rotateX(${(lerp(-90, 0, up) * (1 - chDown) - 90 * chDown).toFixed(2)}deg)`; });

  /* ---- labels ---- */
  for (const L of LABELS) {
    const a = P(t, L.tin, 1.15), b = eio(P(t, L.tout, .55));
    const on = t > L.tin && t < L.tout + .6;
    L.g.style.display = on ? '' : 'none'; if (!on) continue;
    if (L.mode === 'flat') {
      const s = spr(P(t, L.tin, .9), 4.5, 6);
      L.g.style.transform = T3(L.x, L.y - 6, L.z) + ' ' + BBf;
      L.r.style.transform = `scale(${(.6 + .4 * s).toFixed(3)})`; L.r.style.opacity = (cl(s * 2.5) * (1 - b)).toFixed(3);
      continue;
    }
    L.g.style.transform = T3(L.x, L.y, L.z) + ` rotateY(${(-ry).toFixed(3)}deg) rotateX(${(-rx * L.lean).toFixed(2)}deg)`;
    const s = spr(a, 4.5, 6);
    L.r.style.transform = `rotateX(${(lerp(-90, 0, s) - 90 * b).toFixed(2)}deg)`;
    L.r.style.opacity = (cl(a * 6) * (1 - cl(b * 1.4 - .4))).toFixed(3);
    if (L.hang) {
      const h = P(t, L.hang.tin, 1.3), hs = spr(h, 4, 6);
      L.hangEl.style.transform = `rotateX(${lerp(-92, 0, hs).toFixed(2)}deg)`;
      L.hangEl.style.opacity = cl(h * 5);
    }
  }

  /* ---- whip pan: blur the model only (labels stay sharp) ---- */
  const c0 = camAt(t - 1 / 120), c1 = camAt(t + 1 / 120);
  const angV = Math.abs(c1[5] - c0[5]) * 60, linV = Math.hypot(c1[0] - c0[0], c1[2] - c0[2]) * 60;
  const mbx = t > 21.8 && t < 22.8 ? cl(angV * .12 + linV * .0028, 0, 9) : 0;
  $('mbB').setAttribute('stdDeviation', `${mbx.toFixed(2)} 0`);

  /* ---- final: light flare reveals the brand ---- */
  const fl2 = P(t, 42.2, 1.6);
  $('flare').style.opacity = (Math.sin(fl2 * PI) * .92).toFixed(3);
  $('flare').style.transform = `scale(${lerp(.55, 1.5, eo3(fl2)).toFixed(3)})`;
  const wash = eio(P(t, 42.55, .9));
  $('wash').style.opacity = (wash * .84).toFixed(3);
  const blur = wash * 9;
  $('vp1').style.filter = mbx > .2 ? 'url(#mb)' : blur > .2 ? `blur(${blur.toFixed(2)}px)` : 'none';
  $('vp2').style.opacity = 1 - wash;
  const bIn = (s, d = .9) => P(t, s, d);
  const mkI = bIn(42.85, 1.0), mkS = spr(mkI, 4.5, 6);
  $('bMk').style.transform = `translateY(${lerp(30, 0, mkS).toFixed(2)}px) scale(${lerp(.86, 1, mkS).toFixed(3)})`; $('bMk').style.opacity = cl(mkI * 3);
  [...$('bTtl').querySelectorAll('.w')].forEach((w, i) => { const e = bIn(43.05 + i * .16, 1.0), s = spr(e, 4.5, 6); w.style.transform = `translateY(${lerp(40, 0, s).toFixed(2)}px)`; w.style.opacity = cl(e * 2.5); });
  const gr = eio(bIn(43.45, .9)); $('bGr').style.transform = `scaleX(${gr.toFixed(3)})`; $('bGr').style.opacity = gr;
  const un = bIn(43.6, .8); $('bUni').style.transform = `translateY(${lerp(18, 0, eo3(un)).toFixed(2)}px)`; $('bUni').style.opacity = un;
  const pl = bIn(44.0, 1.0), pls = spr(pl, 4.5, 6); $('bPill').style.transform = `translateY(${lerp(30, 0, pls).toFixed(2)}px) scale(${lerp(.9, 1, pls).toFixed(3)})`; $('bPill').style.opacity = cl(pl * 3);
  $('brand').style.display = t > 42.7 ? 'flex' : 'none';

  /* ---- tilt-shift strength, warmth, grain ---- */
  const ts = 1;
  ['tsT1', 'tsT2', 'tsB1', 'tsB2'].forEach((id) => { const e = $(id); if (e) e.style.opacity = ts; });
  const fr = Math.floor(t * 60);
  $('grain').style.transform = `translate(${((fr * 73) % 64) - 32}px,${((fr * 151) % 64) - 32}px)`;
  // fade in from black-ish warm at the very start
  $('stage').style.opacity = 1;
}

window.render = render; window.DUR = DUR;
window.ready = (async () => {
  drawGround();
  await Promise.all(['700 40px "Reem Kufi"', '700 40px Tajawal', '500 40px Tajawal', '800 40px Cairo', '700 40px "Aref Ruqaa"'].map((f) => document.fonts.load(f, 'ابت 0123')));
  await document.fonts.ready; render(0); return true;
})();
