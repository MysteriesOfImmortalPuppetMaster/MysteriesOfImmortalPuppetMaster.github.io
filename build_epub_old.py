"""
build_epub.py — Lightning-fast EPUB3 generator from chapter text files.

Reads all .txt files from ./chapters/, sorts them by numeric filename,
builds a modern EPUB3 with exquisite styling, and outputs it to the project root.
Automatically deletes any pre-existing .epub files before writing.

Python 3.14 · ebooklib · lxml
"""

from __future__ import annotations

import re
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from ebooklib import epub

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS — edit these, never prompted at runtime
# ═══════════════════════════════════════════════════════════════════════════════

BOOK_TITLE    = "Mysteries of Immortal Puppet Master"
BOOK_AUTHOR   = "Gu Zhen Ren"
BOOK_LANGUAGE = "en"
BOOK_ID       = str(uuid.uuid4())

CHAPTERS_DIR  = Path("chapters")
OUTPUT_DIR    = Path(".")

# ═══════════════════════════════════════════════════════════════════════════════
# STYLESHEET — modern, premium EPUB3 CSS
# ═══════════════════════════════════════════════════════════════════════════════

STYLESHEET = """\
/* ── Reset & Base ───────────────────────────────────────────────────────── */
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* ── Light mode (default) ───────────────────────────────────────────────── */
body {
    font-family: "Palatino Linotype", Palatino, "Book Antiqua", Georgia,
                 "Times New Roman", serif;
    font-size: 1.05em;
    line-height: 1.85;
    letter-spacing: 0.012em;
    word-spacing: 0.04em;
    color: #1a1a1a;
    background-color: #faf8f4;
    padding: 1.8em 1.5em;
    -webkit-hyphens: auto;
    hyphens: auto;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
}

/* ── Dark mode ──────────────────────────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
    body {
        color: #d4d0c8;
        background-color: #1b1b1f;
    }
    h1 {
        color: #e8e4dc !important;
        border-bottom-color: rgba(232, 228, 220, 0.15) !important;
    }
    .chapter-body p:first-of-type::first-letter {
        color: #c9a84c !important;
    }
    aside.footnote {
        border-top-color: rgba(212, 208, 200, 0.2) !important;
        color: #a09c94 !important;
    }
    hr {
        border-color: rgba(212, 208, 200, 0.12) !important;
    }
}

/* ── Chapter heading ────────────────────────────────────────────────────── */
h1 {
    font-family: "Palatino Linotype", Palatino, Georgia, serif;
    font-size: 1.65em;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: #2c2c2c;
    margin: 0.6em 0 0.5em 0;
    padding-bottom: 0.45em;
    border-bottom: 2px solid rgba(44, 44, 44, 0.12);
    text-align: left;
    line-height: 1.3;
}

/* ── Body paragraphs ────────────────────────────────────────────────────── */
.chapter-body p {
    margin: 0.85em 0;
    text-align: justify;
    text-indent: 1.5em;
}

.chapter-body p:first-of-type {
    text-indent: 0;
}

/* ── Drop cap ───────────────────────────────────────────────────────────── */
.chapter-body p:first-of-type::first-letter {
    font-size: 3.2em;
    float: left;
    line-height: 0.8;
    padding: 0.05em 0.1em 0 0;
    margin-top: 0.05em;
    font-weight: 700;
    color: #8b6914;
    font-family: "Palatino Linotype", Palatino, Georgia, serif;
}

/* ── Scene break ────────────────────────────────────────────────────────── */
hr {
    border: none;
    border-top: 2px solid rgba(44, 44, 44, 0.18);
    margin: 2em auto;
    width: 70%;
}

/* ── Footnotes (EPUB3 aside) ────────────────────────────────────────────── */
aside.footnote {
    margin-top: 2.5em;
    padding-top: 1em;
    border-top: 1px solid rgba(44, 44, 44, 0.15);
    font-size: 0.82em;
    font-style: italic;
    line-height: 1.6;
    color: #5a5a5a;
}

aside.footnote p {
    margin: 0.35em 0;
    text-indent: 0;
    text-align: left;
}

/* ── Responsive tweaks ──────────────────────────────────────────────────── */
@media screen and (max-width: 600px) {
    body { padding: 1em 0.8em; font-size: 1em; }
    h1  { font-size: 1.35em; }
}
@media screen and (min-width: 1200px) {
    body { max-width: 42em; margin: 0 auto; padding: 2.5em 2em; }
}
"""

# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

_FOOTNOTE_RE = re.compile(r"^\[\^.+?\]", re.MULTILINE)
_SCENE_BREAK = {"…", "***", "* * *", "---","----","-----"}


def _sort_key(path: Path) -> float:
    """Parse filename stem as a float for correct numeric ordering."""
    return float(path.stem)


def _read_file(path: Path) -> tuple[float, str, str, str]:
    """Read a chapter file and return (sort_key, title, body_text, raw_path)."""
    key = _sort_key(path)
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    title = lines[0].strip() if lines else f"Chapter {path.stem}"
    body = "\n".join(lines[1:]).strip()
    return key, title, body, path.stem


