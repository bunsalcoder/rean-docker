# Lab 06 — Networks

## Level

**Intermediate.** User-defined networks and DNS after Compose basics (Lab 05).

## Goal

See Docker DNS: containers reach each other by **name** on a user-defined network.

## Prerequisites

- Lab 05 (Compose) finished — you have seen services talk by hostname
- Docker Engine running (`docker network ls` works)

## Steps

**Optional helper:** `./run.sh` runs the CLI demos with cleanup.  
**Optional Compose form** (same DNS idea): `docker compose run --rm client` → `PONG`, then `docker compose down`.

```bash
docker network create lab06-net

docker run -d --name lab06-redis --network lab06-net redis:7-alpine

# Ping Redis by hostname "lab06-redis"
docker run --rm --network lab06-net redis:7-alpine \
  redis-cli -h lab06-redis ping

# This should FAIL (different/default network, name not resolved)
docker run --rm redis:7-alpine redis-cli -h lab06-redis ping || true

# Cleanup
docker rm -f lab06-redis
docker network rm lab06-net
```

> **Expected output:** The first `redis-cli` prints `PONG`. The second (no `--network lab06-net`) fails with a name-resolution or connection error.

> **Tip:** On a user-defined network, the container **name** is the DNS name siblings use — not `localhost` on the host.

## Experiment

Attach a second alias:

```bash
docker network create lab06-net
docker run -d --name lab06-redis --network lab06-net --network-alias cache redis:7-alpine
docker run --rm --network lab06-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab06-redis && docker network rm lab06-net
```

## Discuss

- Why does `redis-cli -h localhost` from a sibling container fail even when Redis is healthy?
- What is the difference between the default bridge and a user-defined network for DNS?
- When would you add a `--network-alias` instead of renaming the container?

## Success criteria

- [ ] `PONG` when on the same network
- [ ] You can explain why host `localhost` is wrong for sibling containers

## Next

Go to **Lab 07 — Volumes** and prove that named volumes survive `docker rm`.
