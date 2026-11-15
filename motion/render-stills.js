// Render single frames of film.html: node render-stills.js out-dir t1 t2 ... [--v=9x16]
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  const vert = args.includes('--v=9x16');
  const [out, ...times] = args.filter((a) => !a.startsWith('--'));
  const W = vert ? 1080 : 1920, H = vert ? 1920 : 1080;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  const url = 'file://' + path.resolve(__dirname, 'film.html') + '?render=1' + (vert ? '&v=9x16' : '');
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
  for (const t of times) {
    await page.evaluate((x) => window.seek(x), +t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const f = path.join(out, `t${String((+t).toFixed(2)).padStart(5, '0')}${vert ? '-v' : ''}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
})();
