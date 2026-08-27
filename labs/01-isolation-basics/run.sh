#!/usr/bin/env bash
# Optional helper for Lab 01 — same demos as the README, with cleanup.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARE="${ROOT}/.share"
cleanup() {
  docker rm -f lab01-ps lab01-web-a lab01-web-b lab01-limited lab01-r1 lab01-r2 lab01-r3 >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. Process isolation =="
docker run -d --name lab01-ps alpine:3.22 sleep 3600 >/dev/null
echo "inside container:"
docker exec lab01-ps ps aux
echo "host (first lines):"
ps aux | head -n 5
docker rm -f lab01-ps >/dev/null

echo "== 2. Filesystem isolation =="
docker run --rm alpine:3.22 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt'
mkdir -p "${SHARE}"
echo 'from-host' > "${SHARE}/msg.txt"
docker run --rm -v "${SHARE}:/data" alpine:3.22 cat /data/msg.txt

echo "== 3. Network isolation =="
docker run -d --name lab01-web-a -p 18080:80 nginx:1.28-alpine >/dev/null
docker run -d --name lab01-web-b -p 18081:80 nginx:1.28-alpine >/dev/null
# nginx needs a moment to accept connections
for _ in 1 2 3 4 5 6 7 8 9 10; do
  code_a="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18080/ || true)"
  code_b="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:18081/ || true)"
  [[ "${code_a}" == "200" && "${code_b}" == "200" ]] && break
  sleep 1
done
echo "lab01-web-a → ${code_a}"
echo "lab01-web-b → ${code_b}"
[[ "${code_a}" == "200" && "${code_b}" == "200" ]]
docker rm -f lab01-web-a lab01-web-b >/dev/null

echo "== 4. Memory limits =="
docker run -d --name lab01-limited -m 256m alpine:3.22 sleep 60 >/dev/null
mem="$(docker inspect -f '{{.HostConfig.Memory}}' lab01-limited)"
echo "HostConfig.Memory=${mem}"
[[ "${mem}" == "268435456" ]]
docker rm -f lab01-limited >/dev/null

echo "== 5. One image, many containers =="
docker pull redis:7-alpine >/dev/null
docker run -d --name lab01-r1 redis:7-alpine >/dev/null
docker run -d --name lab01-r2 redis:7-alpine >/dev/null
docker run -d --name lab01-r3 redis:7-alpine >/dev/null
docker ps --filter name=lab01-r --format 'table {{.Names}}\t{{.Status}}'
docker rm -f lab01-r1 lab01-r2 lab01-r3 >/dev/null

echo "Lab 01 helper OK."
