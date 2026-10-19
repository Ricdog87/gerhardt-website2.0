# CONTENT-TODO

Alle Platzhalter der Website und was der Kunde liefern oder entscheiden muss.
Platzhalter stehen im Code als `[[NAME]]` und sind auf der Seite sichtbar (sandfarben hinterlegt), bis sie ersetzt sind.

Status: `offen` · `Vorschlag liegt vor` (Freigabe nötig) · `in Vorschau verwendet` (Vorschlag ist auf der Demo zu sehen, Freigabe nötig) · `erledigt`

## Sichtbare Platzhalter auf der Startseite (Stand Phase 1)

| Platzhalter | Wo | Siehe |
|---|---|---|
| `[[prüfen: 3D?]]` | Ablauf, Schritt 2 „Entwurf und Visualisierung" | C8 |
| `[[prüfen: Festpreis?]]` | Ablauf, Schritt 3 „Angebot" | C9 |
| `[[FAQ_NICHT_LOHNEND]]` | FAQ, Frage „Wann lohnt sich ein Projekt nicht?" (nicht im FAQ-Schema) | C12 |
| `[[ERREICHBARKEIT]]` | Footer, Kontakt | C5 |
| `[[TESTIMONIALS]]` | Sektion „Stimmen von Bauherren", per Flag ausgeblendet | C3 |

## Entscheidungen

| # | Punkt | Status | Vorschlag / Stand |
|---|---|---|---|
| E1 | Preisanker `{{PREISANKER}}` | in Vorschau verwendet | „ab 120.000 €" wie auf der Live-Seite (Investition, FAQ, Meta). Alternative „ab 80.000 €". Zentral in `src/config/site.ts`. |
| E2 | `[[ERFAHRUNG_JAHRE]]` | in Vorschau verwendet | Statt einer Jahreszahl zwei belegte Fakten: Hero „Seit 1998", Faktenzeile „1998 gegründet · 2015 Poolbau" (Quelle: Über uns, Footer der Live-Seite). |
| E3 | Gründungsgeschichte | offen | FAQ der Live-Seite sagt „gegründet als Planungsbüro", Über uns sagt „Gerhardt Bewässerungssysteme GmbH". Die neue FAQ nennt nur Gründer, Jahr und Sitz. Was stimmt? |
| E4 | Projektnamen „Kronberg" und „Mainz" | offen | Brechen das Namensschema. Vorschläge folgen in Phase 2, Slugs erst nach Freigabe ändern. |
| E5 | `/ansprechpartner` | offen | In `/ueber-uns` integrieren (Vorschlag) oder eigene Seite behalten. |
| E6 | Logo | offen | Vorschau zeigt das Logo unverändert (blaues „G"). Alternative: einfarbig Anthrazit/Weiß passend zur neuen Palette. |
| E7 | Inhaber-Porträt auf der Startseite | in Vorschau verwendet | Vorhandenes Foto (1600 × 2400) in der Sektion „Das Versprechen". |
| E8 | Unternehmensfilm (YouTube) | offen | Auf `/ueber-uns` mit Zwei-Klick-Lösung weiterverwenden? |
| E9 | Referenzliste öffentlich/gewerblich | offen | Auf `/ueber-uns` behalten; Freigabe, ob Firmennamen (Lufthansa, Deutsche Börse …) weiter genannt werden dürfen. |
| E10 | Hero-Headline | offen | A „Pools, die zum Haus gehören." ist Standard. Varianten ansehen: Vorschau-URL mit `?hero=B` oder `?hero=C`. |
| E11 | Angepasste Projekttexte | Vorschlag liegt vor | Verbotene Wörter ersetzt: „Gartenoase" → „Überlaufpool im Bestandsgarten", „Wohlfühloase" → „der Ort, der das Haus in den Mittelpunkt rückt", „High-End-Pool" → „Naturstein-Pool". Rest wörtlich übernommen. |

## Inhalte vom Kunden

| # | Inhalt | Status | Hinweis |
|---|---|---|---|
| C1 | Porträt Thomas Gerhardt | in Vorschau verwendet | Siehe E7 |
| C2 | 2–3 Teamfotos (Baustelle, nicht gestellt) | offen | Bis dahin ein Baustellenfoto mit Monteur im Gerhardt-Shirt in der Ablauf-Sektion |
| C3 | `[[TESTIMONIALS]]` 2–3 Bauherren-Zitate mit Freigabe, ideal 30–60 s Video | offen | Sektion bleibt per Flag (`flags.testimonials`) ausgeblendet, bis Inhalte da sind |
| C4 | Link Google-Unternehmensprofil / Bewertungen | offen | |
| C5 | `[[ERREICHBARKEIT]]` Bürozeiten / telefonische Erreichbarkeit | offen | Steht aktuell nirgends auf der Seite |
| C6 | Mitgliedschaften, Zertifikate, Pool-Herstellerpartner | offen | Live nur „Fachhändler Husqvarna und Kress" |
| C7 | Gewährleistung und Service-Pakete (was genau, wie lange) | offen | |
| C8 | Ablauf: `[[prüfen: 3D?]]` Wird visualisiert, und wie? | offen | |
| C9 | Ablauf: `[[prüfen: Festpreis?]]` Festpreis-Angebot? | offen | |
| C10 | `[[X]]` Reaktionszeit auf Anfragen in Werktagen | offen | Live: „in den nächsten Werktagen". Wird in Phase 4 (Danke-Seite) gebraucht. |
| C11 | Bauzeit je Projekt | offen | Live nirgends angegeben |
| C12 | `[[FAQ_NICHT_LOHNEND]]` Antwort auf „Wann lohnt sich ein Projekt nicht?" | offen | Im Briefing erwähnt, auf der Live-Seite nicht vorhanden |
| C13 | Original-Shootingdateien 2026 in voller Auflösung | offen | Webbilder max. ca. 2.400 px, für Full-bleed knapp |
| C14 | Logo als SVG | offen | Live nur PNG (3669 px). Die weiße Variante ist aus dem farbigen PNG abgeleitet. |
| C15 | Abendaufnahmen weiterer Projekte | offen | Alle drei Hero-Bilder stammen vom Projekt Naturstein, weil nur dort Dämmerungsaufnahmen existieren. Besonders gefragt: Bergparadies, Provence. Optional Drohnenaufnahmen. |

## Recht (Prüfung durch Kunde / Anwalt / DSB)

| # | Punkt | Status |
|---|---|---|
| R1 | Impressum zitiert TMG (seit 14.05.2024 DDG) | offen |
| R2 | Impressum verweist auf EU-OS-Plattform (eingestellt 20.07.2025) | offen |
| R3 | Datenschutzerklärung an neuen Stack anpassen (Analytics, Anfrageformular, ggf. Upload) | offen |
| R4 | Bildnachweis in-lite design BV bei Weiterverwendung der Beleuchtungsfotos | offen (aktuell keine in-lite-Fotos verwendet) |
