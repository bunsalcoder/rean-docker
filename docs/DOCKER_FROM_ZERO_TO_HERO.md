# Docker From Zero to Hero

> **Project:** `rean-docker`  
> **Audience:** Absolute beginners → advanced practitioners  
> **Style:** Step-by-step, with commands you can run, explanations of *why*, and labs in this repo

---

## How to use this guide

1. Read each chapter in order (they build on each other).
2. Type the commands yourself — do not only read them.
3. After each beginner/intermediate chapter, complete the matching lab under `labs/`.
4. Keep a terminal open in this project root:

```bash
cd /home/bunsal/project/personal/reansot/rean-docker
```

**Conventions used here**

| Symbol | Meaning |
|--------|---------|
| `$` | Run in your host terminal |
| `#` | Comment / explanation |
| `→` | Expected idea / outcome |

---

## Table of contents

1. [What problem does Docker solve?](#1-what-problem-does-docker-solve)
2. [Core mental model](#2-core-mental-model)
3. [Install & verify](#3-install--verify)
4. [Your first containers](#4-your-first-containers)
5. [Images deeply explained](#5-images-deeply-explained)
6. [Dockerfile — build your own images](#6-dockerfile--build-your-own-images)
7. [Volumes — keep data alive](#7-volumes--keep-data-alive)
8. [Networks — how containers talk](#8-networks--how-containers-talk)
9. [Environment, secrets, and config](#9-environment-secrets-and-config)
10. [Docker Compose — multi-container apps](#10-docker-compose--multi-container-apps)
11. [Multi-stage builds & image size](#11-multi-stage-builds--image-size)
12. [Production-minded practices](#12-production-minded-practices)
13. [Debugging & troubleshooting](#13-debugging--troubleshooting)
14. [Security essentials](#14-security-essentials)
15. [Advanced topics](#15-advanced-topics)
16. [Capstone project](#16-capstone-project)
17. [Cheat sheet](#17-cheat-sheet)
18. [Learning path checklist](#18-learning-path-checklist)

---

## 1. What problem does Docker solve?

### The classic pain

You build an app on your laptop. It works. On a teammate’s machine: broken. On the server: broken. Reasons usually include:

- Different OS packages
- Different language runtimes (Node 18 vs 20, Python 3.10 vs 3.12)
- Missing system libraries
- “It works on my machine” configuration drift

### Docker’s answer

**Package the application *and* its runtime dependencies into a portable unit called a container.**

That unit:

- Runs the same way on laptop, CI, and server
- Starts in seconds (much lighter than a full virtual machine)
- Isolates processes, filesystems, and (optionally) networks

### Containers vs virtual machines

| | Virtual Machine | Container |
|--|-----------------|-----------|
| Includes guest OS? | Yes (full OS) | No — shares host kernel |
| Size | GBs | MBs–hundreds of MBs |
| Start time | Minutes | Seconds |
| Isolation | Strong (hypervisor) | Process-level (namespaces + cgroups) |
| Density | Fewer per host | Many per host |

**Analogy:** A VM is a whole house. A container is an apartment in a building that shares plumbing and electricity (the host kernel), but has its own locked rooms (filesystem, process tree, network namespace).

### What Docker is (and is not)

**Docker is:**

- A platform to build, ship, and run containers
- A client (`docker`) talking to a daemon (`dockerd`)
- An ecosystem: images, registries (Docker Hub), Compose, etc.

**Docker is not:**

- A replacement for good application architecture
- Magically “secure by default” (you still harden images and configs)
- The same thing as Kubernetes (K8s *orchestrates* containers at scale; Docker *runs* them)

---

## 2. Core mental model

Memorize these four words:

### Image

A **read-only template** — like a class or a snapshot of a filesystem + metadata (default command, env, exposed ports).

Examples: `nginx:alpine`, `postgres:16`, `node:22-alpine`.

### Container

A **running (or stopped) instance** of an image — like an object created from a class.

You can start many containers from one image.

### Dockerfile

A **recipe** (text file) that tells Docker how to build an image, line by line.

### Registry

A **storage/server for images**. Public default: [Docker Hub](https://hub.docker.com). Private options: GHCR, ECR, GCR, Harbor, etc.

```
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
                                    ↓
                              docker push/pull
                                    ↓
                                Registry
```

### Layers

Images are stacks of **layers**. Each Dockerfile instruction often creates a layer. Unchanged layers are **cached**, so rebuilds are fast when you order instructions wisely.

---

## 3. Install & verify

This machine already has Docker. Always verify:

```bash
docker --version
docker compose version
docker info
docker run --rm hello-world
```

**What you should see**

- A Docker version (Engine)
- Compose version (plugin: `docker compose`, not only old `docker-compose`)
- `docker info` shows server details (storage driver, CPUs, memory)
- `hello-world` downloads a tiny image and prints a success message

### Important Linux note: permissions

If you get `permission denied` talking to the Docker socket:

```bash
# Option A (common): add your user to the docker group, then log out/in
sudo usermod -aG docker $USER

# Option B: prefix with sudo (works, less convenient)
sudo docker ps
```

### Daemon vs client

- **Client:** the `docker` CLI you type
- **Daemon:** `dockerd` background service that actually creates containers

```bash
# Is the daemon running?
sudo systemctl status docker   # on many Linux distros
```

---

## 4. Your first containers

### Lab: `labs/01-hello`

### Run a container (foreground)

```bash
docker run -it ubuntu:24.04 bash
```

| Flag | Meaning |
|------|---------|
| `run` | Create + start a container from an image |
| `-i` | Keep STDIN open |
| `-t` | Allocate a TTY (interactive terminal) |
| `ubuntu:24.04` | Image name + tag |
| `bash` | Command to run inside |

Inside the container try:

```bash
cat /etc/os-release
whoami
exit
```

When you `exit`, the container **stops**. It still exists until you remove it.

### Run in the background (detached)

```bash
docker run -d --name my-nginx -p 8080:80 nginx:alpine
```

| Flag | Meaning |
|------|---------|
| `-d` | Detached (background) |
| `--name` | Friendly name instead of random ID |
| `-p 8080:80` | Map host port 8080 → container port 80 |

Open: [http://localhost:8080](http://localhost:8080)

### Essential day-1 commands

```bash
docker ps                 # running containers
docker ps -a              # all containers (incl. stopped)
docker logs my-nginx      # stdout/stderr of container
docker logs -f my-nginx   # follow logs (Ctrl+C to stop following)
docker exec -it my-nginx sh   # open a shell in a running container
docker stop my-nginx      # graceful stop (SIGTERM)
docker start my-nginx     # start a stopped container
docker rm my-nginx        # delete stopped container
docker rm -f my-nginx     # force remove (stop + delete)
```

### `--rm` for throwaway containers

```bash
docker run --rm -it alpine sh
# when you exit, container is auto-deleted
```

### Cleaning up (safe practice early)

```bash
docker ps -a                      # see leftover containers
docker container prune            # remove all *stopped* containers
docker image ls                   # list images
docker image prune                # remove dangling images
# Nuclear (careful): remove unused images, networks, build cache
docker system prune -a
```

**Lab exercise**

1. Run Nginx on port `8080`.
2. `curl localhost:8080` and confirm HTML.
3. `docker exec` into it and list `/usr/share/nginx/html`.
4. Stop and remove the container.

---

## 5. Images deeply explained

### List and inspect

```bash
docker images
# or
docker image ls

docker pull redis:7-alpine
docker image inspect redis:7-alpine
docker history redis:7-alpine
```

`history` shows layers and approximate sizes — gold for understanding bloat.

### Tags

`nginx:alpine` means:

- Repository/name: `nginx`
- Tag: `alpine` (variant based on Alpine Linux)

Special tag: `latest` — **do not rely on it in production**. Prefer explicit versions: `nginx:1.27-alpine`.

### Official vs custom images

- **Official images** on Docker Hub are curated (postgres, redis, python…).
- **Your images** are built from Dockerfiles and pushed to a registry.

### Image IDs vs names

Images have a content digest / ID. Names are human labels pointing at IDs. Retagging does not copy layers; it adds another name.

```bash
docker tag nginx:alpine my-nginx:dev
docker images | grep nginx
```

---

## 6. Dockerfile — build your own images

### Lab: `labs/02-dockerfile`

A Dockerfile is a script of instructions. Example (Node static-ish app):

```dockerfile
# Start from a small official base
FROM node:22-alpine

# Metadata (optional but good)
LABEL maintainer="you@example.com"

# Working directory inside the image
WORKDIR /app

# Copy dependency manifests first (better cache)
COPY package.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy application source
COPY . .

# Document the port the app listens on (does NOT publish it)
EXPOSE 3000

# Default command when container starts
CMD ["node", "server.js"]
```

### Instruction cheat sheet

| Instruction | Purpose |
|-------------|---------|
| `FROM` | Base image (required first, except ARG before FROM) |
| `WORKDIR` | Set working directory (creates if missing) |
| `COPY` / `ADD` | Copy files into image (`COPY` preferred; `ADD` has extra magic) |
| `RUN` | Execute build-time commands (install packages, etc.) |
| `ENV` | Set environment variables |
| `EXPOSE` | Document ports (documentation + tooling hint) |
| `CMD` | Default command (easily overridden) |
| `ENTRYPOINT` | Fixed main executable (args often appended) |
| `USER` | Switch to non-root user |
| `VOLUME` | Declare mount points |
| `HEALTHCHECK` | How Docker probes container health |
| `ARG` | Build-time variables |

### CMD vs ENTRYPOINT

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

- `docker run img` → runs `nginx -g 'daemon off;'`
- `docker run img -t` → runs `nginx -t` (CMD replaced, ENTRYPOINT kept)

Prefer **exec form** (JSON array), not shell form, so signals (SIGTERM) reach your process correctly:

```dockerfile
# Good
CMD ["node", "server.js"]

# Avoid for main process (PID 1 signal issues)
CMD node server.js
```

### Build and run

From `labs/02-dockerfile`:

```bash
cd labs/02-dockerfile
docker build -t rean-hello:1.0 .
docker run --rm -p 3000:3000 rean-hello:1.0
```

| Part | Meaning |
|------|---------|
| `build` | Build image from Dockerfile |
| `-t rean-hello:1.0` | Name:tag |
| `.` | Build context (files sent to daemon) |

### Build context & `.dockerignore`

Everything in the context directory can be sent to Docker. Exclude junk:

```gitignore
node_modules
.git
*.md
.env
npm-debug.log
```

**Why it matters:** Smaller context = faster builds. Never copy secrets into images accidentally.

### Layer caching strategy (critical skill)

**Bad order** (any code change busts `npm install` cache):

```dockerfile
COPY . .
RUN npm install
```

**Good order**:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
```

Rule: **put rarely changing, expensive steps early; put frequently changing source late.**

---

## 7. Volumes — keep data alive

### Lab: `labs/05-volumes`

Containers are **ephemeral**. Delete a container → its writable layer is gone.

To persist data, use **volumes** or **bind mounts**.

### Three mount types

| Type | Use case | Example |
|------|----------|---------|
| **Named volume** | DB data, managed by Docker | `docker volume create pgdata` |
| **Bind mount** | Live-edit host source code | `-v $(pwd):/app` |
| **tmpfs** | Sensitive/temp in memory | `--tmpfs /tmp` |

### Named volume example (Postgres)

```bash
docker volume create rean-pgdata

docker run -d --name rean-pg \
  -e POSTGRES_PASSWORD=secret \
  -v rean-pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

Stop/remove container — **data remains** in `rean-pgdata`.

```bash
docker volume ls
docker volume inspect rean-pgdata
```

### Bind mount example (dev)

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine node -e "console.log('hi from bind mount')"
```

### Volume vs bind: when to use which

- **Volume:** production data, databases, anything Docker should manage
- **Bind:** local development, config files you edit on the host

### Beware of permissions

Bind mounts inherit host UID/GID issues. Prefer matching user in Dockerfile (`USER`) or fix ownership carefully.

---

## 8. Networks — how containers talk

### Lab: `labs/04-networks`

By default, containers on the same user-defined bridge network can reach each other **by container name** (DNS).

```bash
docker network create rean-net

docker run -d --name rean-redis --network rean-net redis:7-alpine

docker run --rm --network rean-net redis:7-alpine \
  redis-cli -h rean-redis ping
# → PONG
```

Hostnames:

- From another container on `rean-net`: `rean-redis`
- From your host machine: usually via published ports (`localhost:6379`), not the internal name

### Network types (simplified)

| Driver | Typical use |
|--------|-------------|
| `bridge` | Default for single-host apps (most common) |
| `host` | Container shares host network stack (Linux) |
| `none` | No networking |
| `overlay` | Multi-host (Swarm) |

### Port publishing again

`-p HOST:CONTAINER` only affects access **from the host / outside**. Containers on the same Docker network talk on the *container* port without `-p`.

Example: app connects to `postgres:5432` internally; you only publish `5432` if you want host tools (psql GUI) to connect.

---

## 9. Environment, secrets, and config

### Pass env vars

```bash
docker run --rm -e GREETING=Hello alpine printenv GREETING

docker run --rm --env-file .env alpine printenv
```

### Inside Dockerfile

```dockerfile
ENV NODE_ENV=production
```

### Rules of thumb

1. **Config** (non-secret): env vars, Compose `environment`, config files.
2. **Secrets** (passwords, API keys): never bake into image layers; use env at runtime, Docker secrets, or a vault — and keep `.env` out of git.
3. Prefer **12-factor** style: same image, different env per environment (dev/stage/prod).

### Example `.env` (do not commit secrets)

```env
POSTGRES_USER=rean
POSTGRES_PASSWORD=change-me
POSTGRES_DB=rean
```

Add `.env` to `.gitignore`.

---

## 10. Docker Compose — multi-container apps

### Lab: `labs/03-compose`

Manually `docker run` for app + db + redis gets painful. **Compose** describes the whole stack in YAML.

### Minimal `compose.yaml`

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://rean:secret@db:5432/rean
    depends_on:
      - db
    networks:
      - rean

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: rean
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: rean
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - rean

volumes:
  pgdata:

networks:
  rean:
```

### Essential Compose commands

```bash
docker compose up           # create & start (foreground, logs)
docker compose up -d        # detached
docker compose ps           # status
docker compose logs -f web  # follow one service
docker compose exec web sh  # shell into service
docker compose stop         # stop
docker compose down         # stop + remove containers/networks
docker compose down -v      # also delete named volumes (DATA LOSS)
docker compose build        # build images
docker compose up --build   # rebuild then start
```

### Key Compose concepts

| Concept | Meaning |
|---------|---------|
| `services` | Containers in your app |
| `build` | Build from Dockerfile |
| `image` | Use existing image |
| `depends_on` | Start order (not full readiness unless you add healthchecks) |
| `volumes` | Named volumes declared at bottom |
| `networks` | Isolated networks for the project |

### Service DNS

In Compose, service name = hostname. The web service connects to Postgres at host `db`, not `localhost`.

**`localhost` inside a container means that container itself**, never the host or sibling services.

### Profiles & overrides (intermediate)

```yaml
# compose.override.yaml is auto-merged for local dev
services:
  web:
    volumes:
      - ./:/app
    command: npm run dev
```

```yaml
# Use profiles for optional tools
services:
  adminer:
    image: adminer
    profiles: ["tools"]
    ports: ["8080:8080"]
```

```bash
docker compose --profile tools up -d
```

---

## 11. Multi-stage builds & image size

### Lab: `labs/06-multi-stage`

Problem: build tools (compilers, npm with all deps, Go toolchain) bloat production images and increase attack surface.

**Multi-stage builds** use multiple `FROM` lines and copy only artifacts forward.

```dockerfile
# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Benefits:

- Final image has no compilers / unused build deps
- Smaller attack surface
- Often much smaller downloads

### Alpine vs distroless vs slim

| Base | Pros | Cons |
|------|------|------|
| `*-alpine` | Small | musl quirks, fewer packages |
| `*-slim` | Debian-based, smaller than full | Still larger than Alpine |
| Distroless | Minimal, very secure | Harder to debug (no shell) |

Choose based on app needs; consistency across services helps ops.

### Size inspection habits

```bash
docker images rean-hello
docker history rean-hello:1.0
dive rean-hello:1.0   # if you install dive — visual layer explorer
```

---

## 12. Production-minded practices

### Lab: `labs/07-production`

### Checklist before “real” deploy

1. **Pin versions** — `postgres:16.4-alpine`, not `postgres:latest`
2. **Non-root user** — `USER node` or custom UID
3. **Read-only root filesystem** where possible (`--read-only` + writable tmp mounts)
4. **Healthchecks**

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
```

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 20s
```

5. **Resource limits**

```yaml
deploy:
  resources:
    limits:
      cpus: "0.50"
      memory: 512M
```

(For Compose on a single node, also see `mem_limit` / modern `deploy` support depending on Compose version.)

6. **Restart policy**

```yaml
restart: unless-stopped
```

7. **Logging** — don’t log secrets; ship logs to a collector; avoid huge docker logs without rotation.

8. **One process per container** (guideline) — app in one, db in another; use Compose/K8s to compose them.

9. **Immutable images** — rebuild and redeploy; don’t “hotfix” running containers.

### Restart policies

| Policy | Behavior |
|--------|----------|
| `no` | Never restart |
| `always` | Always restart |
| `on-failure` | Restart on non-zero exit |
| `unless-stopped` | Always, except if you manually stopped it |

---

## 13. Debugging & troubleshooting

### Container won’t stay up

```bash
docker ps -a
docker logs <name>
docker inspect <name>   # look at State.ExitCode, Error, Mounts, NetworkSettings
```

### Interactive debug

```bash
docker run --rm -it --entrypoint sh myimage:tag
docker compose run --rm web sh
```

### Copy files in/out

```bash
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./file.txt my-nginx:/tmp/
```

### See processes / resource use

```bash
docker top my-nginx
docker stats
```

### Common failure patterns

| Symptom | Likely cause |
|---------|----------------|
| Port already allocated | Another process/container uses host port |
| Connection refused to `db` | Wrong network, wrong hostname, db not ready |
| Permission denied on volume | UID mismatch on bind mount |
| Huge image | Fat base, leftover build tools, no multi-stage |
| Changes not appearing | Old image cached; rebuild; or editing wrong mount |
| `localhost` from browser works, app can’t reach db | App uses `localhost` instead of service name |

### “Database not ready” race

`depends_on` only waits for **start**, not **ready**. Fix with:

- Healthcheck + `depends_on: condition: service_healthy` (Compose)
- App-level retry/backoff
- Init containers / wait scripts

```yaml
depends_on:
  db:
    condition: service_healthy
```

---

## 14. Security essentials

1. **Don’t run as root** in production containers when avoidable.
2. **Scan images** for CVEs (`docker scout`, Trivy, Grype).
3. **Minimal base images** + multi-stage.
4. **Never commit secrets**; never `ENV PASSWORD=...` with real secrets in Dockerfile.
5. **Pin digests** for critical supply-chain control:

   ```bash
   docker pull nginx@sha256:...
   ```

6. **Drop capabilities** / use security options when needed (`--cap-drop ALL`).
7. **Keep Engine updated**.
8. **Treat the Docker socket as root** — mounting `/var/run/docker.sock` into a container is nearly equivalent to giving that container root on the host.

---

## 15. Advanced topics

### BuildKit

Modern builder (usually default now):

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

Features: better cache, parallel builds, secrets mounts during build (without leaving secrets in layers).

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npmrc \
    npm ci
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .
```

### Multi-arch builds

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t you/app:1.0 --push .
```

Useful for Apple Silicon + Linux servers.

### Registries

```bash
docker login
docker tag rean-hello:1.0 youruser/rean-hello:1.0
docker push youruser/rean-hello:1.0
docker pull youruser/rean-hello:1.0
```

GHCR example tag: `ghcr.io/you/rean-hello:1.0`

### Docker Swarm vs Kubernetes (orientation)

| Tool | Role |
|------|------|
| Docker Compose | Local / simple single-host stacks |
| Docker Swarm | Built-in clustering (less common today) |
| Kubernetes | Industry standard orchestration at scale |

Learn Compose thoroughly first. Move to K8s when you need multi-node scheduling, rolling updates, service meshes, etc.

### Init process & zombies

Use `tini` or Docker’s `--init` so PID 1 reaps zombie processes and forwards signals:

```bash
docker run --init ...
```

### Custom bridge & aliases

```bash
docker network create --subnet=172.28.0.0/16 rean-custom
docker run -d --network rean-custom --network-alias cache redis:7-alpine
```

---

## 16. Capstone project

Build a small stack in this repo (you can extend `labs/03-compose`):

**Goal:** Web API + Postgres + Redis

Requirements:

1. `Dockerfile` for the API (multi-stage if you compile/build).
2. `compose.yaml` with `api`, `db`, `redis`.
3. Named volumes for Postgres.
4. `.env.example` documenting required variables (no real secrets).
5. Healthchecks on API and Postgres.
6. API connects using service hostnames `db` and `redis`.
7. `README` section: how to `up`, migrate (if any), and `down`.

Stretch goals:

- Separate `compose.prod.yaml` with restart policies and resource limits
- Nginx reverse proxy service
- CI job that builds and runs `docker compose config` + a smoke test

---

## 17. Cheat sheet

```bash
# Images
docker pull IMAGE
docker images
docker rmi IMAGE
docker build -t NAME:TAG .
docker history IMAGE

# Containers
docker run -d -p HOST:CONT --name NAME IMAGE
docker ps / docker ps -a
docker logs -f NAME
docker exec -it NAME sh
docker stop NAME && docker rm NAME
docker stats

# Volumes / networks
docker volume ls|create|inspect|rm
docker network ls|create|inspect|rm

# Compose
docker compose up -d --build
docker compose logs -f
docker compose exec SERVICE sh
docker compose down

# Cleanup
docker system df
docker system prune
```

---

## 18. Learning path checklist

### Beginner

- [ ] Explain image vs container vs Dockerfile
- [ ] Run, stop, remove containers; publish ports
- [ ] Read logs and `exec` into a container
- [ ] Write a simple Dockerfile and `docker build`
- [ ] Use `.dockerignore`

### Intermediate

- [ ] Named volumes + bind mounts
- [ ] User-defined networks + DNS by name
- [ ] Env files and 12-factor config
- [ ] Compose multi-service app
- [ ] Fix “db not ready” with healthchecks

### Advanced

- [ ] Multi-stage builds; shrink images
- [ ] Non-root user, healthchecks, restart policies
- [ ] BuildKit secrets; pin tags/digests
- [ ] Push/pull from a registry
- [ ] Debug with `inspect`, `logs`, `stats`, ephemeral shells
- [ ] Complete the capstone stack

---

## Suggested weekly plan

| Day | Focus | Lab |
|-----|--------|-----|
| 1 | Concepts + first containers | `labs/01-hello` |
| 2 | Dockerfile mastery | `labs/02-dockerfile` |
| 3 | Compose basics | `labs/03-compose` |
| 4 | Networks & volumes | `labs/04-networks`, `labs/05-volumes` |
| 5 | Multi-stage + prod habits | `labs/06-multi-stage`, `labs/07-production` |
| 6–7 | Capstone | your own stack |

---

## Glossary

| Term | Definition |
|------|------------|
| Daemon | Background Docker engine (`dockerd`) |
| Layer | Immutable filesystem diff in an image |
| Tag | Mutable label for an image version |
| Digest | Immutable content hash of an image |
| Context | Files sent to daemon during `build` |
| Registry | Remote store for images |
| Orchestrator | System that schedules containers across machines |
| Namespace | Linux isolation (pid, net, mnt, …) |
| cgroups | Linux resource limits (CPU, memory) |

---

## Next steps after this guide

1. Practice labs in order under `labs/`.
2. Containerize a real app you already know.
3. Read official docs: [https://docs.docker.com/](https://docs.docker.com/)
4. Learn Compose Watch / Dev Containers for daily development.
5. When deploying multi-node: start Kubernetes fundamentals (Pods, Deployments, Services).

---

*Created for the `rean-docker` learning project. Work chapter by chapter; prefer understanding over rushing commands.*
