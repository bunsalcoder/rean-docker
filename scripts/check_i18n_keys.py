#!/usr/bin/env python3
"""Fail if Khmer UI strings drift from English keys, or JS/HTML references missing keys."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
I18N_EN = ROOT / "web/assets/js/i18n.js"
I18N_KM = ROOT / "web/assets/js/i18n-km.js"
SCAN_GLOBS = (
    "web/assets/js/*.js",
    "web/*.html",
    "scripts/generate_static_pages.mjs",
)

# "key": "value" or "key":\n  "value" (simple escapes inside value).
PAIR_RE = re.compile(r'"((?:\\.|[^"\\])+)"\s*:\s*"((?:\\.|[^"\\])*)"', re.M)


def parse_string_map(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for match in PAIR_RE.finditer(text):
        key = match.group(1)
        # Skip accidental non-i18n pairs from nearby JS (no dotted / known flat keys).
        if "." not in key and key not in {"copy", "copied", "copyFailed"}:
            continue
        out[key] = match.group(2)
    return out


def extract_en_block(text: str) -> str:
    start = text.find("const EN = {")
    if start < 0:
        raise SystemExit("Could not find const EN = { in i18n.js")
    # End at the STRINGS / locale wiring after EN closes — take until "const STRINGS"
    end = text.find("const STRINGS", start)
    if end < 0:
        end = len(text)
    return text[start:end]


def referenced_keys(root: Path) -> set[str]:
    keys: set[str] = set()
    patterns = (
        re.compile(r"""\bt\(\s*["']([^"']+)["']"""),
        re.compile(r"""data-i18n=["']([^"']+)["']"""),
        re.compile(r"""data-i18n-attr=["'][^"']*:([^"']+)["']"""),
        re.compile(r"""strings\[["']([^"']+)["']\]"""),
    )
    files: list[Path] = []
    for glob in SCAN_GLOBS:
        files.extend(root.glob(glob))
    for path in files:
        if path.name in {"i18n.js", "i18n-km.js"}:
            continue
        text = path.read_text(encoding="utf-8")
        for cre in patterns:
            keys.update(cre.findall(text))
    # Dynamic template keys we know are built at runtime — not literal references.
    return {k for k in keys if "{" not in k and not k.endswith(".")}


def main() -> int:
    en = parse_string_map(extract_en_block(I18N_EN.read_text(encoding="utf-8")))
    km = parse_string_map(I18N_KM.read_text(encoding="utf-8"))
    fail = 0

    if not en:
        print("FAIL: no English i18n keys parsed")
        return 1
    if not km:
        print("FAIL: no Khmer i18n keys parsed")
        return 1

    missing_km = sorted(set(en) - set(km))
    extra_km = sorted(set(km) - set(en))
    if missing_km:
        fail = 1
        print(f"FAIL: {len(missing_km)} English key(s) missing from i18n-km.js:")
        for key in missing_km:
            print(f"  - {key}")
    else:
        print(f"OK:    Khmer covers all {len(en)} English UI keys")

    if extra_km:
        # Orphans are noise for translators; warn but fail so they stay in sync.
        fail = 1
        print(f"FAIL: {len(extra_km)} Khmer key(s) not present in English EN map:")
        for key in extra_km:
            print(f"  - {key}")
    else:
        print("OK:    no orphan Khmer UI keys")

    refs = referenced_keys(ROOT)
    missing_refs = sorted(k for k in refs if k not in en)
    if missing_refs:
        fail = 1
        print(f"FAIL: {len(missing_refs)} referenced i18n key(s) missing from English EN map:")
        for key in missing_refs:
            print(f"  - {key}")
    else:
        print(f"OK:    {len(refs)} literal UI key references resolve in English")

    if fail:
        print("i18n key check failed.")
        return 1
    print("i18n key check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
