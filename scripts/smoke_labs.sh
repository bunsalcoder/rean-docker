#!/usr/bin/env bash
# Start teaching Compose stacks, assert they work, then tear down.
# Used by CI and `make smoke`. Stacks that publish host :3000 run one at a time.
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

smoke_env_lab() {
  local dir="$1"
  echo "== smoke ${dir} =="
  (
    cd "${ROOT}/${dir}"
    cp -f .env.example .env
    cleanup() {
      docker compose down -v --remove-orphans >/dev/null 2>&1 || true
    }
    trap cleanup EXIT
    local out
    out="$(docker compose run --rm demo)"
    printf '%s\n' "${out}"
    printf '%s\n' "${out}" | grep -Fq 'hello-from-env-file'
    printf '%s\n' "${out}" | grep -Fq 'change-me-now'
  )
}

smoke_env_lab labs/04-env-secrets
smoke_compose labs/09-production
smoke_compose labs/12-ci-cd
smoke_compose labs/05-compose
smoke_compose labs/13-capstone

echo "Smoke tests passed."
# Lab 10 stays out on purpose: its Compose file is intentionally broken until the learner fixes it.
