"""TTS the whole book with Breeze TTS 2 into an audioStash-shaped folder.

    python tts_book.py test                 # first chunk of the first chapter only
    python tts_book.py full                 # every chapter (resumable)
    python tts_book.py full --chapters 1-50 # a subset
    python tts_book.py full --dry-run       # chunk the text, no model needed

Output (identical layout to github.com/MysteriesOfImmortalPuppetMaster/audioStash):

    audioStash/
      .gitignore  README.md  _headers  index.html
      1/1_1.mp3 ... 1/1_N.mp3, 1/audio_metadata.json, 1/progress.txt
      (--format webm writes 1_1.webm ... as Opus 24 kbps, like the live site)
      19.5/...
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from dataclasses import replace
from datetime import datetime
from pathlib import Path

from text_prep import chunk_text, clean_chapter

ROOT = Path(__file__).resolve().parent
CHAPTERS_DIR = ROOT / "chapters"
STASH_ROOT_FILES = ROOT / "stash_root"
DEFAULT_OUT = ROOT / "audioStash"
DEFAULT_TEST_OUT = ROOT / "test_output"
STATE_DIR = ROOT / "state"  # resume bookkeeping, kept out of the published folder

# Voice used when no --voice / --ref-audio is given (Breeze "voice design").
DEFAULT_INSTRUCTION = (
    "A calm, warm male audiobook narrator with a clear, slightly deep voice, "
    "reading a Chinese fantasy novel at a steady, natural pace with subtle expression."
)
# `test --preset all` renders each of these (Breeze "voice design" prompts).
PRESETS = {
    "m_sage": "An older male storyteller with a deep, slightly gravelly voice, speaking slowly "
              "and deliberately, like a wise elder recounting an ancient legend.",
    "m_baritone": "A male audiobook narrator with a rich, resonant baritone, dramatic but "
                  "controlled, building tension in action scenes and softening in quiet ones.",
    "m_crisp": "A young, articulate male narrator with a bright, crisp voice and lively pacing, "
               "clearly enjoying the story, with light emotion in the dialogue.",
    "m_soft": "A soft-spoken male narrator with a low, relaxed, intimate voice, like a "
              "late-night radio host reading a story at an easy, unhurried pace.",
    "f_velvet": "A calm female audiobook narrator with a smooth, velvety mid-range voice, "
                "unhurried and soothing, with gentle emphasis on dramatic moments.",
    # f_velvet variations: same calm mid-range core, nudged one way each.
    "f_velvet_soft": "A calm female audiobook narrator with a soft, smooth, velvety mid-range voice, "
                     "gentle and even, speaking slightly quietly at an unhurried pace.",
    "f_velvet_clear": "A calm female audiobook narrator with a smooth mid-range voice and very clear "
                      "diction, unhurried and composed, with subtle emphasis on dramatic moments.",
    "f_velvet_neutral": "A composed female audiobook narrator with a smooth, velvety mid-range voice, "
                        "neutral and even-toned, steady pacing, restrained expression.",
    "f_velvet_rich": "A calm female audiobook narrator with a smooth, slightly rich mid-range voice, "
                     "relaxed and soothing, with gentle warmth but no cheerfulness.",
    "f_velvet_measured": "A calm, thoughtful female narrator with a smooth, velvety mid-range voice, "
                         "measured pacing with natural pauses, quietly serious and immersive.",
    "f_velvet_young": "A calm young woman in her late twenties narrating an audiobook with a smooth, "
                      "velvety mid-range voice, relaxed and soothing, understated emotion.",
    "f_alto":"A mature woman with a low, elegant alto voice, composed and confident, "
              "narrating with quiet authority like a documentary narrator.",
    "f_bright": "A young female narrator with a bright, clear, expressive voice and a lively "
                "pace, giving characters distinct energy in the dialogue.",
    "f_warm": "A warm, friendly female storyteller with a gentle, slightly husky voice and a "
              "hint of humor, reading at a natural, comfortable pace.",
}
DEFAULT_MAX_CHARS = 430  # ~30 s per chunk, matching the original audioStash
CHARS_PER_SEC = 11.5     # measured from the original chapter 1; used for sanity checks
MAX_ATTEMPTS = 3

# Mirrors breeze-tts infer.py
MAX_NEW_TOKENS = 1500
MAX_SEQ_LEN = 2048
REPETITION_PENALTY = 1.1


# --------------------------------------------------------------------------- chapters

def chapter_sort_key(stem: str) -> tuple[float, str]:
    try:
        return (float(stem), stem)
    except ValueError:
        return (float("inf"), stem)


def list_chapters() -> list[str]:
    return sorted((p.stem for p in CHAPTERS_DIR.glob("*.txt")), key=chapter_sort_key)


def select_chapters(all_chapters: list[str], spec: str | None) -> list[str]:
    """spec like "1-50,19.5,300-" (ranges are numeric and inclusive)."""
    if not spec:
        return all_chapters
    picked = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            lo, hi = part.split("-", 1)
            lo_v = float(lo) if lo else float("-inf")
            hi_v = float(hi) if hi else float("inf")
            picked.update(c for c in all_chapters if lo_v <= chapter_sort_key(c)[0] <= hi_v)
        elif part in all_chapters:
            picked.add(part)
        else:
            sys.exit(f"unknown chapter: {part}")
    return [c for c in all_chapters if c in picked]


def load_chunks(chapter: str, max_chars: int) -> list[str]:
    raw = (CHAPTERS_DIR / f"{chapter}.txt").read_text(encoding="utf-8")
    return chunk_text(clean_chapter(raw), max_chars=max_chars)


# --------------------------------------------------------------------------- voice

class Voice:
    def __init__(self, instruction: str | None, ref_audio: Path | None, ref_text: str | None,
                 cfg_scale: float | None, seed: int):
        if (ref_audio is None) != (not ref_text):
            sys.exit("--ref-audio and --ref-text must be given together")
        if ref_audio is not None and not ref_audio.is_file():
            sys.exit(f"reference audio not found: {ref_audio}")
        self.instruction = (instruction or "").strip() or None
        self.ref_audio = ref_audio
        self.ref_text = ref_text.strip() if ref_text else None
        # Breeze recommends cfg 4 when following an instruction, 1 for plain cloning.
        self.cfg_scale = cfg_scale if cfg_scale is not None else (4.0 if self.instruction else 1.0)
        self.seed = seed

    @classmethod
    def from_args(cls, args: argparse.Namespace) -> "Voice":
        instruction, ref_audio, ref_text = args.instruction, args.ref_audio, args.ref_text
        cfg_scale, seed = args.cfg_scale, args.seed
        if args.voice:
            vdir = Path(args.voice)
            meta = json.loads((vdir / "voice.json").read_text(encoding="utf-8"))
            if ref_audio is None and (vdir / "ref.wav").is_file():
                # A voice saved by `test`: clone the clip it produced so every chunk
                # gets the same speaker. The design instruction is dropped unless
                # explicitly re-supplied (that would switch to "voice direction").
                ref_audio = vdir / "ref.wav"
                ref_text = (vdir / "ref.txt").read_text(encoding="utf-8")
            if cfg_scale is None and instruction:
                cfg_scale = meta.get("cfg_scale")
            if seed is None:
                seed = meta.get("seed")
        if ref_text is None and args.ref_text_file:
            ref_text = Path(args.ref_text_file).read_text(encoding="utf-8")
        if instruction is None and ref_audio is None:
            instruction = DEFAULT_INSTRUCTION
        return cls(instruction, Path(ref_audio) if ref_audio else None, ref_text,
                   cfg_scale, 42 if seed is None else seed)

    @property
    def mode(self) -> str:
        if self.ref_audio:
            return "voice direction" if self.instruction else "voice clone"
        return "voice design" if self.instruction else "plain"

    def fingerprint(self) -> str:
        h = hashlib.sha256()
        h.update(json.dumps([self.instruction, self.ref_text, self.cfg_scale, self.seed]).encode())
        if self.ref_audio:
            h.update(self.ref_audio.read_bytes())
        return h.hexdigest()[:16]

    def to_json(self) -> dict:
        return {"mode": self.mode, "instruction": self.instruction,
                "ref_audio": str(self.ref_audio) if self.ref_audio else None,
                "ref_text": self.ref_text, "cfg_scale": self.cfg_scale, "seed": self.seed}


# --------------------------------------------------------------------------- engine

class BreezeEngine:
    """Loads Breeze TTS 2 once and synthesizes many chunks (same steps as infer.py)."""

    def __init__(self, repo: Path, model_dir: Path, fast: str):
        if not (repo / "breeze_infer").is_dir():
            sys.exit(f"breeze-tts repo not found at {repo} (run setup.sh)")
        if not (model_dir / "audio_tokenizer").is_dir():
            sys.exit(f"Breeze TTS 2 weights not found at {model_dir} (run setup.sh)")
        sys.path.insert(0, str(repo))

        import numpy as np
        from breeze_infer.runtime import (
            load_runtime, resolve_device, set_all_seeds, update_generation_config_for_breeze,
        )
        from breeze_infer.templates import get_template, prepare_inputs, select_template_name
        from models.fast_streaming import FastBreezeStreamingRuntime, FastStreamingConfig
        from models.warmup_profile import load_warmup_profile

        self.np = np
        self._set_all_seeds = set_all_seeds
        self._get_template = get_template
        self._prepare_inputs = prepare_inputs
        self._select_template_name = select_template_name

        t0 = time.time()
        self.tokenizer, self.model, self.audio_tokenizer = load_runtime(
            model_dir, device=resolve_device(), attn_implementation="eager"
        )
        update_generation_config_for_breeze(self.model)
        # "graphs": CUDA-graph stages only, no torch.compile -> no Triton needed (Windows-safe).
        # "all": also compiles the depth decoder and codec, which needs Triton.
        graphs = fast == "graphs"
        config = FastStreamingConfig(
            max_new_tokens=MAX_NEW_TOKENS,
            max_seq_len=MAX_SEQ_LEN,
            fast_all=True if fast == "all" else None,
            fast_text_encoder=graphs,
            fast_backbone_prefill=graphs,
            fast_backbone_decode=graphs,
            repetition_penalty=REPETITION_PENALTY,
        )
        self.runtime = FastBreezeStreamingRuntime(
            self.model, self.audio_tokenizer, config, tokenizer=self.tokenizer
        )
        if self.runtime.fast_enabled:
            profile = load_warmup_profile(repo / "configs" / "fast.json")
            # Breeze's profile only pre-captures prompt lengths up to 256 tokens for cfg 1,
            # but cloning from a ~30 s reference clip gives ~450+. Unfrozen, missing
            # lengths are captured on first use (32-token buckets) instead of erroring.
            profile = replace(profile, codec_chunk_frames=self.runtime.codec_chunk_frames,
                              freeze_after_warmup=False)
            manifest = self.runtime.warmup_from_profile(profile)
            log(f"fast warmup: {manifest['total_elapsed_ms']:.0f} ms")
        self.sample_rate = self.runtime.sample_rate
        log(f"model loaded in {time.time() - t0:.0f}s (sample rate {self.sample_rate} Hz)")

    def synthesize(self, text: str, voice: Voice, seed: int):
        """Return (float32 mono audio, codec frame count)."""
        request = {"id": "chunk", "text": text.replace("\n", " "), "speaker": "S0"}
        if voice.instruction:
            request["instruction"] = voice.instruction
        if voice.ref_audio:
            request["ref_audio_path"] = str(voice.ref_audio)
            request["ref_text"] = voice.ref_text
        template = self._get_template(self._select_template_name(request))

        self._set_all_seeds(seed)
        inputs = self._prepare_inputs(
            self.tokenizer, self.audio_tokenizer, self.model, [request], template,
            guidance_scale=voice.cfg_scale, guidance_scale_ref=None, guidance_scale_ins=None,
        )
        parts, frames = [], 0
        for chunk in self.runtime.iter_audio_chunks(inputs, request_id="chunk", seed=seed):
            parts.append(self.np.asarray(chunk.audio, dtype=self.np.float32).reshape(-1))
            frames += chunk.codec_frames
        audio = self.np.concatenate(parts) if parts else self.np.zeros(0, self.np.float32)
        return audio, frames

    def synthesize_checked(self, text: str, voice: Voice):
        """Synthesize, retrying with another seed if the length looks like a failure
        (runaway generation / truncated output). Returns the most plausible take."""
        expected = len(text) / CHARS_PER_SEC
        best = None
        for attempt in range(MAX_ATTEMPTS):
            seed = voice.seed + attempt * 1000
            audio, frames = self.synthesize(text, voice, seed)
            dur = len(audio) / self.sample_rate
            ok = (frames < MAX_NEW_TOKENS - 1
                  and expected * 0.4 <= dur <= expected * 2.2 + 5)
            score = abs(dur - expected) / max(expected, 1) + (0 if ok else 10)
            if best is None or score < best[0]:
                best = (score, audio, dur)
            if ok:
                break
            log(f"    suspicious length {dur:.1f}s (expected ~{expected:.0f}s), "
                f"retry {attempt + 1}/{MAX_ATTEMPTS - 1}" if attempt < MAX_ATTEMPTS - 1
                else f"    still suspicious after {MAX_ATTEMPTS} tries; keeping closest take")
        return best[1], best[2]


# --------------------------------------------------------------------------- kokoro

# Kokoro-82M voices: a/b = American/British, f/m = female/male.
KOKORO_VOICES = [
    "af_heart", "af_bella", "af_nicole", "af_aoede", "af_kore", "af_sarah", "af_nova",
    "af_sky", "af_alloy", "af_jessica", "af_river",
    "am_fenrir", "am_michael", "am_puck", "am_echo", "am_eric", "am_liam", "am_onyx", "am_adam",
    "bf_emma", "bf_isabella", "bf_alice", "bf_lily",
    "bm_george", "bm_fable", "bm_lewis", "bm_daniel",
]


class KokoroVoice:
    """A Kokoro voice name, or a blend like "af_heart+af_bella" (averaged), plus speed."""

    def __init__(self, name: str, speed: float, pinyin: bool = True):
        for part in name.split("+"):
            if part not in KOKORO_VOICES:
                sys.exit(f"unknown Kokoro voice {part!r}; choose from: {', '.join(KOKORO_VOICES)}")
        self.name = name
        self.speed = speed
        self.pinyin = pinyin
        self.mode = "kokoro"

    @property
    def lang_code(self) -> str:
        return self.name[0]  # 'a' American / 'b' British English

    def fingerprint(self) -> str:
        # KOKORO_RENDER_VERSION: bump when pronunciation/pause handling changes,
        # so already-rendered chunks are regenerated.
        key = ["kokoro", self.name, self.speed, self.pinyin, KOKORO_RENDER_VERSION]
        return hashlib.sha256(json.dumps(key).encode()).hexdigest()[:16]

    def to_json(self) -> dict:
        return {"engine": "kokoro", "voice": self.name, "speed": self.speed, "pinyin": self.pinyin}


KOKORO_RENDER_VERSION = 2  # 2: pinyin name lexicon + paragraph/title pauses
PARAGRAPH_PAUSE = 0.35     # seconds of silence between paragraphs
TITLE_PAUSE = 0.9          # after "Chapter N: Title."


class KokoroEngine:
    """Kokoro-82M via the `kokoro` package; one pipeline per accent, loaded on demand."""

    sample_rate = 24000

    def __init__(self):
        import numpy as np
        import torch
        from kokoro import KModel, KPipeline

        self.np = np
        self._KPipeline = KPipeline
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        t0 = time.time()
        self.model = KModel(repo_id="hexgrad/Kokoro-82M").to(self.device).eval()  # shared by all pipelines
        self.pipelines: dict[tuple[str, bool], object] = {}
        self._names: dict[str, str] | None = None
        log(f"kokoro loaded on {self.device} in {time.time() - t0:.0f}s")

    def _pipeline(self, voice: KokoroVoice):
        key = (voice.lang_code, voice.pinyin)
        if key not in self.pipelines:
            pipeline = self._KPipeline(lang_code=voice.lang_code, model=self.model,
                                       repo_id="hexgrad/Kokoro-82M")
            if voice.pinyin:
                lexicon = pipeline.g2p.lexicon
                lexicon.golds.update(self._pinyin_names(lexicon))
            self.pipelines[key] = pipeline
        return self.pipelines[key]

    def _pinyin_names(self, lexicon) -> dict[str, str]:
        """Phonemes for every Chinese name in the book (scanned once per process)."""
        if self._names is None:
            from pinyin import find_names
            t0 = time.time()
            texts = (clean_chapter((CHAPTERS_DIR / f"{c}.txt").read_text(encoding="utf-8"))
                     for c in list_chapters())
            known = lambda w: any(k in d for d in (lexicon.golds, lexicon.silvers)
                                  for k in (w, w.lower()))
            self._names = find_names(texts, known)
            log(f"pinyin lexicon: {len(self._names)} names ({time.time() - t0:.0f}s)")
        return self._names

    def _speak(self, pipeline, text: str, voice: KokoroVoice):
        parts = [
            result.audio.detach().cpu().numpy().reshape(-1)
            for result in pipeline(text, voice=voice.name.replace("+", ","), speed=voice.speed,
                                   split_pattern=None)
            if result.audio is not None
        ]
        return self.np.concatenate(parts) if parts else self.np.zeros(0, self.np.float32)

    def synthesize_checked(self, text: str, voice: KokoroVoice):
        pipeline = self._pipeline(voice)
        pieces = []
        paragraphs = [p for p in text.split("\n") if p.strip()]
        for k, paragraph in enumerate(paragraphs):
            pieces.append(self._speak(pipeline, paragraph, voice))
            if k < len(paragraphs) - 1:
                pause = TITLE_PAUSE if re.match(r"Chapter [\d.]+\b", paragraph) else PARAGRAPH_PAUSE
                pieces.append(self.np.zeros(int(pause * self.sample_rate), self.np.float32))
        audio = self.np.concatenate(pieces) if pieces else self.np.zeros(0, self.np.float32)
        return audio, len(audio) / self.sample_rate


# --------------------------------------------------------------------------- chatterbox

CHATTERBOX_RENDER_VERSION = 1
CHATTERBOX_PARA_MAX = 350   # longer paragraphs are read in sentence groups; Chatterbox
                            # tends to skip words on long inputs
CHATTERBOX_CHARS_PER_SEC = 16.0


class ChatterboxVoice:
    """Chatterbox's built-in voice ("default") or a clone of a reference clip."""

    def __init__(self, ref: str, exaggeration: float, cfg_weight: float, seed: int,
                 strip_quotes: bool = False):
        self.ref = None if ref in (None, "", "default") else Path(ref)
        # Chatterbox "acts" quoted speech (voice shifts); without quote marks it narrates.
        self.strip_quotes = strip_quotes
        if self.ref is not None and not self.ref.is_file():
            sys.exit(f"reference audio not found: {self.ref}")
        self.exaggeration = exaggeration
        self.cfg_weight = cfg_weight
        self.seed = seed
        self.mode = "chatterbox " + ("clone" if self.ref else "default voice")

    def fingerprint(self) -> str:
        h = hashlib.sha256(json.dumps(["chatterbox", self.exaggeration, self.cfg_weight, self.seed,
                                       self.strip_quotes, CHATTERBOX_RENDER_VERSION]).encode())
        if self.ref:
            h.update(self.ref.read_bytes())
        return h.hexdigest()[:16]

    def to_json(self) -> dict:
        return {"engine": "chatterbox", "ref": str(self.ref) if self.ref else "default",
                "exaggeration": self.exaggeration, "cfg_weight": self.cfg_weight, "seed": self.seed,
                "strip_quotes": self.strip_quotes}


