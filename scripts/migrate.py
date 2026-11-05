#!/usr/bin/env python3
"""Import the old Jekyll site (ai-sf/preplancks) into src/content/editions + public/editions.

Usage: python3 scripts/migrate.py /path/to/old/preplancks
Idempotent: rewrites every edition file and media file it owns.
Dates come from the old repo's git history (home.yml at the commit that set each year).
"""
import sys, re, shutil
from pathlib import Path
import yaml
from PIL import Image

OLD = Path(sys.argv[1]).resolve()
ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src/content/editions"
MEDIA = ROOT / "public/editions"
IMG = OLD / "img"

# Facts from the old home.yml history (when / countdown / host). Missing = unknown, left empty.
FACTS = {
    "2026": dict(event_date="2026-03-06", registration_closes="2026-03-02", host="Eindhoven",
                 host_url="https://plancks2026.verenigingspin.nl/",
                 logos=[dict(name="PLANCKS 2026", image="/logos/plancks-2026.svg", href="https://plancks2026.verenigingspin.nl/")]),
    "2025": dict(event_date="2025-02-05", registration_closes="2025-01-31"),
    "2024": dict(event_date="2024-02-16", registration_closes="2024-02-06"),  # old file said "16 Febbraio 2023": typo, year inferred
    "2023": dict(event_date="2023-03-22", registration_closes="2023-02-05", host="Milano"),
    "2022": dict(event_date="2022-03-04", host="Porto"),  # online because of COVID-19
}
# Palette per edition, eyeballed from the key art. paper must be dark (the site is light-on-dark).
THEMES = {
    "2026": dict(paper="#0e0807", accent="#f8ea1a", accent_ink="#1a1600"),
    "2025": dict(paper="#0b0c24", accent="#ff6a1a", accent_ink="#1a0a00"),
    "2024": dict(paper="#1a0912", accent="#f0b429", accent_ink="#1f1500"),
    "2023": dict(paper="#0b0b0f", accent="#f2b134", accent_ink="#1f1500"),
}
# key art: (banner with text, mobile banner, art-only background, art-only mobile background)
ART = {
    "2026": ("prePLANCKS26.webp", "prePLANCKS26_mobile.webp", "prePLANCKS26_bkg.webp", "prePLANCKS26_bkg_mobile.webp"),
    "2025": ("precedenti/2025/SITO_PrePLANCKS25.png", "precedenti/2025/SITOvert_PrePLANCKS25.png",
             "precedenti/2025/SITO_PrePLANCKS25_bkg.png", "precedenti/2025/SITOvert_PrePLANCKS25_bkg.png"),
    # 2024/2023: art without title + a separate transparent title, centred (as the old CSS did)
    "2024": (("precedenti/2024/prePLANCKS24_desktop.png", "precedenti/2024/prePLANCKS24_titolo.png"),
             ("precedenti/2024/prePLANCKS24_mobile.png", "precedenti/2024/prePLANCKS24_titolo.png"),
             "precedenti/2024/prePLANCKS24_desktop.png", "precedenti/2024/prePLANCKS24_mobile.png"),
    "2023": (("precedenti/2023/sitop23_notitle.png", "precedenti/2023/PLANCKS23_titolo.png"),
             ("precedenti/2023/mobilep23_notitle.png", "precedenti/2023/PLANCKS23_titolo.png"),
             "precedenti/2023/sitop23_notitle.png", "precedenti/2023/mobilep23_notitle.png"),
}
ALT = {"2026": "PLANCKS 26 preliminaries, con i loghi di IAPS e AISF", "2025": "PLANCKS 25 preliminaries, con i loghi di IAPS e AISF",
       "2024": "prePLANCKS 2024", "2023": "prePLANCKS 2023"}

def save(im, dest, width, q=82):
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, "WEBP", quality=q)

def load_art(spec, mobile):
    if isinstance(spec, tuple):
        base = Image.open(IMG / spec[0]).convert("RGBA")
        title = Image.open(IMG / spec[1]).convert("RGBA")
        title = title.crop(title.getbbox())
        # old CSS: title centred horizontally, top at 15%, at most 250px tall on a 1080px-high banner, never wider than the banner
        w = min(round(base.width * 0.92), round(title.width * (0.23 * base.height) / title.height))
        title = title.resize((w, round(title.height * w / title.width)), Image.LANCZOS)
        base.alpha_composite(title, ((base.width - w) // 2, round(base.height * 0.15)))
        return base
    return Image.open(IMG / spec)

def pretty(stem):
    return re.sub(r"\s+", " ", stem.replace("_s ", "’s ").replace("_", " ")).strip()

old = yaml.safe_load((OLD / "_data/precedenti.yml").read_text())
years = {}
for a in old["anni"]:
    for sec in a["sections"]:
        years[sec["name"]] = dict(points=sec["points"])
years.setdefault("2026", dict(points=[]))
# 2026 entry in precedenti.yml lists text + solutions
CONTENT.mkdir(parents=True, exist_ok=True)
for y, d in sorted(years.items()):
    docs = []
    for p in d["points"]:
        src = OLD / p["url"]
        kind = "soluzioni" if "sol" in p["button"].lower() else "testo"
        dest = MEDIA / y / f"{kind}.pdf"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        docs.append(dict(label="Soluzioni" if kind == "soluzioni" else "Testo", kind=kind, file=f"/editions/{y}/{kind}.pdf"))
    fm = dict(year=y)
    fm.update(FACTS.get(y, {}))
    if y in ("2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"):
        pass
    if y in FACTS and y != "2022":
        fm["who"] = "Squadre di 3 o 4 studenti"
        fm["who_detail"] = "Triennali, magistrali o misti, regolarmente iscritti ad AISF."
        fm["where"] = "In contemporanea in tutta Italia"
    if y in ART:
        b, bm, bg, bgm = ART[y]
        out = {}
        for key, spec, mobile, w in (("banner", b, False, 2400), ("banner_mobile", bm, True, 1080),
                                     ("background", bg, False, 2400), ("background_mobile", bgm, True, 1080)):
            save(load_art(spec, mobile), MEDIA / y / f"{key}.webp", w)
            out[key] = f"/editions/{y}/{key}.webp"
        out["alt"] = ALT[y]
        fm["art"] = out
        fm["theme"] = THEMES[y]
    if docs:
        fm["documents"] = docs
    gdir = IMG / "precedenti" / y
    photos = sorted(p for p in gdir.rglob("*") if p.suffix.lower() in (".jpg", ".png") and y in ("2017", "2020", "2021")) if gdir.exists() else []
    if photos:
        gal = []
        for i, p in enumerate(photos, 1):
            rel = f"/editions/{y}/gallery/{i:02d}.webp"
            save(Image.open(p), ROOT / "public" / rel.lstrip("/"), 1600, 78)
            city = p.parent.name if p.parent != gdir else ""
            stem = pretty(p.stem)
            if y == "2021":
                city = next(c for c in ("Roma 3", "Roma", "Pisa", "Padova", "Bologna", "Torino") if stem.endswith(c))
                caption = stem[: -len(city)].strip()
            elif y == "2020":
                caption = re.sub(r"\s*\d+$", "", stem)
                if caption == city:
                    caption = ""
            else:
                caption = ""
            gal.append(dict(image=rel, alt=f"prePLANCKS {y}" + (f", {city}" if city else ""), caption=(f"{caption}, {city}" if city and caption else caption)))
        fm["gallery"] = gal
    (CONTENT / f"{y}.md").write_text("---\n" + yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, default_flow_style=False, width=100) + "---\n")
    print(y, "docs", len(docs), "photos", len(photos), "art" if y in ART else "")
