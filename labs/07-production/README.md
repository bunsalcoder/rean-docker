# Lab 07 — Production-minded container

## Goal

Run an API with healthchecks, restart policy, read-only rootfs, and resource limits.

## Steps

```bash
cd labs/07-production

docker compose up --build -d
docker compose ps
# STATUS should become healthy

curl http://localhost:3000/health
docker inspect --format='{{json .State.Health}}' "$(docker compose ps -q api)" | jq .

docker compose down
```

## Discuss

- Why `read_only: true` + `tmpfs: /tmp`?
- Why `no-new-privileges`?
- Why pin `image: rean-prod-api:1.0` after build?

## Success criteria

- [ ] Container reports healthy
- [ ] You can list at least 5 production practices from the main guide chapter 12
