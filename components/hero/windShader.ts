/**
 * WebGL "wind in the trees" effect for the hero image.
 * Only vegetation pixels move (detected by colour in the shader).
 * The building, minarets, sky and stone path stay perfectly still.
 */

// قوة الريح: أقصى إزاحة بالبكسل للأشجار القريبة (يمين ويسار الصورة وأسفلها).
// الأشجار البعيدة تتحرك تقريبًا ثلث هذه القيمة. جرّب بين 6 و 14.
export const WIND_STRENGTH = 10;

// سرعة الريح: 1 = هادئة وطبيعية (تمايل كل 4 ثوانٍ تقريبًا)، 1.5 = أسرع، 0.7 = أبطأ.
export const WIND_SPEED = 1.0;

export const VERTEX_SHADER = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  v_uv.y = 1.0 - v_uv.y;           // top-left origin, like the image
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D u_image;
uniform vec2  u_scale;     // object-fit: cover (canvas uv -> image uv)
uniform vec2  u_texel;     // 1 / image size
uniform vec2  u_view;      // canvas size in CSS pixels
uniform float u_time;      // seconds, wrapped on the CPU to keep precision
uniform float u_strength;  // px
uniform float u_speed;
uniform float u_debug;     // 1.0 = show the vegetation mask

varying vec2 v_uv;

const float TAU = 6.2831853;

// ---------- vegetation mask ----------
float vegetation(vec3 c) {
  float mx  = max(c.r, max(c.g, c.b));
  float mn  = min(c.r, min(c.g, c.b));
  float sat = (mx - mn) / max(mx, 0.001);
  float lum = dot(c, vec3(0.299, 0.587, 0.114));

  // Soft green rule: G >= R and G >= B (small margin) — catches grey-green olive trees
  float greenish = smoothstep(-0.035, 0.015, c.g - c.r)
                 * smoothstep(-0.015, 0.035, c.g - c.b)
                 * smoothstep(0.05, 0.11, sat);

  // Palm / olive yellow-green tones: R slightly above G, clearly warmer than blue
  float palm = (1.0 - smoothstep(0.03, 0.13, c.r - c.g))
             * smoothstep(0.10, 0.20, c.g - c.b)
             * smoothstep(0.26, 0.38, sat);

  float m = max(greenish, palm);

  // Exclusions
  float paleBright = smoothstep(0.62, 0.78, lum) * (1.0 - smoothstep(0.16, 0.30, sat)); // cream/white building
  float skyBlue    = smoothstep(0.0, 0.05, c.b - c.g);                                  // blue dominant
  float tooDark    = 1.0 - smoothstep(0.03, 0.08, lum);
  return m * (1.0 - paleBright) * (1.0 - skyBlue) * (1.0 - tooDark);
}

// Smoothed mask (9 taps) so edges fade softly
float softMask(vec2 uv) {
  vec2 o = u_texel * 2.0;
  float m = vegetation(texture2D(u_image, uv).rgb) * 4.0;
  m += vegetation(texture2D(u_image, uv + vec2( o.x, 0.0)).rgb) * 2.0;
  m += vegetation(texture2D(u_image, uv + vec2(-o.x, 0.0)).rgb) * 2.0;
  m += vegetation(texture2D(u_image, uv + vec2(0.0,  o.y)).rgb) * 2.0;
  m += vegetation(texture2D(u_image, uv + vec2(0.0, -o.y)).rgb) * 2.0;
  m += vegetation(texture2D(u_image, uv + o).rgb);
  m += vegetation(texture2D(u_image, uv - o).rgb);
  m += vegetation(texture2D(u_image, uv + vec2(o.x, -o.y)).rgb);
  m += vegetation(texture2D(u_image, uv + vec2(-o.x, o.y)).rgb);
  return smoothstep(0.12, 0.55, m / 16.0);
}

// ---------- value noise ----------
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

