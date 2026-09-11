#!/usr/bin/env bash
# Keep duplicated teaching labs from drifting on shared hardening invariants.
# Labs stay separate folders on purpose; this gate catches accidental divergence.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0

ok() { echo "OK:    $*"; }
bad() { echo "DRIFT: $*"; fail=1; }

node_digest() {
  local file="$1"
  python3 - "$file" <<'PY'
import pathlib, re, sys
text = pathlib.Path(sys.argv[1]).read_text()
# Prefer runtime stage when multi-stage (Lab 08).
matches = re.findall(
    r"FROM\s+node:22-alpine@(sha256:[0-9a-f]+)",
    text,
    flags=re.IGNORECASE,
)
if not matches:
    raise SystemExit(f"no node:22-alpine digest pin in {sys.argv[1]}")
print(matches[-1])
PY
}

pkg_dep() {
  local file="$1"
  local name="$2"
  python3 - "$file" "$name" <<'PY'
import json, pathlib, sys
data = json.loads(pathlib.Path(sys.argv[1]).read_text())
deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
print(deps.get(sys.argv[2], ""))
PY
}

echo "== Shared Node digest (CRITICAL-gated Dockerfiles) =="
DIGESTS=()
DIGEST_FILES=(
  labs/05-compose/Dockerfile
  labs/08-multi-stage/Dockerfile
  labs/09-production/Dockerfile
  labs/12-ci-cd/Dockerfile
  labs/13-capstone/Dockerfile
)
for f in "${DIGEST_FILES[@]}"; do
  d="$(node_digest "$f")"
  DIGESTS+=("$d")
  ok "$f → $d"
done
canon="${DIGESTS[0]}"
for i in "${!DIGEST_FILES[@]}"; do
  if [[ "${DIGESTS[$i]}" != "$canon" ]]; then
    bad "${DIGEST_FILES[$i]} digest ${DIGESTS[$i]} ≠ ${DIGEST_FILES[0]} $canon"
  fi
done

echo
echo "== Prod-minded Dockerfiles identical (09 = 12 = 13) =="
if diff -q labs/09-production/Dockerfile labs/12-ci-cd/Dockerfile >/dev/null \
  && diff -q labs/09-production/Dockerfile labs/13-capstone/Dockerfile >/dev/null; then
  ok "labs/09-production/Dockerfile matches 12 and 13"
else
  bad "labs/09, 12, 13 Dockerfiles must stay byte-identical"
  diff -u labs/09-production/Dockerfile labs/12-ci-cd/Dockerfile || true
  diff -u labs/09-production/Dockerfile labs/13-capstone/Dockerfile || true
fi

echo
echo "== npm/corepack strip on CRITICAL-gated images =="
STRIP_FILES=(
  labs/05-compose/Dockerfile
  labs/08-multi-stage/Dockerfile
  labs/09-production/Dockerfile
  labs/12-ci-cd/Dockerfile
  labs/13-capstone/Dockerfile
)
for f in "${STRIP_FILES[@]}"; do
  if grep -Fq '/usr/local/lib/node_modules/npm' "$f" \
    && grep -Fq '/usr/local/lib/node_modules/corepack' "$f"; then
    ok "$f strips npm/corepack"
  else
    bad "$f missing npm/corepack strip (needed for CRITICAL gate)"
  fi
done

echo
echo "== Shared Express version across Node labs =="
EXPRESS_LABS=(
  labs/03-dockerfile/package.json
  labs/05-compose/package.json
  labs/08-multi-stage/package.json
  labs/09-production/package.json
  labs/12-ci-cd/package.json
  labs/13-capstone/package.json
)
express_canon="$(pkg_dep "${EXPRESS_LABS[0]}" express)"
if [[ -z "$express_canon" ]]; then
  bad "${EXPRESS_LABS[0]} missing express dependency"
else
  ok "${EXPRESS_LABS[0]} express=$express_canon"
  for f in "${EXPRESS_LABS[@]:1}"; do
    v="$(pkg_dep "$f" express)"
    if [[ "$v" == "$express_canon" ]]; then
      ok "$f express=$v"
    else
      bad "$f express=$v ≠ $express_canon (bump all six together)"
    fi
  done
fi

echo
echo "== Compose stack deps (05 ↔ 13) =="
for dep in pg redis; do
  a="$(pkg_dep labs/05-compose/package.json "$dep")"
  b="$(pkg_dep labs/13-capstone/package.json "$dep")"
  if [[ -n "$a" && "$a" == "$b" ]]; then
    ok "05 and 13 share $dep=$a"
  else
    bad "05 $dep=$a vs 13 $dep=$b (keep aligned)"
  fi
done

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Lab invariant check failed."
  echo "Update the drifted lab files together, or see CONTRIBUTING.md (Shared Node lab apps)."
  exit 1
fi

echo "Lab invariant check passed."
