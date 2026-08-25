"""
build_epub.py — Fast EPUB3 + PDF generator from chapter text files.

Python 3.14 · ebooklib · reportlab · lxml
"""

from __future__ import annotations

import re
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from ebooklib import epub
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, NextPageTemplate
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, 
    NextPageTemplate, Table, TableStyle
)
from reportlab.lib.colors import HexColor, white

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

BOOK_TITLE    = "Mysteries of Immortal Puppet Master"
BOOK_AUTHOR   = "Gu Zhen Ren"
BOOK_LANGUAGE = "en"
BOOK_ID       = str(uuid.uuid4())

CHAPTERS_DIR  = Path("chapters")
OUTPUT_DIR    = Path(".")
COVER_IMAGE   = "cover50.webp"
# ═══════════════════════════════════════════════════════════════════════════════
# STYLESHEET — modern EPUB3 CSS
# ═══════════════════════════════════════════════════════════════════════════════

STYLESHEET = """\
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: "Palatino Linotype", Palatino, Georgia, serif;
    font-size: 1.05em; line-height: 1.85; letter-spacing: 0.012em;
    color: #1a1a1a; background-color: #faf8f4; padding: 1.8em 1.5em;
    hyphens: auto; text-rendering: optimizeLegibility;
}
@media (prefers-color-scheme: dark) {
    body { color: #d4d0c8; background-color: #1b1b1f; }
    h1 { color: #e8e4dc !important; border-bottom-color: rgba(232, 228, 220, 0.15) !important; }
    .chapter-body p:first-of-type::first-letter { color: #c9a84c !important; }
    aside.footnote { border-top-color: rgba(212, 208, 200, 0.2) !important; color: #a09c94 !important; }
    hr { border-color: rgba(212, 208, 200, 0.12) !important; }
}
h1 {
    font-size: 1.65em; font-weight: 600; color: #2c2c2c; margin: 0.6em 0 0.5em 0;
    padding-bottom: 0.45em; border-bottom: 2px solid rgba(44, 44, 44, 0.12);
}
.chapter-body p { margin: 0.85em 0; text-align: justify; text-indent: 1.5em; }
.chapter-body p:first-of-type { text-indent: 0; }
.chapter-body p:first-of-type::first-letter {
    font-size: 3.2em; float: left; line-height: 0.8; padding: 0.05em 0.1em 0 0;
    font-weight: 700; color: #8b6914;
}
hr { border: none; border-top: 1px solid rgba(44, 44, 44, 0.18); margin: 2em auto; width: 40%; }
aside.footnote { margin-top: 2.5em; padding-top: 1em; border-top: 1px solid rgba(44, 44, 44, 0.15); font-size: 0.82em; font-style: italic; color: #5a5a5a; }
aside.footnote p { margin: 0.35em 0; text-indent: 0; }
"""

# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

_FOOTNOTE_RE = re.compile(r"^\[\^.+?\]", re.MULTILINE)
_SCENE_BREAK = {"…", "***", "* * *", "---", "----", "-----"}
_CJK_RE = re.compile(r"[\u2e80-\u2eff\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]+")
_CJK_FONT_NAME = "STSong-Light"


def _sort_key(path: Path) -> float:
    return float(path.stem)


def _read_file(path: Path) -> tuple[float, str, str, str]:
    key = _sort_key(path)
    text = path.read_text(encoding="utf-8-sig")
    lines = text.splitlines()
    title = lines[0].strip() if lines else f"Chapter {path.stem}"
    body = "\n".join(lines[1:]).strip()
    return key, title, body, path.stem


def _body_to_html(body: str) -> str:
    if not body:
        return ""

    main_parts: list[str] = []
    footnote_parts: list[str] = []
    in_footnotes = False

    for block in re.split(r"\n{2,}", body):
        block = block.strip()
        if not block:
            continue

        if _FOOTNOTE_RE.match(block):
            in_footnotes = True

        if in_footnotes:
            for line in block.splitlines():
                if line.strip():
                    footnote_parts.append(f"<p>{_escape(line.strip())}</p>")
        else:
            if block in _SCENE_BREAK:
                main_parts.append("<hr/>")
            else:
                main_parts.append(f"<p>{_escape(block)}</p>")

    html = '<div class="chapter-body">\n' + "\n".join(main_parts) + "\n</div>"
    if footnote_parts:
        html += '\n<aside epub:type="footnote" class="footnote">\n' + "\n".join(footnote_parts) + "\n</aside>"

    return html


def _escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _escape_pdf(text: str) -> str:
    escaped = _escape(text)
    return _CJK_RE.sub(lambda m: f'<font name="{_CJK_FONT_NAME}">{m.group(0)}</font>', escaped)


def _format_chapter_num(stem: str) -> str:
    try:
        val = float(stem)
        return str(int(val)) if val == int(val) else stem
    except ValueError:
        return stem


# ═══════════════════════════════════════════════════════════════════════════════
# PDF BUILDER
# ═══════════════════════════════════════════════════════════════════════════════

