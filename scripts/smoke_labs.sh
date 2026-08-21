#!/usr/bin/env bash
# Start each teaching Compose stack, wait until healthy, hit /health, then tear down.
# Used by CI and `make smoke`. Stacks share host port 3000, so they run one at a time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

smoke_compose() {
  local dir="$1"
  echo "== smoke ${dir} =="
  (
    cd "${ROOT}/${dir}"
    if [[ -f .env.example ]]; then
      cp -f .env.example .env
    fi
    cleanup() {
      docker compose down -v --remove-orphans >/dev/null 2>&1 || true
    }
    trap cleanup EXIT
    docker compose up -d --build --wait --wait-timeout 120
    curl -fsS http://127.0.0.1:3000/health
    echo
  )
}

smoke_compose labs/09-production
smoke_compose labs/12-ci-cd
smoke_compose labs/05-compose

echo "Smoke tests passed."
