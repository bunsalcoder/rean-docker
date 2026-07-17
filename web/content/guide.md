# Docker From Zero to Hero

> **Project:** `rean-docker`  
> **Audience:** Absolute beginners → advanced practitioners  
> **Style:** Step-by-step, with commands you can run, explanations of *why*, and labs in this repo

---

## How to use this guide

1. Read each chapter in order (they build on each other).
2. Type the commands yourself — do not only read them.
3. After each beginner/intermediate chapter, complete the matching lab under `labs/`.
4. Keep a terminal open in this project root (wherever you cloned or downloaded the repo):

```bash
cd path/to/rean-docker
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
2. [Containerization foundations](#2-containerization-foundations)
3. [Core mental model](#3-core-mental-model)
4. [Install & verify](#4-install--verify)
5. [Your first containers](#5-your-first-containers)
6. [Images deeply explained](#6-images-deeply-explained)
7. [Dockerfile — build your own images](#7-dockerfile--build-your-own-images)
8. [Volumes — keep data alive](#8-volumes--keep-data-alive)
9. [Networks — how containers talk](#9-networks--how-containers-talk)
10. [Environment, secrets, and config](#10-environment-secrets-and-config)
11. [Docker Compose — multi-container apps](#11-docker-compose--multi-container-apps)
12. [Multi-stage builds & image size](#12-multi-stage-builds--image-size)
13. [Production-minded practices](#13-production-minded-practices)
14. [Debugging & troubleshooting](#14-debugging--troubleshooting)
15. [Security essentials](#15-security-essentials)
16. [Advanced topics](#16-advanced-topics)
17. [Capstone project](#17-capstone-project)
18. [Cheat sheet](#18-cheat-sheet)
19. [Learning path checklist](#19-learning-path-checklist)

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

Next, **Chapter 2** explains containerization in plain language (beginner foundations), then **Lab 01** lets you feel isolation with simple commands.

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

## 2. Containerization foundations

Containerization is the **idea**. Docker is the **tool most people use to practice that idea**.

**This chapter is beginner foundations**, not an advanced systems course. Skim the deep parts (namespaces, OCI, `runc`) on a first read if you want — the matching lab only needs simple `docker` commands.

**Lab pairing:** after (or while) reading this chapter, do **`labs/01-isolation-basics`** (Lab 01 — Isolation basics). Then continue to Lab 02 for everyday workflow.

This chapter explains containerization in general, then in enough detail that Docker’s later commands feel inevitable — not magical.

### In one sentence

**Containerization** packages an application together with everything it needs to run (runtime, libraries, config) into an isolated unit that shares the host’s OS kernel but has its own view of processes, files, and network.

That unit is a **container**.

### The general picture (start here)

Think of three layers of “how do I run software?”:

| Approach | What you ship | Isolation | Typical size / start |
|----------|---------------|-----------|----------------------|
| Bare metal / host install | App + hope the machine matches | Almost none | Fast, fragile |
| Virtual machine | App + full guest OS | Strong (separate kernel) | Heavy, slow to start |
| Container | App + userland deps (no full guest OS) | Process-level (shared kernel) | Light, starts in seconds |

**Containerization’s bet:** most apps do not need a whole second operating system. They need a **consistent filesystem and libraries**, plus **enough isolation** so one app doesn’t break another.

#### Everyday analogy

- A **VM** is renting a whole house (foundation, plumbing, electrical panel = guest OS).
- A **container** is an apartment: private rooms (your files, processes, ports), shared building systems (the host kernel).
- An **image** is the furnished apartment blueprint; a **container** is a rented unit started from that blueprint.

#### What problem it solves (beyond “Docker”)

1. **Reproducibility** — same bits run on laptop, CI, and server.
2. **Density** — many apps per machine without a VM per app.
3. **Speed** — start/stop in seconds for deploys and tests.
4. **Portability** — move the unit between environments without reinstalling the world.
5. **Clear boundaries** — dependencies live *inside* the unit, not “somewhere on the host.”

#### Containerization vs Docker vs Kubernetes

| Term | What it is |
|------|------------|
| **Containerization** | The *concept*: isolate + package + run with a shared kernel |
| **Docker** | A popular *platform* to build, ship, and run containers |
| **OCI** | Open standards for images and runtimes (so tools can interoperate) |
| **Kubernetes** | An *orchestrator*: schedules many containers across many machines |

You can containerize without Docker (Podman, containerd, nerdctl, etc.). You usually learn Docker first because the workflow is clear and the ecosystem is huge.

```
  Concept: containerization
       │
       ▼
  Standards: OCI image + runtime
       │
       ▼
  Engines/tools: Docker, containerd, Podman, …
       │
       ▼
  Orchestration (optional): Kubernetes, Swarm, Nomad, …
