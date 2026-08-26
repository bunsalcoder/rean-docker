# rean-docker

Learn Docker from absolute beginner to advanced — guided path with a full handbook, runnable labs, and a responsive static learning site.

## Learning website (UI)

Serve the static site from the repo root:

```bash
make serve
```

Then open [http://localhost:5501](http://localhost:5501). Same port as the VS Code / Cursor **Live Server** extension (`.vscode/settings.json`). Override with `make serve PORT=8080` if needed.

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

Use the **EN / ខ្មែរ** control in the header to switch language. Choice is saved in `localStorage` (`rean-locale`).

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
make smoke   # optional: compose smoke for labs 04, 05, 09, 12, 13
```

Or run the scripts directly: `./scripts/sync_en_content.sh` / `./scripts/check_content_sync.sh`.

### Khmer content

Khmer files under `web/content/km/` are **hand-translated**, so they are not byte-copied from English. Instead they must keep the same structure the reader relies on to split chapters and labs. Verify with:

```bash
make check-km    # fail if Khmer drifted from the English structure
make check-all   # run both English + Khmer checks
```

`make check-km` (`./scripts/check_km_content.sh`) confirms that:

- every English content file has a non-empty Khmer counterpart (and flags orphan Khmer files),
- the Khmer handbook keeps the same numbered chapters (`## 1.` … `## N.`) as English,
- the intro (**How to use**) and **Table of contents** headings exist so the reader can split the guide.

When you add a chapter or lab, translate the matching Khmer file (keeping the `## N.` numbered headings) and re-run `make check-all`. Both checks run in CI on every push and PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Labs (hands-on)

Work in order:

| Lab | Topic | Path |
|-----|--------|------|
| 01 | Isolation basics (beginner) | [labs/01-isolation-basics](labs/01-isolation-basics) |
| 02 | First containers | [labs/02-hello](labs/02-hello) |
| 03 | Dockerfile | [labs/03-dockerfile](labs/03-dockerfile) |
| 04 | Env, secrets, and config | [labs/04-env-secrets](labs/04-env-secrets) |
| 05 | Compose (API + Postgres + Redis) | [labs/05-compose](labs/05-compose) |
| 06 | Networks | [labs/06-networks](labs/06-networks) |
| 07 | Volumes | [labs/07-volumes](labs/07-volumes) |
| 08 | Multi-stage builds | [labs/08-multi-stage](labs/08-multi-stage) |
| 09 | Production practices | [labs/09-production](labs/09-production) |
| 10 | Debugging & troubleshooting | [labs/10-debugging](labs/10-debugging) |
| 11 | Security essentials | [labs/11-security](labs/11-security) |
| 12 | Deploy & CI/CD (special) | [labs/12-ci-cd](labs/12-ci-cd) |
| 13 | Capstone (starter scaffold) | [labs/13-capstone](labs/13-capstone) |

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

If you want a PDF of the handbook:

```bash
# Option A: pandoc (if installed)
pandoc docs/DOCKER_FROM_ZERO_TO_HERO.md -o docs/DOCKER_FROM_ZERO_TO_HERO.pdf

# Option B: open the Markdown in VS Code / Cursor and use "Markdown PDF" or print to PDF from preview
```

## License

Handbook, lab instructions, and website copy: [CC BY 4.0](LICENSE). Example code under `labs/`: MIT (see [LICENSE](LICENSE)).
