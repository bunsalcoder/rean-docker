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
make check-all   # English copies + Khmer structure + parity
```

Optional: `make sync-km-i18n` (or `python3 scripts/sync_km_i18n.py`) refreshes Khmer chapter titles in `i18n-km.js` from the Khmer handbook.

## Shared Node lab apps

Labs `03`, `05`, `08`, `09`, `12`, and `13` each have their own `package.json` / lockfile on purpose (isolated teaching folders). When bumping Express or other shared deps, update **all six** locks (or merge the Dependabot PRs for each directory). Do not assume a change in one lab propagates.

## Pull requests

CI runs `make check-all`, builds the lab Dockerfiles, smoke-tests labs 04, 05, 09, 12, and 13 (`make smoke`), runs concept-lab helpers (`make smoke-concept`), and fails on unfixed CRITICAL findings from Trivy. The Pages workflow builds the static site (sync + sitemap + search index) on PRs/`develop` and deploys only from `main` — content checks are not duplicated there. Keep secrets out of git (`.env` is ignored; commit `.env.example` only).
