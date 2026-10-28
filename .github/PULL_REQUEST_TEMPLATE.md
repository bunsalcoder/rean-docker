## Summary

<!-- What changed and why (1–3 bullets). -->

-

## Checklist

- [ ] Target branch is **`develop`** (not `main`, unless this is a promote PR)
- [ ] `make ci-local` passes locally (preferred one-shot: sync + checks + sitemap dirty-tree)
- [ ] English content synced if handbook/lab READMEs changed (`make sync` / `make check`)
- [ ] Khmer structure + parity still green (`make check-km` / `make check-km-parity`) when KM files changed
- [ ] Lab callouts present if you edited a lab (`make check-lab-callouts`)
- [ ] **Required after content/route edits:** `make sitemap` and commit `web/learn/`, `web/lab/`, `web/sitemap.xml`, `web/robots.txt`, `web/assets/search-index-*.json` (CI fails on drift)
- [ ] Shared Node dep bumps use `make bump-node-deps` (not six separate lab PRs)
- [ ] No secrets committed (`.env` stays ignored; `.env.example` only)

## Test plan

<!-- How you verified: commands, pages clicked, labs smoked. -->

-
