# Audit gerhardt-gmbh.de (Phase 0)

Stand: 17.10.2026 · Crawl der Live-Seite mit Playwright (Chromium), Lighthouse 12.8 (mobil, simuliertes Throttling).

Rohdaten:

| Was | Wo |
|---|---|
| Screenshots Desktop 1440 px / Mobile 390 px (DPR 2), ganze Seite | `audit/before/<seite>--desktop.jpg`, `--mobile.jpg` |
| Lighthouse-Reports (JSON) | `audit/lighthouse/` |
| Seitendaten je URL (Meta, Überschriften, Bilder, Links, Anker, Formulare, JSON-LD) | `content/pages/*.json` |
| Seiteninhalte als Markdown | `content/pages-md/*.md` |
| Projekte strukturiert (Fakten, Story, Hero, Galerie, Baustellen-Strecke mit Bildunterschriften) | `content/projects/*.json` |
| FAQ je Seite, Stellenanzeigen, strukturierte Daten | `content/faq.json`, `content/jobs.json`, `content/structured-data.json` |
| Alle Bilder der Live-Seite (395 Dateien, 224 MB), Manifest | `raw-assets/images/`, `content/image-manifest.json` |
| HTML roh (Server) und gerendert (nach JS) | `raw-assets/html/` |
| Skripte zum Wiederholen | `scripts/audit/` |

---

## 1. Kurzfazit

1. **Die Substanz ist besser als die Verpackung.** 7 Projekte mit echten Zahlen, gute Projekttexte, ein vorhandenes Inhaber-Porträt, eine starke Referenzliste (Lufthansa, Deutsche Börse, Allianz, Staatskanzlei Mainz u. a.) und ein Unternehmensfilm. Davon ist auf der Startseite nichts zu sehen.
2. **Die Conversion-Strecke ist kaputt.** Auf allen 7 Projektseiten springt „Beratung anfragen" ins Leere (Anker `#anfrage`, das Formular hat die ID `kontakt`). Alle Formulare und `/kontakt` existieren nur nach JavaScript.
3. **Performance ist das größte technische Problem.** `/pools` lädt 14,2 MB, eine Projektseite 18,4 MB. LCP mobil 28–33 s. Ursache: Bilder ohne `srcset` in voller Auflösung, Mega-Menü-Vorschaubilder auf jeder Seite.
4. **Impressum und Datenschutz hängen an JavaScript.** Der Footer wird per `shell.js` eingefügt. Im Server-HTML fehlt auf allen 30 Seiten der Link zum Impressum.
5. **Der Widerspruch bei den Erfahrungsjahren ist auflösbar** (Abschnitt 4.1): Unternehmen seit 1998, Poolbau seit 2015.
6. **Die geplante IA deckt nicht alle Live-Seiten ab.** Es gibt zusätzlich `/ansprechpartner`, `/kontakt` und einen Stellenmarkt mit 8 Anzeigen (mit JobPosting-Schema). Vorschlag in Abschnitt 9.

---

## 2. Seiteninventar (30 URLs, alle HTTP 200)

Quelle: `sitemap.xml` plus rekursives Folgen interner Links. Es wurden keine Seiten außerhalb der Sitemap gefunden. `/pools/workshop` ist laut `robots.txt` ein internes Werkzeug, wurde nicht gecrawlt, ist aber **öffentlich erreichbar (200)**.

| Bereich | URLs | Anmerkung |
|---|---|---|
| Start | `/` | Nur Weiche Poolbau / Gartentechnik, kein H1, 86 Zeichen Text im Server-HTML |
| Pools | `/pools`, `/pools/projekte`, `/pools/galerie`, `/pools/projekt-{bergparadies, kronberg, mainz, naturstein, provence, suedtirol, townhouse}` | `/pools/projekte` ohne H1 im Server-HTML |
| Gartentechnik | `/gartentechnik`, `/bewaesserung`, `/beleuchtung`, `/rasenroboter`, `/wartung` | Bewässerung, Beleuchtung, Rasenroboter mit FAQ + Service-Schema |
| Unternehmen | `/ueber-uns`, `/ansprechpartner`, `/stellenmarkt` + 8 Stellen | Stellen mit JobPosting-Schema |
| Kontakt | `/kontakt` | Server-HTML 1,3 KB, Inhalt nur per JS |
| Recht | `/impressum`, `/datenschutz` | |

