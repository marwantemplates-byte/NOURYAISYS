// Records nourys-promo.html to MP4 frame-by-frame with a virtual clock (deterministic, no dropped frames).
// node record.js <out.mp4> <startSec> <endSec> [gsapLocalPath]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [out, s0, s1, gsapLocal] = process.argv.slice(2);
  const start = +s0, end = +s1, FPS = 60;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  if (gsapLocal) await page.route('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    r => r.fulfill({ path: gsapLocal, contentType: 'application/javascript' }));
  await page.goto('file://' + path.join(__dirname, 'nourys-promo.html#capture'));
  await page.waitForTimeout(4000);
  if (!(await page.evaluate(() => !!window.NOURYS_RENDER))) throw new Error('page not ready');
  await page.evaluate(() => { document.getElementById('replay').style.display = 'none'; });
  const R = (t) => page.evaluate((t) => window.NOURYS_RENDER(t), t);
  for (let k = 0; k < Math.round(start * FPS); k++) await R(k / FPS);   // step forward so callbacks fire in order
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((end - start) * FPS);
  for (let i = 0; i < n; i++) {
    await R(start + i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 120 === 0) process.stderr.write(`${out}: ${i}/${n}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await browser.close();
})();