def _body_to_html(body: str) -> str:
    """Convert plain-text body into HTML paragraphs with footnotes separated."""
    if not body:
        return ""

    main_parts: list[str] = []
    footnote_parts: list[str] = []
    in_footnotes = False

    for block in re.split(r"\n{2,}", body):
        block = block.strip()
        if not block:
            continue

        # Detect footnote block
        if _FOOTNOTE_RE.match(block):
            in_footnotes = True

        if in_footnotes:
            # Render each footnote line
            for line in block.splitlines():
                line = line.strip()
                if line:
                    footnote_parts.append(f"<p>{_escape(line)}</p>")
        else:
            # Scene break detection
            if block in _SCENE_BREAK:
                main_parts.append("<hr/>")
            else:
                main_parts.append(f"<p>{_escape(block)}</p>")

    html = '<div class="chapter-body">\n' + "\n".join(main_parts) + "\n</div>"

    if footnote_parts:
        html += (
            '\n<aside epub:type="footnote" class="footnote">\n'
            + "\n".join(footnote_parts)
            + "\n</aside>"
        )

    return html


def _escape(text: str) -> str:
    """Minimal HTML escaping preserving readability."""
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
    )


def _format_chapter_num(stem: str) -> str:
    """Format a chapter number for display (strip trailing .0)."""
    try:
        val = float(stem)
        return str(int(val)) if val == int(val) else stem
    except ValueError:
        return stem


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    import time
    t0 = time.perf_counter()

    # ── 1. Discover chapter files ────────────────────────────────────────
    chapter_paths = sorted(CHAPTERS_DIR.glob("*.txt"), key=_sort_key)
    if not chapter_paths:
        print("No .txt files found in", CHAPTERS_DIR)
        return
    print(f"Found {len(chapter_paths)} chapters.")

    # ── 2. Parallel read ─────────────────────────────────────────────────
    with ThreadPoolExecutor() as pool:
        results = list(pool.map(_read_file, chapter_paths))
    results.sort(key=lambda r: r[0])  # ensure sort order
    print(f"Read all files in {time.perf_counter() - t0:.3f}s")

    # ── 3. Build EPUB ────────────────────────────────────────────────────
    book = epub.EpubBook()
    book.set_identifier(BOOK_ID)
    book.set_title(BOOK_TITLE)
    book.set_language(BOOK_LANGUAGE)
    book.add_author(BOOK_AUTHOR)

    # Add metadata for EPUB3
    book.add_metadata("DC", "date", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
    book.add_metadata(None, "meta", "", {"property": "dcterms:modified",
                                          "content": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())})

    # Stylesheet
    css = epub.EpubItem(
        uid="style",
        file_name="style/main.css",
        media_type="text/css",
        content=STYLESHEET.encode("utf-8"),
    )
    book.add_item(css)

    # ── 4. Create chapter items ──────────────────────────────────────────
    toc: list[epub.Link] = []
    spine: list[str | epub.EpubHtml] = ["nav"]

    for _key, title, body, stem in results:
        ch_num = _format_chapter_num(stem)
        file_name = f"ch_{stem}.xhtml"

        chapter_html = (
            f'<html xmlns="http://www.w3.org/1999/xhtml"'
            f' xmlns:epub="http://www.idpf.org/2007/ops">\n'
            f"<head>\n"
            f"  <title>{_escape(title)}</title>\n"
            f'  <link rel="stylesheet" type="text/css" href="style/main.css"/>\n'
            f"</head>\n"
            f"<body>\n"
            f"  <h1>{_escape(title)}</h1>\n"
            f"  {_body_to_html(body)}\n"
            f"</body>\n"
            f"</html>"
        )

        ch = epub.EpubHtml(
            title=title,
            file_name=file_name,
            lang=BOOK_LANGUAGE,
        )
        ch.set_content(chapter_html.encode("utf-8"))
        ch.add_item(css)

        book.add_item(ch)
        toc.append(epub.Link(file_name, title, f"ch_{stem}"))
        spine.append(ch)

    book.toc = toc
    book.spine = spine

    # Navigation files (required by EPUB3)
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    # ── 5. Determine chapter range for filename ──────────────────────────
    first_ch = _format_chapter_num(results[0][3])
    last_ch  = _format_chapter_num(results[-1][3])
    epub_name = f"{BOOK_TITLE}.epub"
    epub_path = OUTPUT_DIR / epub_name

    # ── 6. Delete old .epub files ────────────────────────────────────────
    for old in OUTPUT_DIR.glob("*.epub"):
        old.unlink()
        print(f"  Removed old: {old.name}")

    # ── 7. Write ─────────────────────────────────────────────────────────
    epub.write_epub(str(epub_path), book, {"epub3_pages": False})

    elapsed = time.perf_counter() - t0
    size_mb = epub_path.stat().st_size / (1024 * 1024)
    print(f"\n✓ Created: {epub_path.name}")
    print(f"  Size:    {size_mb:.2f} MB")
    print(f"  Time:    {elapsed:.2f}s")


if __name__ == "__main__":
    main()
