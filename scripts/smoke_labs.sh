#!/usr/bin/env bash
# Start teaching Compose stacks, assert they work, then tear down.
# Used by CI and `make smoke`. Prefers each lab's run.sh when present.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_lab() {
  local dir="$1"
  local helper="${ROOT}/${dir}/run.sh"
  echo "== smoke ${dir} =="
  if [[ -x "${helper}" ]]; then
    "${helper}"
    return
  fi
  if [[ -f "${helper}" ]]; then
    bash "${helper}"
    return
  fi
  echo "FAIL: missing ${dir}/run.sh"
  exit 1
}

run_lab labs/04-env-secrets
run_lab labs/09-production
run_lab labs/12-ci-cd
run_lab labs/05-compose
run_lab labs/13-capstone

echo "Smoke tests passed."
# Lab 10 stays out on purpose: its Compose file is intentionally broken until the learner fixes it.