class ChatterboxEngine:
    """Chatterbox (English) via the `chatterbox-tts` package."""

    def __init__(self):
        import numpy as np
        import torch
        from chatterbox.tts import ChatterboxTTS

        self.np, self.torch = np, torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        t0 = time.time()
        self.model = ChatterboxTTS.from_pretrained(device=device)
        self.sample_rate = self.model.sr
        self._default_conds = self.model.conds
        self._conds_for = None
        log(f"chatterbox loaded on {device} in {time.time() - t0:.0f}s")

    def _use_voice(self, voice: ChatterboxVoice) -> None:
        key = (str(voice.ref), voice.exaggeration)
        if key == self._conds_for:
            return
        if voice.ref:
            self.model.prepare_conditionals(str(voice.ref), exaggeration=voice.exaggeration)
        else:
            self.model.conds = self._default_conds
        self._conds_for = key

    def _pieces(self, paragraph: str) -> list[str]:
        if len(paragraph) <= CHATTERBOX_PARA_MAX:
            return [paragraph]
        from text_prep import merge_quotes, split_sentences
        out, cur = [], ""
        for s in merge_quotes(split_sentences(paragraph)):
            if cur and len(cur) + 1 + len(s) > CHATTERBOX_PARA_MAX:
                out.append(cur)
                cur = s
            else:
                cur = f"{cur} {s}" if cur else s
        return out + ([cur] if cur else [])

    def _speak(self, text: str, voice: ChatterboxVoice):
        """One piece of text, retried with other seeds if the length looks wrong."""
        expected = len(text) / CHATTERBOX_CHARS_PER_SEC
        best = None
        for attempt in range(MAX_ATTEMPTS):
            self.torch.manual_seed(voice.seed + attempt * 1000)
            wav = self.model.generate(text, exaggeration=voice.exaggeration,
                                      cfg_weight=voice.cfg_weight)
            audio = wav.squeeze(0).detach().cpu().numpy().astype(self.np.float32)
            dur = len(audio) / self.sample_rate
            ok = expected * 0.55 <= dur <= expected * 2.0 + 3
            score = abs(dur - expected) / max(expected, 1) + (0 if ok else 10)
            if best is None or score < best[0]:
                best = (score, audio)
            if ok:
                break
            log(f"    suspicious length {dur:.1f}s for {len(text)} chars, retrying")
        return best[1]

    def synthesize_checked(self, text: str, voice: ChatterboxVoice):
        self._use_voice(voice)
        if voice.strip_quotes:
            text = re.sub(r"[“”\"]", "", text)
        pieces = []
        paragraphs = [p for p in text.split("\n") if p.strip()]
        for k, paragraph in enumerate(paragraphs):
            for piece in self._pieces(paragraph):
                pieces.append(self._speak(piece, voice))
            if k < len(paragraphs) - 1:
                pause = TITLE_PAUSE if re.match(r"Chapter [\d.]+\b", paragraph) else PARAGRAPH_PAUSE
                pieces.append(self.np.zeros(int(pause * self.sample_rate), self.np.float32))
        audio = self.np.concatenate(pieces) if pieces else self.np.zeros(0, self.np.float32)
        return audio, len(audio) / self.sample_rate