```

### A short history (why this exists)

1. **chroot** (Unix) — change the apparent root filesystem for a process (filesystem jail; weak alone).
2. **Linux namespaces + cgroups** — the kernel features that make real containers possible (isolate identity; limit CPU/RAM).
3. **LXC** and others — early “Linux containers” using those features.
4. **Docker (2013+)** — made the *developer experience* mainstream: Dockerfile, images, Hub, simple CLI.
5. **OCI** — standardized image/runtime formats so the ecosystem isn’t locked to one vendor forever.

You do not need to memorize history. Remember: **containers are a Linux kernel feature set + a packaging format + a nice UX**.

### Detailed model: what is actually isolated?

On Linux, a container is mostly **normal processes** with extra kernel controls.

#### Namespaces — “what do I see?”

Namespaces give a process its own view of system resources:

| Namespace | Isolates | Why it matters |
|-----------|----------|----------------|
| **pid** | Process IDs | Inside the container, your app can be PID 1 |
| **mnt** | Mounts / filesystem tree | Container has its own `/`, not the host’s |
| **net** | Network stack | Own interfaces, IPs, ports, routing |
| **uts** | Hostname | Container hostname ≠ host hostname |
| **ipc** | Shared memory / IPC | Apps don’t collide on IPC objects |
| **user** | User IDs (optional) | Map container root to unprivileged host user |

**Example idea:** two containers can each listen on port `80` *inside* their own network namespace. On the host you publish different ports (`-p 8080:80` and `-p 8081:80`).

#### cgroups — “how much may I use?”

**Control groups (cgroups)** limit and account for resources:

- CPU time
- Memory
- PIDs / process count
- Block I/O (sometimes)

Without cgroups, one runaway container could starve the host. With them, you can say “this API gets at most 512MB RAM.”

#### Union filesystem / layers — “how is the disk built?”

Images are stacked **layers** (read-only). When a container runs, Docker adds a thin **writable layer** on top:

```
[ writable container layer ]  ← changes while running (unless volumes)
[ image layer: your app ]
[ image layer: npm deps ]
[ image layer: base OS userland ]
```

That is why:

- Images share layers on disk (efficient).
- Rebuilds can be fast (cache unchanged layers).
- Deleting a container throws away the writable layer (unless you used volumes).

#### Shared kernel — the important tradeoff

Containers **share the host kernel**. That means:

- They are lighter than VMs.
- A kernel bug or misconfigured privileged container is a bigger deal than in a well-isolated VM.
- You cannot run a Windows container kernel on a Linux kernel (or vice versa) without virtualization underneath (Docker Desktop uses a small VM on Mac/Windows for this reason).

### Detailed model: image vs container (lifecycle)

```
Build time                         Run time
─────────                          ────────
Dockerfile  ──build──►  Image  ──run──►  Container (running)
                          │                 │
                          │                 ├─ stop  → stopped container
                          │                 ├─ start → running again
                          │                 └─ rm    → gone (writable layer lost)
                          │
                     push/pull
                          │
                       Registry
```

- **Image** = immutable template (usually).
- **Container** = instance with state (running or stopped).
- **Registry** = remote shelf for images (Docker Hub, GHCR, …).

One image → many containers (like one class → many objects).

### How Docker implements containerization (simplified stack)

You type `docker …`. Roughly:

```
docker CLI  →  dockerd (Docker daemon)  →  containerd  →  runc  →  Linux namespaces/cgroups
```

| Piece | Role |
|-------|------|
| **CLI** | Human interface (`docker run`, `build`, …) |
| **dockerd** | Docker’s API/orchestrator on one machine |
| **containerd** | Manages container lifecycle / images |
| **runc** | Actually creates the container via OCI runtime + kernel features |

On Docker Desktop (Mac/Windows), this stack runs inside a **lightweight Linux VM**, because the Mac/Windows kernel is not the Linux kernel containers expect.

You rarely touch `runc` directly. Understanding the stack explains error messages and “where” things run.

### Lab: `labs/01-isolation-basics` (beginner)

**Preferred path:** complete Lab 01 (Isolation basics). It is the same ideas as the demos below, with a checklist and clear “what to notice.”

You do **not** need advanced knowledge — only `docker run`, `exec`, and `rm`.

### Worked examples (optional reference)

Same demos as Lab 01, kept here for the handbook. They assume Docker is installed (Chapter 4). If you are reading ahead, skim now and re-run after install — or just do the lab.

#### Example A — Isolation of processes (pid namespace)

```bash
# Start a quiet container
docker run -d --name rean-ps alpine:3.20 sleep 3600

