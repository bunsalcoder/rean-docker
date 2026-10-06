#!/usr/bin/env python3
"""Re-apply Khmer handbook subsection heading translations from JSON.

One-shot helper. Prefer editing web/content/km/guide.md directly afterward.
Requires scripts/km_guide_heading_translations.json (EN title -> KM title).
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "web/content/km/guide.md"
MAP = ROOT / "scripts/km_guide_heading_translations.json"


def main() -> int:
    if not MAP.is_file():
        print(f"MISSING {MAP}", file=sys.stderr)
        return 1
    translations: dict[str, str] = json.loads(MAP.read_text(encoding="utf-8"))
    text = GUIDE.read_text(encoding="utf-8")
    out: list[str] = []
    changed = 0
    for line in text.splitlines():
        m = re.match(r"^(#{3,4})\s+(.+)$", line)
        if not m:
            out.append(line)
            continue
        hashes = m.group(1)
        title = re.sub(r"\s*#+\s*$", "", m.group(2).strip())
        if title in translations:
            mapped = translations[title]
            out.append(f"{hashes} {mapped}")
            if mapped != title:
                changed += 1
        else:
            out.append(line)
    GUIDE.write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"Updated {changed} headings from {MAP.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