def make_engine(args: argparse.Namespace):
    if args.engine == "kokoro":
        return KokoroEngine()
    if args.engine == "chatterbox":
        return ChatterboxEngine()
    return BreezeEngine(Path(args.breeze_repo), Path(args.model), args.fast)


def make_voice(args: argparse.Namespace):
    if args.engine == "kokoro":
        return KokoroVoice(args.voice or "af_heart", args.speed, not args.no_pinyin)
    if args.engine == "chatterbox":
        return ChatterboxVoice(args.voice or "default", args.exaggeration, args.cfg_weight,
                               42 if args.seed is None else args.seed, args.strip_quotes)
    return Voice.from_args(args)


# --------------------------------------------------------------------------- audio io

AUDIO_EXT = ".mp3"  # set by --format; ".webm" = Opus 24 kbps (what the site serves)
OPUS_KBPS = 24


def write_audio(path: Path, audio, sample_rate: int, np) -> None:
    tmp = path.with_name(path.stem + ".tmp" + path.suffix)
    if path.suffix == ".webm":
        # Opus straight from the TTS output (no MP3 step, so no double encoding).
        pcm = np.clip(audio, -1.0, 1.0).astype("<f4").tobytes()
        subprocess.run(
            ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
             "-f", "f32le", "-ar", str(sample_rate), "-ac", "1", "-i", "pipe:0",
             "-c:a", "libopus", "-b:a", f"{OPUS_KBPS}k", "-application", "audio", str(tmp)],
            input=pcm, check=True,
        )
    else:
        # libsndfile (bundled with the soundfile wheel) encodes MP3 itself; no ffmpeg needed.
        import soundfile as sf
        sf.write(str(tmp), np.clip(audio, -1.0, 1.0), sample_rate,
                 format="MP3", subtype="MPEG_LAYER_III")
    os.replace(tmp, path)


