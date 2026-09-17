#!/usr/bin/env python3
"""Generate web/assets/search-index-{en,km}.json from handbook + lab Markdown."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
CONTENT = WEB / "content"
OUT_DIR = WEB / "assets"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from rean_routes import lab_ids, load_manifest  # noqa: E402


def strip_md(md: str) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", md)
    text = re.sub(r"`[^`]+`", " ", text)
    text = re.sub(r"!\[[^\]]*]\([^)]+\)", " ", text)
    text = re.sub(r"\[[^\]]*]\([^)]+\)", " ", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.M)
    text = re.sub(r"[*_>#|-]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def chapter_starts(lines: list[str], locale: str) -> list[tuple[str, int]]:
    how_to = {
        "en": re.compile(r"^## How to use this guide$"),
        "km": re.compile(r"^## របៀបប្រើមគ្គុទ្ទេសក៍នេះ$"),
    }[locale]
    starts: list[tuple[str, int]] = []
    for index, line in enumerate(lines):
        if how_to.match(line):
            starts.append(("how-to-use", index))
            continue
        m = re.match(r"^## (\d+)\. ", line)
        if m:
            starts.append((m.group(1), index))
    starts.sort(key=lambda item: item[1])
    return starts


def split_guide(markdown: str, locale: str) -> list[dict]:
    lines = markdown.split("\n")
    starts = chapter_starts(lines, locale)
    docs = []
    for i, (chapter_id, start) in enumerate(starts):
        end = starts[i + 1][1] if i + 1 < len(starts) else len(lines)
        body = "\n".join(lines[start:end])
        docs.append({"type": "chapter", "id": chapter_id, "text": strip_md(body)})
    return docs


def build_locale(locale: str, labs: list[str]) -> dict:
    guide_path = CONTENT / locale / "guide.md"
    docs: list[dict] = []
    if guide_path.is_file():
        docs.extend(split_guide(guide_path.read_text(encoding="utf-8"), locale))
    for lab_id in labs:
        lab_path = CONTENT / locale / "labs" / f"{lab_id}.md"
        if not lab_path.is_file():
            continue
        docs.append(
            {
                "type": "lab",
                "id": lab_id,
                "text": strip_md(lab_path.read_text(encoding="utf-8")),
            }
        )
    return {"version": 1, "locale": locale, "docs": docs}


def main() -> int:
    data = load_manifest()
    labs = lab_ids(data)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for locale in ("en", "km"):
        payload = build_locale(locale, labs)
        out = OUT_DIR / f"search-index-{locale}.json"
        out.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        print(f"Wrote {out} ({len(payload['docs'])} docs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
