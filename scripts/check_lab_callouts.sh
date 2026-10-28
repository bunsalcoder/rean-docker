#!/usr/bin/env bash
# Fail if any lab README (EN source or KM site copy) lacks a teaching callout.
# Labels must match web/assets/js/guide.js enhanceCallouts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EN_RE='\*\*(Expected output|Common error|Hint|Tip|Pitfall):'
KM_RE='\*\*(លទ្ធផលដែលរំពឹងទុក|កំហុសទូទៅ|គន្លឹះ|ណែនាំ|អន្ទាក់):'

fail=0

for readme in labs/*/README.md; do
  lab="$(basename "$(dirname "$readme")")"
  if ! grep -EEq "$EN_RE" "$readme"; then
    echo "FAIL: $readme has no Expected output / Common error / Hint / Tip / Pitfall callout"
    fail=1
  else
    echo "OK:    $readme has a callout"
  fi

  km="web/content/km/labs/${lab}.md"
  if [[ ! -f "$km" ]]; then
    echo "FAIL: missing $km"
    fail=1
    continue
  fi
  if ! grep -EEq "$KM_RE" "$km"; then
    echo "FAIL: $km has no Khmer callout label"
    fail=1
  else
    echo "OK:    $km has a callout"
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "Lab callout checks failed. Add a labeled blockquote (see CONTRIBUTING.md)."
  exit 1
fi
echo "Lab callout checks passed."
