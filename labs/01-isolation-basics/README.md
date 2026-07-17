# Lab 01 — Isolation basics

## Level

**Beginner.** You only need `docker run`, `docker exec`, and `docker rm`.  
You do **not** need to master kernel internals, OCI, or Kubernetes.

## Goal

See, with your own eyes, that a container is **isolated** from the host and from other containers:

- processes
- files
- network ports
- memory limits

Read **Chapter 2** for the “why.” This lab is only the **feel it** practice.

## How this fits the path

| Lab | What you learn |
|-----|----------------|
| **01 (this one)** | What isolation *looks like* |
| **02 Hello containers** | Everyday workflow: run, ports, logs, clean up |
| **03+** | Build images, Compose, volumes, production |

Do **01 → 02** in order. Overlap is intentional: same simple commands, different focus.

## Prerequisites

Docker installed and working (Chapter 4):

```bash
docker --version
docker run --rm hello-world
```

## Steps

### 1. Process isolation

Inside a container you see only *its* processes — not your host’s apps.

```bash
docker run -d --name lab01-ps alpine:3.20 sleep 3600

# Small list inside (sleep is usually PID 1)
docker exec lab01-ps ps aux

# Much larger list on the host
ps aux | head

docker rm -f lab01-ps
```

### 2. Filesystem isolation

Files created in a container stay in that container unless you deliberately share a folder.

```bash
# This file lives only inside the container (gone when the container exits)
docker run --rm alpine:3.20 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'

# Sharing is opt-in (bind mount) — isolation is the default
mkdir -p /tmp/lab01-share
echo 'from-host' > /tmp/lab01-share/msg.txt
docker run --rm -v /tmp/lab01-share:/data alpine:3.20 cat /data/msg.txt
# → from-host
```

### 3. Network isolation

Each container can use “port 80” inside. On the host you publish different ports.

```bash
docker run -d --name lab01-web-a -p 18080:80 nginx:alpine
docker run -d --name lab01-web-b -p 18081:80 nginx:alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f lab01-web-a lab01-web-b
```

### 4. Memory limits

Docker can cap how much RAM a container may use.

```bash
docker run -d --name lab01-limited -m 256m alpine:3.20 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' lab01-limited
# → 268435456 (bytes = 256 MiB)

docker rm -f lab01-limited
```

### 5. One image, many containers

Same image → several isolated containers (this is why containers are efficient).

```bash
docker pull redis:7-alpine
docker run -d --name lab01-r1 redis:7-alpine
docker run -d --name lab01-r2 redis:7-alpine
docker run -d --name lab01-r3 redis:7-alpine

docker ps --filter name=lab01-r
docker rm -f lab01-r1 lab01-r2 lab01-r3
```

## What you should take away

| Demo | Plain-English idea |
|------|--------------------|
| `ps` inside vs host | Container doesn’t see host processes |
| `/tmp/note.txt` | Container has its own filesystem |
| Two nginx on port 80 | Each has its own network; host maps ports |
| `-m 256m` | You can limit resources |
| Three Redis | One image, many isolated instances |

*(Optional names for later: namespaces, cgroups, layers — Chapter 2. Skip them for now if they feel heavy.)*

## Success criteria

- [ ] Short process list inside the container; long list on the host
- [ ] Bind mount showed sharing; without a mount, files stay isolated
- [ ] Both nginx URLs returned HTTP 200
- [ ] Inspect showed a 256 MiB memory limit
- [ ] Three Redis containers ran, then you cleaned them up

## Next

Go to **Lab 02 — Hello containers** for the everyday `run` / logs / clean-up workflow.
