#!/usr/bin/env python3
"""Generate web/robots.txt and web/sitemap.xml from web/assets/routes.json."""

from __future__ import annotations

import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from rean_routes import chapter_ids, lab_ids, load_manifest  # noqa: E402


def base_url() -> str:
    if site_url := os.environ.get("SITE_URL", "").strip():
        return site_url.rstrip("/")
    if repo := os.environ.get("GITHUB_REPOSITORY", "").strip():
        owner, name = repo.split("/", 1)
        return f"https://{owner}.github.io/{name}"
    return "https://bunsalcoder.github.io/rean-docker"


def with_lang(path: str, lang: str | None) -> str:
    if not lang:
        return path
    joiner = "&" if "?" in path else "?"
    return f"{path}{joiner}lang={lang}"


def absolute(base: str, path: str) -> str:
    return f"{base}/{path}" if path else f"{base}/"


def content_lastmod() -> str:
    """Stable lastmod from content mtimes (or SOURCE_DATE_EPOCH) — not calendar today.

    Using date.today() made CI's dirty-tree check fail every calendar day even when
    no content changed. Derive from sources that feed the site instead.
    """
    if epoch := os.environ.get("SOURCE_DATE_EPOCH", "").strip():
        return datetime.fromtimestamp(int(epoch), tz=timezone.utc).date().isoformat()

    candidates: list[Path] = [
        WEB / "assets" / "routes.json",
        WEB / "index.html",
        WEB / "learn.html",
        WEB / "labs.html",
        WEB / "lab.html",
        ROOT / "docs" / "DOCKER_FROM_ZERO_TO_HERO.md",
    ]
    for folder in (WEB / "content", ROOT / "labs"):
        if folder.is_dir():
            candidates.extend(folder.rglob("*.md"))

    mtimes = [p.stat().st_mtime for p in candidates if p.is_file()]
    if not mtimes:
        return date.today().isoformat()
    return datetime.fromtimestamp(max(mtimes), tz=timezone.utc).date().isoformat()


def url_entry(base: str, path: str, changefreq: str, priority: str, lastmod: str) -> str:
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
    data = load_manifest()
    chapters = chapter_ids(data)
    labs = lab_ids(data)
    base = base_url()
    lastmod = content_lastmod()

    paths: list[tuple[str, str, str]] = [
        ("index.html", "weekly", "1.0"),
        ("learn.html", "weekly", "0.9"),
        ("labs.html", "weekly", "0.9"),
    ]
    for chapter_id in chapters:
        paths.append((f"learn.html?c={chapter_id}", "monthly", "0.8"))
    for lab_id in labs:
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
    print(f"Wrote {WEB / 'robots.txt'} and {WEB / 'sitemap.xml'} ({len(entries)} URLs, base {base}, lastmod {lastmod})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
