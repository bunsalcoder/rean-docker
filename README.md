# rean-docker

Learn Docker from absolute beginner to advanced — guided path with a full handbook, runnable labs, and a responsive static learning site.

## Learning website (UI)

Open the static site in `web/`:

```bash
cd path/to/rean-docker/web
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

| Page | Purpose |
|------|---------|
| `web/index.html` | Home / brand landing |
| `web/learn.html` | Handbook chapters (sidebar reader) |
| `web/labs.html` | Labs index |
| `web/lab.html` | Individual lab instructions |

> The Learn and Lab pages load Markdown over HTTP, so open them via a local server (not as `file://`).

## Handbook (Markdown)

**[docs/DOCKER_FROM_ZERO_TO_HERO.md](docs/DOCKER_FROM_ZERO_TO_HERO.md)**

It covers containerization foundations (beginner), commands, Compose, volumes, networks, multi-stage builds, production habits, security, and a capstone project.

## Labs (hands-on)

Work in order:

| Lab | Topic | Path |
|-----|--------|------|
| 01 | Isolation basics (beginner) | [labs/01-isolation-basics](labs/01-isolation-basics) |
| 02 | First containers | [labs/02-hello](labs/02-hello) |
| 03 | Dockerfile | [labs/03-dockerfile](labs/03-dockerfile) |
| 04 | Compose (API + Postgres + Redis) | [labs/04-compose](labs/04-compose) |
| 05 | Networks | [labs/05-networks](labs/05-networks) |
| 06 | Volumes | [labs/06-volumes](labs/06-volumes) |
| 07 | Multi-stage builds | [labs/07-multi-stage](labs/07-multi-stage) |
| 08 | Production practices | [labs/08-production](labs/08-production) |

## Prerequisites

- Docker Engine + Compose plugin (`docker compose version`)
- A terminal and curiosity

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

Learning material for personal use in the rean-docker project.
