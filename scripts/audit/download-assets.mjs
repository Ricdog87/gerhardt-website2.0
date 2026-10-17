// Lädt alle beim Crawl gefundenen Bilder (Eigentum des Kunden) nach raw-assets/images,
// Pfadstruktur der Live-Seite bleibt erhalten. Schreibt ein Manifest mit Größe und Herkunft.
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] ?? '.');
const OUT = path.join(ROOT, 'raw-assets/images');
const urls = JSON.parse(await fs.readFile(path.join(ROOT, 'content/image-urls.json'), 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const unique = new Map();
for (const u of urls) {
  const url = new URL(u);
  url.search = '';
  unique.set(decodeURIComponent(url.pathname), url.href);
}

const manifest = [];
let i = 0;
const list = [...unique.entries()];
async function worker() {
  while (i < list.length) {
    const [p, href] = list[i++];
    const dest = path.join(OUT, p.replace(/^\/+/, ''));
    let entry = { path: p, url: href };
    for (let t = 0; t < 6; t++) {
      try {
        const res = await fetch(href);
        if (!res.ok) { entry.status = res.status; break; }
        if (!/^(image|video)\//.test(res.headers.get('content-type') ?? '')) { entry.status = 'kein Bild'; break; }
        const buf = Buffer.from(await res.arrayBuffer());
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.writeFile(dest, buf);
        entry = { ...entry, status: 200, bytes: buf.length, type: res.headers.get('content-type') };
        break;
      } catch (e) {
        entry.error = e.message;
        await sleep(1000 * 2 ** t);
      }
    }
    manifest.push(entry);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
manifest.sort((a, b) => a.path.localeCompare(b.path));
await fs.writeFile(path.join(ROOT, 'content/image-manifest.json'), JSON.stringify(manifest, null, 2));
const ok = manifest.filter((m) => m.status === 200);
console.log(`${ok.length}/${manifest.length} geladen, ${(ok.reduce((s, m) => s + m.bytes, 0) / 1e6).toFixed(1)} MB`);
for (const m of manifest.filter((m) => m.status !== 200)) console.log('FEHLT', m.status ?? m.error, m.path);
