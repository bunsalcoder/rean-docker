# Lab 05 — Networks

## Goal

See Docker DNS: containers reach each other by **name** on a user-defined network.

## Steps

```bash
docker network create lab05-net

docker run -d --name lab05-redis --network lab05-net redis:7-alpine

# Ping Redis by hostname "lab05-redis"
docker run --rm --network lab05-net redis:7-alpine \
  redis-cli -h lab05-redis ping

# This should FAIL (different/default network, name not resolved)
docker run --rm redis:7-alpine redis-cli -h lab05-redis ping || true

# Cleanup
docker rm -f lab05-redis
docker network rm lab05-net
```

## Experiment

Attach a second alias:

```bash
docker network create lab05-net
docker run -d --name lab05-redis --network lab05-net --network-alias cache redis:7-alpine
docker run --rm --network lab05-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab05-redis && docker network rm lab05-net
```

## Success criteria

- [ ] `PONG` when on the same network
- [ ] You can explain why host `localhost` is wrong for sibling containers