class PdfBuilder(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if flowable.__class__.__name__ == 'Paragraph' and flowable.style.name == 'ChHeading':
            text = flowable.getPlainText()
            # Create a unique, deterministic key for each chapter
            key = f"chap_{abs(hash(text))}"
            
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=True)
            
            self.notify('TOCEntry', (0, text, self.page, key))


def title_background(canvas, doc):
    canvas.saveState()
    # 1. Full 100% cover image
    canvas.setFillAlpha(1.0)
    canvas.drawImage(
        COVER_IMAGE, 
        0, 
        0, 
        width=doc.pagesize[0], 
        height=doc.pagesize[1]
    )
    box_x = doc.leftMargin - 0.5*cm
    box_w = doc.width + 1.0*cm
    box_y = doc.pagesize[1] - doc.topMargin - 4*cm - 230
    box_h = 260
    
    draw_faded_white_box(canvas, box_x, box_y, box_w, box_h, max_alpha=0.7, fade_margin=30, steps=25)
    canvas.restoreState()
def draw_faded_white_box(canvas, x, y, width, height, max_alpha=0.7, fade_margin=25, steps=25):
    """Draws a box with a 70% opaque white center that smoothly fades out to 0% at the edges."""
    canvas.saveState()
    canvas.setFillColor(white)
    
    # Calculate per-layer alpha so stacking N layers reaches exact max_alpha (0.7)
    step_alpha = 1.0 - (1.0 - max_alpha) ** (1.0 / steps)
    canvas.setFillAlpha(step_alpha)

    for i in range(steps):
        inset = fade_margin * (i / (steps - 1))
        rx = x + inset
        ry = y + inset
        rw = width - 2 * inset
        rh = height - 2 * inset
        if rw > 0 and rh > 0:
            canvas.rect(rx, ry, rw, rh, fill=1, stroke=0)
            
    canvas.restoreState()
def draw_subtle_gradient(canvas, doc):
    """Draws a barely-perceptible off-white gradient from pure white (top) to warm ivory (bottom)."""
    canvas.saveState()
    width, height = doc.pagesize
    steps = 50
    step_h = height / steps

    # RGB values: Pure white top (255, 255, 255) to warm cream bottom (250, 247, 240)
    r1, g1, b1 = 255, 255, 255
    r2, g2, b2 = 232, 226, 219

    for i in range(steps):
        t = i / (steps - 1)
        r = (r1 * (1 - t) + r2 * t) / 255.0
        g = (g1 * (1 - t) + g2 * t) / 255.0
        b = (b1 * (1 - t) + b2 * t) / 255.0

        canvas.setFillColorRGB(r, g, b)
        # Draw a thin horizontal strip for each step
        canvas.rect(0, height - (i + 1) * step_h, width, step_h + 0.5, fill=1, stroke=0)

    canvas.restoreState()
