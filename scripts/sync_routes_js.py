#!/usr/bin/env python3
"""Generate web/assets/js/routes.js from web/assets/routes.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from rean_routes import (  # noqa: E402
    ROUTES_JS,
    ROUTES_JSON,
    chapter_match_pattern,
    load_manifest,
)


def js_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render_routes_js(data: dict) -> str:
    chapter_lines: list[str] = []
    for chapter in data["chapters"]:
        chapter_id = str(chapter["id"])
        pattern = chapter_match_pattern(chapter)
        if chapter_id == "how-to-use":
            chapter_lines.append(
                "    {\n"
                f"      id: {js_string(chapter_id)},\n"
                f"      match: /{pattern}/m,\n"
                "    },"
            )
        else:
            chapter_lines.append(
                f"    {{ id: {js_string(chapter_id)}, match: /{pattern}/m }},"
            )

    lab_lines = [
        "    {"
        f" id: {js_string(str(lab['id']))},"
        f" levelKey: {js_string(str(lab['levelKey']))},"
        f" minutes: {int(lab['minutes'])}"
        " },"
        for lab in data["labs"]
    ]

    pair_lines: list[str] = []
    for pair in data.get("pairs") or []:
        parts = [
            f" chapter: {js_string(str(pair['chapter']))}",
            f" lab: {js_string(str(pair['lab']))}",
        ]
        hint = pair.get("practiceHintKey")
        if hint:
            parts.append(f" practiceHintKey: {js_string(str(hint))}")
        if pair.get("practiceOnly"):
            parts.append(" practiceOnly: true")
        pair_lines.append("    {" + ",".join(parts) + " },")

    note_lines = [
        f"    {js_string(str(lab_id))}: {js_string(str(key))},"
        for lab_id, key in (data.get("labNotes") or {}).items()
    ]

    version = int(data.get("version") or 1)
    body = "\n".join(
        [
            "/* Generated from web/assets/routes.json — edit the JSON, then: make sync-routes */",
            "(() => {",
            f"  const VERSION = {version};",
            "  const CHAPTERS = [",
            *chapter_lines,
            "  ];",
            "",
            "  const LAB_DEFS = [",
            *lab_lines,
            "  ];",
            "",
            "  const LAB_IDS = LAB_DEFS.map((lab) => lab.id);",
            "",
            "  const PAIR_LIST = [",
            *pair_lines,
            "  ];",
            "",
            "  const LAB_NOTES = {",
            *note_lines,
            "  };",
            "",
            "  const CHAPTER_TO_LAB = Object.fromEntries(",
            "    PAIR_LIST.map((pair) => [pair.chapter, pair.lab])",
            "  );",
            "  // First non-practiceOnly pairing wins as primary theory (Lab 11 → Ch.15).",
            "  const LAB_TO_CHAPTER = PAIR_LIST.reduce((acc, pair) => {",
            "    if (pair.practiceOnly) return acc;",
            "    if (!acc[pair.lab]) acc[pair.lab] = pair.chapter;",
            "    return acc;",
            "  }, {});",
            "  const LAB_TO_CHAPTERS = PAIR_LIST.reduce((acc, pair) => {",
            "    if (pair.practiceOnly) return acc;",
            "    const list = acc[pair.lab] || (acc[pair.lab] = []);",
            "    if (!list.includes(pair.chapter)) list.push(pair.chapter);",
            "    return acc;",
            "  }, {});",
            "",
            "  window.ReanRoutes = {",
            "    version: VERSION,",
            "    CHAPTERS,",
            "    LAB_DEFS,",
            "    LAB_IDS,",
            "    PAIRS: PAIR_LIST,",
            "    LAB_NOTES,",
            "    CHAPTER_TO_LAB,",
            "    LAB_TO_CHAPTER,",
            "    LAB_TO_CHAPTERS,",
            "  };",
            "})();",
            "",
        ]
    )
    return body


def main() -> int:
    data = load_manifest()
    ROUTES_JS.write_text(render_routes_js(data), encoding="utf-8")
    print(f"Wrote {ROUTES_JS} from {ROUTES_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
