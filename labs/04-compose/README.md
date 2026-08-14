# Lab 04 — Docker Compose (API + Postgres + Redis)

## Goal

Run a multi-container app with service DNS, volumes, healthchecks, and config from `.env` (Lab 10).

## Steps

```bash
cd labs/04-compose

cp .env.example .env
# edit POSTGRES_PASSWORD if you want — never commit .env

docker compose up --build
# or detached:
# docker compose up -d --build
```

Test:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
# hit / a few times — "hits" should increase (Redis)
```

Useful commands:

```bash
docker compose ps
docker compose logs -f api
docker compose exec db psql -U rean -d rean -c '\dt'
docker compose down        # keep volume
docker compose down -v     # DELETE database volume
```

If you changed `POSTGRES_USER` / `POSTGRES_DB` in `.env`, use those names in `psql` instead of `rean`.

## Key ideas to notice

1. Hostname `db` and `redis` work **inside** the Compose network.
2. `depends_on` + `service_healthy` waits until Postgres **and** Redis accept connections.
3. Named volume `pgdata` survives `docker compose down` (unless `-v`).
4. The password lives in `.env`, not in `compose.yaml`. Compose interpolates `${POSTGRES_PASSWORD}` at start time.

## Success criteria

- [ ] You copied `.env.example` → `.env` before `up`
- [ ] All three services are up
- [ ] `/` shows `hits` and `dbTime`
- [ ] After `down` + `up`, you understand what happens to data with/without `-v`
