# Docker ពីសូន្យដល់ Hero

> **គម្រោង:** `rean-docker`  
> **ទស្សនិកជន:** អ្នកចាប់ផ្តើមពីសូន្យ → អ្នកអនុវត្តកម្រិតខ្ពស់  
> **រចនាប័ទ្ម:** ជំហានម្តងមួយជំហាន ជាមួយ commands ដែលអ្នកអាច run បាន ការពន្យល់ *ហេតុផល* labs ក្នុង repo នេះ រួមទាំង chapter deploy/CI/CD ពិសេស

---

## របៀបប្រើមគ្គុទ្ទេសក៍នេះ

1. អាន chapter នីមួយៗតាមលំដាប់ (ពួកវាតភ្ជាប់គ្នា)។
2. វាយ commands ដោយខ្លួនឯង — កុំអានតែប៉ុណ្ណោះ។
3. បន្ទាប់ពី chapter beginner/intermediate នីមួយ បញ្ចប់ lab ដែលផ្គូផ្គងក្រោម `labs/`។
4. បើក terminal នៅ root គម្រោងនេះ (ទីកន្លែងដែលអ្នក clone ឬ download repo):

```bash
cd path/to/rean-docker
```

**ទម្លាប់ប្រើនៅទីនេះ**

| សញ្ញា | អត្ថន័យ |
|--------|---------|
| `$` | Run នៅ terminal host របស់អ្នក |
| `#` | Comment / ការពន្យល់ |
| `→` | គំនិត / លទ្ធផលដែលរំពឹង |

---

## តារាងខ្លឹមសារ