def write_wav(path: Path, audio, sample_rate: int) -> None:
    import soundfile as sf
    sf.write(str(path), audio, sample_rate, subtype="PCM_16")


def write_metadata(folder: Path, chapter: str, durations: list[float]) -> None:
    meta = {
        "folder": chapter,
        "audio_files": [
            {"file": f"{chapter}_{i}{AUDIO_EXT}", "duration": round(d, 2)}
            for i, d in enumerate(durations, start=1)
        ],
        "total_files": len(durations),
        "total_duration": round(sum(durations), 2),
    }
    (folder / "audio_metadata.json").write_text(json.dumps(meta, indent=4), encoding="utf-8")


# --------------------------------------------------------------------------- modes

def run_test(args: argparse.Namespace) -> None:
    chapters = list_chapters()
    chapter = args.chapters or chapters[0]
    if chapter not in chapters:
        sys.exit(f"unknown chapter: {chapter}")
    text = load_chunks(chapter, args.max_chars)[args.chunk - 1]

    # (label, voice) pairs; --preset renders several voices with one model load.
    if args.engine == "kokoro":
        names = []
        for pattern in (args.preset or args.voice or "af_heart").split(","):
            # a name, a wildcard like "af_*", "all", or a blend like "af_heart+af_bella"
            hits = (KOKORO_VOICES if pattern == "all" else
                    [pattern] if "+" in pattern else fnmatch.filter(KOKORO_VOICES, pattern))
            if not hits:
                sys.exit(f"unknown Kokoro voice {pattern!r}; choose from: {', '.join(KOKORO_VOICES)}")
            names += [h for h in hits if h not in names]
        suffix = "" if args.speed == 1.0 else f"_x{args.speed:g}"
        if args.no_pinyin:
            suffix += "_nopinyin"
        runs = [(f"kokoro/{n}{suffix}", KokoroVoice(n, args.speed, not args.no_pinyin))
                for n in names]
    elif args.engine == "chatterbox":
        voice = make_voice(args)
        label = args.label or ("default" if voice.ref is None else voice.ref.stem)
        suffix = "_noquotes" if voice.strip_quotes else ""
        runs = [(f"chatterbox/{label}_e{voice.exaggeration:g}{suffix}", voice)]
    elif args.preset:
        names = []
        for pattern in args.preset.split(","):  # names or wildcards, e.g. "f_velvet*"
            hits = list(PRESETS) if pattern == "all" else fnmatch.filter(PRESETS, pattern)
            if not hits:
                sys.exit(f"unknown preset {pattern!r}; choose from: all, {', '.join(PRESETS)}")
            names += [h for h in hits if h not in names]
        if args.seeds:
            seeds = [int(s) for s in args.seeds.split(",")]
        else:
            seeds = [42 if args.seed is None else args.seed]
        runs = [(name if s == 42 else f"{name}_s{s}",
                 Voice(PRESETS[name], None, None, args.cfg_scale, s))
                for name in names for s in seeds]
    else:
        label = args.label or datetime.now().strftime("%Y%m%d-%H%M%S")
        runs = [(label, Voice.from_args(args))]

    log(f"test: chapter {chapter} chunk 1 ({len(text)} chars), {len(runs)} voice(s)")
    log(f"text: {text}")
    if args.dry_run:
        return

    engine = make_engine(args)
    for label, voice in runs:
        out = Path(args.out or DEFAULT_TEST_OUT) / label
        out.mkdir(parents=True, exist_ok=True)
        t0 = time.time()
        audio, dur = engine.synthesize_checked(text, voice)
        elapsed = time.time() - t0

        write_audio(out / f"{chapter}_{args.chunk}{AUDIO_EXT}", audio, engine.sample_rate, engine.np)
        if args.engine == "breeze":
            # Save as a reusable voice: `full --voice test_output/<label>` clones this clip.
            write_wav(out / "ref.wav", audio, engine.sample_rate)
            (out / "ref.txt").write_text(text, encoding="utf-8")
        (out / "voice.json").write_text(json.dumps(voice.to_json(), indent=4), encoding="utf-8")
        log(f"{label}: {dur:.1f}s audio in {elapsed:.1f}s ({dur / max(elapsed, 1e-6):.1f}x realtime) "
            f"-> {out / f'{chapter}_{args.chunk}{AUDIO_EXT}'}")
    if args.engine == "kokoro":
        log("use one for the book: python tts_book.py full --voice <name>")
    elif args.engine == "chatterbox":
        log("use it for the book: python tts_book.py full --engine chatterbox --voice <same>")
    else:
        log("use one for the book: python tts_book.py full --engine breeze --voice test_output/<label>")


