#!/usr/bin/env bash
# Optional helper for Lab 13 — baseline Compose smoke (ownership work stays manual).
# Prefer typing the README commands yourself the first time.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

cleanup() {
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

cp -f .env.example .env

echo "== Validate Compose =="
docker compose -f compose.yaml config >/dev/null
REGISTRY_OWNER=example IMAGE_REF=:sha-deadbee \
  docker compose -f compose.prod.yaml config >/dev/null

echo "== Baseline smoke =="
docker compose up -d --build --wait --wait-timeout 120
curl -fsS http://127.0.0.1:3000/health
echo

echo "Lab 13 helper OK (baseline only — CAPSTONE_OWN work is still yours)."
