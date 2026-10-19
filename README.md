# gerhardt-gmbh.de

Relaunch der Website der Gerhardt GmbH (Poolbau und Gartentechnik, Wiesbaden).

Astro, TypeScript, Tailwind CSS. Bilder über `astro:assets` (AVIF/WebP zur Build-Zeit), Fonts selbst gehostet (Fraunces, Hanken Grotesk). Deployment auf Vercel.

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Ausgabe nach .vercel/output
npm run check      # Typprüfung
```

Voraussetzung: Node 22.22 oder neuer.

## Umgebungsvariablen

| Variable | Zweck |
|---|---|
| `PUBLIC_INDEXABLE` | Nur beim Go-live auf `true` setzen. Ohne die Variable sind alle Builds `noindex` und `robots.txt` sperrt alles. |

## Struktur

| Pfad | Inhalt |
|---|---|
| `src/config/site.ts` | Firmendaten, Preisanker, Hero-Varianten, Navigation, Feature-Flags |
| `src/content/` | Projekte, FAQ, Rechtstexte (Content Collections, Schema in `src/content.config.ts`) |
| `src/components/` | Header, Footer, Projektkarte, Sektionen der Startseite (`home/`) |
| `src/assets/images/` | Kuratierte, umbenannte Bilder. Herkunft jeder Datei: `scripts/assets/curation.json` |
| `audit/` | Bestandsaufnahme (`AUDIT.md`), Screenshots vorher (`before/`) und nachher (`after/`), Lighthouse |
| `content/` | Aus der Live-Seite extrahierte Inhalte (Rohdaten) |
| `raw-assets/` | Originalbilder und HTML der Live-Seite. Nicht Teil des Builds, Bilder in Git LFS. |
| `scripts/audit/` | Crawler, Bild-Download, Content-Extraktion, Screenshots |
| `CONTENT-TODO.md` | Offene Inhalte und Entscheidungen für den Kunden |

## Prüfen

```bash
npm run build && npx serve .vercel/output/static -l 4321
node scripts/audit/screenshots.mjs http://localhost:4321 /     # Screenshots nach audit/after
```

Headline-Varianten des Hero: `/?hero=B`, `/?hero=C`.

## Audit wiederholen

```bash
npm run audit:crawl                              # Screenshots, HTML, Seitendaten der Live-Seite
node scripts/audit/download-assets.mjs .         # Bilder nach raw-assets/images
python3 -I scripts/audit/extract.py .            # strukturierte Inhalte nach content/
```

Für die Extraktion: Python 3 mit `beautifulsoup4` und `markdownify`.
