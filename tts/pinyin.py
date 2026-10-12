"""Pinyin names -> Kokoro (misaki) phonemes, so "Ning Zhuo" isn't read as "Ning Zhyoo-oh".

Only capitalized words that split completely into pinyin syllables and that misaki's
English lexicon doesn't already know are converted (so "She", "Long", "Sun" stay English).
The result is injected into misaki's lexicon; the chapter text itself is unchanged.
"""

from __future__ import annotations

import re

# Initials -> English-approximate consonants (misaki phoneme alphabet).
INITIALS = {
    "zh": "ʤ", "ch": "ʧ", "sh": "ʃ", "b": "b", "p": "p", "m": "m", "f": "f", "d": "d",
    "t": "t", "n": "n", "l": "l", "g": "ɡ", "k": "k", "h": "h", "j": "ʤ", "q": "ʧ",
    "x": "ʃ", "r": "ɹ", "z": "dz", "c": "ts", "s": "s", "y": "", "w": "",
}

# Finals -> (glide, stressed nucleus+coda). The stress mark goes between the two.
FINALS = {
    "a": ("", "ɑ"), "o": ("w", "O"), "e": ("", "ʌ"), "ai": ("", "I"), "ei": ("", "A"),
    "ao": ("", "W"), "ou": ("", "O"), "an": ("", "ɑn"), "en": ("", "ʌn"), "ang": ("", "ɑŋ"),
    "eng": ("", "ʌŋ"), "ong": ("", "ʊŋ"), "er": ("", "ɑɹ"),
    "i": ("", "i"), "ia": ("j", "ɑ"), "ie": ("j", "ɛ"), "iao": ("j", "W"), "iu": ("j", "O"),
    "ian": ("j", "ɛn"), "in": ("", "ɪn"), "iang": ("j", "ɑŋ"), "ing": ("", "ɪŋ"),
    "iong": ("j", "ʊŋ"),
    "u": ("", "u"), "ua": ("w", "ɑ"), "uo": ("w", "O"), "uai": ("w", "I"), "ui": ("w", "A"),
    "uan": ("w", "ɑn"), "un": ("w", "ʌn"), "uang": ("w", "ɑŋ"), "ue": ("w", "ɛ"),
}

# Syllables that don't follow the table above.
SPECIAL = {
    # zhi/chi/shi/ri and zi/ci/si: buzzed vowel, closest English is "jur"/"zuh".
    "zhi": ("ʤ", "", "ɜɹ"), "chi": ("ʧ", "", "ɜɹ"), "shi": ("ʃ", "", "ɜɹ"), "ri": ("ɹ", "", "ɜɹ"),
    "zi": ("dz", "", "ʌ"), "ci": ("ts", "", "ʌ"), "si": ("s", "", "ʌ"),
    # y-/w- spellings
    "yi": ("", "", "i"), "ya": ("", "j", "ɑ"), "ye": ("", "j", "ɛ"), "yao": ("", "j", "W"),
    "you": ("", "j", "O"), "yan": ("", "j", "ɛn"), "yin": ("", "", "ɪn"),
    "yang": ("", "j", "ɑŋ"), "ying": ("", "", "ɪŋ"), "yong": ("", "j", "ʊŋ"),
    "yu": ("", "j", "u"), "yue": ("", "jw", "ɛ"), "yuan": ("", "jw", "ɛn"), "yun": ("", "j", "ʊn"),
    "wu": ("", "w", "u"), "wa": ("", "w", "ɑ"), "wo": ("", "w", "O"), "wai": ("", "w", "I"),
    "wei": ("", "w", "A"), "wan": ("", "w", "ɑn"), "wen": ("", "w", "ʌn"),
    "wang": ("", "w", "ɑŋ"), "weng": ("", "w", "ʌŋ"),
    # ü after j/q/x: xuan ~ "shwen", jun ~ "jun", xue ~ "shweh"
    **{f"{i}uan": (INITIALS[i], "w", "ɛn") for i in "jqx"},
    **{f"{i}un": (INITIALS[i], "", "ʊn") for i in "jqx"},
    "lü": ("l", "", "u"), "nü": ("n", "", "u"),
}

# Initial/final pairs that don't exist in Mandarin; keeps segmentation honest.
_JQX_FINALS = {"i", "ia", "ie", "iao", "iu", "ian", "in", "iang", "ing", "iong", "u", "ue", "uan", "un"}


def _syllables() -> dict[str, str]:
    table: dict[str, tuple[str, str, str]] = {}
    for ini, cons in INITIALS.items():
        if ini in ("y", "w"):
            continue
        for fin, (glide, nucleus) in FINALS.items():
            if ini in ("j", "q", "x") and fin not in _JQX_FINALS:
                continue
            if ini not in ("j", "q", "x") and fin in ("ue",) and ini not in ("l", "n"):
                continue
            if ini in ("zh", "ch", "sh", "r", "z", "c", "s") and fin.startswith("i"):
                continue  # zhi/si etc. are SPECIAL; zhia etc. don't exist
            if ini in ("b", "p", "m", "f") and fin in ("uo", "ua", "uai", "ui", "uan", "un", "uang", "ong"):
                continue
            if ini in ("g", "k", "h") and fin.startswith("i"):
                continue
            table[ini + fin] = (cons, glide, nucleus)
    for fin, (glide, nucleus) in FINALS.items():  # zero-initial: an, ao, er, ...
        if fin[0] in "aoe":
            table[fin] = ("", glide, nucleus)
    table.update(SPECIAL)
    return {k: v for k, v in table.items()}


SYLLABLES = _syllables()
_MAX_LEN = max(map(len, SYLLABLES))


def split_pinyin(word: str) -> list[str] | None:
    """Split a lowercase word into pinyin syllables (longest-first with backtracking)."""
    word = word.replace("v", "ü")

    def go(i: int) -> list[str] | None:
        if i == len(word):
            return []
        for n in range(min(_MAX_LEN, len(word) - i), 0, -1):
            syl = word[i : i + n]
            if syl in SYLLABLES:
                rest = go(i + n)
                if rest is not None:
                    return [syl] + rest
        return None

    return go(0)


def to_phonemes(word: str) -> str | None:
    syls = split_pinyin(word.lower())
    if not syls:
        return None
    out = []
    for k, syl in enumerate(syls):
        cons, glide, nucleus = SYLLABLES[syl]
        out.append(cons + glide + ("ˈ" if k == 0 else "ˌ") + nucleus)
    return "".join(out)


# Names misaki knows but reads badly (Greek letters "kai"/"zai", "loo-oh", "myoo", ...).
# Established anglicizations it reads fine (Yang, Han, Shen, Qing, ...) are left alone.
FORCE = {"Chi", "Xi", "Luo", "Mu", "Yuan", "Si", "Er"}


def find_names(texts, is_english_word) -> dict[str, str]:
    """{Name: phonemes} for every capitalized pinyin word in texts not known as English."""
    seen: set[str] = set()
    names: dict[str, str] = {}
    for text in texts:
        for word in re.findall(r"\b[A-Z][a-z]+\b", text):
            if word in seen:
                continue
            seen.add(word)
            if word not in FORCE and (len(word) < 2 or is_english_word(word)):
                continue
            ps = to_phonemes(word)
            if ps:
                names[word] = ps
    return names
