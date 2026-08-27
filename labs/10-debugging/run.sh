#!/usr/bin/env bash
# Optional helper for Lab 10 — crash + inspect demos.
# Step 3 (localhost → cache) stays manual: edit compose.yaml yourself, or compare compose.fixed.yaml.
set -euo pipefail

cleanup() {
  docker rm -f lab10-crash lab10-inspect >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. Crash + logs + exit code =="
docker rm -f lab10-crash >/dev/null 2>&1 || true
docker run --name lab10-crash alpine:3.22 sh -c 'echo boom >&2; exit 7' >/dev/null 2>&1 || true
docker ps -a --filter name=lab10-crash --format 'table {{.Names}}\t{{.Status}}'
logs="$(docker logs lab10-crash 2>&1 || true)"
echo "${logs}"
echo "${logs}" | grep -Fq boom
code="$(docker inspect -f '{{.State.ExitCode}}' lab10-crash)"
echo "ExitCode=${code}"
[[ "${code}" == "7" ]]
docker rm lab10-crash >/dev/null

echo "== 4. Inspect one field =="
docker run -d --name lab10-inspect alpine:3.22 sleep 30 >/dev/null
docker inspect -f '{{.State.Status}} {{.HostConfig.NetworkMode}}' lab10-inspect
docker rm -f lab10-inspect >/dev/null

echo "Lab 10 helper OK for steps 1 and 4."
echo "Still do step 3: fix compose.yaml (localhost → cache), or peek at compose.fixed.yaml."
