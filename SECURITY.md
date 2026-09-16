# Security Policy

## Supported content

This repository is a **Docker learning curriculum** (handbook, labs, and static site). Report issues that affect:

- Secrets accidentally committed to the repo
- Unsafe defaults in teaching labs that could mislead learners into shipping them unchanged
- Supply-chain problems in pinned images / vendored site libraries
- The published GitHub Pages site (`web/`)

Intentional weak or broken labs (e.g. Lab 04 leaky image, Lab 08 fat image, Lab 10 broken Compose) are teaching material — say so in the report if you are unsure.

## Reporting a vulnerability

Please use [GitHub Security Advisories](https://github.com/bunsalcoder/rean-docker/security/advisories/new) for this repository (private disclosure).

If advisories are unavailable, open a private contact via the repository owner’s GitHub profile.

Do **not** open a public issue for unfixed CRITICAL findings or leaked credentials.

## Site hardening notes

The static site under `web/` uses self-hosted scripts (SRI-checked marked/DOMPurify), Markdown sanitization, and a restrictive **Content-Security-Policy** meta tag on every HTML page. GitHub Pages does not allow custom response headers (`Content-Security-Policy`, `X-Frame-Options`, etc.), so meta CSP is the practical defense-in-depth layer for Pages.

## Response

We aim to acknowledge reports within a few days and ship fixes or clarifying docs on the teaching path as needed.
