#!/usr/bin/env python3
"""Fail if Khmer handbook ###/#### titles are Latin-only (no Khmer letters).

Allows intentional bilingual titles that already include Khmer.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "web/content/km/guide.md"

HEADING_RE = re.compile(r"^(#{3,4})\s+(.+)$")
KHMER_RE = re.compile(r"[\u1780-\u17FF]")
LATIN_RE = re.compile(r"[A-Za-z]")


def main() -> int:
    if not GUIDE.is_file():
        print(f"MISSING {GUIDE}", file=sys.stderr)
        return 1

    bad: list[str] = []
    for i, line in enumerate(GUIDE.read_text(encoding="utf-8").splitlines(), 1):
        m = HEADING_RE.match(line)
        if not m:
            continue
        title = re.sub(r"\s*#+\s*$", "", m.group(2).strip())
        if LATIN_RE.search(title) and not KHMER_RE.search(title):
            bad.append(f"{i}: {m.group(1)} {title}")

    if bad:
        print(
            "Latin-only ###/#### headings in Khmer handbook "
            "(add Khmer, or Khmer + technical English):",
            file=sys.stderr,
        )
        for row in bad:
            print(f"  {row}", file=sys.stderr)
        return 1

    print(f"OK: no Latin-only ###/#### headings in {GUIDE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
