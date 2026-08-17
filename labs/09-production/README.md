# Lab 09 — Production-minded container

## Goal

Run an API with healthchecks, `init`, restart policy, read-only rootfs, log rotation, and resource limits.

## Steps

```bash
cd labs/09-production

docker compose up --build -d
docker compose ps
# STATUS should become healthy

curl http://127.0.0.1:3000/health
docker inspect --format='{{json .State.Health}}' "$(docker compose ps -q api)" | python3 -m json.tool

docker compose down
```

## Discuss

- Why `read_only: true` + `tmpfs: /tmp`?
- Why `no-new-privileges`?
- Why `init: true` (PID 1 / `docker stop` / SIGTERM)?
- Why pin `image: rean-prod-api:1.0` after build, and `FROM node:22-alpine` instead of `node:latest`?
- Why does the healthcheck use `node` + `fetch` instead of `wget` or `curl`?

## Success criteria

- [ ] Container reports healthy
- [ ] You can list at least 5 production practices from the main guide chapter 13

## Next

Go to **Lab 10 — Debugging & troubleshooting** and practice `logs` / `inspect` on a stack that is *supposed* to fail.
