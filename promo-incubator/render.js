// Frame-exact renderer (same pipeline as promo-v3/render.js, landscape 60 fps).
//   node render.js stills <dir> t1 t2 ...
//   node render.js video <out.mp4> <start> <end> [sub=2]
// Video: renders `sub` sub-frames per output frame inside a 180° shutter and averages them (tmix)
// → a light, natural motion blur on fast moves while slow moves and holds stay razor sharp.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// render(t) then wait two frames so every re-rastered 3D tile is complete before capture
const settle = (t) => { window.render(t); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); };

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', ...(process.env.GL==='base'?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader'])] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(__dirname, 'film.html'));
  await page.evaluate(() => window.ready);
  for (let i = 0; i < 2; i++) { await page.evaluate(() => window.render(0)); await page.screenshot(); } // GPU warm-up

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest) {
      await page.evaluate(settle, +t);
      await page.screenshot({ path: path.join(out, `t${String(t).replace('.', '_')}.png`) });
    }
  } else {
    const start = +rest[0], end = +rest[1], sub = +(rest[2] || 2), fps = 60;
    const n = Math.round((end - start) * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-',
      '-vf', `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/${fps}/TB`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps),
      '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      for (let s = 0; s < sub; s++) {
        const t = start + (i + (s / sub) * 0.5) / fps;   // 180° shutter
        await page.evaluate(settle, t);
        const buf = await page.screenshot({ type: 'png' });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      if (i % 60 === 0) process.stderr.write(`${path.basename(out)} frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
