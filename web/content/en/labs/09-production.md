# Lab 09 — Production-minded container

## Goal

Run an API with healthchecks, `init`, restart policy, read-only rootfs, dropped capabilities, log rotation, and resource limits. The published port is bound to localhost only.

**Optional helper:** `./run.sh` brings the stack up, curls `/health`, and checks the 256MiB memory limit. Prefer typing the README commands yourself the first time.

## Steps

```bash
cd labs/09-production

docker compose up --build -d
docker compose ps
# STATUS should become healthy

curl http://127.0.0.1:3000/health
docker inspect --format='{{json .State.Health}}' "$(docker compose ps -q api)" | python3 -m json.tool

# Compose V2 applies deploy.resources.limits — Memory should be 268435456 (256MiB)
docker inspect --format='Memory={{.HostConfig.Memory}} NanoCPUs={{.HostConfig.NanoCpus}}' \
  "$(docker compose ps -q api)"

docker compose down
```

## Discuss

- Why `read_only: true` + `tmpfs: /tmp`?
- Why `no-new-privileges`?
- Why `cap_drop: ALL`?
- Why publish `127.0.0.1:3000` instead of `0.0.0.0:3000`?
- Why `init: true` (PID 1 / `docker stop` / SIGTERM)?
- Why pin `image: rean-prod-api:1.0` after build, and `FROM node:22-alpine@sha256:…` instead of `node:latest`?
- Why delete `npm` / `corepack` from the image after `npm ci`?
- Why `ENV NODE_ENV=production` in the Dockerfile as well as in Compose?
- Why does the healthcheck use `node` + `fetch` instead of `wget` or `curl`?
- Did `HostConfig.Memory` match `deploy.resources.limits.memory: 256M`? What happens if you omit `deploy` under Compose V2?

## Success criteria

- [ ] Container reports healthy
- [ ] `HostConfig.Memory` is `268435456` (256MiB limit applied)
- [ ] You can list at least 5 production practices from the main guide chapter 13

## Next

Go to **Lab 10 — Debugging & troubleshooting** and practice `logs` / `inspect` on a stack that is *supposed* to fail.
