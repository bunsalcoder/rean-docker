#!/usr/bin/env bash
# Optional helper for Lab 11 — whoami, BuildKit secret, digest inspect,
# compose.watch.yaml config, BuildKit cache mount, and SPDX peek.
# Prefer typing the README commands yourself the first time.
# Interactive `docker compose watch` stays manual (README §6).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
SECRET="${TMPDIR:-/tmp}/rean-demo.secret.$$"
CACHE_DF="${TMPDIR:-/tmp}/rean-lab11-cache.Dockerfile.$$"
cleanup() {
  rm -f "${SECRET}" "${CACHE_DF}"
  docker rmi rean-secret:lab11 >/dev/null 2>&1 || true
  docker rmi rean-cache:lab11 >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. Who is PID 1? =="
# Build Lab 03 if the tagged image is missing (same whoami check as the README).
if ! docker image inspect rean-hello:1.0 >/dev/null 2>&1; then
  docker build -t rean-hello:1.0 ../03-dockerfile
fi
hello_user="$(docker run --rm --entrypoint whoami rean-hello:1.0)"
alpine_user="$(docker run --rm --entrypoint whoami alpine:3.22)"
echo "rean-hello:1.0 → ${hello_user}"
echo "alpine:3.22 → ${alpine_user}"
[[ "${hello_user}" == "node" ]]
[[ "${alpine_user}" == "root" ]]

echo "== 2. BuildKit secret (must not land in history) =="
echo 'super-secret-token' > "${SECRET}"
# -f is resolved from cwd (not the build context) — stay in this lab folder.
docker build \
  --secret "id=demo,src=${SECRET}" \
  -t rean-secret:lab11 \
  -f Dockerfile.secret \
  .
history="$(docker history --no-trunc rean-secret:lab11)"
printf '%s\n' "${history}"
if printf '%s\n' "${history}" | grep -Fq 'super-secret-token'; then
  echo "FAIL: secret leaked into docker history"
  exit 1
fi
out="$(docker run --rm rean-secret:lab11)"
printf '%s\n' "${out}"
printf '%s\n' "${out}" | grep -Fq 'runtime image has no build secret'

echo "== 3. Digest vs tag =="
docker pull alpine:3.22 >/dev/null
digest="$(docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}')"
echo "RepoDigest=${digest}"
[[ "${digest}" == alpine@sha256:* ]]

echo "== 4. Compose Watch teaching file =="
docker compose -f compose.watch.yaml config >/dev/null
[[ -f watch-demo/hello.txt ]]

echo "== 5. Stretch — BuildKit cache mount (non-interactive) =="
cat > "${CACHE_DF}" <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine:3.22
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache curl
EOF
docker build -t rean-cache:lab11 -f "${CACHE_DF}" "${TMPDIR:-/tmp}"
docker build -t rean-cache:lab11 -f "${CACHE_DF}" "${TMPDIR:-/tmp}"

echo "== 6. Stretch — SBOM peek (SPDX via Trivy) =="
# Same digest pin as repo CI / Lab 11 README.
TRIVY_IMAGE='aquasec/trivy:0.63.0@sha256:6fb0646988fcd2fdf7bf123f7174945ebc2c9c72d1fa1567c8d7daeeb70f8037'
spdx="$(docker run --rm "$TRIVY_IMAGE" image --format spdx alpine:3.22)"
printf '%s\n' "${spdx}" | head -n 20
printf '%s\n' "${spdx}" | grep -Eqi 'SPDXID|PackageName'

echo "Lab 11 helper OK (interactive Compose Watch loop stays manual — see README §6)."
