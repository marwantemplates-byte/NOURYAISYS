/**
 * Calm, orderly stream of leaves drawn on a Canvas 2D layer.
 * Leaves enter from the LEFT edge and drift to the RIGHT with the wind.
 */

/** Number of leaves on screens >= 768px wide. */
export const LEAF_COUNT_DESKTOP = 40;
/** Number of leaves on screens < 768px wide. */
export const LEAF_COUNT_MOBILE = 18;
/** Extra leaves in the TOP band on the login / register pages (desktop, mobile). */
export const LEAF_EXTRA_TOP_DESKTOP = 16;
export const LEAF_EXTRA_TOP_MOBILE = 8;

const GREENS = ["#4F7D3A", "#2E6B4A", "#6E9440", "#86A84B", "#3F6B33"];
const GOLDS = ["#C9A24B", "#D8B45E", "#B88A35", "#E0C27A"];

type ShapeFn = (ctx: CanvasRenderingContext2D) => void;

// All shapes are drawn pointing along +x, roughly within [-1, 1] x [-0.5, 0.5].
const SHAPES: ShapeFn[] = [
  // 1. Olive leaf — long and narrow
  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.quadraticCurveTo(0, -0.32, 1, 0);
    ctx.quadraticCurveTo(0, 0.32, -1, 0);
    ctx.closePath();
  },
  // 2. Oval leaf with pointed tip
  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-0.9, 0);
    ctx.bezierCurveTo(-0.6, -0.6, 0.5, -0.55, 1, 0);
    ctx.bezierCurveTo(0.5, 0.55, -0.6, 0.6, -0.9, 0);
    ctx.closePath();
  },
  // 3. Teardrop / heart-base leaf
  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-0.8, 0);
    ctx.bezierCurveTo(-1.0, -0.55, -0.1, -0.7, 1, 0);
    ctx.bezierCurveTo(-0.1, 0.7, -1.0, 0.55, -0.8, 0);
    ctx.closePath();
  },
  // 4. Slightly curved willow-like leaf
  (ctx) => {
    ctx.beginPath();
    ctx.moveTo(-1, 0.1);
    ctx.bezierCurveTo(-0.4, -0.35, 0.4, -0.4, 1, -0.12);
    ctx.bezierCurveTo(0.4, 0.05, -0.4, 0.3, -1, 0.1);
    ctx.closePath();
  },
];

type Sprite = { canvas: HTMLCanvasElement; half: number };