1. [តើ Docker ដោះស្រាយបញ្ហាអ្វី?](#1-តើ-docker-ដោះស្រាយបញ្ហាអ្វី)
2. [មូលដ្ឋាន containerization](#2-មូលដ្ឋាន-containerization)
3. [គំរូគំនិតស្នូល](#3-គំរូគំនិតស្នូល)
4. [ដំឡើង និងផ្ទៀងផ្ទាត់](#4-ដំឡើង-និងផ្ទៀងផ្ទាត់)
5. [Container ដំបូងរបស់អ្នក](#5-container-ដំបូងរបស់អ្នក)
6. [ពន្យល់ images ឱ្យជ្រៅ](#6-ពន្យល់-images-ឱ្យជ្រៅ)
7. [Dockerfile — បង្កើត image ផ្ទាល់ខ្លួន](#7-dockerfile--បង្កើត-image-ផ្ទាល់ខ្លួន)
8. [Volumes — រក្សាទិន្នន័យឱ្យនៅរស់](#8-volumes--រក្សាទិន្នន័យឱ្យនៅរស់)
9. [Networks — របៀបដែល containers និយាយគ្នា](#9-networks--របៀបដែល-containers-និយាយគ្នា)
10. [Environment, secrets និង config](#10-environment-secrets-និង-config)
11. [Docker Compose — កម្មវិធីពហុ container](#11-docker-compose--កម្មវិធីពហុ-container)
12. [Multi-stage builds និងទំហំ image](#12-multi-stage-builds-និងទំហំ-image)
13. [ទម្លាប់គិតបែប production](#13-ទម្លាប់គិតបែប-production)
14. [Debug និងដោះស្រាយបញ្ហា](#14-debug-និងដោះស្រាយបញ្ហា)
15. [សុវត្ថិភាពសំខាន់ៗ](#15-សុវត្ថិភាពសំខាន់ៗ)
16. [ប្រធានបទកម្រិតខ្ពស់](#16-ប្រធានបទកម្រិតខ្ពស់)
17. [Deploy ជាមួយ Docker & CI/CD](#17-deploy-ជាមួយ-docker--cicd) *(ពិសេស)*
18. [គម្រោង capstone](#18-គម្រោង-capstone)
19. [សន្លឹកជំនួយ](#19-សន្លឹកជំនួយ)
20. [តារាងតាមដានផ្លូវរៀន](#20-តារាងតាមដានផ្លូវរៀន)

---

## 1. តើ Docker ដោះស្រាយបញ្ហាអ្វី?

### ការឈឺចដែលជាប់ទម្លាប់

អ្នក build app នៅ laptop។ វាដំណើរការ។ នៅ machine មិត្តរួមការ៖ ខូច។ នៅ server៖ ខូច។ មូលហេតុជាធរមានរួមមាន៖

- OS packages ខុសគ្នា
- Language runtime ខុសគ្នា (Node 18 vs 20, Python 3.10 vs 3.12)
- System libraries ខ្វះ
- Configuration drift «វាដំណើរការនៅ machine ខ្ញុំ»

### ចម្លើយរបស់ Docker

**Package application *និង* runtime dependencies របស់វាទៅក្នុង unit ដែលអាចផ្ទេរបាន ហៅថា container។**

Unit នោះ៖

- Run ដូចគ្នានៅ laptop, CI និង server
- Start ក្នុងរយៈពេលពីរបីវិនាទី (ស្រាលជាង virtual machine ពេញ)
- Isolate processes, filesystems និង (ជម្រើស) networks

### Containers vs virtual machines

| | Virtual Machine | Container |
|--|-----------------|-----------|
| រួមបញ្ចូល guest OS? | បាទ (OS ពេញ) | ទេ — share host kernel |
| ទំហំ | GB | MB–រយៈរាប hundreds of MB |
| ពេល start | នាទី | វិនាទី |
| Isolation | រឹង (hypervisor) | Process-level (namespaces + cgroups) |
| Density | តិច per host | ច្រើន per host |

**រូបភាព:** VM គឺជាផ្ទះពេញមួយ។ Container គឺជាបន្ទប់ក្នុងអគារដែល share plumbing និង electricity (host kernel) ប៉ុន្តែមានបន្ទប់ចាក់សោផ្ទាល់ (filesystem, process tree, network namespace)។

បន្ទាប់ **Chapter 2** ពន្យល់ containerization ជាភាសាសាមញ្ញ (មូលដ្ឋាន beginner) រួច **Lab 01** ឱ្យអ្នកមានអារម្មណ៍ isolation ជាមួយ commands សាមញ្ញ។

### Docker គឺអ្វី (និងមិនមែនអ្វី)

**Docker គឺ៖**

- Platform ដើម្បី build, ship និង run containers
- Client (`docker`) និយាយជាមួយ daemon (`dockerd`)
- Ecosystem៖ images, registries (Docker Hub), Compose ជាដើម

**Docker មិនមែន៖**

- ជំនួស architecture application ល្អ
- «Secure by default» ដោយវេទម្ម (អ្នកនៅតែ harden images និង configs)
- ដូច Kubernetes (K8s *orchestrate* containers ក scale; Docker *run* ពួកវា)

---

## 2. មូលដ្ឋាន containerization

Containerization គឺ **គំនិត**។ Docker គឺ **tool** ដែលមនុស្សភាគច្រើនប្រើអនុវត្តគំនិតនោះ។

**Chapter នេះគឺមូលដ្ឋាន beginner** មិនមែន course systems កម្រិតខ្ពស់ទេ។ Skim ផ្នែកជ្រៅ (namespaces, OCI, `runc`) ក្នុងការអានដំបូងបើចង់ — lab ដែលផ្គូផ្គងត្រូវការតែ commands `docker` សាមញ្ញ។

**Lab pairing:** បន្ទាប់ (ឬកំឡុង) អាន chapter នេះ ធ្វើ **`labs/01-isolation-basics`** (Lab 01 — Isolation basics)។ រួចបន្ត Lab 02 សម្រាប់ workflow ប្រចាំថ្ងៃ។

Chapter នេះពន្យល់ containerization ទូទៅ រួចឱ្យជ្រាលដូច្នេះ commands Docker ពេលក្រោយមានហេតុផល — មិនវេទម្ម។

### មួយប្រយោគ

**Containerization** package application ជាមួយអ្វីដែលវាត្រូវការដើម្បី run (runtime, libraries, config) ទៅក្នុង unit ដែល isolated ដែល share OS kernel របស់ host ប៉ុន្តែមានទស្សនៈផ្ទាល់របស់ processes, files និង network។

Unit នោះគឺ **container**។

### រូបភាពទូទៅ (ចាប់ផ្តើមទីនេះ)

គិតពីបីស strata «run software យ៉ាងដូចម្តេច?»៖

| វិធី | អ្វីដែលអ្នក ship | Isolation | ទំហំ / start ធម្មតា |
|----------|---------------|-----------|----------------------|
| Bare metal / host install | App + សង្ឃឹម machine ផ្គូផ្គង | ជិតគ្មាន | លឿន ប៉ុន្តែ fragile |
| Virtual machine | App + guest OS ពេញ | រឹង (kernel ដាច់) | ធ្ងន់ start យឺត |
| Container | App + userland deps (គ្មាន guest OS ពេញ) | Process-level (share kernel) | ស្រាល start ក្នុងវិនាទី |

**Containerization bet:** apps ភាគច្រើនមិនត្រូវការ OS ទីពីរពេញទេ។ ពួកវាត្រូវការ **filesystem និង libraries ស្ថិតស្ថេរប្រាកដ** រួម **isolation គ្រប់គ្រាន់** ដើម្បី app មួយមិនធ្វើឱ្យ app ផ្សេងខូច។

#### រូបភាពប្រចាំថ្ងៃ

- **VM** គឺជួលផ្ទះពេញ (foundation, plumbing, electrical panel = guest OS)។
- **Container** គឺបន្ទប់ក្នុងអគារ៖ បន្ទប់ឯកជន (files, processes, ports) share ប្រព័ន្ធ building (host kernel)។
- **Image** គឺ blueprint បន្ទប់ដែលមាន furniture; **container** គឺ unit ដែល rent ហើយ start ពី blueprint នោះ។

#### Containerization ដោះស្រាយបញ្ហាអ្វី (លើស «Docker»)

1. **Reproducibility** — bits ដូចគ្នា run នៅ laptop, CI និង server។
2. **Density** — apps ច្រើន per machine ដោយមិនចាំបាច់ VM មួយ per app។
3. **Speed** — start/stop ក្នុងវិនាទីសម្រាប់ deploy និង tests។
4. **Portability** — ផ្ទេរ unit រវាង environments ដោយមិន reinstall ពិភពលូត។
5. **Clear boundaries** — dependencies នៅ *ក្នុង* unit មិនមែន «នៅណាមួយនៅ host»។

#### Containerization vs Docker vs Kubernetes

| ពាក្យ | គឺអ្វី |
|------|------------|
| **Containerization** | *Concept*៖ isolate + package + run ជាមួយ shared kernel |
| **Docker** | *Platform* ពេញនិយម build, ship និង run containers |
| **OCI** | Open standards សម្រាប់ images និង runtimes (tools interoperate) |
| **Kubernetes** | *Orchestrator*៖ schedule containers ច្រើន across machines |

អ្នកអាច containerize ដោយមិនប្រើ Docker (Podman, containerd, nerdctl ជាដើម)។ ជាធរមានរៀន Docker មុន ពី workflow ច្បាស់ និង ecosystem ធំ។

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

### ប្រវត្តិសង្ខេប (ហេតុអ្វីមាន)

1. **chroot** (Unix) — ផ្លាស់ប្តូរ root filesystem ដែល process ឃើញ (filesystem jail; ខ្សោយពីរបួស)។
2. **Linux namespaces + cgroups** — kernel features ធ្វើ containers ពិតបាន (isolate identity; limit CPU/RAM)។
3. **LXC** និងផ្សេងៗ — «Linux containers» ដំបូងៗ។
4. **Docker (2013+)** — ធ្វើ *developer experience* mainstream៖ Dockerfile, images, Hub, CLI សាមញ្ញ។
5. **OCI** — standardize image/runtime formats ដើម្បី ecosystem មិន lock ទៅ vendor មួយជារៀងរហូត។

មិនចាំបាច់ memorize ប្រវត្តិ។ ចងចាំ៖ **containers = Linux kernel feature set + packaging format + UX ល្អ**។

### Model លម្អិត៖ អ្វី isolated ពិត?

នៅ Linux container ជារឿយៗ **processes ធម្មតា** ជាមួយ kernel controls បន្ថែម។

#### Namespaces — «ខ្ញុំឃើញអ្វី?»

Namespaces ផ្តល់ process ទស្សនៈផ្ទាល់របស់ system resources៖

| Namespace | Isolates | ហេតុសំខាន់ |
|-----------|----------|----------------|
| **pid** | Process IDs | ក្នុង container app អាច PID 1 |
| **mnt** | Mounts / filesystem tree | Container មាន `/` ផ្ទាល់ មិនមែន host |
| **net** | Network stack | Interfaces, IPs, ports, routing ផ្ទាល់ |
| **uts** | Hostname | Container hostname ≠ host hostname |
| **ipc** | Shared memory / IPC | Apps មិន collide IPC objects |
| **user** | User IDs (ជម្រើស) | Map container root → unprivileged host user |

**គំនិតឧទាហរណ៍:** containers ពីរអាច listen port `80` *ក្នុង* network namespace ផ្ទាល់។ នៅ host publish ports ខុសគ្នា (`-p 8080:80` និង `-p 8081:80`)។

#### cgroups — «ខ្ញុំប្រើបានប៉ុន្មាន?»

**Control groups (cgroups)** limit និង account resources៖

- CPU time
- Memory
- PIDs / process count
- Block I/O (ពេលខ្លះ)

គ្មាន cgroups container runaway អាច starve host។ មានពួកវា អ្នកអាចនិយាយ «API នេះយ៉ាងច្រើន 512MB RAM»។

#### Union filesystem / layers — «disk build យ៉ាងដូចម្តេច?»

Images ជា **layers** stacked (read-only)។ Container run នោះ Docker បន្ថែម **writable layer** តូចពីលើ៖

```
[ writable container layer ]  ← changes while running (unless volumes)
[ image layer: your app ]
[ image layer: npm deps ]
[ image layer: base OS userland ]
```

ហេតុនេះ៖

- Images share layers នៅ disk (មានប្រសិទ្ធភាព)។
- Rebuilds លឿន (cache layers មិនផ្លាស់)។
- Delete container បោះ writable layer (unless volumes)។

#### Shared kernel — tradeoff សំខាន់

Containers **share host kernel**។ នោះមានន័យ៖

- ស្រាលជាង VMs។
- Kernel bug ឬ privileged container misconfigured ធ្ងន់ជាង VM isolated ល្អ។
- Run Windows container kernel លើ Linux kernel (ឬផ្ទុយ) មិនបានដោយគ្មាន virtualization (Docker Desktop ប្រើ VM តូច Mac/Windows)។

### Model លម្អិត៖ image vs container (lifecycle)

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

- **Image** = immutable template (ជាធរមាន)។
- **Container** = instance មាន state (running ឬ stopped)។
- **Registry** = shelf remote សម្រាប់ images (Docker Hub, GHCR, …)។

Image មួយ → containers ច្រើន (ដូច class → objects)។

### Docker implement containerization (stack សាមញ្ញ)

អ្នកវាយ `docker …`។ ជារួម៖

```
docker CLI  →  dockerd (Docker daemon)  →  containerd  →  runc  →  Linux namespaces/cgroups
```

| ផ្នែក | តួនាទី |
|-------|------|
| **CLI** | Human interface (`docker run`, `build`, …) |
| **dockerd** | Docker API/orchestrator នៅ machine មួយ |
| **containerd** | Manage container lifecycle / images |
| **runc** | Create container តាម OCI runtime + kernel features |

Docker Desktop (Mac/Windows) stack run **ក្នុង Linux VM ស្រាល** ពី host kernel Mac/Windows មិនមែន Linux kernel containers រំពឹង។

កម្ម rare ប៉ះ `runc`។ យល់ stack ពន្យល់ error messages និង «ទីកន្លែង» run។

### Lab៖ `labs/01-isolation-basics` (beginner)

**Path ពេញចិត្ត:** បញ្ចប់ Lab 01 (Isolation basics)។ គំនិតដូច demos ខាងក្រោម ជាមួយ checklist និង «what to notice»។

**មិន**ត្រូវការចំណេះដឹងកម្រិតខ្ពស់ — តែ `docker run`, `exec`, `rm`។

### Worked examples (reference ជម្រើស)

Demos ដូច Lab 01 ទុកនៅ handbook។ សន្មត Docker installed (Chapter 4)។ Skim ឥឡូវ read ahead រួច re-run បន្ទាប់ install — ឬធ្វើ lab។

#### Example A — Isolation processes (pid namespace)

```bash
# Start a quiet container
docker run -d --name rean-ps alpine:3.20 sleep 3600

# Processes *inside* the container (small list; sleep is typically PID 1)
docker exec rean-ps ps aux

# Processes on the host (huge list) — different pid namespace
ps aux | head

docker rm -f rean-ps
```

→ ក្នុង container **មិន**ឃើញ Chrome/Slack processes host។ នោះគឺ pid isolation។

#### Example B — Isolation filesystem (mnt namespace)

```bash
docker run --rm -it alpine:3.20 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'
```

→ Container មាន `/tmp` និង `/` ផ្ទាល់។ Create `/tmp/note.txt` ក្នុងមិន create file នៅ desktop host។

Compare **bind mount** (folder share intentionally — live coding ពេលក្រោយ)៖

```bash
mkdir -p /tmp/rean-share
echo 'from-host' > /tmp/rean-share/msg.txt
docker run --rm -v /tmp/rean-share:/data alpine:3.20 cat /data/msg.txt
# → from-host
```

Isolation default; sharing opt-in។

#### Example C — Isolation network (net namespace)

```bash
# Two containers, each with nginx on container-port 80
docker run -d --name rean-web-a -p 18080:80 nginx:alpine
docker run -d --name rean-web-b -p 18081:80 nginx:alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f rean-web-a rean-web-b
```

→ Container នីមួយៗគិតថាមាន port `80`។ Host map published ports ខុសគ្នា។ Network namespacing + port publishing។

#### Example D — Resource limits (cgroups)

```bash
# Limit memory; watch Docker enforce it
docker run --rm -m 128m --memory-swap 128m alpine:3.20 \
  sh -c 'echo "cgroup memory limit applied"; cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "(limit visible via docker inspect)"'
```

Inspect ពីខាងក្រៅ៖

```bash
docker run -d --name rean-limited -m 256m alpine:3.20 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' rean-limited
# → 268435456 (bytes)
docker rm -f rean-limited
```

→ Containerization មិនតែ isolate *identity*; គឺ **controlled consumption**។

#### Example E — Image ដូចគ្នា containers ច្រើន (density)

```bash
docker pull redis:7-alpine
docker run -d --name rean-r1 redis:7-alpine
docker run -d --name rean-r2 redis:7-alpine
docker run -d --name rean-r3 redis:7-alpine
docker ps --filter name=rean-r
docker rm -f rean-r1 rean-r2 rean-r3
```

→ Image មួយ Redis processes isolated បី។ Density win ធៀប VMs បី។

#### Example F — Packaging «works the same» (portable unit)

```bash
# Official image already packages Redis + its defaults
docker run --rm -p 6379:6379 redis:7-alpine
# In another terminal: docker run --rm -it redis:7-alpine redis-cli -h host.docker.internal ping
# (On Linux you may use --network host or the container IP instead)
```

Chapters ក្រោយ **build portable unit** ផ្ទាល់ Dockerfile។ គំនិតដូចគ្នា៖ ship environment ជាមួយ app។

### *Inside* typical container image?

ជាធរមាន៖

- **Userland** minimal (Alpine, Debian slim, distroless, …) — *មិន* kernel ទីពីរ
- Language runtime (Node, Python, JVM, …) បើត្រូវការ
- Application files
- Default command (`CMD` / `ENTRYPOINT`)
- Metadata (ports, env defaults, labels)

**ជាធរមានមិនមាន**៖

- Hypervisor
- `/home` host (unless mount)
- Filesystems containers ផ្សេង
- Desktop environment ពេញ

### Containerization *មិន*មានន័យ

| Myth | Reality |
|------|---------|
| «Containers = VMs» | ទេ — shared kernel, process-level isolation |
| «Containers secure automatically» | Defaults ជួយ ប៉ុន្តែ harden (users, scans, least privilege) |
| «Container មួយ = machine VM-sized» | Prefer **concern មួយ per container** (API, DB, worker) compose រួម |
| «Docker តែវិធី» | Docker popularize; OCI-compatible tools run containers |
| «Run Docker = production solved» | Config, secrets, networking, observability orchestrator |

### ពេល containerize (និងពេលមិន)

**Fit ល្អ**

- Web APIs, workers, job runners
- Sidecars (proxy, log shipper)
- Databases *dev/test* (prod DB managed separately — team choice)
- CI tasks environment clean repeatable
- Ship artifact ដូចគ្នា laptop → staging → prod

**Fit ខ្សោយ / careful**

- GUI desktop apps (possible ប៉ុន្តែ awkward)
- Apps ត្រូវការ host device / kernel module access
- Ultra-low-latency kernel workloads VM/bare metal mandated
- «Lift and shift» monolith messy *without* fix config — containers package chaos too

### Mental checklist មុន run container

1. **Image** អ្វី? (trust + tag/digest)
2. **Isolated** vs **sharing**? (ports, volumes, env)
3. **Resources** ប៉ុន្មាន? (memory/CPU limits prod)
4. **Data** ពេល remove container? (volumes!)
5. **Who reach**? (published ports, networks)

### Bridge ទៅ guide នេះ

| Topic បន្ទាប់ | តភ្ជាប់ containerization |
|------------|-------------------------------------|
| Core mental model (Ch.3) | Image / container / Dockerfile / registry vocabulary |
| Isolation basics (Lab 01) | Feel isolation commands `docker` |
| First containers (Ch.5 / Lab 02) | Workflow run, logs, clean up |
| Images & Dockerfiles | *Build* portable unit |
| Volumes & networks | Controlled exceptions isolation |
| Compose | Containers ច្រើន cooperate app |
| Production & security | Harden shared-kernel world |

**Takeaway:** Containerization = **package + isolate + limit + ship** shared kernel។ Docker practice នៅ `rean-docker`។

---

## 3. គំរូគំនិតស្នូល

Memorize ពាក្យបួន៖

### Image

**Read-only template** — ដូច class ឬ snapshot filesystem + metadata (default command, env, exposed ports)។

Examples: `nginx:alpine`, `postgres:16`, `node:22-alpine`។

### Container

**Running (ឬ stopped) instance** image — ដូច object ពី class។

Start containers ច្រើន image មួយ។

### Dockerfile

**Recipe** (text file) Dockerfile build image ជួរតាមជួរ។

### Registry

**Storage/server images**។ Public default: [Docker Hub](https://hub.docker.com)។ Private: GHCR, ECR, GCR, Harbor ជាដើម។

```
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
                                    ↓
                              docker push/pull
                                    ↓
                                Registry
```

### Layers

Images stack **layers**។ Dockerfile instruction ជាធរមាន layer។ Layers unchanged **cached** rebuilds លឿន order instructions wisely។

---

## 4. ដំឡើង និងផ្ទៀងផ្ទាត់

ត្រូវការ Docker **computer អ្នក** មុន labs។ Learners ភាគច្រើន install **Docker Desktop** (Windows, macOS, Linux)។ Linux servers **Docker Engine**។

Official: [https://docs.docker.com/get-started/get-docker/](https://docs.docker.com/get-started/get-docker/)

Pick OS ខាងក្រោម រួច **Verify** shared។

### Windows

**Recommended:** Docker Desktop **WSL 2** backend។

1. **Check requirements**
   - 64-bit Windows 10 (22H2+) or Windows 11
   - Virtualization BIOS/UEFI (*Intel VT-x*, *AMD-V*, *SVM*)
   - ~4 GB RAM free (8 GB+ recommended)

2. **Install WSL 2** (required)
   - **PowerShell as Administrator**:

```powershell
wsl --install
```

   - Restart when asked។
   - After reboot finish Ubuntu first-time setup។
   - Confirm WSL:

```powershell
wsl --status
```

3. **Download Docker Desktop for Windows**
   - [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
   - AMD64 (most PCs) or ARM64 (Snapdragon/ARM)

4. **Run installer**
   - `Docker Desktop Installer.exe`
   - Default options
   - **Use WSL 2 instead of Hyper-V** when offered
   - Finish wizard start Docker Desktop

5. **Accept terms wait engine**
   - Start menu Docker Desktop
   - Accept Docker Subscription Service Agreement (personal/learning allowed)
   - Whale icon **running** (not «starting»)

6. **Verify terminal**
   - **PowerShell**, **Windows Terminal**, or **WSL** → Verify below

**Windows fails**

- Restart PC after WSL start Docker Desktop
- Docker Desktop → Settings → General WSL 2
- Settings → Resources → WSL Integration enable distro
- `wsl --update` elevated PowerShell

### macOS

**Recommended:** Docker Desktop for Mac។

1. **Check requirements**
   - Supported macOS (current + two previous majors)
   - Apple Silicon (M1/M2/M3/M4…) **or** Intel Mac
   - ~4 GB RAM free (8 GB+ recommended)

2. **Download installer**
   - [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
   - **Apple Silicon** or **Intel Chip**
   - Apple menu → About This Mac chip type

3. **Install Docker Desktop**
   - Open `Docker.dmg`
   - Drag Docker → **Applications**
   - Eject disk image

4. **Start first time**
   - **Applications → Docker**
   - Approve security/privacy prompts
   - Accept agreement
   - Menu-bar whale **running**

5. **Verify Terminal**
   - **Terminal** (or iTerm) → Verify below

**macOS fails**

- System Settings → Privacy & Security allow Docker
- Quit Docker (whale → Quit) reopen
- Apple Silicon build on M-series (Intel builds poor)

### Linux

Two choices:

| Option | Best when |
|--------|-----------|
| **Docker Desktop for Linux** | GUI easy all-in-one |
| **Docker Engine** (daemon + CLI) | Lighter Ubuntu/Debian/Fedora |

#### Option A — Docker Desktop for Linux

1. Distro supported (Ubuntu, Debian, Fedora): [Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/)
2. Install `.deb` or `.rpm` official
3. Launch app menu
4. Accept agreement engine running
5. Verify below

#### Option B — Docker Engine (CLI) Ubuntu/Debian-family

Steps usual Linux learners។ Other distros: [Install Docker Engine](https://docs.docker.com/engine/install/)។

1. **Update packages prerequisites**

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
```

2. **Add Docker GPG key apt repository**

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

> Debian: use Debian instructions (`download.docker.com/linux/debian`) not Ubuntu URL។

3. **Install Engine, CLI, Compose plugin, helpers**

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. **Start Docker enable boot**

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

Want `active (running)`។

5. **(Recommended) Docker without `sudo` every time**

```bash
sudo usermod -aG docker $USER
```

**Log out log back in** (or reboot) group applies។ Until then `sudo docker …`។

### Verify (all platforms)

Docker installed running terminal:

```bash
docker --version
docker compose version
docker info
docker run --rm hello-world
```

**Should see**

- Docker version (Engine / Desktop)
- Compose version (plugin `docker compose`, not only old `docker-compose`)
- `docker info` server details
- `hello-world` tiny image success message

`docker info` or `hello-world` fails → Docker not fully running — start Docker Desktop (`sudo systemctl start docker` Linux Engine) retry។

### Important Linux note: permissions

`permission denied` Docker socket:

```bash
# Option A (common): add user docker group, log out/in
sudo usermod -aG docker $USER

# Option B: prefix sudo (works, less convenient)
sudo docker ps
```

### Daemon vs client

- **Client:** `docker` CLI you type
- **Daemon:** `dockerd` background creates containers

```bash
# Is the daemon running? (Linux Engine / many distros)
sudo systemctl status docker
```

Windows/macOS Docker Desktop daemon inside Desktop Linux VM — keep Desktop running while work។

---

## 5. Container ដំបូងរបស់អ្នក

### Lab: `labs/02-hello`

### Run container (foreground)

```bash
docker run -it ubuntu:24.04 bash
```

| Flag | Meaning |
|------|---------|
| `run` | Create + start container from image |
| `-i` | Keep STDIN open |
| `-t` | Allocate TTY (interactive terminal) |
| `ubuntu:24.04` | Image name + tag |
| `bash` | Command run inside |

Inside container try:

```bash
cat /etc/os-release
whoami
exit
```

When `exit` container **stops**។ Still exists until remove។

### Run background (detached)

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

### `--rm` throwaway containers

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

1. Run Nginx port `8080`។
2. `curl localhost:8080` confirm HTML។
3. `docker exec` list `/usr/share/nginx/html`។
4. Stop remove container។

---

## 6. ពន្យល់ images ឱ្យជ្រៅ

### List and inspect

```bash
docker images
# or
docker image ls

docker pull redis:7-alpine
docker image inspect redis:7-alpine
docker history redis:7-alpine
```

`history` shows layers approximate sizes — gold bloat។

### Tags

`nginx:alpine` means:

- Repository/name: `nginx`
- Tag: `alpine` (variant Alpine Linux)

Special tag: `latest` — **do not rely production**។ Prefer explicit versions: `nginx:1.27-alpine`។

### Official vs custom images

- **Official images** Docker Hub curated (postgres, redis, python…)។
- **Your images** built Dockerfiles pushed registry។

### Image IDs vs names

Images content digest / ID។ Names human labels IDs។ Retagging not copy layers; another name។

```bash
docker tag nginx:alpine my-nginx:dev
docker images | grep nginx
```

---

## 7. Dockerfile — បង្កើត image ផ្ទាល់ខ្លួន

### Lab: `labs/03-dockerfile`

Dockerfile script instructions។ Example (Node static-ish app):

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

Prefer **exec form** (JSON array), not shell form, signals (SIGTERM) reach process correctly:

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

Everything context directory sent Docker។ Exclude junk:

```gitignore
node_modules
.git
*.md
.env
npm-debug.log
```

**Why it matters:** Smaller context = faster builds។ Never copy secrets into images accidentally។

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

Rule: **ដាក់ជំហានដែលផ្លាស់ប្តូយក rare និង expensive មុន; ដាក់ source ផ្លាស់ប្តូយញឹកញាប់ពេលក្រោយ។**

---

## 8. Volumes — រក្សាទិន្នន័យឱ្យនៅរស់

### Lab: `labs/06-volumes`

Containers **ephemeral** (មិនអចិន្ត)។ Delete container → writable layer បាត់។

រក្សាទិន្នន័យប្រើ **volumes** ឬ **bind mounts**។

### ប្រភេទ mount បី

| Type | Use case | Example |
|------|----------|---------|
| **Named volume** | DB data, Docker manage | `docker volume create pgdata` |
| **Bind mount** | Live-edit source code host | `-v $(pwd):/app` |
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

Stop/remove container — **data remains** in `rean-pgdata`។

```bash
docker volume ls
docker volume inspect rean-pgdata
```

### Bind mount example (dev)

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine node -e "console.log('hi from bind mount')"
```

### Volume vs bind: ពេលណាប្រើអ្វី

- **Volume:** production data, databases, អ្វី Docker គួរ manage
- **Bind:** local development, config files edit host

### ប្រយ័ត្ន permissions

Bind mounts inherit host UID/GID issues។ Prefer matching user Dockerfile (`USER`) or fix ownership carefully។

---

## 9. Networks — របៀបដែល containers និយាយគ្នា

### Lab: `labs/05-networks`

Default containers same user-defined bridge network reach each other **by container name** (DNS)។

```bash
docker network create rean-net

docker run -d --name rean-redis --network rean-net redis:7-alpine

docker run --rm --network rean-net redis:7-alpine \
  redis-cli -h rean-redis ping
# → PONG
```

Hostnames:

- Container ផ្សេង `rean-net`: `rean-redis`
- Host machine: via published ports (`localhost:6379`) មិនមែន internal name

### Network types (simplified)

| Driver | Typical use |
|--------|-------------|
| `bridge` | Default single-host apps (common) |
| `host` | Container share host network stack (Linux) |
| `none` | No networking |
| `overlay` | Multi-host (Swarm) |

### Port publishing ម្តងទៀត

`-p HOST:CONTAINER` affects access **from host / outside**។ Containers same Docker network talk *container* port without `-p`។

Example: app connects `postgres:5432` internally; publish `5432` only if host tools (psql GUI) connect។

---

## 10. Environment, secrets និង config

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

1. **Config** (non-secret): env vars, Compose `environment`, config files។
2. **Secrets** (passwords, API keys): never bake image layers; env runtime, Docker secrets, vault — keep `.env` out git។
3. Prefer **12-factor**: same image, different env per environment (dev/stage/prod)។

### Example `.env` (do not commit secrets)

```env
POSTGRES_USER=rean
POSTGRES_PASSWORD=change-me
POSTGRES_DB=rean
```

Add `.env` to `.gitignore`។

---

## 11. Docker Compose — កម្មវិធីពហុ container

### Lab: `labs/04-compose`

Manually `docker run` app + db + redis painful។ **Compose** describes whole stack YAML។

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

### Compose commands សំខាន់

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

### Compose concepts សំខាន់

| Concept | Meaning |
|---------|---------|
| `services` | Containers in your app |
| `build` | Build from Dockerfile |
| `image` | Use existing image |
| `depends_on` | Start order (not full readiness unless healthchecks) |
| `volumes` | Named volumes declared at bottom |
| `networks` | Isolated networks for the project |

### Service DNS

Compose service name = hostname។ Web service connects Postgres host `db` not `localhost`។

**`localhost` inside container means that container itself**, never host or sibling services។

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

## 12. Multi-stage builds និងទំហំ image

### Lab: `labs/07-multi-stage`

Problem: build tools (compilers, npm all deps, Go toolchain) bloat production images increase attack surface។

**Multi-stage builds** use multiple `FROM` copy only artifacts forward។

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

- Final image no compilers / unused build deps
- Smaller attack surface
- Often much smaller downloads

### Alpine vs distroless vs slim

| Base | Pros | Cons |
|------|------|------|
| `*-alpine` | Small | musl quirks, fewer packages |
| `*-slim` | Debian-based, smaller than full | Still larger than Alpine |
| Distroless | Minimal, very secure | Harder to debug (no shell) |

Choose based on app needs; consistency across services helps ops។

### Size inspection habits

```bash
docker images rean-hello
docker history rean-hello:1.0
dive rean-hello:1.0   # if you install dive — visual layer explorer
```

---

## 13. ទម្លាប់គិតបែប production

### Lab: `labs/08-production`

### Checklist មុន deploy «real»

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

(Compose single node, see `mem_limit` / modern `deploy` support depending Compose version.)

6. **Restart policy**

```yaml
restart: unless-stopped
```

7. **Logging** — don't log secrets; ship logs collector; avoid huge docker logs without rotation.

8. **One process per container** (guideline) — app one, db another; use Compose/K8s compose them.

9. **Immutable images** — rebuild redeploy; don't «hotfix» running containers.

### Restart policies

| Policy | Behavior |
|--------|----------|
| `no` | Never restart |
| `always` | Always restart |
| `on-failure` | Restart on non-zero exit |
| `unless-stopped` | Always, except manually stopped |

---

## 14. Debug និងដោះស្រាយបញ្ហា

### Container won't stay up

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

### Failure patterns ធម្មតា

| Symptom | Likely cause |
|---------|----------------|
| Port already allocated | Process/container uses host port |
| Connection refused to `db` | Wrong network, hostname, db not ready |
| Permission denied on volume | UID mismatch bind mount |
| Huge image | Fat base, leftover build tools, no multi-stage |
| Changes not appearing | Old image cached; rebuild; wrong mount |
| `localhost` browser works, app can't reach db | App uses `localhost` not service name |

### «Database not ready» race

`depends_on` only waits **start**, not **ready**។ Fix with:

- Healthcheck + `depends_on: condition: service_healthy` (Compose)
- App-level retry/backoff
- Init containers / wait scripts

```yaml
depends_on:
  db:
    condition: service_healthy
```

---

## 15. សុវត្ថិភាពសំខាន់ៗ

1. **Don't run as root** production containers when avoidable.
2. **Scan images** CVEs (`docker scout`, Trivy, Grype).
3. **Minimal base images** + multi-stage.
4. **Never commit secrets**; never `ENV PASSWORD=...` real secrets Dockerfile.
5. **Pin digests** supply-chain control:

   ```bash
   docker pull nginx@sha256:...
   ```

6. **Drop capabilities** / security options (`--cap-drop ALL`).
7. **Keep Engine updated**.
8. **Treat Docker socket as root** — mount `/var/run/docker.sock` into container nearly equivalent root host.

---

## 16. ប្រធានបទកម្រិតខ្ពស់

### BuildKit

Modern builder (usually default):

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

Features: better cache, parallel builds, secrets mounts build (without leaving secrets layers).

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

Useful Apple Silicon + Linux servers.

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

Learn Compose thoroughly first. Move K8s when need multi-node scheduling, rolling updates, service meshes, etc.

### Init process & zombies

Use `tini` or Docker `--init` so PID 1 reaps zombie processes forwards signals:

```bash
docker run --init ...
```

### Custom bridge & aliases

```bash
docker network create --subnet=172.28.0.0/16 rean-custom
docker run -d --network rean-custom --network-alias cache redis:7-alpine
```

---

## 17. Deploy ជាមួយ Docker & CI/CD

> **Chapter ពិសេស:** path «ship it» — app containerized ចាកចេញ laptop, build CI, land registry, run server។ Complete Chapters 11–13 (ideally 15–16) មុន។

### Lab: `labs/09-ci-cd`

Deploy មិនមែន command មួយ។ **Pipeline** decisions៖

```
  Code → Build image → Test → Push to registry → Pull on server → Run (Compose) → Observe
```

Step manual undocumented → deploys fragile។ CI/CD turns repeatable parts automation។

### «Deploy with Docker» មានន័យ

| Piece | Job |
|-------|-----|
| **Image** | Immutable artifact (app + runtime) identified tag/digest |
| **Registry** | Store distribute images (Docker Hub, GHCR, ECR, …) |
| **Runtime host** | Machine(s) Docker Engine pull run images |
| **Compose (or orchestrator)** | Declares services, env, volumes, networks, restart, health |
| **CI/CD** | Automates build/test/push (often deploy) every change |

Docker Compose enough **single-host** production (VPS, small VM)។ Multi-node scheduling, rolling updates cluster, richer autoscaling → Kubernetes (Chapter 16 orientation) — **same images**។

### Environments: same image, different config

Follow 12-factor habits Chapter 10:

| Environment | Typical source of config | Image |
|-------------|--------------------------|-------|
| Local / lab | `.env`, bind mounts, `compose.override.yaml` | Built your machine |
| Staging | secrets host / CI variables | Same image prod (or release candidate) |
| Production | host env / secret manager; no bind-mounted source | **Only** images registry |

Rules prevent most deploy disasters:

1. **Build once, promote same digest** (or same git SHA tag) staging → prod.
2. **Never bake secrets image.**
3. Prefer **`IMAGE:git-sha`** (or semver) over `latest`.
4. Keep **prod Compose file** pulls images (`image:`) not build server (`build:`) when possible.

### Production Compose layout

Practical split Lab 09:

**`compose.yaml`** — local / CI smoke (may `build:`)

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: "3000"
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 3s
      retries: 3
```

**`compose.prod.yaml`** — server (pull-only)

```yaml
services:
  api:
    image: ghcr.io/YOUR_USER/rean-deploy-api:${IMAGE_TAG:-latest}
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: ${PORT:-3000}
      APP_VERSION: ${APP_VERSION:-unknown}
    restart: unless-stopped
    read_only: true
    tmpfs: ["/tmp"]
    security_opt: ["no-new-privileges:true"]
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 15s
      timeout: 3s
      retries: 3
    mem_limit: 256m
```

On the server:

```bash
export IMAGE_TAG=sha-abc1234   # or a semver tag from CI
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

Validate files anywhere (laptop or CI):

```bash
docker compose -f compose.yaml config
docker compose -f compose.prod.yaml config
```

### Registry workflow (build → tag → push → pull)

```bash
# Authenticate (Docker Hub, GHCR, etc.)
docker login ghcr.io

# Build with an immutable-ish tag (git short SHA is a great default)
GIT_SHA=$(git rev-parse --short HEAD)
IMAGE=ghcr.io/YOUR_USER/rean-deploy-api

docker build -t "$IMAGE:sha-$GIT_SHA" -t "$IMAGE:latest" .
docker push "$IMAGE:sha-$GIT_SHA"
docker push "$IMAGE:latest"
```

On the server pull **same** tag CI pushed:

```bash
docker pull ghcr.io/YOUR_USER/rean-deploy-api:sha-$GIT_SHA
```

**GHCR tip:** GitHub Actions `GITHUB_TOKEN` push `ghcr.io/<owner>/<image>` when workflow `packages: write`។ Package visibility GitHub → Packages.

### Server bootstrap (single VPS checklist)

Once per host:

1. Install Docker Engine + Compose plugin (Chapter 4 Linux path).
2. Create non-root deploy user; add `docker` group (or rootless later).
3. Harden SSH (keys only, no password login).
4. Clone or copy **only** deploy files (`compose.prod.yaml`, `.env`, maybe reverse-proxy config) — not necessarily whole app source.
5. Create `.env` server (never commit real values).
6. Optional recommended: **Caddy** or **Nginx** reverse proxy TLS (`https://your.domain` → `127.0.0.1:3000`).

Minimal mental model TLS:

```
Internet → :443 (Caddy/Nginx) → localhost:3000 (your container published port)
```

Publish app only `127.0.0.1:3000` not exposed raw internet:

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

### Reverse proxy (why next to Docker)

Containers great running app. Reverse proxy handles:

- HTTPS certificates (Let's Encrypt)
- Multiple hostnames one machine
- Request logging / basic rate limits
- Hiding internal ports

**Not** need Kubernetes single API + Postgres one VPS. Compose + proxy common honest production setup.

### Releases without drama

| Practice | Why |
|----------|-----|
| Healthchecks + `restart: unless-stopped` | Unhealthy/crashed containers recover or stay marked unhealthy |
| `docker compose up -d` after `pull` | Recreates only changed services |
| Keep previous tag noted | Instant rollback: set `IMAGE_TAG` last good SHA `up -d` again |
| Database volumes | Named volumes survive container recreation (Chapter 8) |
| Migrations | Explicit step (one-off `compose run`) before/after switching API — document order |

Rollback sketch:

```bash
export IMAGE_TAG=sha-OLDGOOD
docker compose -f compose.prod.yaml pull api
docker compose -f compose.prod.yaml up -d api
```

### CI/CD: each stage should do

Think stages, not «one giant script»:

| Stage | Typical checks | Failure means |
|-------|----------------|---------------|
| **Validate** | `docker compose config`, Dockerfile present | Bad YAML / broken project layout |
| **Test** | Unit tests (host or build stage) | App logic broken |
| **Build** | `docker build` (BuildKit) | Image won't build |
| **Smoke** | `compose up` + `curl /health` CI | Container starts app dead |
| **Push** | `docker push` tagged image | Artifact not published |
| **Deploy** | SSH / API / platform «pull + up» | Runtime host not updated |

**Continuous Integration (CI)** = validate + test + build (+ smoke) every PR/push.  
**Continuous Delivery/Deployment (CD)** = promote built image environment automatically or one click.

Start CI **builds pushes**. Add automatic deploy staging stable. Keep production deploy gated (manual approval) until trust pipeline.

### GitHub Actions — complete pattern

Lab 09 ready-to-copy workflow. Shape:

```yaml
name: CI — build, smoke, push

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  packages: write

env:
  IMAGE: ghcr.io/${{ github.repository_owner }}/rean-deploy-api

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate Compose files
        working-directory: labs/09-ci-cd
        run: |
          docker compose -f compose.yaml config >/dev/null
          docker compose -f compose.prod.yaml config >/dev/null

      - name: Build image
        working-directory: labs/09-ci-cd
        run: |
          TAG=sha-$(git rev-parse --short HEAD)
          docker build -t "$IMAGE:$TAG" -t "$IMAGE:latest" .
          echo "TAG=$TAG" >> "$GITHUB_ENV"

      - name: Smoke test
        working-directory: labs/09-ci-cd
        run: |
          docker compose up -d --build
          for i in $(seq 1 30); do
            if curl -fsS http://127.0.0.1:3000/health; then exit 0; fi
            sleep 1
          done
          docker compose logs
          exit 1

      - name: Teardown smoke stack
        if: always()
        working-directory: labs/09-ci-cd
        run: docker compose down -v

      - name: Login to GHCR
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Push image
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          docker push "$IMAGE:$TAG"
          docker push "$IMAGE:latest"
```

Notes:

- **PRs build + smoke** not push (keeps registry clean).
- **`main` pushes** publish image.
- Replace image name / working directory wire own app.
- Private deploy key SSH deploy step, store secrets GitHub → Settings → Secrets (`SSH_HOST`, `SSH_KEY`, …) — never repo.

### Optional CD: deploy over SSH after push

After successful push job (same workflow or second `deploy` job):

```yaml
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/rean-deploy
            export IMAGE_TAG=sha-${{ github.sha }}
            # shorten if you tag with short SHA in build step
            docker compose -f compose.prod.yaml pull
            docker compose -f compose.prod.yaml up -d
```

Keep deploy scripts **idempotent**: run twice leave system healthy.

### Secrets & supply chain CI

1. Use GitHub/GitLab **masked secrets** registry passwords, SSH keys, API tokens.
2. Prefer `GITHUB_TOKEN` / OIDC cloud roles over long-lived PATs when platform supports.
3. Pin Actions full commit SHAs higher assurance (optional hardening).
4. Scan images CI (`docker scout`, Trivy, Grype) fail critical CVEs when ready (Chapter 15).
5. Treat Docker socket CI runners trusted infrastructure — don't expose untrusted PR code forks without isolation.

### Observability after deploy

Minimum viable production eyes:

```bash
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs -f --tail=200 api
curl -fsS https://your.domain/health
```

Then graduate log shipping uptime checks. Green CI build not substitute live `/health` public URL.

### End-to-end checklist (print this)

- [ ] App has real `/health` (or equivalent) Compose **and** CI smoke tests
- [ ] `compose.prod.yaml` uses `image:` + tag variable (no surprise remote builds)
- [ ] `.env.example` documents every required variable; real `.env` gitignored
- [ ] CI validates Compose, builds, smokes, pushes main branch
- [ ] Server has Docker Engine, deploy files, secrets only host
- [ ] You know rollback tag last good deploy
- [ ] TLS terminates reverse proxy (or platform edge), not afterthought
- [ ] You can explain build → registry → pull → up without looking up

### How chapter connects

| Earlier chapter | What you reuse here |
|-----------------|---------------------|
| 7 / 12 | Dockerfile + multi-stage CI builds |
| 10 | Env/secrets — CI secrets + server `.env` |
| 11 | Compose deploy unit |
| 13 / 15 | Healthchecks, non-root, limits, scanning |
| 16 | BuildKit, registries, multi-arch ARM + AMD |

Next: **Lab 09** run CI steps locally optionally push. After **Capstone (Chapter 18)** real CI workflow stretch goal — already know shape.


---

## 18. គម្រោង capstone

Build small stack repo (extend `labs/04-compose`):

**Goal:** Web API + Postgres + Redis

Requirements:

1. `Dockerfile` API (multi-stage if compile/build).
2. `compose.yaml` `api`, `db`, `redis`.
3. Named volumes Postgres.
4. `.env.example` documenting required variables (no real secrets).
5. Healthchecks API Postgres.
6. API connects service hostnames `db` `redis`.
7. `README` section: how `up`, migrate (if any), `down`.

Stretch goals:

- Separate `compose.prod.yaml` restart policies resource limits (Chapter 17)
- Nginx or Caddy reverse proxy front API
- CI job Lab 09 / Chapter 17: `docker compose config` + build + smoke + push

---

## 19. សន្លឹកជំនួយ

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

## 20. តារាងតាមដានផ្លូវរៀន

### Beginner

- [ ] Explain containerization vs VMs vs Docker vs Kubernetes
- [ ] Describe namespaces cgroups high level
- [ ] Complete `labs/01-isolation-basics`
- [ ] Explain image vs container vs Dockerfile
- [ ] Run, stop, remove containers; publish ports
- [ ] Read logs `exec` into container
- [ ] Write simple Dockerfile `docker build`
- [ ] Use `.dockerignore`

### Intermediate

- [ ] Named volumes + bind mounts
- [ ] User-defined networks + DNS by name
- [ ] Env files 12-factor config
- [ ] Compose multi-service app
- [ ] Fix «db not ready» healthchecks

### Advanced

- [ ] Multi-stage builds; shrink images
- [ ] Non-root user, healthchecks, restart policies
- [ ] BuildKit secrets; pin tags/digests
- [ ] Push/pull registry
- [ ] Debug `inspect`, `logs`, `stats`, ephemeral shells
- [ ] Complete Chapter 17 deploy checklist; finish `labs/09-ci-cd`
- [ ] Explain CI vs CD build → registry → pull → up path
- [ ] Complete capstone stack

---

## ផែនការប្រចាំសប្តាហ៍ (ណែនាំ)

| Day | Focus | Lab |
|-----|--------|-----|
| 1 | Isolation basics + hello workflow | `labs/01-isolation-basics`, `labs/02-hello` |
| 2 | Dockerfile mastery | `labs/03-dockerfile` |
| 3 | Compose basics | `labs/04-compose` |
| 4 | Networks & volumes | `labs/05-networks`, `labs/06-volumes` |
| 5 | Multi-stage + prod habits | `labs/07-multi-stage`, `labs/08-production` |
| 6 | Deploy + CI/CD (special) | `labs/09-ci-cd` |
| 7–8 | Capstone | your own stack |

---

## វចនានុក្រម

| Term | Definition |
|------|------------|
| Containerization | Packaging app deps isolated unit shared kernel |
| OCI | Open Container Initiative — standards images runtimes |
| Daemon | Background Docker engine (`dockerd`) |
| Layer | Immutable filesystem diff image |
| Tag | Mutable label image version |
| Digest | Immutable content hash image |
| Context | Files sent daemon during `build` |
| Registry | Remote store images |
| Orchestrator | System schedules containers across machines |
| Namespace | Linux isolation (pid, net, mnt, …) |
| cgroups | Linux resource limits (CPU, memory) |

---

## ជំហានបន្ទាប់បន្ទាប់ពីមគ្គុទ្ទេសក៍នេះ

1. Practice labs order under `labs/` (include Lab 09 deploy/CI).
2. Re-run Chapter 2 isolation examples until obvious.
3. Containerize real app you know — wire Chapter 17 pipeline.
4. Read official docs: [https://docs.docker.com/](https://docs.docker.com/)
5. Learn Compose Watch / Dev Containers daily development.
6. Harden CD: image scanning CI, manual prod approvals, multi-node Kubernetes (Pods, Deployments, Services).

---

*Created for `rean-docker` learning project. Work chapter by chapter; prefer understanding over rushing commands.*