Technik-Hosting: Vercel (statische HTML-Dateien, `cleanUrls`). `/x.html` und `/x/` leiten per 308 auf `/x`, `www` per 308 auf die Apex-Domain. **Das Vercel-Projekt der Live-Seite liegt nicht im Team „ricardo-demo projects"**, sondern in einem anderen Account. Für den Go-live brauchen wir Zugriff auf diesen Account oder auf die DNS-Verwaltung.

---

## 3. Inhalte, die wir übernehmen

### 3.1 Projekte (verifiziert)

| Slug | Ort | Pool | Projektart (Live) | Kostenrahmen | Bauzeit |
|---|---|---|---|---|---|
| naturstein | Wiesbaden | 4 × 9 m, Skimmer, Gegenstromanlage | Bestandsgarten · Sanierung & Gesamtausführung | ca. 300.000 € | nicht angegeben |
| bergparadies | Wiesbaden | 3,60 × 8 m, Überlauf, Gegenstromanlage | Bestandsgarten | ca. 200.000 € | nicht angegeben |
| townhouse | Wiesbaden | 3 × 7 m, Skimmer, Gegenstromanlage (Turbine) | Neubau (Gartenneubau auf mehreren Ebenen) | ca. 200.000 € | nicht angegeben |
| provence | Wiesbaden | 3 × 9 m, Skimmer | Bestandsgarten | ca. 150.000 € | nicht angegeben |
| kronberg | Kronberg | 3,60 × 7 m, Polypropylen-Skimmer | Bestandsgarten | ca. 150.000 € | nicht angegeben |
| suedtirol | Königstein | 3,50 × 8 m, Skimmer, Gegenstromanlage | Neubau | ca. 150.000 € | nicht angegeben |
| mainz | Mainz | 3,30 × 7 m, Skimmer, Gegenstromanlage | Neubau (Komplettsystem, Altbau restauriert) | ca. 150.000 € | nicht angegeben |

Ergänzungen gegenüber dem Briefing: Townhouse (Wiesbaden, 3 × 7 m, Neubau, ca. 200.000 €) und Mainz (3,30 × 7 m, Neubau, ca. 150.000 €). Mainz und Townhouse haben laut Faktenzeile ebenfalls eine Gegenstromanlage.

Je Projekt vorhanden: 5 Hero-Bilder, 1 Story-Bild, 17–19 Galeriebilder, 5 Bilder „Von der Baustelle zur Übergabe" mit ausformulierten Bildunterschriften (Vorher → Bauphase → Rohbau → Nachher). Das ist eine fertige Vorlage für den Vorher/Nachher-Slider und die Ablauf-Sektion.

Story-Texte folgen fast überall dem Muster Ausgangslage → Wunsch → Lösung. Kronberg und Mainz sind kürzer und haben keinen expliziten „Wunsch"-Satz.

### 3.2 Unternehmen

