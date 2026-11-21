"""Write the rolling release's notes (notes.md) and the CI run summary.

Called by .github/workflows/generate_releases.yml after the books are built. Download counts
come in as env vars: PREV_* is the total carried from all earlier builds, CUR_* the counts of
the release that is about to be replaced. Their sum is stored in a hidden comment in the new
notes, where the next build picks it up again.
"""
import base64
import glob
import json
import os
import re
from datetime import datetime, timezone
from urllib.parse import quote

REPO = os.environ.get("GITHUB_REPOSITORY", "MysteriesOfImmortalPuppetMaster/MysteriesOfImmortalPuppetMaster.github.io")
SHA = os.environ.get("GITHUB_SHA", "0000000")
SITE = "https://mysteriesofimmortalpuppetmaster.github.io"
ACCENT = "3b8ccb"  # --mp-accent from styles.css


def count(name):
    return int(os.environ.get(name, "0") or 0)


prev = {"epub": count("PREV_EPUB"), "pdf": count("PREV_PDF")}
cur = {"epub": count("CUR_EPUB"), "pdf": count("CUR_PDF")}
total = {k: prev[k] + cur[k] for k in prev}


def book(ext):
    files = sorted(glob.glob(f"*.{ext}"))
    if not files:
        return None, "?"
    size = sum(os.path.getsize(f) for f in files) / 1024 / 1024
    return files[0], f"{size:.1f} MB"


def latest_chapter():
    try:
        with open("chapters.json", encoding="utf-8") as f:
            entries = json.load(f)
    except (OSError, ValueError):
        return None
    for e in reversed(entries):
        title = re.sub(r"\[\^\d+\]", "", e.get("title", "")).strip()
        if title.startswith("Chapter"):
            return title
    return None


# White 24x24 line icons, drawn for these buttons (shields.io shows them left of the label).
_ICON = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" '
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{}</svg>')
ICONS = {
    # open book
    "epub": _ICON.format('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/>'
                         '<path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
    # page with a folded corner and text lines
    "pdf": _ICON.format('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
                        '<path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>'),
}


def badge(label, message, color, label_color, icon):
    esc = lambda t: t.replace("-", "--").replace("_", "__").replace(" ", "%20")
    logo = quote("data:image/svg+xml;base64," + base64.b64encode(icon.encode()).decode(), safe="")
    return (f"https://img.shields.io/badge/{esc(label)}-{esc(message)}-{color}"
            f"?style=for-the-badge&labelColor={label_color}&logo={logo}")


epub, epub_size = book("epub")
pdf, pdf_size = book("pdf")
dl = lambda f: f"https://github.com/{REPO}/releases/download/latest/{f}"
chapter = latest_chapter()
built = datetime.now(timezone.utc).strftime("%d %b %Y").lstrip("0")
commit = f"[`{SHA[:7]}`](https://github.com/{REPO}/commit/{SHA})"
n = lambda v: f"{v:,}"

buttons = []
if epub:
    buttons.append(f"[![Download EPUB]({badge('Download EPUB', epub_size, '2d6fa3', ACCENT, ICONS['epub'])})]({dl(epub)})")
if pdf:
    buttons.append(f"[![Download PDF]({badge('Download PDF', pdf_size, '1d5596', '256bbc', ICONS['pdf'])})]({dl(pdf)})")

notes = f"""## Mysteries of Immortal Puppet Master

<img src="{SITE}/banner50percent.webp" align="right" width="130" alt="Cover">

{f"The whole book, up to **{chapter}**." if chapter else "The whole book."}
Rebuilt automatically whenever the site changes.

{" ".join(buttons)}

| | Downloads |
|:--|--:|
| EPUB | **{n(total["epub"])}** |
| PDF | **{n(total["pdf"])}** |
| All formats | **{n(total["epub"] + total["pdf"])}** |

<sub>Built {built} from {commit}. Counts cover every earlier build (GitHub resets them each time the book is rebuilt) and update with the next build. [Read online]({SITE})</sub>

<!-- download-totals epub={total["epub"]} pdf={total["pdf"]} -->
"""

with open("notes.md", "w", encoding="utf-8") as f:
    f.write(notes)

summary = f"""### Downloads

| | Earlier builds | Replaced build | All time |
|:--|--:|--:|--:|
| EPUB | {n(prev["epub"])} | {n(cur["epub"])} | **{n(total["epub"])}** |
| PDF | {n(prev["pdf"])} | {n(cur["pdf"])} | **{n(total["pdf"])}** |
| All formats | {n(prev["epub"] + prev["pdf"])} | {n(cur["epub"] + cur["pdf"])} | **{n(total["epub"] + total["pdf"])}** |

{" ".join(buttons)}
"""

if os.environ.get("GITHUB_STEP_SUMMARY"):
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
        f.write(summary)
