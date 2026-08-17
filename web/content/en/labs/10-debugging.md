# Lab 10 — Debugging & troubleshooting

## Goal

Practice the commands you reach for when a container **exits**, **cannot connect**, or **uses the wrong hostname**. Pair with handbook **Chapter 14**.

You do not need a new app — only `docker logs`, `docker inspect`, and a Compose file that is *supposed* to fail until you fix it.

## Steps

### 1. A container that will not stay up

```bash
docker run --name lab10-crash alpine:3.22 sh -c 'echo boom >&2; exit 7'
docker ps -a --filter name=lab10-crash
docker logs lab10-crash
docker inspect -f '{{.State.ExitCode}} {{.State.Error}}' lab10-crash
docker rm lab10-crash
```

Exit code `7` is the app’s `exit 7`. `Error` is usually empty for a clean non-zero exit — the **logs** are the story.

### 2. Interactive debug shell

```bash
docker run --rm -it --entrypoint sh alpine:3.22
# inside: ps aux; ls /; exit
```

Use this when the default `CMD` is wrong and you need to look around.

### 3. Wrong hostname (`localhost` inside a container)

```bash
cd labs/10-debugging

# This client talks to localhost — that is *itself*, not Redis
docker compose run --rm client || true
docker compose logs cache
docker compose down
```

Edit `compose.yaml`: change `-h localhost` to `-h cache`. Run again:

```bash
docker compose run --rm client
# → PONG
docker compose down
```

`localhost` from your browser can still reach a published port. Sibling containers must use the **service name**.

### 4. Inspect one field instead of drowning in JSON

```bash
docker run -d --name lab10-inspect alpine:3.22 sleep 30
docker inspect -f '{{.State.Status}} {{.HostConfig.NetworkMode}}' lab10-inspect
docker rm -f lab10-inspect
```

## Discuss

- When do you read `logs` vs `inspect` vs `compose ps`?
- Why does `depends_on` without `condition: service_healthy` still race?
- How is this different from Lab 06 (networks), where the same hostname bug was the *lesson* rather than a failure you debug?

## Success criteria

- [ ] You found the exit code and the `boom` line from logs
- [ ] The Compose client printed `PONG` after you switched `localhost` → `cache`
- [ ] You can name three commands you would run before rebuilding “just in case”

## Next

Go to **Lab 11 — Security essentials** (non-root, scans, BuildKit secrets).
