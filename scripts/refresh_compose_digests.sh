#!/usr/bin/env bash
# Refresh Postgres/Redis digest pins in Lab 13 Compose files.
# Dependabot covers Dockerfiles under labs/09, 12, 13 — not Compose `image:` digests.
# Usage: ./scripts/refresh_compose_digests.sh
#        ./scripts/refresh_compose_digests.sh --check   # exit 1 if pins drift from Hub
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

CHECK_ONLY=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_ONLY=1
fi

digest_for() {
  local tag="$1"
  docker buildx imagetools inspect "$tag" --format '{{json .Manifest}}' \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["digest"])'
}

replace_pin() {
  local file="$1"
  local repo_tag="$2" # e.g. postgres:16-alpine
  local digest="$3"   # sha256:…
  python3 - "$file" "$repo_tag" "$digest" <<'PY'
import pathlib, re, sys
path, tag, digest = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
text = path.read_text()
pattern = re.compile(rf"(image:\s*{re.escape(tag)}@)sha256:[0-9a-f]+")
new_text, n = pattern.subn(rf"\1{digest}", text)
if n == 0:
    raise SystemExit(f"no pin for {tag} in {path}")
path.write_text(new_text)
print(f"  {path}: {tag}@{digest} ({n} occurrence(s))")
PY
}

current_pin() {
  local file="$1"
  local repo_tag="$2"
  python3 - "$file" "$repo_tag" <<'PY'
import pathlib, re, sys
path, tag = pathlib.Path(sys.argv[1]), sys.argv[2]
text = path.read_text()
m = re.search(rf"image:\s*{re.escape(tag)}@(sha256:[0-9a-f]+)", text)
if not m:
    raise SystemExit(f"no pin for {tag} in {path}")
print(m.group(1))
PY
}

FILES=(
  labs/13-capstone/compose.yaml
  labs/13-capstone/compose.prod.yaml
)
TAGS=(
  postgres:16-alpine
  redis:7-alpine
)

echo "Resolving current Hub digests…"
declare -A DIGESTS
for tag in "${TAGS[@]}"; do
  DIGESTS["$tag"]="$(digest_for "$tag")"
  echo "  $tag -> ${DIGESTS[$tag]}"
done

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  drift=0
  for file in "${FILES[@]}"; do
    for tag in "${TAGS[@]}"; do
      pinned="$(current_pin "$file" "$tag")"
      hub="${DIGESTS[$tag]}"
      if [[ "$pinned" != "$hub" ]]; then
        echo "DRIFT: $file $tag pinned=$pinned hub=$hub"
        drift=1
      else
        echo "OK:    $file $tag"
      fi
    done
  done
  if [[ "$drift" -ne 0 ]]; then
    echo
    echo "Compose digests drifted. Refresh with: make refresh-digests"
    exit 1
  fi
  echo "Compose digest pins match Hub."
  exit 0
fi

echo "Updating Lab 13 Compose pins…"
for file in "${FILES[@]}"; do
  for tag in "${TAGS[@]}"; do
    replace_pin "$file" "$tag" "${DIGESTS[$tag]}"
  done
done

echo
echo "Done. Review the diff, then commit if digests changed."
echo "Note: Lab 05 intentionally uses floating tags (postgres:16-alpine / redis:7-alpine)."