def _build_pdf(results: list[tuple[float, str, str, str]], output_dir: Path) -> None:
    t0 = time.perf_counter()
    pdf_name = f"{BOOK_TITLE}.pdf"
    pdf_path = output_dir / pdf_name

    pdfmetrics.registerFont(UnicodeCIDFont(_CJK_FONT_NAME))

    # Enable stream compression to drastically reduce output PDF size
    doc = PdfBuilder(
        str(pdf_path), pagesize=A5,
        leftMargin=1.8*cm, rightMargin=1.8*cm,
        topMargin=2.5*cm, bottomMargin=2.0*cm,
        pageCompression=1
    )

    def header_footer(canvas, doc):
        draw_subtle_gradient(canvas, doc)
        canvas.saveState()
        canvas.setFont('Times-Roman', 8)
        canvas.setFillColor(HexColor('#888888'))
        canvas.drawCentredString(doc.pagesize[0]/2.0, doc.pagesize[1] - 1.5*cm, BOOK_TITLE.upper())
        canvas.setFont('Times-Roman', 9)
        canvas.setFillColor(HexColor('#666666'))
        canvas.drawCentredString(doc.pagesize[0]/2.0, 1.0*cm, str(doc.page))
        canvas.restoreState()

    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='normal')
    template_title = PageTemplate(id='Title', frames=frame, onPage=title_background)
    template_chap = PageTemplate(id='Chapter', frames=frame, onPage=header_footer)
    doc.addPageTemplates([template_title, template_chap])

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('TitleStyle', parent=styles['Normal'], fontName='Times-Bold', fontSize=24, leading=28, alignment=1, spaceAfter=20, textColor=HexColor('#2c2c2c'))
    author_style = ParagraphStyle('AuthorStyle', parent=styles['Normal'], fontName='Times-Italic', fontSize=14, leading=18, alignment=1, spaceBefore=4, textColor=HexColor('#555555'))
    ornament_style = ParagraphStyle('Ornament', parent=styles['Normal'], fontName='Times-Roman', fontSize=18, leading=22, alignment=1, spaceAfter=4, textColor=HexColor('#8b6914'))
    toc_h2_style = ParagraphStyle('TocHeading', parent=styles['Heading2'], fontName='Times-Bold', fontSize=16, leading=20, alignment=1, spaceAfter=20, textColor=HexColor('#2c2c2c'))
    ch_heading_style = ParagraphStyle('ChHeading', parent=styles['Heading1'], fontName='Times-Bold', fontSize=14, leading=18, spaceAfter=15, textColor=HexColor('#2c2c2c'))

    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontName='Times-Roman', fontSize=10.5, leading=16, alignment=4, firstLineIndent=0.0, spaceAfter=4)

    body_first_style = ParagraphStyle('BodyFirstStyle', parent=body_style, firstLineIndent=0, leading=24, spaceAfter=6)

    scene_break_style = ParagraphStyle('SceneBreak', parent=styles['Normal'], fontName='Times-Roman', fontSize=14, leading=18, alignment=1, spaceBefore=15, spaceAfter=15, textColor=HexColor('#8b6914'))

    footnote_style = ParagraphStyle('Footnote', parent=body_style, fontName='Times-Italic', fontSize=8.5, leading=12)

    title_box = Table(
        [
            [Paragraph(BOOK_TITLE, title_style)],
            [Paragraph("❧  ❧  ❧", ornament_style)],
            [Paragraph(BOOK_AUTHOR, author_style)]
        ],
        colWidths=[doc.width],
        style=TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ])
    )

    story = [
        Spacer(1, 4*cm),
        title_box,
        NextPageTemplate('Chapter'),
        PageBreak(),
        Paragraph("Table of Contents", toc_h2_style)
    ]

    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle(fontName='Times-Roman', fontSize=8.5, name='TOCHeading1', leftIndent=10, firstLineIndent=0, spaceBefore=2, leading=12)]
    story.extend([toc, PageBreak()])

    for key, title, body, stem in results:
        story.append(Paragraph(_escape_pdf(title), ch_heading_style))
        blocks = re.split(r"\n{2,}", body)
        first_para = True
        
        for block in blocks:
            block = block.strip()
            if not block: continue

            if block in _SCENE_BREAK:
                story.append(Paragraph("· · ·", scene_break_style))
                first_para = False
            elif _FOOTNOTE_RE.match(block):
                story.append(Spacer(1, 10))
                for line in block.splitlines():
                    if line.strip():
                        story.append(Paragraph(_escape_pdf(line.strip()), footnote_style))
            else:
                text = _escape_pdf(block)
                if first_para:
                    if text:
                        text = f'<font size="24" color="#8b6914"><b>{text[0]}</b></font>{text[1:]}'
                    story.append(Paragraph(text, body_first_style))
                    first_para = False
                else:
                    story.append(Paragraph(text, body_style))
        story.append(PageBreak())

    print("Rendering compressed PDF...")
    doc.multiBuild(story)
    
    elapsed = time.perf_counter() - t0
    size_mb = pdf_path.stat().st_size / (1024 * 1024)
    print(f"✓ Created: {pdf_path.name} ({size_mb:.2f} MB in {elapsed:.2f}s)")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    t0 = time.perf_counter()
    chapter_paths = sorted(CHAPTERS_DIR.glob("*.txt"), key=_sort_key)
    if not chapter_paths:
        print("No .txt files found.")
        return

    with ThreadPoolExecutor() as pool:
        results = list(pool.map(_read_file, chapter_paths))
    results.sort(key=lambda r: r[0])

    book = epub.EpubBook()
    book.set_identifier(BOOK_ID)
    book.set_title(BOOK_TITLE)
    book.set_language(BOOK_LANGUAGE)
    book.add_author(BOOK_AUTHOR)

    css = epub.EpubItem(uid="style", file_name="style/main.css", media_type="text/css", content=STYLESHEET.encode("utf-8"))
    book.add_item(css)

    toc: list[epub.Link] = []
    spine: list[str | epub.EpubHtml] = ["nav"]

    for _key, title, body, stem in results:
        file_name = f"ch_{stem}.xhtml"
        chapter_html = (
            f'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">\n'
            f"<head><title>{_escape(title)}</title><link rel=\"stylesheet\" type=\"text/css\" href=\"style/main.css\"/></head>\n"
            f"<body><h1>{_escape(title)}</h1>{_body_to_html(body)}</body></html>"
        )
        ch = epub.EpubHtml(title=title, file_name=file_name, lang=BOOK_LANGUAGE)
        ch.set_content(chapter_html.encode("utf-8"))
        ch.add_item(css)

        book.add_item(ch)
        toc.append(epub.Link(file_name, title, f"ch_{stem}"))
        spine.append(ch)

    book.toc = toc
    book.spine = spine
    book.add_item(epub.EpubNcx())
    book.add_item(epub.EpubNav())

    epub_path = OUTPUT_DIR / f"{BOOK_TITLE}.epub"
    epub.write_epub(str(epub_path), book, {"epub3_pages": False})

    print(f"✓ Created: {epub_path.name} ({epub_path.stat().st_size / (1024 * 1024):.2f} MB)")
    _build_pdf(results, OUTPUT_DIR)


if __name__ == "__main__":
    main()