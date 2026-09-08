#!/usr/bin/env bash
# Copy marked + DOMPurify UMD builds into web/assets/js/vendor/ and refresh SRI on HTML pages.
# Run from repo root after bumping versions in web/package.json (or merging a Dependabot PR).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT/web"

echo "== npm ci (web/) =="
npm ci

MARKED_SRC="node_modules/marked/marked.min.js"
PURIFY_SRC="node_modules/dompurify/dist/purify.min.js"
VENDOR="assets/js/vendor"

[[ -f "$MARKED_SRC" ]] || { echo "missing $MARKED_SRC" >&2; exit 1; }
[[ -f "$PURIFY_SRC" ]] || { echo "missing $PURIFY_SRC" >&2; exit 1; }

cp -f "$MARKED_SRC" "$VENDOR/marked.min.js"
cp -f "$PURIFY_SRC" "$VENDOR/purify.min.js"

# License texts ship beside the min builds when present.
if [[ -f node_modules/marked/LICENSE.md ]]; then
  cp -f node_modules/marked/LICENSE.md "$VENDOR/LICENSE.marked.txt"
elif [[ -f node_modules/marked/LICENSE ]]; then
  cp -f node_modules/marked/LICENSE "$VENDOR/LICENSE.marked.txt"
fi
if [[ -f node_modules/dompurify/LICENSE ]]; then
  cp -f node_modules/dompurify/LICENSE "$VENDOR/LICENSE.dompurify.txt"
fi

sha384() {
  openssl dgst -sha384 -binary "$1" | openssl base64 -A
}

MARKED_SRI="sha384-$(sha384 "$VENDOR/marked.min.js")"
PURIFY_SRI="sha384-$(sha384 "$VENDOR/purify.min.js")"

MARKED_VER="$(node -p "require('./node_modules/marked/package.json').version")"
PURIFY_VER="$(node -p "require('./node_modules/dompurify/package.json').version")"

for html in learn.html lab.html; do
  python3 - "$html" "$MARKED_SRI" "$PURIFY_SRI" <<'PY'
import pathlib, re, sys
path = pathlib.Path(sys.argv[1])
marked_sri, purify_sri = sys.argv[2], sys.argv[3]
text = path.read_text(encoding="utf-8")
text2, n1 = re.subn(
    r'<script src="\./assets/js/vendor/marked\.min\.js"[^>]*>\s*</script>',
    f'<script src="./assets/js/vendor/marked.min.js" integrity="{marked_sri}" crossorigin="anonymous"></script>',
    text,
    count=1,
)
text3, n2 = re.subn(
    r'<script src="\./assets/js/vendor/purify\.min\.js"[^>]*>\s*</script>',
    f'<script src="./assets/js/vendor/purify.min.js" integrity="{purify_sri}" crossorigin="anonymous"></script>',
    text2,
    count=1,
)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"Could not update vendor script tags in {path} (marked={n1}, purify={n2})")
path.write_text(text3, encoding="utf-8")
print(f"Updated {path}")
PY
done

# Refresh the version table in the vendor README (first data rows only).
python3 - "$MARKED_VER" "$PURIFY_VER" <<'PY'
import pathlib, re, sys
marked_ver, purify_ver = sys.argv[1], sys.argv[2]
path = pathlib.Path("assets/js/vendor/README.md")
text = path.read_text(encoding="utf-8")
text = re.sub(
    r"(\| \[marked\].*\| )\d+\.\d+\.\d+( \|)",
    rf"\g<1>{marked_ver}\2",
    text,
    count=1,
)
text = re.sub(
    r"(\| \[DOMPurify\].*\| )\d+\.\d+\.\d+( \|)",
    rf"\g<1>{purify_ver}\2",
    text,
    count=1,
)
path.write_text(text, encoding="utf-8")
print(f"Vendor README versions → marked {marked_ver}, DOMPurify {purify_ver}")
PY

cd "$ROOT"
./scripts/check_vendor_sri.sh
echo
echo "Vendor libs refreshed. Commit web/package-lock.json, vendor/*.min.js, learn.html, lab.html, and README."
