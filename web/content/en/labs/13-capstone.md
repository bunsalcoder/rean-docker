# Lab 13 — Capstone

## Goal

Build a small **API + Postgres + Redis** stack that you could show a teammate. Pair with handbook **Chapter 18**.

This folder ships a **day-one runnable baseline** (Compose + Node API) so CI and newcomers can `up` immediately. That baseline is **not** the finish line — Capstone means you **own** the stack (marker: `CAPSTONE_OWN`).

Work in this folder (`labs/13-capstone`) so your capstone stays separate from the teaching labs.

## Requirements

1. `Dockerfile` for the API (baseline pins Node by digest — Chapter 15; multi-stage if you compile/build).
2. `compose.yaml` with `api`, `db`, `redis` (baseline pins Postgres/Redis by digest — Chapter 15).
3. Named volume for Postgres.
4. `.env.example` documenting required variables (no real secrets).
5. Healthchecks on the API and Postgres.
6. API connects using service hostnames `db` and `redis` — not `localhost`.
7. This README (or a section you add) explains `up`, any migrate step, and `down`.

## Own it (`CAPSTONE_OWN`)

Running the baseline unchanged does **not** complete this lab. Change the product so a teammate can tell it is yours. Do **at least two** of these (stretch goals below count):

1. Add a new API route (see `// CAPSTONE_OWN:` in `server.js`) and document it in this README.
2. Rename services or the Compose project and update healthchecks / env docs to match.
3. Turn the API image into a **multi-stage** build (Lab 08) while keeping digests / non-root habits.
4. Ship a reverse proxy (Nginx or Caddy) in front of the API — no reference file on purpose.
5. Customize `compose.prod.yaml` and/or `workflows/ci.yml` beyond copy-paste (limits, scan, your image name).

Optional clean-room restart from Lab 05 if you prefer writing Compose from scratch:

```bash
cp -R ../05-compose/. .
# then restore this README and re-apply digests + your ideas
```

## Stretch goals

- Separate `compose.prod.yaml` with restart policy and resource limits (Chapter 17 / Lab 12)
- Nginx or Caddy reverse proxy in front of the API
- CI job: `docker compose config` + build + smoke + push (pattern: Lab 12’s `workflows/ci.yml`)
- Image scan in CI (Lab 11)

**Optional references** (prefer writing your own first): this folder includes baseline `compose.prod.yaml` and `workflows/ci.yml` patterned on Lab 12. Validate prod config with:

```bash
REGISTRY_OWNER=example IMAGE_REF=:sha-deadbee \
  docker compose -f compose.prod.yaml config
```

## Suggested start

```bash
cd labs/13-capstone
cp .env.example .env
docker compose up --build
curl -s http://localhost:3000/health
curl -s http://localhost:3000/ | python3 -m json.tool
docker compose down
```

Then apply your `CAPSTONE_OWN` changes and re-run the curls (plus any new route).

## Run / tear down

| Command | What it does |
|---------|----------------|
| `docker compose up --build` | Build the API image and start `api`, `db`, `redis` |
| `curl http://localhost:3000/health` | Confirm dependencies are reachable |
| `docker compose down` | Stop containers; **keep** the named volume |
| `docker compose down -v` | Stop containers and **delete** `pgdata` |

## Success criteria

- [ ] `docker compose up --build` starts all services
- [ ] `/health` is green and the API talks to both `db` and `redis`
- [ ] `.env` is gitignored; `.env.example` is committed
- [ ] You can tear down with `docker compose down` and explain what `-v` would delete
- [ ] `CAPSTONE_OWN`: at least two ownership changes from the list above are done and noted in this README

You are done with the guided path. Next steps: containerize an app you already know, then wire Chapter 17’s pipeline to it.
