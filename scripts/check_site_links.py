#!/usr/bin/env python3
"""Fail if the static site or content Markdown points at missing local files.

Checks:
  * href / src / srcset on HTML under web/ (relative paths only)
  * url(...) in web/assets/css/*.css
  * relative Markdown links and image paths under web/content/
  * lab folder paths mentioned as labs/<id> in content exist on disk
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
CONTENT = WEB / "content"
LABS = ROOT / "labs"

ATTR_RE = re.compile(
    r"""(?P<attr>\b(?:href|src|srcset)\s*=\s*)(?P<q>["'])(?P<val>[^"']+)(?P=q)""",
    re.I,
)
CSS_URL_RE = re.compile(r"""url\(\s*(['"]?)([^'")]+)\1\s*\)""", re.I)
MD_LINK_RE = re.compile(r"""!\[[^\]]*]\(([^)]+)\)|\[[^\]]*]\(([^)]+)\)""")
LAB_PATH_RE = re.compile(r"""\blabs/([0-9]{2}-[a-z0-9-]+)\b""")

SKIP_SCHEMES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


def is_external(ref: str) -> bool:
    low = ref.strip().lower()
    if low.startswith(SKIP_SCHEMES):
        return True
    if low.startswith("//"):
        return True
    parsed = urlparse(ref)
    return bool(parsed.scheme)


def normalize_ref(ref: str) -> str:
    ref = unquote(ref.strip())
    if ref.startswith("#"):
        return ""
    # Drop query/fragment for existence checks.
    ref = ref.split("?", 1)[0].split("#", 1)[0]
    return ref


def resolve_target(base_file: Path, ref: str) -> Path | None:
    ref = normalize_ref(ref)
    if not ref or is_external(ref):
        return None
    if ref.startswith("/"):
        # Site is published under /rean-docker/ — treat site-root absolute as web/.
        return (WEB / ref.lstrip("/")).resolve()
    return (base_file.parent / ref).resolve()


def collect_html_refs(text: str) -> list[str]:
    refs: list[str] = []
    for m in ATTR_RE.finditer(text):
        attr = m.group("attr").lower()
        val = m.group("val")
        if "srcset" in attr:
            for part in val.split(","):
                refs.append(part.strip().split()[0])
        else:
            refs.append(val)
    return refs


def check_exists(base_file: Path, ref: str, failures: list[str], label: str) -> None:
    target = resolve_target(base_file, ref)
    if target is None:
        return
    try:
        target.relative_to(ROOT)
    except ValueError:
        failures.append(f"{label}: escapes repo via {ref!r} (from {base_file})")
        return
    if not target.exists():
        failures.append(f"{label}: missing {ref!r} → {target.relative_to(ROOT)} (from {base_file.relative_to(ROOT)})")


def main() -> int:
    failures: list[str] = []

    for html in sorted(WEB.rglob("*.html")):
        text = html.read_text(encoding="utf-8")
        for ref in collect_html_refs(text):
            check_exists(html, ref, failures, "HTML")

    for css in sorted((WEB / "assets" / "css").glob("*.css")):
        text = css.read_text(encoding="utf-8")
        for m in CSS_URL_RE.finditer(text):
            check_exists(css, m.group(2), failures, "CSS")

    for md in sorted(CONTENT.rglob("*.md")):
        text = md.read_text(encoding="utf-8")
        for m in MD_LINK_RE.finditer(text):
            ref = m.group(1) or m.group(2) or ""
            check_exists(md, ref, failures, "MD")
        for m in LAB_PATH_RE.finditer(text):
            lab_id = m.group(1)
            lab_dir = LABS / lab_id
            if not lab_dir.is_dir():
                failures.append(
                    f"LAB: missing labs/{lab_id}/ (mentioned in {md.relative_to(ROOT)})"
                )

    # Manifest icons / start_url
    manifest = WEB / "site.webmanifest"
    if manifest.is_file():
        text = manifest.read_text(encoding="utf-8")
        for m in re.finditer(r'"src"\s*:\s*"([^"]+)"', text):
            check_exists(manifest, m.group(1), failures, "manifest")
        for m in re.finditer(r'"start_url"\s*:\s*"([^"]+)"', text):
            check_exists(manifest, m.group(1), failures, "manifest")

    if failures:
        print("Link check failed:")
        for line in failures:
            print(f"  - {line}")
        return 1

    print("Link check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
