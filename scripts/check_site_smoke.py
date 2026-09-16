#!/usr/bin/env python3
"""Lightweight static-site smoke: routes, pages, locale/content paths, search indexes."""

from __future__ import annotations

import json
import re
import sys
import threading
import urllib.error
import urllib.request
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from rean_routes import chapter_ids, lab_ids, load_manifest  # noqa: E402
from serve_web import PagesLikeHandler  # noqa: E402


class QuietHandler(PagesLikeHandler):
    def log_message(self, fmt, *args):  # noqa: ARG002
        return


HTML_PAGES = ("index.html", "learn.html", "labs.html", "lab.html", "404.html")
REQUIRED_SCRIPTS = (
    "assets/js/boot.js",
    "assets/js/routes.js",
    "assets/js/i18n.js",
)
CSP_RE = re.compile(
    r'<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]+"\s*/?>',
    re.I,
)


def fetch(url: str) -> tuple[int, str]:
    try:
        with urllib.request.urlopen(url, timeout=5) as res:
            return res.status, res.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="replace")
        return err.code, body


def main() -> int:
    data = load_manifest()
    chapters = chapter_ids(data)
    labs = lab_ids(data)
    fail = 0

    for page in HTML_PAGES:
        path = WEB / page
        text = path.read_text(encoding="utf-8")
        if not CSP_RE.search(text):
            print(f"FAIL: {page} missing CSP meta")
            fail = 1
        else:
            print(f"OK:    {page} has CSP")
        for script in REQUIRED_SCRIPTS:
            if script not in text:
                print(f"FAIL: {page} missing {script}")
                fail = 1

    for locale in ("en", "km"):
        index_path = WEB / "assets" / f"search-index-{locale}.json"
        payload = json.loads(index_path.read_text(encoding="utf-8"))
        docs = payload.get("docs") or []
        expected = len(chapters) + len(labs)
        if len(docs) < expected:
            print(f"FAIL: {index_path.name} has {len(docs)} docs; expected ≥ {expected}")
            fail = 1
        else:
            print(f"OK:    {index_path.name} ({len(docs)} docs)")

    for lab_id in labs:
        for locale in ("en", "km"):
            lab_md = WEB / "content" / locale / "labs" / f"{lab_id}.md"
            if not lab_md.is_file():
                print(f"FAIL: missing {lab_md.relative_to(ROOT)}")
                fail = 1

    handler = partial(QuietHandler, directory=str(WEB))
    httpd = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{port}"

    try:
        checks = [
            "/index.html",
            "/learn.html",
            "/learn.html?lang=km",
            "/labs.html?lang=km",
            f"/lab.html?id={labs[0]}",
            f"/lab.html?id={labs[0]}&lang=km",
            "/assets/routes.json",
            "/assets/js/routes.js",
            "/assets/search-index-en.json",
            "/assets/search-index-km.json",
            "/content/en/guide.md",
            "/content/km/guide.md",
        ]
        for path in checks:
            code, body = fetch(f"{base}{path}")
            if code != 200 or not body.strip():
                print(f"FAIL: GET {path} → {code}")
                fail = 1
            else:
                print(f"OK:    GET {path} → {code}")

        code, body = fetch(f"{base}/definitely-missing-page")
        if code != 404 or "404" not in body:
            print(f"FAIL: missing page should 404 with 404.html body (got {code})")
            fail = 1
        else:
            print("OK:    missing page → 404 + 404.html")
    finally:
        httpd.shutdown()

    if fail:
        print("Site smoke failed.")
        return 1
    print("Site smoke passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
