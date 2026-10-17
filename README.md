# gerhardt-gmbh.de

Relaunch der Website der Gerhardt GmbH (Poolbau und Gartentechnik, Wiesbaden).

## Struktur

| Pfad | Inhalt |
|---|---|
| `audit/` | Bestandsaufnahme der Live-Seite: `AUDIT.md`, Screenshots vorher/nachher, Lighthouse |
| `content/` | Aus der Live-Seite extrahierte Inhalte (Seiten, Projekte, FAQ, Stellen) |
| `raw-assets/` | Originalbilder und HTML der Live-Seite. Nicht Teil des Builds. Bilder liegen in Git LFS. |
| `scripts/audit/` | Crawler, Bild-Download, Content-Extraktion |
| `CONTENT-TODO.md` | Offene Inhalte und Entscheidungen für den Kunden |

## Audit wiederholen

```bash
npm install
npm run audit:crawl                              # Screenshots, HTML, Seitendaten
node scripts/audit/download-assets.mjs .         # Bilder nach raw-assets/images
python3 -I scripts/audit/extract.py .            # strukturierte Inhalte nach content/
```

Voraussetzung: Node 22, Python 3 mit `beautifulsoup4` und `markdownify`.