type Leaf = {
  sprite: Sprite;
  x: number;
  lane: number; // 0..1 base height
  speed: number; // px/s
  amp: number; // px
  freq: number; // rad per px
  phase: number;
  rot: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  scale: number;
  alpha: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function makeSprite(shape: ShapeFn, color: string, size: number, blur: number): Sprite {
  const pad = Math.ceil(blur * 3) + 2;
  const half = Math.ceil(size) + pad;
  const c = document.createElement("canvas");
  // Rendered at 2x so leaves stay crisp on high-density screens
  c.width = c.height = half * 4;
  const ctx = c.getContext("2d");
  if (!ctx) return { canvas: c, half };
  ctx.scale(2, 2);
  ctx.translate(half, half);
  if (blur > 0 && "filter" in ctx) ctx.filter = `blur(${blur * 2}px)`;
  ctx.scale(size, size);
  shape(ctx);
  ctx.fillStyle = color;
  ctx.fill();
  // Midrib
  ctx.beginPath();
  ctx.moveTo(-0.85, 0);
  ctx.quadraticCurveTo(0, -0.04, 0.9, 0);
  ctx.lineWidth = 0.06;
  ctx.strokeStyle = "rgba(255,255,240,0.35)";
  ctx.stroke();
  return { canvas: c, half };
}

export type LeafField = {
  resize: (cssW: number, cssH: number, dpr: number) => void;
  update: (dt: number, time: number) => void;
  draw: () => void;
};

export type LeafOptions = {
  /** Extra leaves drifting in the top third (desktop / mobile). */
  extraTop?: { desktop: number; mobile: number };
};

export function createLeafField(canvas: HTMLCanvasElement, opts: LeafOptions = {}): LeafField | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let w = 1;
  let h = 1;
  let dpr = 1;
  let leaves: Leaf[] = [];
  let count = 0;

  const margin = 60;

  const build = (n: number, extra: number) => {
    leaves = [];
    for (let i = 0; i < n + extra; i++) {
      const isExtra = i >= n;
      const gold = Math.random() < 0.3;
      const palette = gold ? GOLDS : GREENS;
      const depth = Math.random(); // 0 = far, 1 = near
      const blurred = depth > 0.85 || depth < 0.12; // a few out-of-focus leaves
      const size = 8 + depth * 11 + (blurred && depth > 0.5 ? 5 : 0);
      const sprite = makeSprite(
        SHAPES[i % SHAPES.length],
        palette[Math.floor(Math.random() * palette.length)],
        size,
        blurred ? rand(1.5, 2.8) : 0,
      );
      leaves.push({
        sprite,
        // Spread across the whole hero on load — never starts empty
        x: rand(-margin, w + margin),
        // Orderly lanes from top to ~88% of height, with slight jitter.
        // Extra leaves get their own lanes in the top band (2%–32%).
        lane: isExtra
          ? 0.02 + ((i - n + 0.5) / extra) * 0.3 + rand(-0.015, 0.015)
          : Math.min(0.9, ((i + 0.5) / n) * 0.86 + 0.03 + rand(-0.015, 0.015)),
        speed: 26 + depth * 34 + rand(-4, 4),
        amp: rand(10, 26),
        freq: rand(0.006, 0.012),
        phase: rand(0, Math.PI * 2),
        rot: rand(-0.4, 0.4),
        rotSpeed: rand(0.25, 0.7) * (Math.random() < 0.5 ? -1 : 1),
        flip: rand(0, Math.PI * 2),
        flipSpeed: rand(0.8, 1.6),
        scale: 1,
        alpha: blurred ? 0.7 : rand(0.8, 0.95),
      });
    }
    // Shuffle so lanes and depth aren't correlated in draw order
    leaves.sort(() => Math.random() - 0.5);
  };

  return {
    resize(cssW, cssH, ratio) {
      const prevW = w;
      w = cssW;
      h = cssH;
      dpr = ratio;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const mobile = w < 768;
      const n = mobile ? LEAF_COUNT_MOBILE : LEAF_COUNT_DESKTOP;
      const extra = opts.extraTop ? (mobile ? opts.extraTop.mobile : opts.extraTop.desktop) : 0;
      if (n + extra !== count) {
        count = n + extra;
        build(n, extra);
      } else if (prevW !== w) {
        for (const l of leaves) l.x = (l.x / prevW) * w;
      }
    },
    update(dt, time) {
      // Gentle shared gust so the stream breathes with the trees
      const gust = 0.85 + 0.15 * Math.sin(time * 0.37);
      for (const l of leaves) {
        l.x += l.speed * gust * dt;
        l.rot += l.rotSpeed * dt;
        l.flip += l.flipSpeed * dt;
        if (l.x > w + margin) {
          l.x = -margin - rand(0, 40);
          l.phase = rand(0, Math.PI * 2);
        }
      }
    },
    draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const l of leaves) {
        const y = l.lane * h + Math.sin(l.x * l.freq + l.phase) * l.amp;
        // Tilt follows the wavy path a little
        const slope = Math.cos(l.x * l.freq + l.phase) * l.amp * l.freq;
        const flipY = Math.cos(l.flip); // -1..1, the leaf turns over
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(l.x, y);
        ctx.rotate(l.rot * 0.5 + Math.atan(slope));
        ctx.scale(1, flipY < 0 ? Math.min(-0.15, flipY) : Math.max(0.15, flipY));
        ctx.globalAlpha = l.alpha * (0.75 + 0.25 * Math.abs(flipY));
        const s = l.sprite;
        ctx.drawImage(s.canvas, -s.half, -s.half, s.half * 2, s.half * 2);
      }
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
  };
}
