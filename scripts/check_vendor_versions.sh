#!/usr/bin/env bash
# Fail if web/package.json versions drift from the vendored README table
# (catch Dependabot bumps that never ran ./scripts/vendor_site_libs.sh).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 - <<'PY'
import json
import re
from pathlib import Path

pkg = json.loads(Path("web/package.json").read_text(encoding="utf-8"))
deps = pkg.get("dependencies") or {}
readme = Path("web/assets/js/vendor/README.md").read_text(encoding="utf-8")

fail = 0
for name, key in (("marked", "marked"), ("DOMPurify", "dompurify")):
    want = deps.get(key)
    if not want:
        print(f"DRIFT: web/package.json missing dependency {key}")
        fail = 1
        continue
    # Table row: | [marked](...) | 15.0.12 | ...
    pattern = rf"\|\s*\[{re.escape(name)}\][^\n]*\|\s*([0-9][^|\s]*)\s*\|"
    m = re.search(pattern, readme)
    if not m:
        print(f"DRIFT: vendor README missing version row for {name}")
        fail = 1
        continue
    got = m.group(1).strip()
    if got != want:
        print(f"DRIFT: {name} package.json={want} vendor README={got}")
        print("  Run: ./scripts/vendor_site_libs.sh")
        fail = 1
    else:
        print(f"OK:    {name} {want}")

raise SystemExit(fail)
PY
