#!/usr/bin/env bash
# Optional helper for Lab 09 — production Compose smoke + memory limit check.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== Compose up =="
docker compose up -d --build --wait --wait-timeout 120

echo "== Health =="
curl -fsS http://127.0.0.1:3000/health
echo

echo "== Memory limit =="
mem="$(docker inspect --format='{{.HostConfig.Memory}}' "$(docker compose ps -q api)")"
echo "HostConfig.Memory=${mem}"
[[ "${mem}" == "268435456" ]]

echo "Lab 09 helper OK."
