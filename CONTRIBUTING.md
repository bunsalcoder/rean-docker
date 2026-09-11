# Contributing

Handbook English is canonical in `docs/DOCKER_FROM_ZERO_TO_HERO.md`. Lab English is canonical in each `labs/*/README.md`. The site copies under `web/content/en/` must match those sources.

## Edit English, then sync

```bash
# after changing the handbook or a lab README:
make sync    # copy sources → web/content/en/
make check   # fail if anything drifted
```

## Khmer

Files under `web/content/km/` are **hand-translated**. Keep the same numbered chapter headings (`## 1.` … `## 20.`) and the intro / table-of-contents titles so the reader can split the guide.

When you add a chapter or lab:

1. Translate the matching Khmer file (same `## N.` headings).
2. If you add a lab folder, add `web/content/km/labs/<folder>.md`.
3. Update lab strings in `web/assets/js/i18n.js` and `web/assets/js/i18n-km.js`.
4. Run:

```bash
make check-km    # structure only (not a byte-for-byte translation check)
make check-km-parity  # checklist/code-fence counts + teaching invariants (IMAGE_REF, run.sh hints, etc.)
make check-links # HTML/CSS/MD local link targets + labs/<id> mentions
make check-all   # English copies + Khmer structure + parity + links
```

Optional: `make sync-km-i18n` (or `python3 scripts/sync_km_i18n.py`) refreshes Khmer chapter titles in `i18n-km.js` from the Khmer handbook.

## Shared Node lab apps

Labs `03`, `05`, `08`, `09`, `12`, and `13` each have their own `package.json` / lockfile on purpose (isolated teaching folders). When bumping Express or other shared deps, update **all six** locks (or merge the Dependabot PRs for each directory). Do not assume a change in one lab propagates.

| Lab | App shape | Hardening notes |
|-----|-----------|-----------------|
| 03 | Express hello | Floating `FROM` tag; pre-hardening |
| 05 | API + Postgres + Redis | Digest-pinned Node API; floating Compose tags for db/redis |
| 08 | TypeScript multi-stage | Slim digest-pinned; fat floating contrast |
| 09 | Prod-minded API | Digest-pinned Node; Dependabot docker |
| 12 | Deploy/CI API | Digest-pinned Node; Dependabot docker |
| 13 | Capstone baseline | Digest-pinned Node + Compose db/redis |

## Compose image digests (Lab 13)

Dependabot’s `docker` ecosystem updates Dockerfiles, not Compose `image: …@sha256:` pins. After you intentionally upgrade Postgres/Redis series tags (or Hub moved the tag):

```bash
make refresh-digests          # rewrite Lab 13 compose.yaml + compose.prod.yaml
# optional: make refresh-digests-check   # fail if pins ≠ current Hub digests
```

A weekly GitHub Actions workflow runs `make refresh-digests-check` so Compose pins cannot age silently. Lab 05 keeps floating Compose tags on purpose — do not “fix” those to digests until Capstone / Chapter 15.

## Site vendor libraries (marked / DOMPurify)

Self-hosted under `web/assets/js/vendor/` (no CDN). Versions are tracked in `web/package.json` for Dependabot. After a bump:

```bash
./scripts/vendor_site_libs.sh   # copy UMD builds + refresh SRI on learn.html / lab.html
make check-vendor-sri
```

## Pull requests

CI runs `make check-all` (English sync, Khmer structure/parity, local site link checks, and vendor SRI), builds the lab Dockerfiles, smoke-tests labs 04, 05, 09, 12, and 13 via their `run.sh` helpers (`make smoke`), runs concept-lab helpers including Lab 03 (`make smoke-concept`), and fails on unfixed CRITICAL findings from Trivy for Labs **05, 08 (slim), 09, 12, and 13**. Early or intentional anti-pattern images (03, 08-fat, leaky, secret demo) are built but not CRITICAL-gated. The Pages workflow deploys from `main` **only after CI succeeds**; PRs dry-run the site build. Keep secrets out of git (`.env` is ignored; commit `.env.example` only). After content that affects SEO/search, run `make sitemap` and commit the generated files so CI’s dirty-tree check stays green.
