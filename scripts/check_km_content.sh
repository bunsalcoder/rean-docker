#!/usr/bin/env bash
# Guard the Khmer site content against structural drift from the English sources.
#
# Khmer is a human translation, so we cannot byte-compare it (that's what
# check_content_sync.sh does for English). Instead we verify the structure the
# reader relies on to render chapters and labs:
#   * every English content file has a Khmer counterpart (and vice versa),
#   * the Khmer handbook keeps the same numbered chapters (## N. ...) as English,
#   * the intro ("How to use") and Table-of-contents anchors exist so learn.js
#     can split the guide into chapters.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

EN_DIR="web/content/en"
KM_DIR="web/content/km"

fail=0

require_file() {
  local label="$1"
  local path="$2"
  if [[ ! -f "$path" ]]; then
    echo "MISSING $label: $path"
    fail=1
    return 1
  fi
  if [[ ! -s "$path" ]]; then
    echo "EMPTY   $label: $path"
    fail=1
    return 1
  fi
  return 0
}

echo "== File coverage =="

# Every English file must have a non-empty Khmer counterpart.
mapfile -t en_files < <(cd "$EN_DIR" && find . -type f -name '*.md' | sort)
for rel in "${en_files[@]}"; do
  rel="${rel#./}"
  if require_file "KM copy" "$KM_DIR/$rel"; then
    echo "OK:    $EN_DIR/$rel  ↔  $KM_DIR/$rel"
  fi
done

# Flag orphan Khmer files with no English counterpart (likely a stale/renamed file).
mapfile -t km_files < <(cd "$KM_DIR" && find . -type f -name '*.md' | sort)
for rel in "${km_files[@]}"; do
  rel="${rel#./}"
  if [[ ! -f "$EN_DIR/$rel" ]]; then
    echo "ORPHAN Khmer file (no English source): $KM_DIR/$rel"
    fail=1
  fi
done

echo
echo "== Handbook structure =="

EN_GUIDE="$EN_DIR/guide.md"
KM_GUIDE="$KM_DIR/guide.md"

if require_file "EN guide" "$EN_GUIDE" && require_file "KM guide" "$KM_GUIDE"; then
  # Numbered chapters the reader splits on, derived from English so the check
  # stays correct as the handbook grows.
  mapfile -t chapter_nums < <(grep -oE '^## [0-9]+\. ' "$EN_GUIDE" | grep -oE '[0-9]+' | sort -n | uniq)

  if [[ "${#chapter_nums[@]}" -eq 0 ]]; then
    echo "WARN: no numbered chapters found in $EN_GUIDE"
  fi

  missing=()
  for n in "${chapter_nums[@]}"; do
    if ! grep -qE "^## ${n}\. " "$KM_GUIDE"; then
      missing+=("$n")
    fi
  done

  if [[ "${#missing[@]}" -ne 0 ]]; then
    echo "DRIFT: Khmer guide is missing numbered chapters: ${missing[*]}"
    echo "       (English has ${#chapter_nums[@]}: ${chapter_nums[*]})"
    fail=1
  else
    echo "OK:    all ${#chapter_nums[@]} numbered chapters present in Khmer guide"
  fi

  # Intro + TOC anchors used by learn.js splitGuide(). Accept either language
  # variant so a partially translated heading still passes.
  if grep -qE '^## (How to use this guide|របៀបប្រើមគ្គុទ្ទេសក៍នេះ)\s*$' "$KM_GUIDE"; then
    echo "OK:    intro (How to use) heading present"
  else
    echo "DRIFT: Khmer guide is missing the intro heading (How to use / របៀបប្រើមគ្គុទ្ទេសក៍នេះ)"
    fail=1
  fi

  if grep -qE '^## (Table of contents|តារាងខ្លឹមសារ)\s*$' "$KM_GUIDE"; then
    echo "OK:    table-of-contents heading present"
  else
    echo "DRIFT: Khmer guide is missing the table-of-contents heading (Table of contents / តារាងខ្លឹមសារ)"
    fail=1
  fi
fi

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Khmer content check failed."
  echo "The Khmer site content drifted from the English structure the reader expects."
  echo "Update files under $KM_DIR to match, then re-run:  ./scripts/check_km_content.sh"
  exit 1
fi

echo "Khmer content check passed."
