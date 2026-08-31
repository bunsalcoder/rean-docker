#!/usr/bin/env bash
# Optional helper for Lab 11 — non-root whoami, BuildKit secret, digest inspect.
# Prefer typing the README commands yourself the first time. Trivy scan stays manual.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRET="${TMPDIR:-/tmp}/rean-demo.secret.$$"
cleanup() {
  rm -f "${SECRET}"
  docker rmi rean-secret:lab11 >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. Who is PID 1? =="
# Build Lab 03 if the tagged image is missing (same whoami check as the README).
if ! docker image inspect rean-hello:1.0 >/dev/null 2>&1; then
  docker build -t rean-hello:1.0 "${ROOT}/../03-dockerfile"
fi
hello_user="$(docker run --rm --entrypoint whoami rean-hello:1.0)"
alpine_user="$(docker run --rm --entrypoint whoami alpine:3.22)"
echo "rean-hello:1.0 → ${hello_user}"
echo "alpine:3.22 → ${alpine_user}"
[[ "${hello_user}" == "node" ]]
[[ "${alpine_user}" == "root" ]]

echo "== 2. BuildKit secret (must not land in history) =="
echo 'super-secret-token' > "${SECRET}"
docker build \
  --secret "id=demo,src=${SECRET}" \
  -t rean-secret:lab11 \
  -f Dockerfile.secret \
  "${ROOT}"
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

echo "Lab 11 helper OK (run the optional Trivy scan from the README yourself)."
