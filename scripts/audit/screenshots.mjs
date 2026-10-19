// Screenshots der neuen Seite (Desktop 1440 px, Mobile 390 px) nach audit/after.
// Aufruf: node scripts/audit/screenshots.mjs <basis-url> [pfad ...]
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:4321';
const paths = process.argv.length > 3 ? process.argv.slice(3) : ['/'];
const out = path.resolve('audit/after');
await fs.mkdir(out, { recursive: true });

const viewports = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch();
for (const [name, opts] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ ...opts, locale: 'de-DE', reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // Alle Reveal-Elemente sichtbar machen und Lazy-Bilder laden
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);
    const slug = p === '/' ? 'index' : p.replace(/^\//, '').replace(/\//g, '__');
    const file = path.join(out, `${slug}--${name}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 78, fullPage: true });
    const hScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(name, p, hScroll ? 'HORIZONTALER SCROLL' : 'ok', file);
  }
  await ctx.close();
}
await browser.close();
