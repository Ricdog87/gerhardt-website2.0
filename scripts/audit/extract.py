"""Strukturierte Inhalte aus den gerenderten Live-Seiten nach content/.

Aufruf: python3 -I scripts/audit/extract.py <repo-root>
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
HTML = ROOT / "raw-assets/html"
OUT = ROOT / "content"
PAGES_MD = OUT / "pages-md"
PROJECTS = OUT / "projects"
for d in (PAGES_MD, PROJECTS):
    d.mkdir(parents=True, exist_ok=True)


def clean(text):
    return re.sub(r"\s+", " ", (text or "").replace("‑", "-").replace("­", "")).strip()


def asset(src):
    """Relativen Bildpfad auf Live-Pfad normalisieren (/assets/...)."""
    if not src:
        return None
    src = re.sub(r"^(\.\./)+|^\./", "/", src)
    src = re.sub(r"^https://gerhardt-gmbh\.de", "", src)
    return src.split("?")[0]


def strip_chrome(soup):
    for sel in ["header.header", "footer.footer", "script", "style", "noscript", "[data-contact-form]", ".mega", "svg"]:
        for el in soup.select(sel):
            el.decompose()
    return soup


def page_meta(soup):
    m = lambda n: (soup.find("meta", attrs={"name": n}) or {}).get("content")
    return {"title": clean(soup.title.string if soup.title else ""), "description": m("description")}


def jsonld(soup):
    out = []
    for s in soup.select('script[type="application/ld+json"]'):
        try:
            out.append(json.loads(s.string))
        except Exception:
            pass
    return out


def faqs(soup):
    items = []
    for d in soup.select("details"):
        q = d.find("summary")
        if not q:
            continue
        qt = clean(q.get_text())
        q.extract()
        items.append({"q": qt, "a": clean(d.get_text(" "))})
    return items


def project(slug, soup):
    info = soup.select_one(".project-info")
    stats = {
        clean(s.select_one(".project-info__stat-label").get_text()): clean(s.select_one(".project-info__stat-value").get_text(" "))
        for s in info.select(".project-info__stat")
    }
    sub = [clean(s.get_text()) for s in info.select(".project-info__subtitle span")]
    story = soup.select_one(".story")
    paragraphs = [clean(p.get_text()) for p in story.select(".story__body p") if "story__cta" not in (p.get("class") or [])]
    img = lambda el: {"src": asset(el.get("src")), "alt": el.get("alt")}
    return {
        "slug": slug,
        "name": clean(info.select_one("h1").get_text()).replace("Projekt ", ""),
        "ort": sub[0] if sub else None,
        "untertitel": sub[1] if len(sub) > 1 else None,
        "pool": stats.get("Pool"),
        "projektart": stats.get("Projektart"),
        "kostenrahmen": stats.get("Kostenrahmen"),
        "fakten_roh": stats,
        "headline": clean(story.select_one("h2").get_text()),
        "story": paragraphs,
        "hero": [img(i) for i in soup.select(".hero__carousel img")],
        "story_bild": img(story.select_one("img")) if story.select_one("img") else None,
        "galerie": [img(i) for i in soup.select(".gallery__grid img")],
        "baustelle_bis_uebergabe": [
            {**img(i), "caption": i.get("data-caption")} for i in soup.select(".proof__carousel img")
        ],
    }


def to_markdown(soup):
    main = soup.find("main") or soup.body
    md = markdownify(str(main), heading_style="ATX", strip=["a"])
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", md)  # Bilder separat erfasst
    md = re.sub(r"\n\s*\n\s*\n+", "\n\n", md)
    return md.strip()


summary = {"projects": [], "faq": {}, "jobs": [], "ld": {}}
for f in sorted(HTML.glob("*.rendered.html")):
    slug = f.name.replace(".rendered.html", "")
    path = "/" if slug == "index" else "/" + slug.replace("__", "/")
    soup = BeautifulSoup(f.read_text(encoding="utf-8"), "html.parser")
    meta = page_meta(soup)
    ld = jsonld(soup)
    summary["ld"][path] = ld
    for j in ld:
        if isinstance(j, dict) and j.get("@type") == "JobPosting":
            summary["jobs"].append({"path": path, **j})
    strip_chrome(soup)

    if slug.startswith("pools__projekt-"):
        p = project(slug.replace("pools__projekt-", ""), soup)
        p["meta"] = meta
        (PROJECTS / f"{p['slug']}.json").write_text(json.dumps(p, ensure_ascii=False, indent=2), encoding="utf-8")
        summary["projects"].append({k: p[k] for k in ("slug", "name", "ort", "pool", "projektart", "kostenrahmen")})

    f_items = faqs(BeautifulSoup(str(soup), "html.parser"))
    if f_items:
        summary["faq"][path] = f_items

    md = f"---\npath: {path}\ntitle: {json.dumps(meta['title'], ensure_ascii=False)}\ndescription: {json.dumps(meta['description'], ensure_ascii=False)}\n---\n\n" + to_markdown(soup)
    (PAGES_MD / f"{slug}.md").write_text(md + "\n", encoding="utf-8")

(OUT / "faq.json").write_text(json.dumps(summary["faq"], ensure_ascii=False, indent=2), encoding="utf-8")
(OUT / "jobs.json").write_text(json.dumps(summary["jobs"], ensure_ascii=False, indent=2), encoding="utf-8")
(OUT / "structured-data.json").write_text(json.dumps(summary["ld"], ensure_ascii=False, indent=2), encoding="utf-8")
(OUT / "projects/_index.json").write_text(json.dumps(summary["projects"], ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(summary["projects"], ensure_ascii=False, indent=1))
print("FAQ:", {k: len(v) for k, v in summary["faq"].items()})
print("Jobs:", len(summary["jobs"]))
