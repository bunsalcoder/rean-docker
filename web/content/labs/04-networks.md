# Lab 04 — Networks

## Goal

See Docker DNS: containers reach each other by **name** on a user-defined network.

## Steps

```bash
docker network create lab04-net

docker run -d --name lab04-redis --network lab04-net redis:7-alpine

# Ping Redis by hostname "lab04-redis"
docker run --rm --network lab04-net redis:7-alpine \
  redis-cli -h lab04-redis ping

# This should FAIL (different/default network, name not resolved)
docker run --rm redis:7-alpine redis-cli -h lab04-redis ping || true

# Cleanup
docker rm -f lab04-redis
docker network rm lab04-net
```

## Experiment

Attach a second alias:

```bash
docker network create lab04-net
docker run -d --name lab04-redis --network lab04-net --network-alias cache redis:7-alpine
docker run --rm --network lab04-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab04-redis && docker network rm lab04-net
```

## Success criteria

- [ ] `PONG` when on the same network
- [ ] You can explain why host `localhost` is wrong for sibling containers