def run_full(args: argparse.Namespace) -> None:
    chapters = select_chapters(list_chapters(), args.chapters)
    if args.workers != "1" and not args.dry_run:
        run_pool(args, chapters)
        return

    out_root = Path(args.out or DEFAULT_OUT)
    if args.dry_run:
        preview = ROOT / "chunk_preview"
        preview.mkdir(exist_ok=True)
        n = 0
        for ch in chapters:
            chunks = load_chunks(ch, args.max_chars)
            n += len(chunks)
            (preview / f"{ch}.txt").write_text(
                "\n\n".join(f"[{i}] {c}" for i, c in enumerate(chunks, 1)), encoding="utf-8")
        hours = sum(len(c) for ch in chapters for c in load_chunks(ch, args.max_chars)) / CHARS_PER_SEC / 3600
        log(f"{len(chapters)} chapters, {n} chunks, ~{hours:.0f} h of audio; "
            f"chunk texts written to {preview}")
        return

    voice = make_voice(args)
    out_root.mkdir(parents=True, exist_ok=True)
    for f in (STASH_ROOT_FILES.iterdir() if STASH_ROOT_FILES.is_dir() else []):
        if not (out_root / f.name).exists():
            shutil.copy2(f, out_root / f.name)
    STATE_DIR.mkdir(exist_ok=True)

    engine = make_engine(args)
    log(f"{len(chapters)} chapters, {voice.mode}, out={out_root}")
    t_start, audio_total = time.time(), 0.0
    for n, ch in enumerate(chapters, 1):
        audio_total += tts_chapter(engine, voice, ch, out_root, args.max_chars,
                                   f"[{n}/{len(chapters)}]")
        elapsed = time.time() - t_start
        if audio_total:
            log(f"  cumulative: {audio_total / 3600:.2f} h audio in {elapsed / 3600:.2f} h "
                f"({audio_total / elapsed:.2f}x realtime this worker)")


CHUNK_HOOK = None  # --serve mode: called with the seconds of audio after every chunk


def text_key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def chapter_progress(chapter: str, vfp: str, out_root: Path, max_chars: int) -> tuple[int, int]:
    """(chunks in chapter, chunks already rendered with this voice) - mirrors tts_chapter."""
    chunks = load_chunks(chapter, max_chars)
    state_path = STATE_DIR / f"{chapter}.json"
    if not state_path.is_file():
        return len(chunks), 0
    state = json.loads(state_path.read_text(encoding="utf-8"))
    if state.get("voice") != vfp:
        return len(chunks), 0
    done = state.get("chunks", {})
    have = 0
    for i, text in enumerate(chunks, 1):
        entry = done.get(str(i))
        if (entry and entry["text"] == text_key(text)
                and (out_root / chapter / f"{chapter}_{i}{AUDIO_EXT}").is_file()):
            have += 1
    return len(chunks), have


