#!/usr/bin/env bash
# Optional: run concept-lab helpers (01, 02, 06, 07, 10). Used by CI / `make smoke-concept`.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run_one() {
  local script="$1"
  echo "== ${script} =="
  bash "${script}"
}

run_one labs/01-isolation-basics/run.sh
run_one labs/02-hello/run.sh
run_one labs/06-networks/run.sh
run_one labs/07-volumes/run.sh
run_one labs/10-debugging/run.sh

echo "== compose config (06 / 07 / 10 fixed) =="
docker compose -f labs/06-networks/compose.yaml config >/dev/null
docker compose -f labs/07-volumes/compose.yaml config >/dev/null
docker compose -f labs/10-debugging/compose.yaml config >/dev/null
docker compose -f labs/10-debugging/compose.fixed.yaml config >/dev/null
(
  cd labs/06-networks
  docker compose run --rm client | grep -Fq PONG
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
)
(
  cd labs/10-debugging
  docker compose -f compose.fixed.yaml run --rm client | grep -Fq PONG
  docker compose -f compose.fixed.yaml down -v --remove-orphans >/dev/null 2>&1 || true
)

echo "Concept lab helpers passed."
