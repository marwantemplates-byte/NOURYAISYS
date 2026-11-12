/**
 * WebGL "wind in the trees" effect for the hero image.
 *
 * Only green vegetation pixels move (detected by colour in the shader).
 * The building, minarets, sky and stone path stay perfectly still.
 */

/** How far the foliage sways, as a fraction of the image width (0.004 ≈ 8px on a 2000px image). */
export const WIND_STRENGTH = 0.004;
/** Speed of the wind wave (1 = calm default, 2 = twice as fast). */
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
precision mediump float;

uniform sampler2D u_image;
uniform vec2  u_scale;     // object-fit: cover scale (canvas uv -> image uv)
uniform vec2  u_texel;     // 1 / image size
uniform float u_time;
uniform float u_strength;
uniform float u_speed;

varying vec2 v_uv;

// 0..1: how much this colour looks like vegetation
float greenMask(vec3 c) {
  float mx  = max(c.r, max(c.g, c.b));
  float mn  = min(c.r, min(c.g, c.b));
  float sat = (mx - mn) / max(mx, 0.001);
  float gOverB = smoothstep(0.02, 0.10, c.g - c.b);   // excludes the blue sky
  float gOverR = smoothstep(-0.02, 0.05, c.g - c.r);  // excludes ivory stone & building
  float satOk  = smoothstep(0.10, 0.24, sat);         // excludes greys / whites
  float notTooBright = 1.0 - smoothstep(0.88, 0.97, mx);
  return gOverB * gOverR * satOk * notTooBright;
}

// Softened mask: average of 5 taps so edges fade smoothly
float softMask(vec2 uv) {
  vec2 o = u_texel * 2.5;
  float m = greenMask(texture2D(u_image, uv).rgb) * 2.0;
  m += greenMask(texture2D(u_image, uv + vec2( o.x, 0.0)).rgb);
  m += greenMask(texture2D(u_image, uv + vec2(-o.x, 0.0)).rgb);
  m += greenMask(texture2D(u_image, uv + vec2(0.0,  o.y)).rgb);
  m += greenMask(texture2D(u_image, uv + vec2(0.0, -o.y)).rgb);
  return m / 6.0;
}

void main() {
  // object-fit: cover; object-position: center
  vec2 uv = (v_uv - 0.5) * u_scale + 0.5;

  float t = u_time * u_speed;

  // Gusts: slow, layered envelope (always >= ~0.35 so it never fully stops)
  float gust = 0.55
    + 0.25 * sin(t * 0.37)
    + 0.15 * sin(t * 0.91 + 1.3)
    + 0.10 * sin(t * 1.73 + 4.0);

  // Wave travels left -> right (phase decreases with time along +x)
  float wave = sin(uv.x * 7.0 - t * 1.6 + uv.y * 2.0);
  float flutter = sin(uv.x * 38.0 + uv.y * 27.0 - t * 4.3) * 0.35;

  // Stronger near the bottom and on the foreground foliage at the sides
  float bottom = smoothstep(0.15, 1.0, uv.y);
  float side   = smoothstep(0.30, 0.0, min(uv.x, 1.0 - uv.x));
  float weight = 0.35 + 0.45 * bottom + 0.45 * side;

  float amount = u_strength * gust * weight;
  vec2 disp = vec2((wave * 0.8 + 0.5 + flutter) * amount,   // drift to the right
                   (sin(uv.x * 11.0 - t * 2.1) * 0.25) * amount);

  float m = softMask(uv);
  vec2 suv = clamp(uv - disp * m, 0.0, 1.0);
  vec3 original = texture2D(u_image, uv).rgb;
  vec3 moved    = texture2D(u_image, suv).rgb;

  // Only accept the displaced sample if it is also vegetation, so the
  // building/sky never bleed into the trees.
  float m2 = m * softMask(suv);
  gl_FragColor = vec4(mix(original, moved, m2), 1.0);
}
`;

export type WindRenderer = {
  setImage: (img: HTMLImageElement) => void;
  resize: (width: number, height: number) => void;
  render: (timeSeconds: number) => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

/** Returns null when WebGL is unavailable — the caller keeps the plain image. */
export function createWindRenderer(canvas: HTMLCanvasElement): WindRenderer | null {
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
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
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
  const uTime = gl.getUniformLocation(program, "u_time");
  const uStrength = gl.getUniformLocation(program, "u_strength");
  const uSpeed = gl.getUniformLocation(program, "u_speed");
  gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);
  gl.uniform1f(uStrength, WIND_STRENGTH);
  gl.uniform1f(uSpeed, WIND_SPEED);

  let imgW = 1;
  let imgH = 1;
  let viewW = 1;
  let viewH = 1;
  let hasImage = false;

  const updateScale = () => {
    if (!gl) return;
    // cover: the image fills the canvas, overflow is cropped equally on both sides
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
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      imgW = img.naturalWidth || 1;
      imgH = img.naturalHeight || 1;
      gl.uniform2f(uTexel, 1 / imgW, 1 / imgH);
      hasImage = true;
      updateScale();
    },
    resize(width, height) {
      if (!gl) return;
      viewW = Math.max(1, width);
      viewH = Math.max(1, height);
      gl.viewport(0, 0, viewW, viewH);
      updateScale();
    },
    render(time) {
      if (!gl || !hasImage) return;
      gl.uniform1f(uTime, time);
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
