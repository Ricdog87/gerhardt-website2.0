// Crawlt die Live-Seite: Screenshots (Desktop/Mobile), gerenderter + roher HTML,
// strukturierte Inhalte, Bildliste. Ausgabe nach audit/before, content/, raw-assets/.
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://gerhardt-gmbh.de';
const ROOT = path.resolve(process.argv[2] ?? '.');
const SHOTS = path.join(ROOT, 'audit/before');
const PAGES = path.join(ROOT, 'content/pages');
const HTML = path.join(ROOT, 'raw-assets/html');
const EXCLUDE = [/^\/api\//, /^\/pools\/workshop/];
const VIEWPORTS = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, label, tries = 6) {
  let err;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      await sleep(1500 * 2 ** i);
    }
  }
  throw new Error(`${label}: ${err?.message}`);
}

async function fetchText(url) {
  return retry(async () => {
    const res = await fetch(url, { redirect: 'manual' });
    return { status: res.status, location: res.headers.get('location'), body: await res.text() };
  }, `fetch ${url}`);
}

function slugFor(p) {
  return p === '/' ? 'index' : p.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '__');
}

function normalize(href) {
  try {
    const u = new URL(href, ORIGIN);
    if (u.origin !== ORIGIN) return null;
    let p = u.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (p.length > 1) p = p.replace(/\/$/, '');
    if (EXCLUDE.some((r) => r.test(p))) return null;
    if (/\.(jpe?g|png|webp|avif|svg|gif|pdf|mp4|webm|css|js|xml|txt|ico|ttf|woff2?)$/i.test(p)) return null;
    return p;
  } catch {
    return null;
  }
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

function extractInPage() {
  const txt = (el) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const meta = (sel) => document.querySelector(sel)?.getAttribute('content') ?? null;
  const main = document.querySelector('main') ?? document.body;

  // Lineare Inhaltsstruktur ohne Header/Footer
  const blocks = [];
  const walker = main.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,summary,td,th,.label,[class*="eyebrow"],[class*="kicker"]');
  for (const el of walker) {
    if (el.closest('header.header, footer.footer, nav, script, style')) continue;
    if (el.tagName === 'P' && el.closest('li,blockquote')) continue;
    const t = txt(el);
    if (!t) continue;
    blocks.push({ tag: el.tagName.toLowerCase(), cls: el.className || undefined, text: t });
  }

  const images = [...document.querySelectorAll('img')].map((img) => ({
    src: img.currentSrc || img.src,
    attrSrc: img.getAttribute('src'),
    srcset: img.getAttribute('srcset'),
    alt: img.getAttribute('alt'),
    loading: img.getAttribute('loading'),
    w: img.naturalWidth,
    h: img.naturalHeight,
    rendered: [Math.round(img.getBoundingClientRect().width), Math.round(img.getBoundingClientRect().height)],
  }));
  const bgImages = [...document.querySelectorAll('*')]
    .map((el) => getComputedStyle(el).backgroundImage)
    .filter((b) => b && b.startsWith('url('))
    .map((b) => b.slice(4, -1).replace(/["']/g, ''));
  const videos = [...document.querySelectorAll('video, video source')].map((v) => v.src || v.getAttribute('src')).filter(Boolean);

  const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.getAttribute('href'), text: txt(a), abs: a.href }));
  const anchors = links
    .filter((l) => l.href.includes('#'))
    .map((l) => {
      const u = new URL(l.abs);
      const sameDoc = u.pathname === location.pathname;
      const id = decodeURIComponent(u.hash.slice(1));
      return { ...l, sameDoc, targetExists: sameDoc ? (id === '' || !!document.getElementById(id)) : null };
    });

  const forms = [...document.querySelectorAll('form')].map((f) => ({
    action: f.getAttribute('action'),
    method: f.getAttribute('method'),
    id: f.id,
    fields: [...f.querySelectorAll('input,select,textarea')].map((i) => ({ name: i.name, type: i.type, required: i.required })),
  }));

  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
    try { return JSON.parse(s.textContent); } catch { return s.textContent; }
  });

  const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => ({ tag: h.tagName.toLowerCase(), text: txt(h) }));

  // Typo/Farben stichprobenartig
  const cs = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color, bg: s.backgroundColor };
  };

  const tel = links.filter((l) => l.href.startsWith('tel:')).map((l) => l.href);
  const mail = links.filter((l) => l.href.startsWith('mailto:')).map((l) => l.href);

  return {
    title: document.title,
    description: meta('meta[name="description"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    robots: meta('meta[name="robots"]'),
    og: { title: meta('meta[property="og:title"]'), description: meta('meta[property="og:description"]'), image: meta('meta[property="og:image"]') },
    lang: document.documentElement.lang,
    headings,
    blocks,
    images,
    bgImages: [...new Set(bgImages)],
    videos,
    links,
    anchors,
    forms,
    jsonld,
    tel: [...new Set(tel)],
    mail: [...new Set(mail)],
    styles: { body: cs('body'), h1: cs('h1'), h2: cs('h2'), p: cs('main p') ?? cs('p'), a: cs('main a') },
    footerText: txt(document.querySelector('footer')),
    headerText: txt(document.querySelector('header')),
    docHeight: document.documentElement.scrollHeight,
  };
}

