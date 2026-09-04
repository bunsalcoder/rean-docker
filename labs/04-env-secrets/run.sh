#!/usr/bin/env bash
# Optional helper for Lab 04 — env-file + Compose demo + leaky Dockerfile contrast.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
  docker rmi rean-leaky:lab04 >/dev/null 2>&1 || true
}
trap cleanup EXIT

cp -f .env.example .env

echo "== Runtime --env-file =="
docker run --rm --env-file .env alpine:3.22 \
  sh -c 'printenv GREETING; printenv DB_PASSWORD' | tee /tmp/rean-lab04-env.out
grep -Fq 'hello-from-env-file' /tmp/rean-lab04-env.out
grep -Fq 'change-me-now' /tmp/rean-lab04-env.out

echo "== Compose env_file =="
out="$(docker compose run --rm demo)"
printf '%s\n' "${out}"
printf '%s\n' "${out}" | grep -Fq 'hello-from-env-file'
printf '%s\n' "${out}" | grep -Fq 'change-me-now'

echo "== Leaky Dockerfile (secret in history) =="
docker build -t rean-leaky:lab04 -f Dockerfile.leaky .
docker run --rm rean-leaky:lab04
history="$(docker history --no-trunc rean-leaky:lab04)"
printf '%s\n' "${history}"
printf '%s\n' "${history}" | grep -Fq 'super-secret-do-not-copy'

echo "Lab 04 helper OK."