- Gegründet **1998 von Thomas Gerhardt in Ingelheim** als „Gerhardt Bewässerungssysteme GmbH". 2010 Umzug nach Wiesbaden-Delkenheim, seitdem „Gerhardt GmbH". **Poolbau seit 2015.**
- Zwei Gesellschaften: **Gerhardt GmbH** (HRB 27912, GF Thomas Gerhardt, Mike Baruth) und **Gerhardt Service GmbH** (HRB 35968, GF Thomas Gerhardt, Natascha Gerhardt, Dieter Ludescher).
- Team auf `/ansprechpartner`: 11 Personen mit Funktion, Durchwahl, Mobil, E-Mail (Geschäftsführung, Bauleitung inkl. Dipl.-Ing., Service, Kalkulation, Buchhaltung, Backoffice).
- **Referenzliste** öffentlich/gewerblich (31 Einträge, überwiegend Bewässerung): u. a. Lufthansa, Deutsche Börse, Allianz, Merck, Boehringer, Hessischer Rundfunk, Staatskanzlei Mainz, Skyline Plaza, Niederwalddenkmal.
- **Inhaber-Porträt vorhanden:** `assets/unternehmen/thomas.webp`, 1600 × 2400 px, draußen im Garten, professionell. Ersetzt den Platzhalter `[[PORTRAIT]]` (Freigabe für Startseite einholen).
- **Unternehmensfilm** auf YouTube (`UFaM3vzyQV8`), eingebettet auf `/ueber-uns`.
- Inhaber-Zitat (Startseite Pools): „Ich verspreche jedem Kunden vorher: Ich sehe das fertige Ergebnis vor mir — und es wird genau so, wie Sie es sich wünschen."
- Zweites Zitat (Über uns): „Wir sehen den Garten als Rückzugsort. …"
- Instagram `gerhardtgmbh`, Facebook-Profil vorhanden.

### 3.3 Kontaktdaten (vollständig, keine Platzhalter nötig)

Gerhardt GmbH · Max-Planck-Ring 11 · 65205 Wiesbaden · Telefon 06122 70770-00 · info@gerhardt-gmbh.de · Service: service@gerhardt-gmbh.de

**Offen:** Erreichbarkeit/Bürozeiten stehen nirgends auf der Seite → `[[ERREICHBARKEIT]]`.

### 3.4 FAQ

27 Fragen: `/pools` (6), `/bewaesserung` (8), `/beleuchtung` (6), `/rasenroboter` (7). Die Pool-FAQ enthält **keine** Frage „Wann lohnt es sich nicht?" (im Briefing erwähnt). Die einzige vergleichbare Aussage steht auf `/wartung`: „Wir sagen offen, wenn ein Neubau günstiger wäre als eine Rettung." → Neue FAQ-Frage nötig, Inhalt vom Kunden.

### 3.5 Testimonials, Auszeichnungen, Mitgliedschaften, Herstellerpartner

**Nichts davon auf der Live-Seite.** Einzige Partnerangabe: „Fachhändler für Husqvarna und Kress" (Rasenroboter). → CONTENT-TODO.

---

## 4. Widersprüche und Sprachprobleme in den Live-Texten

### 4.1 Erfahrungsjahre

| Stelle | Aussage | Bezug |
|---|---|---|
| Meta `/pools` | „seit über 10 Jahren" | passt zu Poolbau seit 2015 |
| FAQ `/pools`, JSON-LD | „seit über 25 Jahren" | passt zu Gründung 1998 |
| Footer, `/ueber-uns` | „Seit 1998" | Gründung |
| Meta `/pools/galerie` | „Momente aus 25 Jahren Poolbau" | **falsch**, Poolbau seit 2015 |

**Vorschlag:** `[[ERFAHRUNG_JAHRE]]` durch zwei belegte Fakten ersetzen: „Seit 1998 im Rhein-Main-Gebiet · Poolbau seit 2015". Das ist ehrlich und stärker als eine runde Zahl. Freigabe nötig.

### 4.2 Weitere Widersprüche

- FAQ: „Gegründet als **Planungsbüro**". Über uns: gegründet als **Bewässerungsfirma**. Beides kann stimmen, muss aber geklärt werden.
- Preisanker „ab 120.000 €", aber das Budget-Dropdown im Formular beginnt bei „100.000–150.000 €".
- Hero `/pools` sagt „Traum-Pools", Projekt Provence sagt „Als wäre er schon immer hier gewesen". Das ist der Kern des Positionierungswechsels: Der zweite Satz ist Hero-Variante B.

### 4.3 Verbotene Wörter in bestehenden Texten (werden beim Übernehmen ersetzt)

