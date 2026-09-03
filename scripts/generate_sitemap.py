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


def with_lang(path: str, lang: str | None) -> str:
    if not lang:
        return path
    joiner = "&" if "?" in path else "?"
    return f"{path}{joiner}lang={lang}"


def absolute(base: str, path: str) -> str:
    return f"{base}/{path}" if path else f"{base}/"


def url_entry(base: str, path: str, changefreq: str, priority: str, lastmod: str) -> str:
    # Canonical EN loc + xhtml hreflang alternates for KM / x-default.
    en_loc = absolute(base, path)
    km_loc = absolute(base, with_lang(path, "km"))
    return (
        "  <url>\n"
        f"    <loc>{escape(en_loc)}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        f'    <xhtml:link rel="alternate" hreflang="en" href="{escape(en_loc)}" />\n'
        f'    <xhtml:link rel="alternate" hreflang="km" href="{escape(km_loc)}" />\n'
        f'    <xhtml:link rel="alternate" hreflang="x-default" href="{escape(en_loc)}" />\n'
        "  </url>"
    )


def main() -> int:
    text = ROUTES_JS.read_text(encoding="utf-8")
    chapter_ids, lab_ids = parse_routes(text)
    base = base_url()
    lastmod = date.today().isoformat()

    paths: list[tuple[str, str, str]] = [
        ("index.html", "weekly", "1.0"),
        ("learn.html", "weekly", "0.9"),
        ("labs.html", "weekly", "0.9"),
    ]
    for chapter_id in chapter_ids:
        paths.append((f"learn.html?c={chapter_id}", "monthly", "0.8"))
    for lab_id in lab_ids:
        paths.append((f"lab.html?id={lab_id}", "monthly", "0.8"))

    entries = [url_entry(base, path, freq, prio, lastmod) for path, freq, prio in paths]

    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
        '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
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
