#!/usr/bin/env python3
"""Generate web/robots.txt and web/sitemap.xml from web/assets/routes.json."""

from __future__ import annotations

import os
import subprocess
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


def absolute(base: str, path: str) -> str:
    return f"{base}/{path}" if path else f"{base}/"


def static_pair(en_path: str) -> tuple[str, str]:
    """EN static path → (en_path, km twin path). Hubs keep ?lang=km style via with_lang_query."""
    if en_path.endswith(".html") and "/" in en_path and not en_path.endswith(".km.html"):
        return en_path, en_path[:-5] + ".km.html"
    return en_path, en_path


def with_lang_query(path: str, lang: str) -> str:
    joiner = "&" if "?" in path else "?"
    return f"{path}{joiner}lang={lang}"


# Paths whose commits define sitemap lastmod. Checkout mtimes are not stable:
# actions/checkout stamps every file with "now", so a later CI day rewrote lastmod.
CONTENT_LASTMOD_PATHS = (
    "web/assets/routes.json",
    "web/index.html",
    "web/learn.html",
    "web/labs.html",
    "web/lab.html",
    "web/content",
    "labs",
    "docs/DOCKER_FROM_ZERO_TO_HERO.md",
)


def content_lastmod() -> str:
    """Stable lastmod from the latest content commit (or SOURCE_DATE_EPOCH).

    Using date.today() or file mtimes made CI's dirty-tree check fail on a later
    calendar day even when no content changed. Git commit time does not.
    The check and Pages jobs fetch full history so this is not the shallow HEAD.
    """
    if epoch := os.environ.get("SOURCE_DATE_EPOCH", "").strip():
        return datetime.fromtimestamp(int(epoch), tz=timezone.utc).date().isoformat()

    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", *CONTENT_LASTMOD_PATHS],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        result = None
    stamp = (result.stdout or "").strip() if result and result.returncode == 0 else ""
    if stamp.isdigit():
        return datetime.fromtimestamp(int(stamp), tz=timezone.utc).date().isoformat()

    return date.today().isoformat()


def url_entry(
    base: str,
    en_path: str,
    km_path: str,
    changefreq: str,
    priority: str,
    lastmod: str,
) -> str:
    en_loc = absolute(base, en_path)
    km_loc = absolute(base, km_path)
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

    # Hubs stay on SPA shells; chapter/lab locs are crawlable static HTML.
    entries: list[str] = []
    hubs = [
        ("index.html", "weekly", "1.0"),
        ("learn.html", "weekly", "0.9"),
        ("labs.html", "weekly", "0.9"),
    ]
    for path, freq, prio in hubs:
        entries.append(
            url_entry(base, path, with_lang_query(path, "km"), freq, prio, lastmod)
        )
    for chapter_id in chapters:
        en_path = f"learn/{chapter_id}.html"
        _en, km_path = static_pair(en_path)
        entries.append(url_entry(base, en_path, km_path, "monthly", "0.8", lastmod))
    for lab_id in labs:
        en_path = f"lab/{lab_id}.html"
        _en, km_path = static_pair(en_path)
        entries.append(url_entry(base, en_path, km_path, "monthly", "0.8", lastmod))

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
