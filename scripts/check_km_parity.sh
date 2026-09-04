#!/usr/bin/env bash
# Stricter Khmer parity checks beyond structure (check_km_content.sh).
# Flags drift in checklists, code blocks, and teaching invariants that must
# stay aligned even when prose is hand-translated.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EN_DIR="web/content/en"
KM_DIR="web/content/km"

fail=0

count_matches() {
  local pattern="$1"
  local file="$2"
  grep -cE "$pattern" "$file" 2>/dev/null || true
}

check_lab_pair() {
  local rel="$1"
  local en="$EN_DIR/labs/${rel}.md"
  local km="$KM_DIR/labs/${rel}.md"
  [[ -f "$en" && -f "$km" ]] || return 0

  local en_checks km_checks en_fences km_fences
  en_checks="$(count_matches '^- \[ \]' "$en")"
  km_checks="$(count_matches '^- \[ \]' "$km")"
  en_fences="$(count_matches '^```' "$en")"
  km_fences="$(count_matches '^```' "$km")"

  if [[ "$en_checks" != "$km_checks" ]]; then
    echo "DRIFT: $rel checklist items EN=$en_checks KM=$km_checks"
    fail=1
  fi
  if [[ "$en_fences" != "$km_fences" ]]; then
    echo "DRIFT: $rel code fences EN=$en_fences KM=$km_fences"
    fail=1
  fi
}

require_in_both() {
  local label="$1"
  local pattern="$2"
  local en="$3"
  local km="$4"
  if grep -qE "$pattern" "$en" && ! grep -qE "$pattern" "$km"; then
    echo "DRIFT: $label missing in Khmer ($km)"
    fail=1
  fi
}

echo "== Lab parity =="
for en_file in "$EN_DIR"/labs/*.md; do
  check_lab_pair "$(basename "$en_file" .md)"
done

echo
echo "== Teaching invariants =="

require_in_both "Lab 01 .share hint" '\.share/' \
  "$EN_DIR/labs/01-isolation-basics.md" "$KM_DIR/labs/01-isolation-basics.md"
require_in_both "Lab 07 .bind hint" '\.bind' \
  "$EN_DIR/labs/07-volumes.md" "$KM_DIR/labs/07-volumes.md"
require_in_both "Lab 10 compose.fixed" 'compose\.fixed\.yaml' \
  "$EN_DIR/labs/10-debugging.md" "$KM_DIR/labs/10-debugging.md"
require_in_both "Lab 03 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/03-dockerfile.md" "$KM_DIR/labs/03-dockerfile.md"
require_in_both "Lab 04 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/04-env-secrets.md" "$KM_DIR/labs/04-env-secrets.md"
require_in_both "Lab 05 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/05-compose.md" "$KM_DIR/labs/05-compose.md"
require_in_both "Lab 08 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/08-multi-stage.md" "$KM_DIR/labs/08-multi-stage.md"
require_in_both "Lab 09 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/09-production.md" "$KM_DIR/labs/09-production.md"
require_in_both "Lab 09 npm strip" 'npm.*corepack|corepack.*npm' \
  "$EN_DIR/labs/09-production.md" "$KM_DIR/labs/09-production.md"
require_in_both "Lab 11 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/11-security.md" "$KM_DIR/labs/11-security.md"
require_in_both "Lab 11 Trivy gate" 'unfixed CRITICAL' \
  "$EN_DIR/labs/11-security.md" "$KM_DIR/labs/11-security.md"
require_in_both "Lab 11 Chapter 16 stretch" 'Chapter 16|ជំពូក 16' \
  "$EN_DIR/labs/11-security.md" "$KM_DIR/labs/11-security.md"
require_in_both "Lab 12 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/12-ci-cd.md" "$KM_DIR/labs/12-ci-cd.md"
require_in_both "Lab 12 IMAGE_REF" 'IMAGE_REF' \
  "$EN_DIR/labs/12-ci-cd.md" "$KM_DIR/labs/12-ci-cd.md"
require_in_both "Lab 13 run.sh" '\./run\.sh' \
  "$EN_DIR/labs/13-capstone.md" "$KM_DIR/labs/13-capstone.md"
require_in_both "Lab 13 CAPSTONE_OWN" 'CAPSTONE_OWN' \
  "$EN_DIR/labs/13-capstone.md" "$KM_DIR/labs/13-capstone.md"
require_in_both "Lab 13 compose.prod ref" 'compose\.prod\.yaml' \
  "$EN_DIR/labs/13-capstone.md" "$KM_DIR/labs/13-capstone.md"

require_in_both "Guide IMAGE_REF" 'IMAGE_REF' \
  "$EN_DIR/guide.md" "$KM_DIR/guide.md"
require_in_both "Guide digest labs note" 'Labs 09|Lab 09' \
  "$EN_DIR/guide.md" "$KM_DIR/guide.md"
require_in_both "Guide Chapter 16 Lab 11 stretch" 'Lab 11' \
  "$EN_DIR/guide.md" "$KM_DIR/guide.md"

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Khmer parity check failed."
  echo "Update web/content/km/ to match teaching structure, then re-run: ./scripts/check_km_parity.sh"
  exit 1
fi

echo "Khmer parity check passed."
