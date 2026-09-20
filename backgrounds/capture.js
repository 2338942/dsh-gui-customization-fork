// capture.js — render Earth frames via headless Edge + puppeteer-core
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const W = 1920, H = 1080;
const FPS = 24;
const DURATION = 30;          // seconds (one full rotation → seamless loop)
const TOTAL = FPS * DURATION; // 720 frames
const OUT = path.join(dir, 'frames');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu-sandbox', '--use-gl=angle', '--use-angle=swiftshader',
           `--window-size=${W},${H}`, '--force-device-scale-factor=1', '--hide-scrollbars',
           '--disable-lcd-text', '--mute-audio', '--disable-background-timer-throttling'],
    defaultViewport: { width: W, height: H }
  });
  const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
  page.on('pageerror', (e) => console.log('PAGE ERROR:', String(e)));

  await page.goto('file:///' + path.join(dir, 'render.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  // wait until textures loaded & ready
  for (let i = 0; i < 100; i++) {
    const ready = await page.evaluate(() => window.__ready === true).catch(() => false);
    if (ready) break;
    await new Promise(r => setTimeout(r, 200));
  }
  const ready = await page.evaluate(() => window.__ready === true).catch(() => false);
  if (!ready) { console.log('FATAL: renderer not ready'); await browser.close(); process.exit(2); }
  console.log('renderer ready');

  const t0 = Date.now();
  for (let i = 0; i < TOTAL; i++) {
    const t = i / FPS;
    await page.evaluate((tt) => window.__renderFrame(tt), t);
    const file = path.join(OUT, 'frame-' + String(i).padStart(4, '0') + '.png');
    await page.screenshot({ path: file });
    if (i % 60 === 0) {
      const spd = (i + 1) / ((Date.now() - t0) / 1000);
      console.log(`frame ${i}/${TOTAL} @ ${spd.toFixed(1)} fps, ${((Date.now()-t0)/1000).toFixed(0)}s`);
    }
  }
  await browser.close();
  console.log('DONE', TOTAL, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
  process.exit(0);
})().catch((e) => { console.error('CAPTURE FAIL:', e); process.exit(1); });
