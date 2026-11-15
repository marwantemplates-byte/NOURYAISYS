// Frame-exact renderer (same approach as promo-v3/render.js).
//   node render.js stills <dir> t1 t2 ...          → PNG stills
//   node render.js video <out.mp4> <start> <end>   → H.264 chunk, 60 fps, frame n shows t = start + n/60
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  // new headless + SwiftShader GL compositing is ~6× faster than the legacy software compositor for this many 3D layers
  const browser = await chromium.launch({ channel: 'chromium', args: ['--force-color-profile=srgb', '--disable-lcd-text', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-background-networking', '--disable-component-update', '--no-first-run'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  page.on('console', (m) => console.error('console:', m.text()));
  await page.goto('file://' + path.join(__dirname, process.env.PAGE || 'film.html'), { timeout: 180000 });
  await page.evaluate(() => window.ready);
  const cdp = await page.context().newCDPSession(page);
  const shot = async () => Buffer.from((await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true })).data, 'base64');
  const show = async (t) => { await page.evaluate((t) => window.render(t), t); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };
  for (let i = 0; i < 2; i++) { await show(+(rest[0] || 0)); await shot(); }   // warm-up

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest) {
      await show(+t);
      fs.writeFileSync(path.join(out, `t${(+t).toFixed(2).replace('.', '_')}.png`), await shot());
    }
  } else {
    const start = +rest[0], end = +rest[1], fps = 60;
    const n = Math.round((end - start) * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await show(start + i / fps);
      const buf = await shot();
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 60 === 0) process.stderr.write(`${path.basename(out)} frame ${i}/${n}  ${((Date.now() - t0) / 1000 / (i + 1)).toFixed(2)} s/frame\n`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
