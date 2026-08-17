# Lab 13 — Capstone

## Goal

Build a small **API + Postgres + Redis** stack that you could show a teammate. Pair with handbook **Chapter 18**.

You may copy Lab 05 (`labs/05-compose`) as a starting point, then apply Labs 08–12: multi-stage (if you compile), production Compose, and a CI-shaped workflow.

Work in this folder (`labs/13-capstone`) so your capstone stays separate from the teaching labs.

## Requirements

1. `Dockerfile` for the API (multi-stage if you compile/build).
2. `compose.yaml` with `api`, `db`, `redis`.
3. Named volume for Postgres.
4. `.env.example` documenting required variables (no real secrets).
5. Healthchecks on the API and Postgres.
6. API connects using service hostnames `db` and `redis` — not `localhost`.
7. This README (or a section you add) explains `up`, any migrate step, and `down`.

## Stretch goals

- Separate `compose.prod.yaml` with restart policy and resource limits (Chapter 17 / Lab 12)
- Nginx or Caddy reverse proxy in front of the API
- CI job: `docker compose config` + build + smoke + push (copy Lab 12’s `workflows/ci.yml`)
- Image scan in CI (Lab 11)

## Suggested start

```bash
cd labs/13-capstone
cp -R ../05-compose/. .
# remove what you don’t need, then make it yours
cp .env.example .env
docker compose up --build
```

## Success criteria

- [ ] `docker compose up --build` starts all services
- [ ] `/health` is green and the API talks to both `db` and `redis`
- [ ] `.env` is gitignored; `.env.example` is committed
- [ ] You can tear down with `docker compose down` and explain what `-v` would delete

You are done with the guided path. Next steps: containerize an app you already know, then wire Chapter 17’s pipeline to it.