# Processes *inside* the container (small list; sleep is typically PID 1)
docker exec rean-ps ps aux

# Processes on the host (huge list) — different pid namespace
ps aux | head

docker rm -f rean-ps
```

→ Inside the container you do **not** see your host’s Chrome/Slack processes. That is pid isolation.

#### Example B — Isolation of filesystem (mnt namespace)

```bash
docker run --rm -it alpine:3.20 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'
```

→ The container has its own `/tmp` and `/`. Creating `/tmp/note.txt` inside does not create that file on your host desktop.

Compare with a **bind mount** (intentionally shared folder — you will use this later for live coding):

```bash
mkdir -p /tmp/rean-share
echo 'from-host' > /tmp/rean-share/msg.txt
docker run --rm -v /tmp/rean-share:/data alpine:3.20 cat /data/msg.txt
# → from-host
```

Isolation is the default; sharing is opt-in.

#### Example C — Isolation of network (net namespace)

```bash
# Two containers, each with nginx on container-port 80
docker run -d --name rean-web-a -p 18080:80 nginx:alpine
docker run -d --name rean-web-b -p 18081:80 nginx:alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f rean-web-a rean-web-b
```

→ Each container thinks it owns port `80`. The host maps different published ports. That is network namespacing plus port publishing.

#### Example D — Resource limits (cgroups)

```bash
# Limit memory; watch Docker enforce it
docker run --rm -m 128m --memory-swap 128m alpine:3.20 \
  sh -c 'echo "cgroup memory limit applied"; cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "(limit visible via docker inspect)"'
