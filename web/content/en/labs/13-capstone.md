# Lab 13 — Capstone

## Goal

Build a small **API + Postgres + Redis** stack that you could show a teammate. Pair with handbook **Chapter 18**.

This folder already has a **starter scaffold** (Compose + Node API) so you can run something on day one, then reshape it with Labs 08–12: multi-stage builds, production Compose, and a CI-shaped workflow.

Work in this folder (`labs/13-capstone`) so your capstone stays separate from the teaching labs.

## Requirements

1. `Dockerfile` for the API (starter pins Node by digest — Chapter 15; multi-stage if you compile/build).
2. `compose.yaml` with `api`, `db`, `redis` (starter pins Postgres/Redis by digest — Chapter 15).
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
cp .env.example .env
docker compose up --build
curl -s http://localhost:3000/health
curl -s http://localhost:3000/ | python3 -m json.tool
docker compose down
```

Make it yours: rename services, change the API responses, add a route, tighten the Dockerfile, or add a prod Compose file. Prefer editing this scaffold over copying Lab 05 again — unless you want a clean room restart:

```bash
# optional clean restart from Lab 05
cp -R ../05-compose/. .
# then restore this README and re-apply your ideas
```

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

You are done with the guided path. Next steps: containerize an app you already know, then wire Chapter 17’s pipeline to it.
