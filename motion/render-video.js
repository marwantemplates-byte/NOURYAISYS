// Render frames [from,to) of film.html as JPEG into a directory: node render-video.js dir from to [--v=9x16]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const a = process.argv.slice(2), vert = a.includes('--v=9x16'); const [dir, from, to] = a.filter((x) => !x.startsWith('--'));
  const W = vert ? 1080 : 1920, H = vert ? 1920 : 1080;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(__dirname, 'film.html') + '?render=1' + (vert ? '&v=9x16' : ''));
  await p.waitForFunction(() => window.READY === true);
  for (let f = +from; f < +to; f++) {
    await p.evaluate((t) => window.seek(t), f / 60);
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.screenshot({ path: path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
  }
  await b.close();
})();
