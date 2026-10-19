// Scrollt die Seite per Mausrad durch (wie ein Nutzer, damit Smooth Scroll und Scroll-Animationen greifen)
// und speichert Standbilder. Meldet Konsolenfehler.
// Aufruf: node scripts/audit/scroll-frames.mjs <url> <ausgabeordner> [breite] [höhe] [schritt]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [url = 'http://localhost:4321/', out = 'audit/frames', w = '1440', h = '900', step = '600'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const width = Number(w);
const height = Number(h);
const mobile = width < 768;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  ...(mobile ? { isMobile: true, hasTouch: true } : {}),
});
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(out, '000-intro.jpg'), type: 'jpeg', quality: 70 });
await page.waitForTimeout(3800);
await page.screenshot({ path: path.join(out, '001-hero.jpg'), type: 'jpeg', quality: 70 });

let i = 2;
let lastY = -1;
for (;;) {
  if (mobile) {
    await page.evaluate((s) => window.scrollBy(0, s), Number(step));
  } else {
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.wheel(0, Number(step));
  }
  await page.waitForTimeout(700);
  const { y, scene, max } = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    scene: document.documentElement.dataset.scene ?? '-',
    max: document.documentElement.scrollHeight - window.innerHeight,
  }));
  await page.screenshot({ path: path.join(out, `${String(i).padStart(3, '0')}-y${y}-${scene}.jpg`), type: 'jpeg', quality: 60 });
  i++;
  if (y >= max - 2 || y === lastY) break;
  lastY = y;
}

console.log(`${i} Bilder, Fehler: ${errors.length ? errors.join(' | ') : 'keine'}`);
await browser.close();
