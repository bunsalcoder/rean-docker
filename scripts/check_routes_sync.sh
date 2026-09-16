#!/usr/bin/env bash
# Fail if web/assets/js/routes.js drifted from web/assets/routes.json.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 - <<'PY'
import sys
from pathlib import Path

sys.path.insert(0, str(Path("scripts").resolve()))
from rean_routes import ROUTES_JS, ROUTES_JSON, load_manifest
from sync_routes_js import render_routes_js

expected = render_routes_js(load_manifest())
actual = ROUTES_JS.read_text(encoding="utf-8")
if actual != expected:
    print(f"DRIFT: {ROUTES_JS} does not match {ROUTES_JSON}")
    print("Run: make sync-routes")
    raise SystemExit(1)
print(f"OK:    {ROUTES_JS} matches {ROUTES_JSON}")
PY
