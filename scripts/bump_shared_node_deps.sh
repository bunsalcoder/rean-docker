#!/usr/bin/env bash
# Bump a shared npm dependency across the six teaching Node labs, then refresh locks.
# Usage:
#   ./scripts/bump_shared_node_deps.sh express@^4.22.0
#   ./scripts/bump_shared_node_deps.sh pg@^8.16.0   # updates labs that list pg
#   PKG=express@^4.22.0 ./scripts/bump_shared_node_deps.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SPEC="${1:-${PKG:-}}"
if [[ -z "$SPEC" || "$SPEC" != *@* ]]; then
  echo "Usage: $0 <name>@<version-range>"
  echo "Example: $0 express@^4.21.2"
  exit 1
fi

NAME="${SPEC%%@*}"
RANGE="${SPEC#*@}"
if [[ -z "$NAME" || -z "$RANGE" || "$NAME" == "$RANGE" ]]; then
  echo "Could not parse package spec: $SPEC"
  exit 1
fi

LABS=(
  labs/03-dockerfile
  labs/05-compose
  labs/08-multi-stage
  labs/09-production
  labs/12-ci-cd
  labs/13-capstone
)

updated=0
for lab in "${LABS[@]}"; do
  pkg="$lab/package.json"
  if ! python3 - "$pkg" "$NAME" <<'PY'
import json, pathlib, sys
data = json.loads(pathlib.Path(sys.argv[1]).read_text())
name = sys.argv[2]
deps = data.get("dependencies") or {}
dev = data.get("devDependencies") or {}
raise SystemExit(0 if name in deps or name in dev else 1)
PY
  then
    echo "skip  $lab (no $NAME)"
    continue
  fi

  python3 - "$pkg" "$NAME" "$RANGE" <<'PY'
import json, pathlib, sys
path = pathlib.Path(sys.argv[1])
name, range_ = sys.argv[2], sys.argv[3]
data = json.loads(path.read_text())
for key in ("dependencies", "devDependencies"):
    section = data.get(key) or {}
    if name in section:
        section[name] = range_
        data[key] = section
path.write_text(json.dumps(data, indent=2) + "\n")
PY
  echo "set   $lab → $NAME=$RANGE"
  (cd "$lab" && npm install --package-lock-only --ignore-scripts)
  updated=$((updated + 1))
done

if [[ "$updated" -eq 0 ]]; then
  echo "No lab package.json listed $NAME."
  exit 1
fi

echo
echo "Updated $updated lab(s). Next: make check-lab-invariants"