async function main() {
  for (const d of [SHOTS, PAGES, HTML]) await fs.mkdir(d, { recursive: true });

  const sm = await fetchText(`${ORIGIN}/sitemap.xml`);
  const seeds = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normalize(m[1])).filter(Boolean);
  const queue = [...new Set(['/', ...seeds])];
  const seen = new Set(queue);
  const results = [];
  const allImages = new Set();

  const browser = await chromium.launch();
  const contexts = {
    desktop: await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'de-DE' }),
    mobile: await browser.newContext({ ...VIEWPORTS.mobile, viewport: { width: 390, height: 844 }, locale: 'de-DE',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }),
  };

  while (queue.length) {
    const p = queue.shift();
    const slug = slugFor(p);
    const url = ORIGIN + p;
    process.stdout.write(`→ ${p} `);

    const raw = await fetchText(url).catch((e) => ({ status: 0, body: '', error: e.message }));
    await fs.writeFile(path.join(HTML, `${slug}.raw.html`), raw.body);

    let data = null;
    const netImages = new Set();
    for (const [vp, ctx] of Object.entries(contexts)) {
      const page = await ctx.newPage();
      // YouTube-Embed blockiert sonst networkidle (und lädt ohnehin ohne Einwilligung)
      await page.route(/youtube/, (r) => r.abort());
      page.on('response', (r) => {
        const t = r.request().resourceType();
        if ((t === 'image' || t === 'media') && r.url().startsWith(ORIGIN)) netImages.add(r.url());
      });
      try {
        const t0 = Date.now();
        await retry(() => page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }), `goto ${url}`, 5);
        const loadMs = Date.now() - t0;
        await scrollThrough(page);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.screenshot({ path: path.join(SHOTS, `${slug}--${vp}.jpg`), type: 'jpeg', quality: 72, fullPage: true });
        if (vp === 'desktop') {
          data = await page.evaluate(extractInPage);
          data.loadMs = loadMs;
          await fs.writeFile(path.join(HTML, `${slug}.rendered.html`), await page.content());
        } else {
          data.mobile = await page.evaluate(() => ({
            docHeight: document.documentElement.scrollHeight,
            hScroll: document.documentElement.scrollWidth > window.innerWidth,
            h1: getComputedStyle(document.querySelector('h1') ?? document.body).fontSize,
          }));
        }
      } catch (e) {
        data ??= { error: e.message };
        data.error = (data.error ? data.error + ' | ' : '') + `${vp}: ${e.message}`;
      } finally {
        await page.close();
      }
    }

    data.path = p;
    data.status = raw.status;
    data.redirect = raw.location ?? null;
    data.rawHtmlBytes = raw.body.length;
    data.rawHasH1 = /<h1[\s>]/i.test(raw.body);
    data.rawTextLen = raw.body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').length;
    data.networkImages = [...netImages];
    for (const i of data.images ?? []) if (i.src) allImages.add(i.src);
    for (const b of data.bgImages ?? []) allImages.add(new URL(b, ORIGIN).href);
    for (const n of netImages) allImages.add(n);

    await fs.writeFile(path.join(PAGES, `${slug}.json`), JSON.stringify(data, null, 2));
    results.push({ path: p, status: data.status, title: data.title, error: data.error });
    console.log(data.status, data.error ? `ERR ${data.error}` : 'ok');

    for (const l of data.links ?? []) {
      const n = normalize(l.abs);
      if (n && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }

  await browser.close();
  await fs.writeFile(path.join(ROOT, 'content/crawl-index.json'), JSON.stringify(results, null, 2));
  await fs.writeFile(path.join(ROOT, 'content/image-urls.json'), JSON.stringify([...allImages].filter((u) => u.startsWith(ORIGIN)).sort(), null, 2));
  console.log(`\n${results.length} Seiten, ${allImages.size} Bild-URLs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
