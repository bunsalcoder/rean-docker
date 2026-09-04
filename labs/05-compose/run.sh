#!/usr/bin/env bash
# Optional helper for Lab 05 — Compose API + Postgres + Redis smoke.
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

cp -f .env.example .env

echo "== Compose up =="
docker compose up -d --build --wait --wait-timeout 120

echo "== Health =="
curl -fsS http://127.0.0.1:3000/health
echo
curl -fsS http://127.0.0.1:3000/
echo

echo "Lab 05 helper OK."
