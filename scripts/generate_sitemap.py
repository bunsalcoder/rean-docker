#!/usr/bin/env python3
"""Generate web/robots.txt and web/sitemap.xml from routes.js route definitions."""

from __future__ import annotations

import os
import re
import sys
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
ROUTES_JS = WEB / "assets/js/routes.js"


def base_url() -> str:
    if site_url := os.environ.get("SITE_URL", "").strip():
        return site_url.rstrip("/")
    if repo := os.environ.get("GITHUB_REPOSITORY", "").strip():
        owner, name = repo.split("/", 1)
        return f"https://{owner}.github.io/{name}"
    return "https://bunsalcoder.github.io/rean-docker"


def parse_routes(text: str) -> tuple[list[str], list[str]]:
    chapters_block = re.search(r"const CHAPTERS = \[(.*?)\];", text, re.S)
    labs_block = re.search(r"const LAB_DEFS = \[(.*?)\];", text, re.S)
    if not chapters_block or not labs_block:
        raise SystemExit(f"Could not parse route tables in {ROUTES_JS}")

    chapter_ids = re.findall(r'id: "([^"]+)"', chapters_block.group(1))
    lab_ids = re.findall(r'id: "([^"]+)"', labs_block.group(1))
    if not chapter_ids:
        raise SystemExit(f"No chapter routes found in {ROUTES_JS}")
    if not lab_ids:
        raise SystemExit(f"No lab routes found in {ROUTES_JS}")
    return chapter_ids, lab_ids


def url_entry(base: str, path: str, changefreq: str, priority: str, lastmod: str) -> str:
    # These locs are the canonical reader URLs (query strings on learn.html / lab.html).
    loc = f"{base}/{path}" if path else f"{base}/"
    return (
        "  <url>\n"
        f"    <loc>{escape(loc)}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        "  </url>"
    )


def with_lang(path: str, lang: str | None) -> str:
    if not lang:
        return path
    joiner = "&" if "?" in path else "?"
    return f"{path}{joiner}lang={lang}"


def main() -> int:
    text = ROUTES_JS.read_text(encoding="utf-8")
    chapter_ids, lab_ids = parse_routes(text)
    base = base_url()
    lastmod = date.today().isoformat()

    entries = [
        url_entry(base, "index.html", "weekly", "1.0", lastmod),
        url_entry(base, with_lang("index.html", "km"), "weekly", "0.9", lastmod),
        url_entry(base, "learn.html", "weekly", "0.9", lastmod),
        url_entry(base, with_lang("learn.html", "km"), "weekly", "0.8", lastmod),
        url_entry(base, "labs.html", "weekly", "0.9", lastmod),
        url_entry(base, with_lang("labs.html", "km"), "weekly", "0.8", lastmod),
    ]
    for chapter_id in chapter_ids:
        entries.append(
            url_entry(
                base,
                f"learn.html?c={chapter_id}",
                "monthly",
                "0.8",
                lastmod,
            )
        )
        entries.append(
            url_entry(
                base,
                with_lang(f"learn.html?c={chapter_id}", "km"),
                "monthly",
                "0.7",
                lastmod,
            )
        )
    for lab_id in lab_ids:
        entries.append(
            url_entry(
                base,
                f"lab.html?id={lab_id}",
                "monthly",
                "0.8",
                lastmod,
            )
        )
        entries.append(
            url_entry(
                base,
                with_lang(f"lab.html?id={lab_id}", "km"),
                "monthly",
                "0.7",
                lastmod,
            )
        )

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
    robots = (
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        f"Sitemap: {base}/sitemap.xml\n"
    )

    (WEB / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (WEB / "robots.txt").write_text(robots, encoding="utf-8")
    print(f"Wrote {WEB / 'robots.txt'} and {WEB / 'sitemap.xml'} ({len(entries)} URLs, base {base})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