def tts_chapter(engine: BreezeEngine, voice: Voice, chapter: str, out_root: Path,
                max_chars: int, tag: str) -> float:
    """TTS one chapter, skipping chunks already done with identical text+voice.
    Returns seconds of newly generated audio."""
    chunks = load_chunks(chapter, max_chars)
    folder = out_root / chapter
    folder.mkdir(parents=True, exist_ok=True)
    state_path = STATE_DIR / f"{chapter}.json"
    vfp = voice.fingerprint()

    state = {}
    if state_path.is_file():
        state = json.loads(state_path.read_text(encoding="utf-8"))
    done = state.get("chunks", {}) if state.get("voice") == vfp else {}

    key = text_key

    durations: list[float | None] = []
    for i, text in enumerate(chunks, start=1):
        entry = done.get(str(i))
        if entry and entry["text"] == key(text) and (folder / f"{chapter}_{i}{AUDIO_EXT}").is_file():
            durations.append(entry["duration"])
        else:
            durations.append(None)

    # Drop leftovers if the chapter now has fewer chunks than a previous run.
    for p in folder.glob(f"{chapter}_*{AUDIO_EXT}"):
        suffix = p.stem[len(chapter) + 1:]
        if suffix.isdigit() and int(suffix) > len(chunks):
            p.unlink()
    # Half-written files from a run killed mid-write.
    for p in folder.glob(f"*.tmp{AUDIO_EXT}"):
        p.unlink()

    todo = [i for i, d in enumerate(durations, start=1) if d is None]
    if not todo:
        write_metadata(folder, chapter, durations)  # type: ignore[arg-type]
        log(f"{tag} chapter {chapter}: already done ({len(chunks)} chunks)")
        return 0.0

    log(f"{tag} chapter {chapter}: {len(todo)}/{len(chunks)} chunks to generate")
    progress = folder / "progress.txt"
    progress.write_text("".join(f"{i}\n" for i, d in enumerate(durations, 1) if d is not None),
                        encoding="utf-8")
    new_audio = 0.0
    new_state = {"voice": vfp, "chunks": {str(i): {"text": key(chunks[i - 1]), "duration": d}
                                          for i, d in enumerate(durations, 1) if d is not None}}
    for i in todo:
        text = chunks[i - 1]
        t0 = time.time()
        audio, dur = engine.synthesize_checked(text, voice)
        write_audio(folder / f"{chapter}_{i}{AUDIO_EXT}", audio, engine.sample_rate, engine.np)
        durations[i - 1] = dur
        new_audio += dur
        new_state["chunks"][str(i)] = {"text": key(text), "duration": dur}
        state_path.write_text(json.dumps(new_state), encoding="utf-8")
        with progress.open("a", encoding="utf-8") as fh:
            fh.write(f"{i}\n")
        took = time.time() - t0
        log(f"  {chapter}_{i}{AUDIO_EXT}  {dur:5.1f}s audio  {took:5.1f}s  ({dur / took:.2f}x realtime)")
        if CHUNK_HOOK:
            CHUNK_HOOK(dur)

    write_metadata(folder, chapter, durations)  # type: ignore[arg-type]
    return new_audio


def run_status(args: argparse.Namespace) -> None:
    """Overall progress, plus combined speed of all workers over the last 10 minutes."""
    out_root = Path(args.out or DEFAULT_OUT)
    window, now = 600, time.time()
    total = done = 0
    done_audio = recent_audio = 0.0
    chapters_done = 0
    oldest_recent = now
    for ch in list_chapters():
        n = len(load_chunks(ch, args.max_chars))
        total += n
        state_path = STATE_DIR / f"{ch}.json"
        if not state_path.is_file():
            continue
        chunks = json.loads(state_path.read_text(encoding="utf-8")).get("chunks", {})
        have = 0
        for i, entry in chunks.items():
            mp3 = out_root / ch / f"{ch}_{i}{AUDIO_EXT}"
            if mp3.is_file():
                have += 1
                done_audio += entry["duration"]
                mtime = mp3.stat().st_mtime
                if now - mtime < window:
                    recent_audio += entry["duration"]
                    oldest_recent = min(oldest_recent, mtime)
        done += have
        chapters_done += have >= n
    # Divide by the span actually covered, so a run younger than 10 min isn't underrated.
    speed = recent_audio / max(now - oldest_recent, 30)
    log(f"chunks: {done}/{total} ({100 * done / max(total, 1):.1f}%), "
        f"chapters complete: {chapters_done}, audio so far: {done_audio / 3600:.1f} h")
    if speed:
        remaining = (total - done) * (done_audio / max(done, 1)) / speed
        log(f"combined speed (last 10 min): {speed:.2f}x realtime, "
            f"ETA ~{remaining / 3600:.0f} h of running")
    else:
        log("no chunks finished in the last 10 minutes")


def run_serve(args: argparse.Namespace) -> None:
    """Worker process for run_pool: reads chapter names on stdin, renders them, and reports
    @@ready / @@chunk <sec> / @@done <chapter> on stdout. Logs go to stderr."""
    global LOG_STREAM, CHUNK_HOOK
    LOG_STREAM = sys.stderr
    out_root = Path(args.out or DEFAULT_OUT)
    STATE_DIR.mkdir(exist_ok=True)
    voice = make_voice(args)
    engine = make_engine(args)
    if args.engine == "kokoro":  # build the pinyin lexicon now, not during the first chapter
        engine._pipeline(voice)
    CHUNK_HOOK = lambda dur: print(f"@@chunk {dur:.3f}", flush=True)
    print("@@ready", flush=True)
    for line in sys.stdin:
        chapter = line.strip()
        if not chapter or chapter == "QUIT":
            break
        tts_chapter(engine, voice, chapter, out_root, args.max_chars, f"[{chapter}]")
        print(f"@@done {chapter}", flush=True)


