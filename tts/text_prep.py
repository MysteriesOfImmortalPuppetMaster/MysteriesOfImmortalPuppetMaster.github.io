"""Turn a raw chapter .txt into clean, speakable text chunks.

Pure Python (no TTS deps) so it can be checked anywhere with `--dry-run`.
"""

from __future__ import annotations

import html
import re

# Breeze TTS treats "(...)" (English) and "[...]" (Chinese) as vocal events like
# "(sigh)" or "[笑]", so brackets from the novel must not reach the model as-is.

CJK = r"぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯"
_FOOTNOTE_DEF = re.compile(r"^\[\^[^\]]+\]:?\s", re.M)
_FOOTNOTE_REF = re.compile(r"\[\^[^\]]*\]")
_SEPARATOR = re.compile(r"^\s*(?:-{3,}|\*{3,}|(?:\*\s*){3,}|_{3,}|={3,})\s*$", re.M)
_SENTENCE_END = re.compile(r"([.!?…]+[”’\"')\]]*)\s+")


def clean_chapter(raw: str) -> str:
    """Return speakable text, one paragraph per line."""
    text = raw.replace("﻿", "").replace("\r\n", "\n").replace("\r", "\n")

    # Translator footnotes live in a trailing block; drop it and the inline markers.
    m = _FOOTNOTE_DEF.search(text)
    if m:
        text = re.sub(r"\n\s*Notes:\s*$", "\n", text[: m.start()])
    text = _FOOTNOTE_REF.sub("", text)

    # HTML (a few chapters use <div>, <b>, <i>, <p class="glitch-text">).
    text = re.sub(r"(?i)<br\s*/?>|</(?:p|div)>", "\n", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(text)

    # Markdown.
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)            # images
    text = re.sub(r"\[([^\]]+)\]\((?:https?://)[^)]*\)", r"\1", text)  # links
    text = re.sub(r"https?://\S+", "", text)
    text = _SEPARATOR.sub("", text)
    text = re.sub(r"^\s*#{1,6}\s*", "", text, flags=re.M)
    text = re.sub(r"\*{1,3}", "", text)
    text = re.sub(r"(?<!\w)_{1,2}([^_\n]+?)_{1,2}(?!\w)", r"\1", text)

    # Chinese/Japanese glosses can't be read by an English narrator.
    text = re.sub(rf"\(\s*[{CJK}\s,、，;；/]+\s*\)", "", text)
    text = re.sub(rf"[{CJK}]+", "", text)

    # Brackets -> plain prose so they aren't read as vocal events.
    text = text.replace("[...]", "...").replace("[…]", "…")
    text = re.sub(r"\[([^\]]*)\]", r"\1", text)
    text = re.sub(r"\(([^)]*)\)", r", \1,", text)
    text = text.replace("(", "").replace(")", "")

    paragraphs = []
    for line in text.split("\n"):
        line = _tidy(line)
        if re.search(r"\w", line):
            # Headings ("Chapter 1: Title") have no end punctuation; add one so
            # the narrator pauses instead of running into the next sentence.
            if not re.search(r"[.!?…:;,—–\-”’\"']$", line):
                line += "."
            paragraphs.append(line)
    return "\n".join(paragraphs)


def _tidy(line: str) -> str:
    line = re.sub(r"[ \t 　]+", " ", line).strip()
    line = re.sub(r"\s+([,.;:!?…])", r"\1", line)
    line = re.sub(r",\s*(?=[,.;:!?…])", "", line)  # ", ." / ",,"
    line = re.sub(r"([“‘\"])\s*,\s*", r"\1", line)        # “, text
    line = re.sub(r"^[,;:]\s*", "", line)
    line = re.sub(r"\s*,$", "", line)
    return line


def split_sentences(paragraph: str) -> list[str]:
    parts = _SENTENCE_END.split(paragraph)
    # split() with one group yields [text, end, text, end, ..., text]
    sentences = [a + b for a, b in zip(parts[0::2], parts[1::2] + [""])]
    return [s.strip() for s in sentences if s.strip()]


# Kokoro reads up to ~500 characters in one pass; quotes longer than this still split.
QUOTE_MAX = 480


def merge_quotes(sentences: list[str]) -> list[str]:
    """Keep each quotation in one unit, so dialogue isn't cut mid-quote (the model
    reads a quote's intonation across sentences only if it sees them together)."""
    out: list[str] = []
    buf, curly, straight = "", 0, False
    for s in sentences:
        if buf and len(buf) + 1 + len(s) > QUOTE_MAX:
            out.append(buf)  # quote too long: fall back to sentence boundaries
            buf, curly, straight = "", 0, False
        buf = f"{buf} {s}" if buf else s
        curly += s.count("“") - s.count("”")
        straight ^= s.count('"') % 2 == 1
        if curly <= 0 and not straight:
            out.append(buf)
            buf, curly, straight = "", 0, False
    if buf:
        out.append(buf)
    return out


def _split_long(sentence: str, max_chars: int) -> list[str]:
    """Break a sentence longer than max_chars at clause, then word, boundaries."""
    if len(sentence) <= max_chars:
        return [sentence]
    pieces = re.split(r"(?<=[,;:—–])\s+", sentence)
    if len(pieces) == 1:
        pieces = sentence.split(" ")
    out, cur = [], ""
    for piece in pieces:
        if cur and len(cur) + 1 + len(piece) > max_chars:
            out.append(cur)
            cur = piece
        else:
            cur = f"{cur} {piece}" if cur else piece
    if cur:
        out.append(cur)
    # A single word/clause can still exceed max_chars; hard-cut as last resort.
    return [p[i : i + max_chars] for p in out for i in range(0, len(p), max_chars)]


def chunk_text(text: str, max_chars: int = 400, min_chars: int = 120) -> list[str]:
    """Greedily pack whole sentences into chunks of at most ~max_chars.

    The original audioStash chunks average ~30 s / ~380 characters each.
    Paragraph breaks inside a chunk are kept as newlines (engines turn them into pauses).
    """
    units: list[tuple[str, bool]] = []  # (text, starts a new paragraph)
    for paragraph in text.split("\n"):
        first = True
        for sentence in merge_quotes(split_sentences(paragraph)):
            for piece in _split_long(sentence, max(max_chars, QUOTE_MAX)):
                units.append((piece, first))
                first = False

    chunks: list[str] = []
    cur = ""
    for unit, new_para in units:
        if cur and len(cur) + 1 + len(unit) > max_chars:
            chunks.append(cur)
            cur = unit
        else:
            sep = "\n" if new_para else " "
            cur = f"{cur}{sep}{unit}" if cur else unit
    if cur:
        # Avoid a tiny trailing chunk: fold it into the previous one if it fits.
        if chunks and len(cur) < min_chars and len(chunks[-1]) + 1 + len(cur) <= max_chars * 1.4:
            chunks[-1] = f"{chunks[-1]}\n{cur}"
        else:
            chunks.append(cur)
    return chunks
