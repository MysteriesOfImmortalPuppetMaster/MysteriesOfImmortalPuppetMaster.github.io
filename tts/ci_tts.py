"""Keep audioStash in sync with the chapter texts (used by the GitHub Action).

audioStash/tts_manifest.json records, per chapter, a hash of the chapter text its audio
was made from. Every run renders the chapters whose text is new or changed (newest
first), stops before its time budget runs out, and commits each chapter as it finishes,
pushing every few chapters. Whatever doesn't fit is left for the next run.

    python ci_tts.py --chapters-dir chapters --stash audioStash --plan     # just count
    python ci_tts.py --chapters-dir chapters --stash audioStash --budget-minutes 320
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import tts_book as tb

MANIFEST = "tts_manifest.json"


def text_hash(path: Path) -> str:
    """Hash of the chapter file, independent of BOM and line endings."""
    text = path.read_text(encoding="utf-8-sig").replace("\r\n", "\n")
    return hashlib.sha256(text.encode()).hexdigest()[:16]


def load_manifest(stash: Path) -> dict:
    path = stash / MANIFEST
    if path.is_file():
        return json.loads(path.read_text(encoding="utf-8"))
    return {"version": 1, "chapters": {}}


def save_manifest(stash: Path, manifest: dict) -> None:
    manifest["chapters"] = dict(sorted(manifest["chapters"].items(),
                                       key=lambda kv: tb.chapter_sort_key(kv[0])))
    (stash / MANIFEST).write_text(json.dumps(manifest, indent=1) + "\n", encoding="utf-8")


def git(stash: Path, *args: str, check: bool = True) -> int:
    return subprocess.run(["git", "-C", str(stash), *args], check=check).returncode


def push(stash: Path) -> None:
    for attempt in range(5):
        if git(stash, "push", "-q", check=False) == 0:
            return
        tb.log(f"push failed (attempt {attempt + 1}), rebasing and retrying")
        git(stash, "pull", "--rebase", "-q", check=False)
        time.sleep(10 * (attempt + 1))
    sys.exit("could not push to audioStash")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapters-dir", required=True)
    ap.add_argument("--stash", required=True, help="audioStash checkout to commit into")
    ap.add_argument("--budget-minutes", type=float, default=320,
                    help="stop starting new chapters so the job ends before this")
    ap.add_argument("--force", default="", help="also redo these chapters, e.g. '1045,1040-1050'")
    ap.add_argument("--push-every", type=int, default=3,
                    help="after the first chapter, push every this many chapters")
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--plan", action="store_true", help="only report how many chapters are due")
    ap.add_argument("--bootstrap", action="store_true",
                    help="write the manifest from --chapters-dir without rendering anything")
    args = ap.parse_args()

    start = time.time()
    tb.CHAPTERS_DIR = Path(args.chapters_dir).resolve()
    stash = Path(args.stash).resolve()
    chapters = tb.list_chapters()
    current = {c: text_hash(tb.CHAPTERS_DIR / f"{c}.txt") for c in chapters}
    manifest = load_manifest(stash)

    if args.bootstrap:
        manifest["chapters"] = current
        save_manifest(stash, manifest)
        tb.log(f"manifest written for {len(current)} chapters")
        return

    forced = tb.select_chapters(chapters, args.force) if args.force else []
    due = [c for c in chapters if manifest["chapters"].get(c) != current[c] and c not in forced]
    due.sort(key=tb.chapter_sort_key, reverse=True)  # newest chapters first
    order = forced + due
    tb.log(f"{len(order)} chapters need audio" + (f": {', '.join(order[:20])}"
                                                  + (" ..." if len(order) > 20 else "") if order else ""))
    if out := os.environ.get("GITHUB_OUTPUT"):
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"due={len(order)}\n")
    if args.plan or not order:
        return

    tb.AUDIO_EXT = ".webm"
    tb.STATE_DIR = Path(tempfile.mkdtemp(prefix="tts_state_"))  # fresh: re-render whole chapters
    engine = tb.KokoroEngine()
    voice = tb.KokoroVoice(args.voice, 1.0)

    budget = args.budget_minutes * 60
    slowest = 0.0
    done = unpushed = 0
    for n, ch in enumerate(order, 1):
        elapsed = time.time() - start
        # Only start a chapter if even the slowest one so far would still fit.
        if elapsed + max(slowest, 300) * 1.3 > budget:
            tb.log(f"time budget reached after {elapsed / 60:.0f} min; "
                   f"{len(order) - done} chapters left for the next run")
            break
        git(stash, "sparse-checkout", "add", f"/{ch}/")
        t0 = time.time()
        tb.tts_chapter(engine, voice, ch, stash, tb.DEFAULT_MAX_CHARS, f"[{n}/{len(order)}]")
        slowest = max(slowest, time.time() - t0)
        manifest["chapters"][ch] = current[ch]
        save_manifest(stash, manifest)
        git(stash, "add", "-A", "--", ch, MANIFEST)
        git(stash, "commit", "-q", "-m", f"TTS chapter {ch}", check=False)
        done += 1
        unpushed += 1
        # Push the first chapter right away (it's the newest, what readers are waiting
        # for), then in batches: every push redeploys GitHub Pages (~10 builds/hour limit).
        if done == 1 or unpushed >= args.push_every:
            push(stash)
            unpushed = 0
    if unpushed:
        push(stash)
    tb.log(f"rendered {done} chapters in {(time.time() - start) / 60:.0f} min; "
           f"{len(order) - done} left")

    if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(summary, "a", encoding="utf-8") as fh:
            fh.write(f"Rendered {done} chapters, {len(order) - done} left for the next run.\n")


if __name__ == "__main__":
    main()