class WorkerTuner:
    """Hill-climbs the worker count: start, +2 while it gets faster, then the neighbours
    (+1 / -1) of the best, then settle. E.g. 4 -> 6 (faster) -> 8 (slower) -> 7 -> settle."""

    SETTLE = 20    # seconds to ignore after the pool has reached the new size
    WINDOW = 60    # seconds of measurement per worker count
    MARGIN = 1.03  # must be >3% faster to count as better (measurement noise)

    def __init__(self, start: int, max_workers: int):
        self.n = start
        self.max = max_workers
        self.results: dict[int, float] = {}
        self.stable_since: float | None = None
        self.done = False

    def best(self) -> int:
        # Prefer fewer workers unless more are clearly faster.
        best = min(self.results)
        for n in sorted(self.results):
            if self.results[n] > self.results[best] * self.MARGIN:
                best = n
        return best

    def next_count(self) -> int | None:
        r, b = self.results, self.best()
        if b + 2 <= self.max and b + 2 not in r and b + 1 not in r:
            return b + 2
        if b + 1 <= self.max and b + 1 not in r:
            return b + 1
        if b - 1 >= 1 and b - 1 not in r and b - 2 not in r:
            return b - 1
        return None

    def tick(self, now: float, stable: bool, samples) -> str | None:
        """Called every loop; returns a message when the target count changes."""
        if self.done:
            return None
        if not stable:
            self.stable_since = None
            return None
        if self.stable_since is None:
            self.stable_since = now
            return None
        t0 = self.stable_since + self.SETTLE
        if now < t0 + self.WINDOW:
            return None
        speed = sum(d for t, d in samples if t >= t0) / (now - t0)
        return self.record(speed)

    def record(self, speed: float) -> str:
        self.results[self.n] = speed
        measured = f"{self.n} workers: {speed:.0f}x"
        nxt = self.next_count()
        if nxt is None:
            self.n = self.best()
            self.done = True
            return f"tuning: {measured} -> settled on {self.n} workers ({self.results[self.n]:.0f}x)"
        self.n = nxt
        self.stable_since = None
        return f"tuning: {measured} -> trying {nxt}"

    def failed(self) -> str:
        """A worker crashed at this size (e.g. out of GPU memory): treat as a bad size."""
        return self.record(0.0)


def run_pool(args: argparse.Namespace, chapters: list[str]) -> None:
    """Render chapters with several model processes on the GPU, handing out one chapter at
    a time. --workers auto tunes the count while running; --workers N keeps it fixed."""
    import queue
    import threading
    from collections import deque

    auto = args.workers == "auto"
    target = args.start_workers if auto else int(args.workers)
    tuner = WorkerTuner(target, args.max_workers) if auto else None

    out_root = Path(args.out or DEFAULT_OUT)
    out_root.mkdir(parents=True, exist_ok=True)
    for f in (STASH_ROOT_FILES.iterdir() if STASH_ROOT_FILES.is_dir() else []):
        if not (out_root / f.name).exists():
            shutil.copy2(f, out_root / f.name)
    STATE_DIR.mkdir(exist_ok=True)

    log("checking what's already done...")
    vfp = make_voice(args).fingerprint()
    pending: deque[str] = deque()
    remaining_chunks = 0
    for ch in chapters:
        total, have = chapter_progress(ch, vfp, out_root, args.max_chars)
        if have < total:
            pending.append(ch)
            remaining_chunks += total - have
    chapters_total, chapters_left = len(chapters), len(pending)
    log(f"{chapters_total - chapters_left}/{chapters_total} chapters already done, "
        f"{remaining_chunks} chunks to go")
    if not pending:
        return

    argv, skip = [], False
    for a in sys.argv[1:]:
        if skip:
            skip = False
        elif a in ("--workers", "--start-workers", "--max-workers"):
            skip = True
        elif not a.startswith(("--workers=", "--start-workers=", "--max-workers=")):
            argv.append(a)
    cmd = [sys.executable, "-u", str(Path(__file__).resolve())] + argv + ["--serve"]

    events: queue.Queue = queue.Queue()
    workers: dict[int, dict] = {}
    next_id = 0

    def reader(wid: int, proc) -> None:
        for line in proc.stdout:
            if line.startswith("@@"):
                kind, _, arg = line[2:].strip().partition(" ")
                events.put((wid, kind, arg, time.time()))
        events.put((wid, "exit", proc.wait(), time.time()))

    def spawn() -> None:
        nonlocal next_id
        wid, next_id = next_id, next_id + 1
        logf = (ROOT / f"worker{wid}.log").open("w", encoding="utf-8")
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=logf,
                                text=True, encoding="utf-8", errors="replace", bufsize=1)
        workers[wid] = {"proc": proc, "ready": False, "chapter": None, "quitting": False,
                        "log": logf}
        threading.Thread(target=reader, args=(wid, proc), daemon=True).start()

    def send(wid: int, line: str) -> None:
        try:
            workers[wid]["proc"].stdin.write(line + "\n")
            workers[wid]["proc"].stdin.flush()
        except OSError:
            pass  # already exiting; its exit event cleans up

    def assign(wid: int) -> None:
        w = workers[wid]
        if w["quitting"] or not pending:
            w["quitting"] = True
            send(wid, "QUIT")
        else:
            w["chapter"] = pending.popleft()
            send(wid, w["chapter"])

    def rescale() -> None:
        active = [wid for wid, w in workers.items() if not w["quitting"]]
        for _ in range(target - len(active)):
            if pending:
                spawn()
        # Retire the newest extra workers; busy ones stop after their current chapter.
        for wid in sorted(active, reverse=True)[:max(0, len(active) - target)]:
            workers[wid]["quitting"] = True
            if workers[wid]["ready"] and workers[wid]["chapter"] is None:
                send(wid, "QUIT")

    samples: deque = deque()  # (time, seconds of audio) per finished chunk
    chunk_durs: deque = deque(maxlen=500)
    t_start = last_report = time.time()
    crashes = 0
    rescale()
    log(f"{'auto-tuning, starting with' if auto else 'running'} {target} workers "
        f"(per-worker logs: worker*.log)")

    try:
        while workers:
            try:
                wid, kind, arg, t = events.get(timeout=1)
            except queue.Empty:
                wid = None
            if wid is not None and wid in workers:
                w = workers[wid]
                if kind == "ready":
                    w["ready"] = True
                    assign(wid)
                elif kind == "chunk":
                    samples.append((t, float(arg)))
                    chunk_durs.append(float(arg))
                    remaining_chunks = max(0, remaining_chunks - 1)
                elif kind == "done":
                    w["chapter"] = None
                    chapters_left -= 1
                    assign(wid)
                elif kind == "exit":
                    w["log"].close()
                    del workers[wid]
                    if arg != 0 or w["chapter"] is not None:
                        crashes += 1
                        log(f"worker {wid} exited with code {arg} - see worker{wid}.log")
                        if w["chapter"] is not None:
                            pending.appendleft(w["chapter"])
                        if crashes >= 10:
                            log("too many worker crashes, stopping")
                            break
                        if tuner and not tuner.done:
                            log(tuner.failed())
                            target = tuner.n
                        elif target > 1 and crashes % 3 == 0:
                            target -= 1
                            log(f"repeated crashes, reducing to {target} workers")
                    rescale()

            now = time.time()
            while samples and samples[0][0] < now - 600:
                samples.popleft()
            if tuner and not tuner.done:
                if len(pending) < target * 2:
                    tuner.done = True  # too little work left to measure anything
                else:
                    ready = [x for x in workers.values() if not x["quitting"] and x["ready"]]
                    stable = (len(ready) == target
                              and not any(x["quitting"] for x in workers.values()))
                    msg = tuner.tick(now, stable, samples)
                    if msg:
                        log(msg)
                        target = tuner.n
                        rescale()

            if now - last_report >= 15:
                last_report = now
                span = min(60.0, now - t_start)
                speed = sum(d for t, d in samples if t >= now - 60) / span if span > 0 else 0
                avg = sum(chunk_durs) / len(chunk_durs) if chunk_durs else 25.0
                eta = remaining_chunks * avg / speed if speed > 0 else None
                eta_s = (f"{int(eta // 3600)}h{int(eta % 3600 // 60):02d}m" if eta is not None
                         else "measuring")
                tuning = f" | tuning ({tuner.n})" if tuner and not tuner.done else ""
                active = sum(1 for x in workers.values() if not x["quitting"])
                log(f"{active} workers | {speed:.0f}x realtime | "
                    f"{chapters_total - chapters_left}/{chapters_total} chapters | "
                    f"ETA {eta_s}{tuning}")
    except KeyboardInterrupt:
        log("stopping workers... (run again to resume)")
    finally:
        for w in workers.values():
            if w["proc"].poll() is None:
                w["proc"].kill()
    log(f"finished: {chapters_total - chapters_left}/{chapters_total} chapters done")


