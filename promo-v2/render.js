// node render.js stills <dir> t1 t2 ...
// node render.js video <out.mp4> <start> <end> [sub=3]
// Motion blur: renders `sub` sub-frames per output frame (240° shutter) and averages them.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(() => window.ready);

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const t of rest) {
      await page.evaluate((t) => window.render(t), +t);
      await page.screenshot({ path: path.join(out, `t${String(t).replace('.', '_')}.png`) });
    }
  } else {
    const start = +rest[0], end = +rest[1], sub = +(rest[2] || 3), fps = 30;
    const n = Math.round((end - start) * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-',
      '-vf', `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/${fps}/TB`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps),
      '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      for (let s = 0; s < sub; s++) {
        const t = start + (i + (s / sub) * (2 / 3)) / fps;   // 240° shutter
        await page.evaluate((t) => window.render(t), t);
        const buf = await page.screenshot({ type: 'png' });
        if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      }
      if (i % 30 === 0) process.stderr.write(`frame ${i}/${n}\n`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})();