„Traum-Pools" (Hero `/pools`), „Wohlfühloase" (Bergparadies-Story, Über uns), „Gartenoase" (Bergparadies-Untertitel, Meta), „High-End-Pool" (Naturstein-Headline), „perfekten" (Über uns). Ausrufezeichen und Emojis: keine gefunden.

---

## 5. Gestaltung Ist-Zustand

| | Live |
|---|---|
| Schrift | **Univers Next Pro** (Light/Regular/Medium/Bold), selbst gehostet als **TTF** (kein WOFF2), drei Schnitte per Preload. Kommerzielle Monotype-Schrift: Lizenz für Webnutzung ist beim Kunden zu prüfen, entfällt mit dem Relaunch. |
| H1 | 51 px / 700 / Tracking −0,02em, weiß auf Bild |
| H2 | 42 px / 700 |
| Labels | 11,5 px, Versalien, Tracking 0,14em, **Blau #0066CB** |
| Farben | Navy `#0F1C2E`, Blau `#0066CB` / `#0055A8`, Text `#1A2332`, Slate `#5A6B7D`, Linie `#E0DDD7`, Hintergrund `#FAFAF8` |
| Header | 92 px (mobil 76 px), Mega-Menü mit Vorschaubildern |
| Ecken | abgerundete Bildkarten, Navy-Flächen |

Wirkung: sauber, aber generisch-corporate (Navy + Signalblau, fette Grotesk). Das Briefing will Serif-Display, Kalkstein-Töne und Petrol.

**Offener Punkt Logo:** Das Logo ist ein „G" in Blau (bzw. weiß auf dunkel). Neben der neuen Palette ohne Blau braucht es eine Entscheidung: Logo unverändert lassen (Markenzeichen), oder einfarbige Varianten in Anthrazit/Weiß verwenden. Logo-Datei `logo-black.png` ist 3669 px breit (PNG); wir brauchen das Logo als **SVG** vom Kunden.

---

## 6. Performance (Lighthouse mobil)

| Seite | Perf. | A11y | Best Pr. | SEO | LCP | Gewicht |
|---|---|---|---|---|---|---|
| `/` | 73 | 91 | 100 | 100 | 10,2 s | 4,0 MB |
| `/pools` | 64 | 87 | 100 | 100 | 33,4 s | 14,2 MB |
| `/pools/projekt-bergparadies` | 64 | 87 | 100 | 100 | 28,0 s | 18,4 MB |
| `/pools/projekte` | 93 | 91 | 100 | 100 | 2,7 s | 8,7 MB |
| `/kontakt` | 99 | 92 | 100 | 100 | 2,0 s | 2,5 MB |

CLS überall 0, TBT < 60 ms. Ziel Relaunch: Perf ≥ 90, A11y/BP/SEO ≥ 95, LCP < 2,5 s, Startseite < 2,5 MB.

Ursachen:
- **Keine responsiven Bilder.** Hero- und Galeriebilder in 2.000–2.400 px auch auf 390-px-Displays. Lighthouse-Einsparpotenzial: 11 MB (`/pools`), 13,6 MB (Projektseite).
- **Mega-Menü-Vorschaubilder** (`mega-pools.jpg` 1,28 MB, `mega-technik.jpg` 0,76 MB) laden auf jeder Seite, obwohl das Menü zu ist.
- Hero-Karussell lädt alle 5 Bilder sofort.
- Render-blockierendes CSS (450–560 ms), Fonts als TTF.
- Logo-PNG 3669 px breit für eine Anzeige von ca. 130 px.

Accessibility-Fehler auf allen geprüften Seiten: Farbkontrast (blaue Mini-Labels), Links nur über Farbe erkennbar, zu kleine Touch-Ziele (Karussell-Punkte).

---

## 7. SEO

