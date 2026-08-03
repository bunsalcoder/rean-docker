# Lab 04 — Docker Compose (API + Postgres + Redis)

## Goal

Run a multi-container app with service DNS, volumes, and healthchecks.

## Steps

```bash
cd labs/04-compose

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

## Key ideas to notice

1. Hostname `db` and `redis` work **inside** the Compose network.
2. `depends_on` + `service_healthy` waits until Postgres accepts connections.
3. Named volume `pgdata` survives `docker compose down` (unless `-v`).

## Success criteria

- [ ] All three services are up
- [ ] `/` shows `hits` and `dbTime`
- [ ] After `down` + `up`, you understand what happens to data with/without `-v`
