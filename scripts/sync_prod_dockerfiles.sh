#!/usr/bin/env bash
# Copy the Lab 09 "golden" prod Dockerfile into Labs 12 and 13.
# Those three must stay byte-identical (see check_lab_invariants.sh).
# Edit labs/09-production/Dockerfile, then run: make sync-prod-dockerfiles
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SRC="labs/09-production/Dockerfile"
TARGETS=(
  labs/12-ci-cd/Dockerfile
  labs/13-capstone/Dockerfile
)

if [[ ! -f "$SRC" ]]; then
  echo "Missing source: $SRC" >&2
  exit 1
fi

for dest in "${TARGETS[@]}"; do
  cp "$SRC" "$dest"
  echo "Synced $SRC → $dest"
done

echo
echo "Prod Dockerfiles synced. Verify with: make check-lab-invariants"
