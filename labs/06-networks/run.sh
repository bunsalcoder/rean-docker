#!/usr/bin/env bash
# Optional helper for Lab 06 — same DNS demos as the README.
set -euo pipefail

cleanup() {
  docker rm -f lab06-redis >/dev/null 2>&1 || true
  docker network rm lab06-net >/dev/null 2>&1 || true
}
trap cleanup EXIT
cleanup

echo "== user-defined network + hostname =="
docker network create lab06-net >/dev/null
docker run -d --name lab06-redis --network lab06-net redis:7-alpine >/dev/null
pong="$(docker run --rm --network lab06-net redis:7-alpine redis-cli -h lab06-redis ping)"
echo "same network → ${pong}"
[[ "${pong}" == "PONG" ]]

echo "== default network should fail to resolve =="
if docker run --rm redis:7-alpine redis-cli -h lab06-redis ping >/dev/null 2>&1; then
  echo "expected failure when not on lab06-net" >&2
  exit 1
fi
echo "cross-network resolve failed as expected"

docker rm -f lab06-redis >/dev/null
docker network rm lab06-net >/dev/null

echo "== network-alias experiment =="
docker network create lab06-net >/dev/null
docker run -d --name lab06-redis --network lab06-net --network-alias cache redis:7-alpine >/dev/null
alias_pong="$(docker run --rm --network lab06-net redis:7-alpine redis-cli -h cache ping)"
echo "alias cache → ${alias_pong}"
[[ "${alias_pong}" == "PONG" ]]

echo "Lab 06 helper OK."
echo "Optional Compose form: docker compose -f compose.yaml run --rm client"
