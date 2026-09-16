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
        f"    {{ id: {js_string(str(lab['id']))}, levelKey: {js_string(str(lab['levelKey']))} }},"
        for lab in data["labs"]
    ]

    body = "\n".join(
        [
            "/* Generated from web/assets/routes.json — edit the JSON, then: make sync-routes */",
            "(() => {",
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
            "  window.ReanRoutes = { CHAPTERS, LAB_DEFS, LAB_IDS };",
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