```

Inspect from the outside:

```bash
docker run -d --name rean-limited -m 256m alpine:3.20 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' rean-limited
# → 268435456 (bytes)
docker rm -f rean-limited
```

→ Containerization is not only isolation of *identity*; it is also **controlled consumption**.

#### Example E — Same image, many containers (density)

```bash
docker pull redis:7-alpine
docker run -d --name rean-r1 redis:7-alpine
docker run -d --name rean-r2 redis:7-alpine
docker run -d --name rean-r3 redis:7-alpine
docker ps --filter name=rean-r
docker rm -f rean-r1 rean-r2 rean-r3
```

→ One image, three isolated Redis processes. That is the density win versus three VMs.

#### Example F — “Works the same” packaging (portable unit)

```bash
# Official image already packages Redis + its defaults
docker run --rm -p 6379:6379 redis:7-alpine
# In another terminal: docker run --rm -it redis:7-alpine redis-cli -h host.docker.internal ping
# (On Linux you may use --network host or the container IP instead)
```

Later chapters teach you to **build your own** portable unit with a Dockerfile. The idea is the same: ship the environment with the app.

### What is *inside* a typical container image?

Usually:

- A minimal **userland** (Alpine, Debian slim, distroless, …) — *not* a second kernel
- Language runtime (Node, Python, JVM, …) if needed
- Your application files
- Default command (`CMD` / `ENTRYPOINT`)
- Metadata (ports, env defaults, labels)

Usually **not**:

- A hypervisor
- Your host’s `/home` (unless you mount it)
- Other containers’ filesystems
- A full desktop environment

### What containerization does *not* mean

| Myth | Reality |
|------|---------|
| “Containers are VMs” | No — shared kernel, process-level isolation |
| “Containers are automatically secure” | Defaults help, but you still harden (users, scans, least privilege) |
| “One container = one VM-sized machine” | Prefer **one main concern per container** (API, DB, worker), composed together |
| “Docker is the only way” | Docker popularized it; OCI-compatible tools also run containers |
| “If it runs in Docker, production is solved” | You still need config, secrets, networking, observability, and often an orchestrator |

### When to containerize (and when not to)

**Good fits**

- Web APIs, workers, job runners
- Sidecars (proxy, log shipper)
- Databases in *dev/test* (prod DB often managed separately — team choice)
- CI tasks that need a clean, repeatable environment
- Shipping the same artifact from laptop → staging → prod

**Weaker fits / be careful**

- GUI desktop apps (possible, often awkward)
- Apps that need full host device / kernel module access
- Ultra-low-latency kernel-specific workloads where VM or bare metal is mandated
- “Lift and shift” a giant messy monolith *without* fixing config — containers package chaos too

### Mental checklist before every container you run

1. **What image** am I starting from? (trust + tag/digest)
2. **What is isolated** vs **what am I sharing**? (ports, volumes, env)
3. **What resources** may it use? (memory/CPU limits in prod)
4. **What happens to data** when the container is removed? (volumes!)
5. **Who can reach it**? (published ports, networks)

### Bridge to the rest of this guide

| Next topic | How it connects to containerization |
|------------|-------------------------------------|
| Core mental model (Ch.3) | Image / container / Dockerfile / registry vocabulary |
| Isolation basics (Lab 01) | Feel isolation with simple `docker` commands |
| First containers (Ch.5 / Lab 02) | Everyday workflow: run, logs, clean up |
| Images & Dockerfiles | How you *build* the portable unit |
| Volumes & networks | Controlled exceptions to isolation |
| Compose | Many containers cooperating as one app |
| Production & security | Harden the shared-kernel world |

**Takeaway:** Containerization = **package + isolate + limit + ship** on a shared kernel. Docker is how you will practice that for the rest of `rean-docker`.

---

## 3. Core mental model

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

## 4. Install & verify

You need Docker on **your** computer before the labs will work. Most learners install **Docker Desktop** (Windows, macOS, or Linux). On Linux servers you can install **Docker Engine** instead.

Official downloads and docs: [https://docs.docker.com/get-started/get-docker/](https://docs.docker.com/get-started/get-docker/)

Pick your operating system below, then finish with the shared **Verify** steps.

### Windows

**Recommended:** Docker Desktop with the **WSL 2** backend.

1. **Check requirements**
   - 64-bit Windows 10 (version 22H2+) or Windows 11
   - Virtualization enabled in BIOS/UEFI (often labeled *Intel VT-x*, *AMD-V*, or *SVM*)
   - About 4 GB RAM free (8 GB+ recommended)

2. **Install WSL 2** (required for the recommended setup)
   - Open **PowerShell as Administrator** and run:

```powershell
wsl --install
```

   - Restart when Windows asks you to.
   - After reboot, finish any Ubuntu (or other distro) first-time setup if a terminal opens.
   - Confirm WSL is ready:

```powershell
wsl --status
```

3. **Download Docker Desktop for Windows**
   - Go to [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
   - Download the installer for your CPU (AMD64 for most PCs, ARM64 for Snapdragon/ARM devices)

4. **Run the installer**
   - Double-click `Docker Desktop Installer.exe`
   - Prefer the default options
   - Ensure **Use WSL 2 instead of Hyper-V** is selected when offered
   - Finish the wizard and start Docker Desktop when prompted

5. **Accept the terms and wait for the engine**
   - Open Docker Desktop from the Start menu if it is not already running
   - Accept the Docker Subscription Service Agreement (personal / learning use is allowed under Docker’s terms)
   - Wait until the whale icon in the system tray shows Docker is **running** (not “starting”)

6. **Verify in a terminal**
   - Open **PowerShell**, **Windows Terminal**, or a **WSL** shell and continue with the Verify section below

**If something fails on Windows**

- Restart the PC after installing WSL, then start Docker Desktop again
- In Docker Desktop → Settings → General, confirm WSL 2 is selected
- In Docker Desktop → Settings → Resources → WSL Integration, enable your installed distro
- Run `wsl --update` in an elevated PowerShell if WSL is outdated

### macOS

**Recommended:** Docker Desktop for Mac.

1. **Check requirements**
   - A supported macOS version (current release and the two previous majors are typically supported)
   - Apple Silicon (M1/M2/M3/M4…) **or** Intel Mac
   - About 4 GB RAM free (8 GB+ recommended)

2. **Download the correct installer**
   - Go to [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
   - Choose **Apple Silicon** or **Intel Chip** to match your Mac
   - Tip: Apple menu → About This Mac shows the chip type

3. **Install Docker Desktop**
   - Open the downloaded `Docker.dmg`
   - Drag the Docker icon into **Applications**
   - Eject the disk image when finished

4. **Start Docker for the first time**
   - Open **Applications → Docker**
   - Approve macOS security / privacy prompts (Password or Touch ID may be required)
   - Accept the Docker Subscription Service Agreement
   - Wait until the menu-bar whale icon shows Docker is **running**

5. **Verify in Terminal**
   - Open **Terminal** (or iTerm) and continue with the Verify section below

**If something fails on macOS**

- System Settings → Privacy & Security: allow Docker if macOS blocked it
- Quit Docker completely (whale menu → Quit), then reopen it
- Confirm you installed the Apple Silicon build on an M-series Mac (Intel builds will not run well there)

### Linux

You have two common choices:

| Option | Best when |
|--------|-----------|
| **Docker Desktop for Linux** | You want a GUI and an easy all-in-one setup |
| **Docker Engine** (daemon + CLI) | You prefer a lighter install on Ubuntu/Debian/Fedora/etc. |

#### Option A — Docker Desktop for Linux

1. Confirm your distro is supported (Ubuntu, Debian, and Fedora are common choices): [Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/)
2. Install the package for your distro (`.deb` or `.rpm`) from the official page
3. Launch Docker Desktop from your app menu
4. Accept the agreement and wait until the engine shows as running
5. Continue with Verify below

#### Option B — Docker Engine (CLI) on Ubuntu/Debian-family

These steps are the usual path for many Linux learners. For other distros, follow Docker’s Engine docs for your family ([Install Docker Engine](https://docs.docker.com/engine/install/)).

1. **Update packages and install prerequisites**

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
```

