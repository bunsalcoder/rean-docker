#!/usr/bin/env bash
# Optional helper for Lab 08 — build fat vs slim, compare size, smoke the slim image.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker rm -f lab08-slim >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== Build fat + slim =="
docker build -t rean-multi:fat -f Dockerfile.fat .
docker build -t rean-multi:slim .

echo "== Size contrast =="
fat_bytes="$(docker image inspect rean-multi:fat --format '{{.Size}}')"
slim_bytes="$(docker image inspect rean-multi:slim --format '{{.Size}}')"
echo "fat=${fat_bytes} slim=${slim_bytes}"
[[ "${fat_bytes}" -gt "${slim_bytes}" ]]

echo "== USER contrast =="
slim_user="$(docker run --rm --entrypoint whoami rean-multi:slim)"
fat_user="$(docker run --rm --entrypoint whoami rean-multi:fat)"
echo "slim=${slim_user} fat=${fat_user}"
[[ "${slim_user}" == "node" ]]
[[ "${fat_user}" == "root" ]]

echo "== Slim serves / =="
docker run -d --name lab08-slim -p 3001:3000 rean-multi:slim >/dev/null
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1:3001/ >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:3001/
echo

echo "Lab 08 helper OK."
