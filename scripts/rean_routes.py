#!/usr/bin/env python3
"""Load web/assets/routes.json — shared chapter/lab tables for site tooling."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
ROUTES_JSON = WEB / "assets/routes.json"
ROUTES_JS = WEB / "assets/js/routes.js"


def chapter_match_pattern(chapter: dict) -> str:
    if match := chapter.get("match"):
        return str(match)
    chapter_id = str(chapter["id"])
    if chapter_id.isdigit():
        return rf"^## {chapter_id}\. "
    raise SystemExit(
        f"Chapter {chapter_id!r} needs an explicit match pattern in {ROUTES_JSON}"
    )


def load_manifest(path: Path | None = None) -> dict:
    manifest_path = path or ROUTES_JSON
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(data.get("chapters"), list) or not data["chapters"]:
        raise SystemExit(f"No chapters in {manifest_path}")
    if not isinstance(data.get("labs"), list) or not data["labs"]:
        raise SystemExit(f"No labs in {manifest_path}")
    for chapter in data["chapters"]:
        if "id" not in chapter:
            raise SystemExit(f"Chapter missing id in {manifest_path}")
        chapter_match_pattern(chapter)
    for lab in data["labs"]:
        if "id" not in lab or "levelKey" not in lab:
            raise SystemExit(f"Lab entries need id + levelKey in {manifest_path}")
        minutes = lab.get("minutes")
        if not isinstance(minutes, int) or minutes <= 0:
            raise SystemExit(
                f"Lab {lab.get('id')!r} needs a positive integer minutes in {manifest_path}"
            )
    return data


def chapter_ids(data: dict | None = None) -> list[str]:
    manifest = data or load_manifest()
    return [str(ch["id"]) for ch in manifest["chapters"]]


def lab_ids(data: dict | None = None) -> list[str]:
    manifest = data or load_manifest()
    return [str(lab["id"]) for lab in manifest["labs"]]


def lab_defs(data: dict | None = None) -> list[dict]:
    manifest = data or load_manifest()
    return [
        {
            "id": str(lab["id"]),
            "levelKey": str(lab["levelKey"]),
            "minutes": int(lab["minutes"]),
        }
        for lab in manifest["labs"]
    ]