# --------------------------------------------------------------------------- cli

LOG_STREAM = None  # None = stdout; worker processes log to stderr (stdout is the protocol)


def log(msg: str) -> None:
    print(f"{datetime.now():%H:%M:%S} {msg}", file=LOG_STREAM or sys.stdout, flush=True)


def main() -> None:
    global CHAPTERS_DIR, AUDIO_EXT
    # Windows consoles/redirected logs default to cp1252; chunk text has other characters.
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    ap =argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mode", choices=["test", "full", "status"],
                    help="test: first chunk of the first chapter; full: the whole book; "
                         "status: progress and combined speed")
    ap.add_argument("--chapters", help="full: e.g. '1-50,19.5,300-'; test: one chapter (default: first)")
    ap.add_argument("--engine", choices=["kokoro", "chatterbox", "breeze"], default="kokoro")
    ap.add_argument("--exaggeration", type=float, default=0.5,
                    help="chatterbox: emotion intensity (0.3 calmer, 0.5 default)")
    ap.add_argument("--cfg-weight", type=float, default=0.5, help="chatterbox: pacing/adherence")
    ap.add_argument("--strip-quotes", action="store_true",
                    help="chatterbox: remove quote marks so dialogue is narrated, not acted")
    ap.add_argument("--voice", help="kokoro: voice name or blend 'af_heart+af_bella'; "
                                    "chatterbox: 'default' or a reference clip to clone; "
                                    "breeze: folder saved by `test` to clone")
    ap.add_argument("--speed", type=float, default=1.0, help="kokoro: speaking speed")
    ap.add_argument("--no-pinyin", action="store_true",
                    help="kokoro: don't fix Chinese name pronunciation (for A/B comparison)")
    ap.add_argument("--chunk", type=int, default=1, help="test: which chunk of the chapter")
    ap.add_argument("--instruction", help="voice design / direction prompt")
    ap.add_argument("--ref-audio", type=Path, help="reference clip to clone")
    ap.add_argument("--ref-text", help="exact transcript of --ref-audio")
    ap.add_argument("--ref-text-file", help="file containing the transcript of --ref-audio")
    ap.add_argument("--cfg-scale", type=float, help="default 4 with an instruction, else 1")
    ap.add_argument("--seed", type=int, help="sampling seed (default 42)")
    ap.add_argument("--label", help="test: output subfolder name (default: timestamp)")
    ap.add_argument("--preset", help="test: 'all', or comma-separated names/wildcards from PRESETS")
    ap.add_argument("--seeds", help="test with --preset: several seeds, e.g. '42,7,13'")
    ap.add_argument("--max-chars", type=int, default=DEFAULT_MAX_CHARS, help="chunk size target")
    ap.add_argument("--out", help=f"output folder (default {DEFAULT_OUT.name}/ or {DEFAULT_TEST_OUT.name}/)")
    ap.add_argument("--fast", choices=["off", "graphs", "all"], default="off",
                    help="graphs: CUDA graphs, no Triton needed; all: Breeze --fast-all (needs Triton)")
    ap.add_argument("--workers", default="1",
                    help="full: parallel model processes on the GPU, or 'auto' to tune while running")
    ap.add_argument("--start-workers", type=int, default=4, help="full --workers auto: first count")
    ap.add_argument("--max-workers", type=int, default=16, help="full --workers auto: upper limit")
    ap.add_argument("--serve", action="store_true", help=argparse.SUPPRESS)
    ap.add_argument("--breeze-repo", default=str(ROOT / "breeze-tts"))
    ap.add_argument("--model", default=str(ROOT / "breeze-tts-2"))
    ap.add_argument("--dry-run", action="store_true", help="only chunk the text; no model")
    ap.add_argument("--format", choices=["mp3", "webm"], default="mp3",
                    help="mp3 (no ffmpeg needed) or webm = Opus 24 kbps like the site (needs ffmpeg)")
    ap.add_argument("--chapters-dir", help=f"folder with the chapter .txt files (default {CHAPTERS_DIR})")
    args = ap.parse_args()
    AUDIO_EXT = "." + args.format
    if args.format == "webm" and shutil.which("ffmpeg") is None and not args.dry_run:
        sys.exit("--format webm needs ffmpeg on PATH")
    if args.chapters_dir:
        CHAPTERS_DIR = Path(args.chapters_dir).resolve()

    if args.serve:
        run_serve(args)
        return
    if args.workers != "auto" and not args.workers.isdigit():
        sys.exit("--workers must be a number or 'auto'")
    {"test": run_test, "full": run_full, "status": run_status}[args.mode](args)


if __name__ == "__main__":
    main()
