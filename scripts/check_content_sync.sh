#!/usr/bin/env bash
# Fail if English handbook/labs drift from the web content copies.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0

check_pair() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$src" ]]; then
    echo "MISSING source: $src"
    fail=1
    return
  fi
  if [[ ! -f "$dst" ]]; then
    echo "MISSING copy:   $dst"
    fail=1
    return
  fi
  if ! cmp -s "$src" "$dst"; then
    echo "DRIFT: $src  ≠  $dst"
    fail=1
  else
    echo "OK:    $src  →  $dst"
  fi
}

echo "== Handbook =="
check_pair \
  "docs/DOCKER_FROM_ZERO_TO_HERO.md" \
  "web/content/en/guide.md"

echo
echo "== Labs =="
for lab_dir in labs/*/; do
  name="$(basename "$lab_dir")"
  check_pair \
    "labs/${name}/README.md" \
    "web/content/en/labs/${name}.md"
done

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Content sync check failed."
  echo "Fix drift manually, or run:  ./scripts/sync_en_content.sh"
  exit 1
fi

echo "Content sync check passed."
