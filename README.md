# rean-docker

[![CI](https://github.com/bunsalcoder/rean-docker/actions/workflows/content-sync.yml/badge.svg)](https://github.com/bunsalcoder/rean-docker/actions/workflows/content-sync.yml)
[![Pages](https://github.com/bunsalcoder/rean-docker/actions/workflows/pages.yml/badge.svg)](https://bunsalcoder.github.io/rean-docker/)

Learn Docker from absolute beginner to advanced — guided path with a full handbook, runnable labs, and a responsive static learning site.

## Learning website (UI)

Serve the static site from the repo root:

```bash
make serve
```

Then open [http://localhost:5501](http://localhost:5501). Same port as the VS Code / Cursor **Live Server** extension (`.vscode/settings.json`). Override with `make serve PORT=8080` if needed.

The live site deploys from **`main`** via GitHub Pages ([bunsalcoder.github.io/rean-docker](https://bunsalcoder.github.io/rean-docker/)). Content checks and lab smoke/scan run once in the **CI** workflow. Pushes and PRs on `develop` still **dry-run** the Pages build (sync + sitemap + search index) so site regressions fail before merge — they do not publish.

Equivalent without Make:

```bash
cd web && python3 -m http.server 5501
```

| Page | Purpose |
|------|---------|
| `web/index.html` | Home / brand landing |
| `web/learn.html` | Handbook chapters (sidebar reader) |
| `web/labs.html` | Labs index |
| `web/lab.html` | Individual lab instructions |

Use the **EN / ខ្មែរ** control in the header to switch language. Choice is saved in `localStorage` (`rean-locale`) and reflected in the URL as `?lang=km` (shareable Khmer links).

Localized lesson Markdown lives under:

- `web/content/en/` — English handbook + labs
- `web/content/km/` — Khmer handbook + labs

If a Khmer file is missing, the site falls back to English for that page.

> The Learn and Lab pages load Markdown over HTTP, so open them via a local server (not as `file://`).

## Handbook (Markdown)

**[docs/DOCKER_FROM_ZERO_TO_HERO.md](docs/DOCKER_FROM_ZERO_TO_HERO.md)**

It covers containerization foundations (beginner), commands, Compose, volumes, networks, multi-stage builds, production habits, security, a special deploy/CI/CD chapter, and a capstone project.

English site copies must match the handbook and lab READMEs. After editing either source, sync (or verify) with:

```bash
make sync    # copy sources → web/content/en/
make check   # fail if anything drifted
make ci-local    # check-all + sitemap + search index (CI content gate)
make smoke          # optional: compose smoke for labs 04, 05, 09, 12, 13
make smoke-concept  # optional: run.sh helpers for labs 01, 02, 06, 07, 08, 10, 11
```

Or run the scripts directly: `./scripts/sync_en_content.sh` / `./scripts/check_content_sync.sh`.

### Khmer content

Khmer files under `web/content/km/` are **hand-translated**, so they are not byte-copied from English. Instead they must keep the same structure the reader relies on to split chapters and labs. Verify with:

```bash
make check-km    # fail if Khmer drifted from the English structure
make check-km-parity  # fail if Khmer labs drift in checklists, code blocks, or teaching invariants
make check-all   # run English + Khmer structure + parity checks
```

`make check-km` (`./scripts/check_km_content.sh`) confirms that:

- every English content file has a non-empty Khmer counterpart (and flags orphan Khmer files),
- the Khmer handbook keeps the same numbered chapters (`## 1.` … `## N.`) as English,
- the intro (**How to use**) and **Table of contents** headings exist so the reader can split the guide.

`make check-km-parity` (`./scripts/check_km_parity.sh`) additionally flags drift in lab checklist counts, code-fence counts, and key teaching strings (e.g. `IMAGE_REF`, optional helper hints) that must stay aligned across languages.

When you add a chapter or lab, translate the matching Khmer file (keeping the `## N.` numbered headings) and re-run `make check-all`. All three checks run in CI on every push and PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Labs (hands-on)

Work in order:

| Lab | Topic | Path |
|-----|--------|------|
| 01 | Isolation basics (beginner) | [labs/01-isolation-basics](labs/01-isolation-basics) (`run.sh`) |
| 02 | First containers | [labs/02-hello](labs/02-hello) (`run.sh`) |
| 03 | Dockerfile | [labs/03-dockerfile](labs/03-dockerfile) (`run.sh`) |
| 04 | Env, secrets, and config | [labs/04-env-secrets](labs/04-env-secrets) (`run.sh`) |
| 05 | Compose (API + Postgres + Redis) | [labs/05-compose](labs/05-compose) (`run.sh`) |
| 06 | Networks | [labs/06-networks](labs/06-networks) (`run.sh` / Compose) |
| 07 | Volumes | [labs/07-volumes](labs/07-volumes) (`run.sh` / Compose) |
| 08 | Multi-stage builds | [labs/08-multi-stage](labs/08-multi-stage) (`run.sh`) |
| 09 | Production practices | [labs/09-production](labs/09-production) (`run.sh`) |
| 10 | Debugging & troubleshooting | [labs/10-debugging](labs/10-debugging) (`run.sh`) |
| 11 | Security essentials | [labs/11-security](labs/11-security) (`run.sh`; Chapter 16 stretch) |
| 12 | Deploy & CI/CD (special) | [labs/12-ci-cd](labs/12-ci-cd) (`run.sh`) |
| 13 | Capstone (own the baseline) | [labs/13-capstone](labs/13-capstone) (`run.sh`) |

## Prerequisites

- Docker Engine + Compose plugin (`docker compose version`)
- `curl` (labs that hit `/health`)
- A terminal and curiosity
- Optional: Python 3 (`make serve` and pretty-printing JSON in a few labs)

On Windows, prefer **WSL2**. Some bind-mount examples use `/tmp`; use a folder in this repo if that path is awkward.

Verify:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

## Suggested pace

Follow the **Suggested weekly plan** section at the end of the handbook. Do not skip labs — typing the commands is the learning.

## PDF export (optional)

**From the site:** open a chapter in [Learn](./web/learn.html) or a lab page, then use **Print** (or your browser’s Print → Save as PDF). Chrome UI and the sidebar are hidden for a clean page.

**From the handbook Markdown:**

```bash
# Option A: pandoc (if installed)
pandoc docs/DOCKER_FROM_ZERO_TO_HERO.md -o docs/DOCKER_FROM_ZERO_TO_HERO.pdf

# Option B: open the Markdown in VS Code / Cursor and use "Markdown PDF" or print to PDF from preview
```

## License

Handbook, lab instructions, and website copy: [CC BY 4.0](LICENSE). Example code under `labs/`: MIT (see [LICENSE](LICENSE)).