2. **Add Docker’s official GPG key and apt repository**

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
```

> On Debian, use Docker’s Debian instructions (`download.docker.com/linux/debian`) instead of the Ubuntu URL above.

3. **Install Engine, CLI, Compose plugin, and helpers**

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. **Start Docker and enable it on boot**

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

You want `active (running)`.

5. **(Recommended) Use Docker without typing `sudo` every time**

```bash
sudo usermod -aG docker $USER
```

Then **log out and log back in** (or reboot) so the group membership applies. Until you do, keep using `sudo docker …`.

### Verify (all platforms)

After Docker is installed and running, open a terminal and run:

```bash
docker --version
docker compose version
docker info
docker run --rm hello-world
```

**What you should see**

- A Docker version (Engine / Desktop)
- Compose version (plugin: `docker compose`, not only the old `docker-compose` binary)
- `docker info` shows server details (storage driver, CPUs, memory)
- `hello-world` downloads a tiny image and prints a success message

If `docker info` or `hello-world` fails, Docker is not fully running yet — start Docker Desktop (or `sudo systemctl start docker` on Linux Engine) and try again.

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
# Is the daemon running? (Linux Engine / many distros)
sudo systemctl status docker
```

On Windows and macOS with Docker Desktop, the daemon runs inside Desktop’s Linux VM — keep the Desktop app running while you work.

---

## 5. Your first containers

### Lab: `labs/02-hello`

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

## 6. Images deeply explained

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

## 7. Dockerfile — build your own images

### Lab: `labs/03-dockerfile`

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

From `labs/03-dockerfile`:

```bash
cd labs/03-dockerfile
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

## 8. Volumes — keep data alive

### Lab: `labs/06-volumes`

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

## 9. Networks — how containers talk

### Lab: `labs/05-networks`

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

## 10. Environment, secrets, and config

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

## 11. Docker Compose — multi-container apps

### Lab: `labs/04-compose`

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

## 12. Multi-stage builds & image size

### Lab: `labs/07-multi-stage`

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

## 13. Production-minded practices

### Lab: `labs/08-production`

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

## 14. Debugging & troubleshooting

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

## 15. Security essentials

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

## 16. Advanced topics

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

## 17. Capstone project

Build a small stack in this repo (you can extend `labs/04-compose`):

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

## 18. Cheat sheet

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

## 19. Learning path checklist

### Beginner

- [ ] Explain containerization vs VMs vs Docker vs Kubernetes
- [ ] Describe namespaces and cgroups at a high level
- [ ] Complete `labs/01-isolation-basics`
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
| 1 | Isolation basics + hello workflow | `labs/01-isolation-basics`, `labs/02-hello` |
| 2 | Dockerfile mastery | `labs/03-dockerfile` |
| 3 | Compose basics | `labs/04-compose` |
| 4 | Networks & volumes | `labs/05-networks`, `labs/06-volumes` |
| 5 | Multi-stage + prod habits | `labs/07-multi-stage`, `labs/08-production` |
| 6–7 | Capstone | your own stack |

---

## Glossary

| Term | Definition |
|------|------------|
| Containerization | Packaging an app with its deps into an isolated unit on a shared kernel |
| OCI | Open Container Initiative — standards for images and runtimes |
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
2. Re-run the Chapter 2 isolation examples until they feel obvious.
3. Containerize a real app you already know.
4. Read official docs: [https://docs.docker.com/](https://docs.docker.com/)
5. Learn Compose Watch / Dev Containers for daily development.
6. When deploying multi-node: start Kubernetes fundamentals (Pods, Deployments, Services).

---

*Created for the `rean-docker` learning project. Work chapter by chapter; prefer understanding over rushing commands.*
