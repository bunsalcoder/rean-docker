#!/usr/bin/env bash
# Optional helper for Lab 03 — build, run, hit / and /health.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker rm -f lab03-api >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== Build =="
docker build -t rean-hello:1.0 .

echo "== Run =="
docker run -d --rm --name lab03-api -p 3000:3000 rean-hello:1.0 >/dev/null
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "== Smoke =="
curl -fsS http://127.0.0.1:3000/
echo
curl -fsS http://127.0.0.1:3000/health
echo

echo "Lab 03 helper OK."
