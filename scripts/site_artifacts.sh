#!/usr/bin/env bash
# Shared site artifact helpers used by Make and GitHub Actions.
#   generate — rebuild static pages, sitemap, robots.txt, search indexes
#   check    — fail if those paths drifted from git (run generate first in CI)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

usage() {
  echo "Usage: $0 generate|check" >&2
  exit 2
}

[[ "${1:-}" ]] || usage

ARTIFACT_PATHS=(
  web/sitemap.xml
  web/robots.txt
  web/assets/search-index-en.json
  web/assets/search-index-km.json
  web/learn
  web/lab
)

generate() {
  # Subshell so cwd stays repo root for the Python generators.
  (cd web && npm ci --ignore-scripts)
  (cd web && node ../scripts/generate_static_pages.mjs)
  python3 ./scripts/generate_sitemap.py
  python3 ./scripts/generate_search_index.py
}

check() {
  if ! git diff --exit-code -- "${ARTIFACT_PATHS[@]}"; then
    if [[ "${GITHUB_ACTIONS:-}" == "true" ]]; then
      echo "::error::Generated site artifacts drifted from git. Run: make sitemap && commit the results."
    fi
    echo "Generated site artifacts drifted. Commit make sitemap output." >&2
    exit 1
  fi
  echo "OK:    generated site artifacts match git"
}

case "$1" in
  generate) generate ;;
  check) check ;;
  *) usage ;;
esac
