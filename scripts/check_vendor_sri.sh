#!/usr/bin/env bash
# Verify self-hosted marked/DOMPurify hashes match integrity= on learn/lab pages.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

sha384_b64() {
  openssl dgst -sha384 -binary "$1" | openssl base64 -A
}

check_file() {
  local html="$1"
  local js="$2"
  local label="$3"
  local expected actual
  expected="sha384-$(sha384_b64 "$js")"
  if ! grep -Fq "integrity=\"${expected}\"" "$html"; then
    actual="$(grep -oE "integrity=\"sha384-[^\"]+\"" "$html" | head -1 || true)"
    echo "DRIFT: ${label} SRI mismatch in ${html}"
    echo "  expected integrity=\"${expected}\""
    echo "  found    ${actual:-<none>}"
    echo "  After replacing ${js}, update integrity= on learn.html and lab.html"
    echo "  (see web/assets/js/vendor/README.md)."
    return 1
  fi
  echo "OK:    ${label} → ${html}"
}

fail=0
for html in web/learn.html web/lab.html; do
  check_file "$html" web/assets/js/vendor/marked.min.js "marked" || fail=1
  check_file "$html" web/assets/js/vendor/purify.min.js "DOMPurify" || fail=1
  if ! grep -Fq 'crossorigin="anonymous"' "$html"; then
    echo "DRIFT: ${html} vendor scripts need crossorigin=\"anonymous\" for SRI"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  echo "Vendor SRI check failed."
  exit 1
fi
echo "Vendor SRI check passed."