void main() {
  // object-fit: cover; object-position: center
  vec2 uv = (v_uv - 0.5) * u_scale + 0.5;
  float t = u_time * u_speed;

  // Depth: foreground = left/right edges and bottom; far trees = centre
  float side   = 1.0 - smoothstep(0.02, 0.24, min(uv.x, 1.0 - uv.x));
  float bottom = smoothstep(0.55, 0.95, uv.y);
  float near   = max(side, bottom);
  float depth  = mix(0.3, 1.0, near);              // 3px far .. 10px near (with strength 10)

  // Vertical falloff in the central column (where the minarets and sky are):
  // there, nothing above ~35% of the height moves. The left third (foreground
  // olive tree) and the edges stay free.
  float leftOlive = 1.0 - smoothstep(0.30, 0.40, uv.x);
  float gate = max(max(side, leftOlive), smoothstep(0.30, 0.50, uv.y));

  float m = softMask(uv) * gate;

  if (u_debug > 0.5) {
    gl_FragColor = vec4(vec3(m), 1.0);
    return;
  }

  // ---- wind field (travels LEFT -> RIGHT: phase = k*x - w*t) ----
  // slow sway, period ~4 s and ~2.7 s
  float sway  = sin(TAU * (t / 4.0) - uv.x * 3.0 + uv.y * 0.8);
  float sway2 = sin(TAU * (t / 2.7) - uv.x * 5.5 + 1.7);
  // occasional gusts: noise front moving to the right
  float gust  = smoothstep(0.45, 0.85, noise(vec2(uv.x * 1.6 - t * 0.45, uv.y * 0.8 + t * 0.05)));
  float gustT = smoothstep(0.35, 0.75, noise(vec2(t * 0.15, 7.3)));   // global gust envelope
  // small fast flutter with per-region phase so it is not one uniform wave
  float ph    = noise(uv * vec2(28.0, 36.0)) * TAU;
  float flutter = sin(t * 7.5 + ph) * 0.5 + sin(t * 11.3 + ph * 1.7) * 0.25;

  float dx = 0.30                                  // steady lean to the right
           + 0.45 * sway + 0.18 * sway2
           + 0.55 * gust * (0.4 + 0.6 * gustT)
           + 0.22 * flutter;
  float dy = 0.18 * sin(TAU * (t / 3.6) - uv.x * 4.0) + 0.12 * flutter;

  vec2 dispPx  = vec2(dx, dy) * u_strength * depth * m;  // CSS pixels
  vec2 dispUv  = dispPx / u_view * u_scale;              // -> image uv

  vec2 suv = clamp(uv - dispUv, 0.0, 1.0);               // sample from the left => moves right
  vec3 original = texture2D(u_image, uv).rgb;
  vec3 moved    = texture2D(u_image, suv).rgb;

  // Only accept the displaced sample if it is also vegetation,
  // so the building / sky never bleed into the trees.
  float accept = clamp(softMask(suv) * 1.5, 0.0, 1.0) * smoothstep(0.05, 0.35, m);
  gl_FragColor = vec4(mix(original, moved, accept), 1.0);
}
`;

export type WindRenderer = {
  setImage: (img: HTMLImageElement) => void;
  resize: (width: number, height: number, cssWidth: number, cssHeight: number) => void;
  render: (timeSeconds: number) => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[hero] shader compile error:", gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/** Returns null when WebGL is unavailable — the caller keeps the plain image. */
export function createWindRenderer(
  canvas: HTMLCanvasElement,
  opts: { debugMask?: boolean } = {},
): WindRenderer | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    }) as WebGLRenderingContext | null;
  } catch {
    gl = null;
  }
  if (!gl) return null;

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[hero] program link error:", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  // Non power-of-two safe settings
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const uScale = gl.getUniformLocation(program, "u_scale");
  const uTexel = gl.getUniformLocation(program, "u_texel");
  const uView = gl.getUniformLocation(program, "u_view");
  const uTime = gl.getUniformLocation(program, "u_time");
  gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
  gl.uniform1f(gl.getUniformLocation(program, "u_strength"), WIND_STRENGTH);
  gl.uniform1f(gl.getUniformLocation(program, "u_speed"), WIND_SPEED);
  gl.uniform1f(gl.getUniformLocation(program, "u_debug"), opts.debugMask ? 1 : 0);

  let imgW = 1;
  let imgH = 1;
  let viewW = 1;
  let viewH = 1;
  let hasImage = false;

  const updateScale = () => {
    if (!gl) return;
    const canvasAspect = viewW / viewH;
    const imageAspect = imgW / imgH;
    let sx = 1;
    let sy = 1;
    if (canvasAspect > imageAspect) sy = imageAspect / canvasAspect;
    else sx = canvasAspect / imageAspect;
    gl.uniform2f(uScale, sx, sy);
  };

  return {
    setImage(img) {
      if (!gl) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      imgW = img.naturalWidth || 1;
      imgH = img.naturalHeight || 1;
      gl.uniform2f(uTexel, 1 / imgW, 1 / imgH);
      hasImage = true;
      updateScale();
    },
    resize(width, height, cssWidth, cssHeight) {
      if (!gl) return;
      viewW = Math.max(1, width);
      viewH = Math.max(1, height);
      gl.viewport(0, 0, viewW, viewH);
      gl.uniform2f(uView, Math.max(1, cssWidth), Math.max(1, cssHeight));
      updateScale();
    },
    render(time) {
      if (!gl || !hasImage) return;
      // Wrap time so float precision never degrades (LCM-friendly period ≈ 10.8 min)
      gl.uniform1f(uTime, time % 648);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      if (!gl) return;
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl = null;
    },
  };
}
