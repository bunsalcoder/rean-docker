#!/usr/bin/env bash
# Optional helper for Lab 14 — BuildKit cache mount, compose.watch.yaml config,
# and SPDX peek. Interactive `docker compose watch` stays manual (README §2).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
CACHE_DF="${TMPDIR:-/tmp}/rean-lab14-cache.Dockerfile.$$"
cleanup() {
  rm -f "${CACHE_DF}"
  docker rmi rean-cache:lab14 >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. BuildKit cache mount (non-interactive) =="
cat > "${CACHE_DF}" <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine:3.22
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache curl
EOF
docker build -t rean-cache:lab14 -f "${CACHE_DF}" "${TMPDIR:-/tmp}"
docker build -t rean-cache:lab14 -f "${CACHE_DF}" "${TMPDIR:-/tmp}"

echo "== 2. Compose Watch teaching file =="
docker compose -f compose.watch.yaml config >/dev/null
[[ -f watch-demo/hello.txt ]]

echo "== 3. SBOM peek (SPDX via Trivy) =="
# Same digest pin as repo CI / Lab 11.
TRIVY_IMAGE='aquasec/trivy:0.63.0@sha256:6fb0646988fcd2fdf7bf123f7174945ebc2c9c72d1fa1567c8d7daeeb70f8037'
spdx="$(docker run --rm "$TRIVY_IMAGE" image --format spdx alpine:3.22)"
printf '%s\n' "${spdx}" | head -n 20
printf '%s\n' "${spdx}" | grep -Eqi 'SPDXID|PackageName'

echo "Lab 14 helper OK (interactive Compose Watch loop stays manual — see README §2)."