| Prüfpunkt | Befund |
|---|---|
| Canonical | **fehlt auf allen 30 Seiten** |
| Open Graph / OG-Bild | **fehlt auf allen 30 Seiten** |
| H1 | fehlt auf `/` (nur H2 „Poolbau"/„Gartentechnik") und im Server-HTML von `/pools/projekte` und `/kontakt` |
| Title/Description | vorhanden und eindeutig; Startseite: „Wählen Sie einen Bereich." (kein Suchwert) |
| Strukturierte Daten | LocalBusiness (alle Seiten), FAQPage (4 Seiten), Service (4), JobPosting (8). Keine BreadcrumbList, keine ImageObject. JobPosting beim Relaunch **unbedingt erhalten** (Google Jobs). |
| Sitemap / robots | vorhanden, korrekt. `/pools/workshop` nur per robots gesperrt, aber öffentlich erreichbar |
| Alt-Texte | 619 Bildvorkommen, davon 180 ohne Alt-Text, nur 110 verschiedene. Häufigste: „Gerhardt — Bildergalerie" (83×), „Gerhardt GmbH" (56×), „Gerhardt — im Prozess" (26×), „Projekt X — Detail" (je 17–19×) |
| Dateinamen | 11 Dateien mit Leerzeichen, Klammern oder „test", z. B. `2026_03_WIESBADEN-GER_PILM (test)-00248.jpg`, `2026_03_BAUSTELLEN_BAD CAMBERG (Bodenplatte giessen)-.jpg`. 40 identische Dateien unter verschiedenen Namen. |
| Lokale Seiten | keine |

---

## 8. Was nur per JavaScript kommt

`assets/js/shell.js` (57 KB) baut Header, Navigation, Footer und alle Anfrageformulare zur Laufzeit.

| Element | Server-HTML | Nach JS |
|---|---|---|
| Navigation | leeres `<header data-shell-nav>` | ja |
| Footer inkl. **Impressum/Datenschutz** | leeres `<footer data-shell-footer>` | ja (außer `/stellenmarkt/initiativbewerbung`) |
| Anfrageformular (`/pools`, Projekte, Gartentechnik, `/kontakt`) | **nein** | ja |
| Bewerbungsformular (Stellen) | ja | ja |
| `/kontakt` | 1,3 KB, kein Inhalt | Formular |

Folge: Ohne JavaScript (oder bei einem JS-Fehler) gibt es weder Kontaktmöglichkeit noch Impressum. Suchmaschinen sehen auf `/kontakt` eine leere Seite.

### Kaputte Anker

| Seite | Link | Problem |
|---|---|---|
| alle 7 Projektseiten | Header-CTA „Beratung anfragen" → `#anfrage` | Formular hat `id="kontakt"`, **Klick bewirkt nichts** |
| `/stellenmarkt` | „Jetzt bewerben" → `#jobs` | Ziel-ID fehlt |

Auf `/`, `/pools/projekte`, `/impressum`, `/datenschutz`, `/ansprechpartner`, `/ueber-uns` führt der CTA auf `/kontakt` (funktioniert, sofern JS läuft).

### Bestehendes Anfrageformular

POST an `/api/contact`. Felder: Vorname, Nachname, E-Mail, Telefon (optional), Interesse (Pool · Bewässerung · Beleuchtung · Rasenroboter · Wartung · Sonstiges), Straße, PLZ, Wohnort, Budget (100–150 k · 150–250 k · über 250 k), Nachricht. Erfolgsmeldung: „Wir melden uns in den nächsten Werktagen zurück."
Probleme: keine Qualifizierung nach Projektart/Zeitraum/Architekt; Pool steht gleichrangig neben Rasenroboter; Pflichtfeld Straße vor dem ersten Kontakt ist eine Hürde. Den Versand habe ich bewusst **nicht** getestet, um keine Testanfrage beim Kunden auszulösen.

---

## 9. Recht und Datenschutz

Rechtstexte werden laut Briefing inhaltlich übernommen und nicht von uns umformuliert. Folgende Punkte sollte der Kunde (bzw. sein Anwalt/Datenschutzbeauftragter) vor Go-live prüfen:

1. **Impressum** zitiert §§ 7–10 **TMG**. Das TMG wurde am 14.05.2024 durch das **DDG** abgelöst.
2. **Impressum** verweist auf die **EU-OS-Plattform**. Die Plattform wurde zum 20.07.2025 eingestellt.
3. **YouTube-Embed** auf `/ueber-uns` lädt ohne Einwilligung (auch `youtube-nocookie.com` überträgt beim Seitenaufruf die IP an Google). Relaunch: Zwei-Klick-Lösung (Vorschaubild lokal, Video erst nach Klick).
4. **Datenschutzerklärung** beschreibt eine eigene Nutzungsanalyse mit Speicherung bei **Supabase** und Verknüpfung der Sitzungs-ID mit Formularanfragen sowie Resend und Vercel. Wenn der Relaunch auf Vercel Web Analytics wechselt und ein neues Anfrageformular nutzt, muss die Datenschutzerklärung angepasst werden.
5. **Bildnachweis:** Produktfotos Gartenbeleuchtung sind © in-lite design BV. Bei Weiterverwendung muss der Nachweis bleiben.
6. Datenschutz nennt bereits TDDDG (aktuell), Hosting Vercel und Resend. Das passt zum geplanten Stack.

---

## 10. Konsequenzen für die Informationsarchitektur

Seiten, die die geplante IA nicht vorsieht:

| Live-URL | Vorschlag |
|---|---|
| `/stellenmarkt`, `/stellenmarkt/*` (8 Stellen) | **URLs 1:1 behalten**, im neuen Design, JobPosting-Schema erhalten, Link im Footer und auf `/ueber-uns`. Recruiting ist für einen Handwerksbetrieb mit 8 offenen Stellen geschäftskritisch. |
| `/ansprechpartner` | In `/ueber-uns` als Team-Sektion integrieren, 301 auf `/ueber-uns#team`. Alternativ als eigene Seite behalten. Entscheidung Kunde. |
| `/kontakt` | 301 auf `/anfrage` |
| `/pools/workshop` | nicht übernehmen, 410 oder 301 auf `/` |

### Vollständige Redirect-Liste (301)

```
/pools                          → /
/pools/projekte                 → /projekte
/pools/projekt-:slug            → /projekte/:slug        (7 Projekte)
/pools/galerie                  → /projekte
/gartentechnik                  → /systeme
/bewaesserung                   → /systeme/bewaesserung
/beleuchtung                    → /systeme/beleuchtung
/rasenroboter                   → /systeme/rasenroboter
/wartung                        → /service
/kontakt                        → /anfrage
/ansprechpartner                → /ueber-uns#team        (vorbehaltlich Entscheidung)
/pools/workshop                 → /
/:path.html                     → /:path                 (Altlinks mit .html, live bereits 308)
/:path/                         → /:path                 (Trailing Slash)
```

Unverändert bleiben: `/ueber-uns`, `/stellenmarkt` + 8 Unterseiten, `/impressum`, `/datenschutz`.

---

## 11. Bildbestand für den Relaunch

| Ordner | Dateien | Nutzung |
|---|---|---|
| `projekte/<slug>/` | 24–30 je Projekt | Projektseiten, Startseite |
| `pools-galerie/` | 99 | überwiegend Baustelle/Anlieferung → Ablauf, Vorher/Nachher |
| `poolbau-kosten/` | 29 | Baustelle/Montage → Ablauf |
| `technik/*` | 49 | Systeme, Service (Beleuchtung teilweise © in-lite) |
| Hero, Mega, Logos, Porträt | 18 | |

Auflösung der Webbilder: meist 1.500–2.400 px Breite, bereits als WebP komprimiert. Für 16:9-Full-bleed auf 1440–1920-px-Displays mit Retina reicht das nur knapp. **Die Original-Shootingdateien (2026) vom Fotografen anfordern.** Bis dahin bauen wir mit den Webversionen.
