# Lab 06 — Networks

## Goal

See Docker DNS: containers reach each other by **name** on a user-defined network.

## Steps

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

## Experiment

Attach a second alias:

```bash
docker network create lab06-net
docker run -d --name lab06-redis --network lab06-net --network-alias cache redis:7-alpine
docker run --rm --network lab06-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab06-redis && docker network rm lab06-net
```

## Success criteria

- [ ] `PONG` when on the same network
- [ ] You can explain why host `localhost` is wrong for sibling containers

## Next

Go to **Lab 07 — Volumes** and prove that named volumes survive `docker rm`.
