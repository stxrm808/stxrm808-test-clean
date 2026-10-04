// node render.js <outDir> [frames comma list | all] [workers]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const outDir = process.argv[2]; const which = process.argv[3] || 'all'; const WORKERS = +(process.argv[4] || 4);
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files'] });
  const mk = async () => {
    const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    p.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(1); });
    await p.goto('file://' + path.join(__dirname, 'anim.html'));
    await p.evaluate(() => window.ready);
    return p;
  };
  const first = await mk();
  const meta = await first.evaluate(() => window.META);
  const total = Math.round(meta.DUR * meta.FPS);
  const frames = which === 'all' ? [...Array(total).keys()] : which.split(',').map(Number);
  const pages = [first]; for (let i = 1; i < WORKERS; i++) pages.push(await mk());
  let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async p => {
    const cv = await p.$('canvas');
    while (next < frames.length) {
      const f = frames[next++];
      await p.evaluate(fr => window.renderFrame(fr), f);
      await cv.screenshot({ path: path.join(outDir, `f_${String(f).padStart(5, '0')}.png`) });
      if (++done % 120 === 0) console.log(done, '/', frames.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
  }));
  await browser.close();
  console.log('done', done, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
