#!/usr/bin/env bash
# Copy canonical English handbook + lab READMEs into web/content/en/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p web/content/en/labs

cp -f docs/DOCKER_FROM_ZERO_TO_HERO.md web/content/en/guide.md
echo "Synced handbook → web/content/en/guide.md"

for lab_dir in labs/*/; do
  name="$(basename "$lab_dir")"
  src="labs/${name}/README.md"
  dst="web/content/en/labs/${name}.md"
  if [[ ! -f "$src" ]]; then
    echo "Skip (no README): $name"
    continue
  fi
  cp -f "$src" "$dst"
  echo "Synced $src → $dst"
done

echo
./scripts/check_content_sync.sh
