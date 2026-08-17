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
docker run -d --name rean-ps alpine:3.22 sleep 3600

# Processes *inside* the container (small list; sleep is typically PID 1)
docker exec rean-ps ps aux

# Processes on the host (huge list) — different pid namespace
ps aux | head

docker rm -f rean-ps
```

→ ក្នុង container **មិន**ឃើញ Chrome/Slack processes host។ នោះគឺ pid isolation។

#### Example B — Isolation filesystem (mnt namespace)

```bash
docker run --rm -it alpine:3.22 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'
```

→ Container មាន `/tmp` និង `/` ផ្ទាល់។ Create `/tmp/note.txt` ក្នុងមិន create file នៅ desktop host។

Compare **bind mount** (folder share intentionally — live coding ពេលក្រោយ)៖

```bash
mkdir -p /tmp/rean-share
echo 'from-host' > /tmp/rean-share/msg.txt
docker run --rm -v /tmp/rean-share:/data alpine:3.22 cat /data/msg.txt
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
docker run --rm -m 128m --memory-swap 128m alpine:3.22 \
  sh -c 'echo "cgroup memory limit applied"; cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "(limit visible via docker inspect)"'
```

Inspect ពីខាងក្រៅ៖

```bash
docker run -d --name rean-limited -m 256m alpine:3.22 sleep 60
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
COPY package.json package-lock.json ./

# Install exact dependency versions from the lockfile
RUN npm ci --omit=dev

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

### Lab: `labs/07-volumes`

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

### Lab: `labs/06-networks`

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

### Lab: `labs/04-env-secrets`

ធ្វើបន្ទាប់ពី Lab 03 (អ្នកសរសេរ Dockerfile រួច) និងមុន Lab 05។ អ្នកនឹងផ្ទេរ config នៅ **ពេល run** រួចមើល password ដែលដុតក្នុង image លេចក្នុង `docker history`។

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

### Lab: `labs/05-compose`

Manually `docker run` app + db + redis painful។ **Compose** describes whole stack YAML។

### Minimal `compose.yaml`

Lab 05 រក្សា **password ក្នុង `.env`** មិនមែនក្នុង YAML (Lab 04)។ Compose interpolate `${POSTGRES_PASSWORD}` ពេល stack ចាប់ផ្តើម៖

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    depends_on:
      - db
    networks:
      - rean

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - rean

volumes:
  pgdata:

networks:
  rean:
```

Copy `.env.example` → `.env` មុន `docker compose up`។ តម្លៃក្នុង Compose file មើលឃើញតាម `docker compose config` លើម៉ាស៊ីនអ្នក — នេះធម្មតា។ ច្បាប់គឺ៖ **កុំ commit `.env` ហើយកុំដុត secrets ចូល image**។

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
| `env_file` / `.env` | Runtime config និង secrets (មិនដុតក្នុង image) |

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

### Lab: `labs/08-multi-stage`

Problem: build tools (compilers, TypeScript/`tsc`, npm all deps, Go toolchain) bloat production images increase attack surface។

**Multi-stage builds** use multiple `FROM` copy only artifacts forward។

Lab 08 compile TypeScript ក្នុង build stage ដូច្នេះ `:fat` (compiler នៅក្នុង image) ធំជាង `:slim` (JS ដែល compile រួច + production deps តែប៉ុណ្ណោះ) ច្បាស់។

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

### Lab: `labs/09-production`

### Checklist មុន deploy «real»

1. **Pin versions** — `postgres:16.4-alpine`, not `postgres:latest`
2. **Non-root user** — `USER node` or custom UID
3. **Read-only root filesystem** where possible (`--read-only` + writable tmp mounts)
4. **Healthchecks** — Alpine Node images ភាគច្រើនគ្មាន `wget`/`curl`។ Probe ដោយ Node runtime ដូច app:

```dockerfile
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
```

```yaml
healthcheck:
  test:
    [
      "CMD",
      "node",
      "-e",
      "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))",
    ]
  interval: 15s
  timeout: 3s
  retries: 3
  start_period: 5s
```

5. **Resource limits** — Compose V2 (`docker compose`) apply `deploy.resources` លើ single node។ មិនត្រូវការ Swarm ឬ key ចាស់ `mem_limit` / `cpus`។

```yaml
deploy:
  resources:
    limits:
      cpus: "0.50"
      memory: 256M
```

6. **Restart policy**

```yaml
restart: unless-stopped
```

7. **Init process** — `init: true` (ឬ `docker run --init`) ដើម្បីឱ្យ PID 1 reap zombies និង forward `SIGTERM` ពី `docker stop`។ គូជាមួយ exec-form `CMD` និង graceful shutdown ក្នុង app។

```yaml
init: true
```

8. **Logging** — don't log secrets; ship logs collector; cap Docker json-file logs ដើម្បីកុំឱ្យ app សរសេរពេញថាស។

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

9. **One process per container** (guideline) — app one, db another; use Compose/K8s compose them.

10. **Immutable images** — rebuild redeploy; don't «hotfix» running containers.

### Restart policies

| Policy | Behavior |
|--------|----------|
| `no` | Never restart |
| `always` | Always restart |
| `on-failure` | Restart on non-zero exit |
| `unless-stopped` | Always, except manually stopped |

---

## 14. Debug និងដោះស្រាយបញ្ហា

### Lab: `labs/10-debugging`

អនុវត្ត `logs`, `inspect` និង Compose client ដែលនិយាយទៅ `localhost` ខុស។ កែ hostname រួចត្រឡប់មកទីនេះសម្រាប់ pattern ផ្សេងទៀត។

### Container មិននៅ up

```bash
docker ps -a
docker logs <name>
docker inspect <name>   # look at State.ExitCode, Error, Mounts, NetworkSettings
```

### Debug បែប interactive

```bash
docker run --rm -it --entrypoint sh myimage:tag
docker compose run --rm web sh
```

### Copy files ចូល/ចេញ

```bash
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./file.txt my-nginx:/tmp/
```

### មើល processes / ការប្រើ resource

```bash
docker top my-nginx
docker stats
```

### Failure patterns ធម្មតា

| រោគសញ្ញា | មូលហេតុទំនង |
|---------|----------------|
| Port already allocated | Process/container ផ្សេងកំពុងប្រើ host port |
| Connection refused to `db` | Network ខុស, hostname ខុស, db មិនទាន់ ready |
| Permission denied on volume | UID mismatch លើ bind mount |
| Huge image | Base ធំ, ឧបករណ៍ build នៅសល់, គ្មាន multi-stage |
| Changes not appearing | Image ចាស់នៅ cache; rebuild; ឬ mount ខុស |
| `localhost` ក្នុង browser ដំណើរការ តែ app មិនទៅដល់ db | App ប្រើ `localhost` មិនមែនឈ្មោះ service |

### ការប្រណាំង «Database not ready»

`depends_on` រង់ចាំតែ **start** មិនមែន **ready**។ ដោះស្រាយដោយ៖

- Healthcheck + `depends_on: condition: service_healthy` (Compose)
- Retry/backoff ក្នុង app
- Init containers / wait scripts

```yaml
depends_on:
  db:
    condition: service_healthy
```

---

## 15. សុវត្ថិភាពសំខាន់ៗ

### Lab: `labs/11-security`

ប្រៀបធៀប `whoami` លើ image ដែលមិនមែន root vs Alpine, build ជាមួយ BuildKit `--secret` (គ្មានអ្វីក្នុង `docker history`) ហើយស្កេនដោយ Trivy បើចង់។ Lab 04 បានបង្ហាញ anti-pattern `ENV` ដែលលេច secret រួចហើយ។

1. **កុំ run ជា root** ក្នុង production containers នៅពេលអាចជៀសបាន។
2. **ស្កេន images** រក CVEs (`docker scout`, Trivy, Grype)។
3. **Base images តូច** + multi-stage។
4. **កុំ commit secrets**; កុំ `ENV PASSWORD=...` ជាមួយ secret ពិតក្នុង Dockerfile។
5. **Pin digests** សម្រាប់គ្រប់គ្រង supply-chain៖

   ```bash
   docker pull nginx@sha256:...
   ```

6. **Drop capabilities** / ប្រើ security options ពេលត្រូវ (`--cap-drop ALL`)។
7. **Update Engine** ឱ្យទាន់។
8. **ចាត់ Docker socket ដូច root** — mount `/var/run/docker.sock` ចូល container ស្ទើរតែដូចឱ្យ container នោះ root លើ host។

---

## 16. ប្រធានបទកម្រិតខ្ពស់

### BuildKit

Builder ទំនើប (ធម្មតាជា default ឥឡូវ)៖

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

លក្ខណៈ៖ cache ល្អជាង, build ទន្ទឹមគ្នា, mount secrets ពេល build (មិនទុក secrets ក្នុង layers)។

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

មានប្រយោជន៍សម្រាប់ Apple Silicon + Linux servers។

### Registries

```bash
docker login
docker tag rean-hello:1.0 youruser/rean-hello:1.0
docker push youruser/rean-hello:1.0
docker pull youruser/rean-hello:1.0
```

ឧទាហរណ៍ GHCR tag: `ghcr.io/you/rean-hello:1.0`

### Docker Swarm vs Kubernetes (ទិដ្ឋភាព)

| ឧបករណ៍ | តួនាទី |
|------|------|
| Docker Compose | Stack មូលដ្ឋាន / host តែមួយ |
| Docker Swarm | Clustering ក្នុង Docker (ប្រើតិចជាងសព្វថ្ងៃ) |
| Kubernetes | Orchestration ស្តង់ដារឧស្សាហកម្មនៅទំហំធំ |

រៀន Compose ឱ្យជ្រៅមុន។ ទៅ K8s ពេលត្រូវការ scheduling ច្រើន node, rolling updates, service meshes ជាដើម។

### Init process និង zombies

ប្រើ `tini` ឬ Docker `--init` ដើម្បីឱ្យ PID 1 ប្រមូល zombie processes និងបញ្ជូន signals៖

```bash
docker run --init ...
```

### Custom bridge និង aliases

```bash
docker network create --subnet=172.28.0.0/16 rean-custom
docker run -d --network rean-custom --network-alias cache redis:7-alpine
```

---

## 17. Deploy ជាមួយ Docker & CI/CD

> **ជំពូកពិសេស:** នេះគឺផ្លូវ «ship it» — app ដែល containerize ចាកចេញពី laptop, ត្រូវ build ក្នុង CI, ចូល registry, រួច run លើ server។ បញ្ចប់ជំពូក 11–13 (និង 15–16 បើអាច) មុន។

### Lab: `labs/12-ci-cd`

Deploy មិនមែនពាក្យបញ្ជាតែមួយ។ វាជា **pipeline** នៃការសម្រេចចិត្ត៖

```
  Code → Build image → Test → Push to registry → Pull on server → Run (Compose) → Observe
```

បើជំហានណាមួយធ្វើដោយដៃ ហើយគ្មានឯកសារ deploys នឹងផុយ។ CI/CD ប្រែផ្នែកដែលធ្វើម្តងហើយម្តងទៀតទៅជាស្វ័យប្រវត្តិ។

### «Deploy with Docker» មានន័យថាអ្វី

| ផ្នែក | ការងារ |
|-------|-----|
| **Image** | Artifact ដែលមិនប្តូរ (app + runtime) សម្គាល់ដោយ tag/digest |
| **Registry** | ផ្ទុក និងចែកចាយ images (Docker Hub, GHCR, ECR, …) |
| **Runtime host** | ម៉ាស៊ីនដែលមាន Docker Engine pull ហើយ run images |
| **Compose (ឬ orchestrator)** | ប្រកាស services, env, volumes, networks, restart, health |
| **CI/CD** | ស្វ័យប្រវត្តិ build/test/push (និងជាញឹកញាប់ deploy) រាល់ការផ្លាស់ប្តូរ |

Docker Compose គ្រប់គ្រាន់សម្រាប់ production **host តែមួយ** (VPS, VM តូច)។ ពេលត្រូវការ scheduling ច្រើន node, rolling updates លើ cluster និង autoscaling កាន់តែសម្បូរ អ្នកទៅ Kubernetes (ជំពូក 16) — នៅតែប្រើ **images ដូចគ្នា**។

### Environments: image ដូចគ្នា config ផ្សេង

តាមទម្លាប់ 12-factor ពីជំពូក 10៖

| Environment | ប្រភព config ធម្មតា | Image |
|-------------|--------------------------|-------|
| Local / lab | `.env`, bind mounts, `compose.override.yaml` | Build លើម៉ាស៊ីនអ្នក |
| Staging | secrets លើ host / CI variables | Image ដូច prod (ឬ release candidate) |
| Production | host env / secret manager; មិន bind-mount source | **តែ** images ពី registry |

ច្បាប់ដែលការពារ deploy ភាគច្រើនកុំឱ្យខូច៖

1. **Build ម្ដង រួច promote digest ដូចគ្នា** (ឬ git SHA tag ដូចគ្នា) staging → prod។
2. **កុំដុត secrets ចូល image។**
3. ចូលចិត្ត **`IMAGE:git-sha`** (ឬ semver) ជាងពឹង `latest`។
4. ទុក **prod Compose** ដែល pull images (`image:`) មិនមែន build លើ server (`build:`) នៅពេលអាច។

### Production Compose layout

ការបែងចែកជាក់ស្តែងក្នុង Lab 12៖

**`compose.yaml`** — local / CI smoke (អាចមាន `build:`)

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

**`compose.prod.yaml`** — server (pull តែប៉ុណ្ណោះ)

```yaml
services:
  api:
    image: ghcr.io/YOUR_USER/rean-deploy-api:${IMAGE_TAG:?set IMAGE_TAG to a sha tag}
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: ${PORT:-3000}
      APP_VERSION: ${APP_VERSION:-unknown}
    restart: unless-stopped
    init: true
    read_only: true
    tmpfs: ["/tmp"]
    security_opt: ["no-new-privileges:true"]
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 15s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 256M
```

នៅលើ server៖

```bash
export IMAGE_TAG=sha-abc1234   # or a semver tag from CI
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

Validate files នៅណាក៏បាន (laptop ឬ CI)៖

```bash
docker compose -f compose.yaml config
IMAGE_TAG=sha-deadbee docker compose -f compose.prod.yaml config
```

`compose.prod.yaml` បដិសេធ interpolate បើ `IMAGE_TAG` ខ្វះ — នេះចេតនា។ Prod ត្រូវ pin SHA (ឬ semver) មិនមែន `:latest`។

### Registry workflow (build → tag → push → pull)

```bash
# Authenticate (Docker Hub, GHCR, etc.)
docker login ghcr.io

# Build with an immutable-ish tag (git short SHA is a great default)
GIT_SHA=$(git rev-parse --short HEAD)
IMAGE=ghcr.io/YOUR_USER/rean-deploy-api

docker build -t "$IMAGE:sha-$GIT_SHA" .
docker push "$IMAGE:sha-$GIT_SHA"
# កុំ tag :latest សម្រាប់ deploy — ឈ្មោះនោះផ្លាស់ទី។ មើល GHCR តាម SHA tag។
```

នៅលើ server អ្នក pull **tag ដូចគ្នា** ដែល CI បាន push៖

```bash
docker pull ghcr.io/YOUR_USER/rean-deploy-api:sha-$GIT_SHA
```

**គន្លឹះ GHCR:** ក្នុង GitHub Actions `GITHUB_TOKEN` អាច push ទៅ `ghcr.io/<owner>/<image>` ពេល workflow មានសិទ្ធិ `packages: write`។ ភាពមើលឃើញនៃ package កំណត់នៅ GitHub → Packages។

### Server bootstrap (checklist VPS តែមួយ)

ធ្វើម្ដងក្នុងមួយ host៖

1. ដំឡើង Docker Engine + Compose plugin (ផ្លូវ Linux ក្នុងជំពូក 4)។
2. បង្កើត user deploy ដែលមិនមែន root; បន្ថែមទៅក្រុម `docker` (ឬ rootless ក្រោយ)។
3. រឹត SSH (keys តែប៉ុណ្ណោះ, មិន login ដោយ password)។
4. Clone ឬ copy **តែ** ឯកសារ deploy (`compose.prod.yaml`, `.env`, ប្រហែល config reverse-proxy) — មិនចាំបាច់ source app ទាំងមូល។
5. បង្កើត `.env` លើ server (កុំ commit តម្លៃពិត)។
6. ណែនាំ៖ **Caddy** ឬ **Nginx** ជា reverse proxy សម្រាប់ TLS (`https://your.domain` → `127.0.0.1:3000`)។

គំរូ TLS ខ្លី៖

```
Internet → :443 (Caddy/Nginx) → localhost:3000 (your container published port)
```

អ្នកអាច publish app តែនៅ `127.0.0.1:3000` ដើម្បីមិនបើកចំហទៅអ៊ីនធឺណិត៖

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

### Reverse proxy (ហេតុអ្វីនៅក្បែរ Docker)

Containers ល្អក្នុងការរត់ app។ Reverse proxy ទទួលខុសត្រូវ៖

- វិញ្ញាបនបត្រ HTTPS (Let’s Encrypt)
- Hostnames ច្រើនលើម៉ាស៊ីនតែមួយ
- Request logging / rate limits មូលដ្ឋាន
- លាក់ internal ports

អ្នក **មិន** ត្រូវការ Kubernetes សម្រាប់ API + Postgres តែមួយលើ VPS មួយ។ Compose + proxy គឺ setup production ធម្មតា និងស្មោះត្រង់។

### Releases ដោយគ្មានរឿងរ៉ាវ

| ទម្លាប់ | ហេតុអ្វី |
|----------|-----|
| Healthchecks + `restart: unless-stopped` | Container ខូច/unhealthy ងើបឡើងវិញ ឬនៅសម្គាល់ unhealthy |
| `docker compose up -d` បន្ទាប់ពី `pull` | បង្កើតសេវាដែលផ្លាស់ប្តូរឡើងវិញតែប៉ុណ្ណោះ |
| ទុក tag មុន | Rollback ភ្លាម៖ កំណត់ `IMAGE_TAG` ទៅ SHA ល្អចុងក្រោយ រួច `up -d` ម្ដងទៀត |
| Database volumes | Named volumes នៅរស់បន្ទាប់ពីបង្កើត container ឡើងវិញ (ជំពូក 8) |
| Migrations | ធ្វើជាជំហានច្បាស់ (one-off `compose run`) មុន/ក្រោយប្តូរ API — សរសេរលំដាប់ |

គំនូស rollback៖

```bash
export IMAGE_TAG=sha-OLDGOOD
docker compose -f compose.prod.yaml pull api
docker compose -f compose.prod.yaml up -d api
```

### CI/CD: ជំហាននីមួយៗគួរធ្វើអ្វី

គិតជា stages មិនមែន «script យក្សមួយ»៖

| Stage | ការពិនិត្យធម្មតា | Failure មានន័យ |
|-------|----------------|---------------|
| **Validate** | `docker compose config`, មាន Dockerfile | YAML ខុស / layout គម្រោងខូច |
| **Test** | Unit tests (host ឬក្នុង build stage) | Logic app ខូច |
| **Build** | `docker build` (BuildKit) | Image មិន build |
| **Smoke** | `compose up` + `curl /health` ក្នុង CI | Container ចាប់ផ្ដើម តែ app ស្លាប់ |
| **Push** | `docker push` image ដែល tag | Artifact មិនបានផ្សាយ |
| **Deploy** | SSH / API / platform «pull + up» | Host runtime មិនបាន update |

**Continuous Integration (CI)** = validate + test + build (+ smoke) រាល់ PR/push។  
**Continuous Delivery/Deployment (CD)** = promote image ដែល build រួចទៅ environment ស្វ័យប្រវត្តិ ឬដោយចុចម្ដង។

ចាប់ផ្ដើមដោយ CI ដែល **build និង push**។ បន្ថែម deploy ស្វ័យប្រវត្តិទៅ staging ពេលនោះនឹងស្ថិរភាព។ ទុក production deploy ឱ្យមានច្រក (ការយល់ព្រមដោយដៃ) រហូតទុកចិត្ត pipeline។

### GitHub Actions — pattern ពេញ

Lab 12 មាន workflow ត្រៀម copy។ រូបរាងដូចនេះ៖

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
        working-directory: labs/12-ci-cd
        run: |
          docker compose -f compose.yaml config >/dev/null
          REGISTRY_OWNER=example IMAGE_TAG=sha-deadbee \
            docker compose -f compose.prod.yaml config >/dev/null

      - name: Build image
        working-directory: labs/12-ci-cd
        run: |
          TAG=sha-$(git rev-parse --short HEAD)
          docker build -t "$IMAGE:$TAG" .
          echo "TAG=$TAG" >> "$GITHUB_ENV"

      - name: Smoke test
        working-directory: labs/12-ci-cd
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
        working-directory: labs/12-ci-cd
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
        run: docker push "$IMAGE:$TAG"
```

កំណត់ចំណាំ៖

- **PRs build + smoke** តែមិន push (ឱ្យ registry ស្អាត)។
- **`main` pushes** ផ្សាយ **SHA tag** (`sha-abc1234`) មិនមែន `:latest`។ ឈ្មោះនោះផ្លាស់ទី; rollback មិនបាន។
- ប្តូរឈ្មោះ image / working directory ពេលភ្ជាប់ទៅ app ផ្ទាល់ខ្លួន។
- សម្រាប់ deploy key ឯកជន ឬជំហាន SSH deploy ទុក secrets ក្នុង GitHub → Settings → Secrets (`SSH_HOST`, `SSH_KEY`, …) — កុំដាក់ក្នុង repo។

### CD ស្រេចចិត្ត: deploy តាម SSH បន្ទាប់ពី push

បន្ទាប់ពី job push ជោគជ័យ (workflow ដូចគ្នា ឬ job `deploy` ទីពីរ)៖

```yaml
      - name: Deploy over SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/rean-deploy
            export IMAGE_TAG=sha-$(echo ${{ github.sha }} | cut -c1-7)
            docker compose -f compose.prod.yaml pull
            docker compose -f compose.prod.yaml up -d
```

ឱ្យ script deploy **idempotent**: រត់ពីរដងនៅតែទុកប្រព័ន្ធឱ្យសុខភាពល្អ។

### Secrets និង supply chain ក្នុង CI

1. ប្រើ **masked secrets** GitHub/GitLab សម្រាប់ពាក្យសម្ងាត់ registry, SSH keys, API tokens។
2. ចូលចិត្ត `GITHUB_TOKEN` / OIDC cloud roles ជាង PAT រយៈពេលវែង នៅពេល platform គាំទ្រ។
3. Pin Actions ទៅ commit SHA ពេញ សម្រាប់ការធានាខ្ពស់ជាង (hardening ស្រេចចិត្ត)។
4. ស្កេន images ក្នុង CI (`docker scout`, Trivy, Grype) ហើយ fail លើ critical CVEs ពេលអ្នកត្រៀម bar នោះ (ជំពូក 15)។
5. ចាត់ Docker socket ក្នុង CI runners ជា infrastructure ដែលទុកចិត្ត — កុំបើកឱ្យ PR code ពី forks ដែលមិនទុកចិត្តដោយគ្មាន isolation។

### ការសង្កេតបន្ទាប់ពី deploy

ភ្នែក production អប្បបរមា៖

```bash
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs -f --tail=200 api
curl -fsS https://your.domain/health
```

បន្ទាប់ទៅ log shipping និង uptime checks។ CI build ពណ៌បៃតងមិនជំនួស `/health` ពិតពី URL សាធារណៈ។

### Checklist ពីចុងដល់ចុង (បោះពុម្ពទុក)

- [ ] App មាន `/health` ពិត (ឬសមភាគី) ប្រើដោយ Compose **និង** CI smoke tests
- [ ] `compose.prod.yaml` ប្រើ `image:` + tag variable (គ្មាន build ពីចម្ងាយដោយចៃដន្យ)
- [ ] `.env.example` រាយ variable គ្រប់គ្រាន់; `.env` ពិតត្រូវ gitignore
- [ ] CI validate Compose, build, smoke, រួច push លើ main
- [ ] Server មាន Docker Engine, ឯកសារ deploy និង secrets តែលើ host
- [ ] អ្នកដឹង rollback tag ពី deploy ល្អចុងក្រោយ
- [ ] TLS ចប់នៅ reverse proxy (ឬ platform edge) មិនមែនជាការគិតក្រោយ
- [ ] អ្នកអាចពន្យល់ build → registry → pull → up ដោយមិនមើលកំណត់ចំណាំ

### របៀបដែលជំពូកនេះភ្ជាប់

| ជំពូកមុន | អ្វីដែលអ្នកប្រើឡើងវិញ |
|-----------------|---------------------|
| 7 / 12 | Dockerfile + multi-stage សម្រាប់ CI builds |
| 10 | Env/secrets — CI secrets + `.env` លើ server |
| 11 | Compose ជា unit deploy |
| 13 / 15 | Healthchecks, non-root, limits, scanning |
| 16 | BuildKit, registries, multi-arch បើត្រូវ ARM + AMD |

បន្ទាប់៖ **Lab 12** ធ្វើឱ្យអ្នករត់ជំហាន CI លើម៉ាស៊ីនផ្ទាល់ រួច push បើចង់។ ក្រោយនោះ **Capstone (ជំពូក 18)** អាចមាន CI workflow ពិតជា stretch goal — អ្នកស្គាល់រូបរាងហើយ។


---

## 18. គម្រោង capstone

### Lab: `labs/13-capstone`

បង្កើត stack តូចក្នុង repo នេះ (អ្នកអាច copy `labs/05-compose` ចូលថត capstone)៖

**គោលដៅ:** Web API + Postgres + Redis

តម្រូវការ៖

1. `Dockerfile` សម្រាប់ API (multi-stage បើអ្នក compile/build)។
2. `compose.yaml` មាន `api`, `db`, `redis`។
3. Named volumes សម្រាប់ Postgres។
4. `.env.example` រាយ variables ដែលត្រូវការ (គ្មាន secrets ពិត)។
5. Healthchecks លើ API និង Postgres។
6. API ភ្ជាប់តាម hostname `db` និង `redis`។
7. ផ្នែក `README`: របៀប `up`, migrate (បើមាន) និង `down`។

Stretch goals៖

- `compose.prod.yaml` ដាច់ដោយឡែក ជាមួយ restart policies និង resource limits (មើលជំពូក 17)
- Nginx ឬ Caddy reverse proxy មុខ API
- CI job ពី Lab 12 / ជំពូក 17: `docker compose config` + build + smoke + push

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

### ថ្នាក់ដើម

- [ ] ពន្យល់ containerization vs VMs vs Docker vs Kubernetes
- [ ] ពិពណ៌នា namespaces និង cgroups កម្រិតខ្ពស់
- [ ] បញ្ចប់ `labs/01-isolation-basics`
- [ ] ពន្យល់ image vs container vs Dockerfile
- [ ] Run, stop, remove containers; publish ports
- [ ] អាន logs និង `exec` ចូល container
- [ ] សរសេរ Dockerfile សាមញ្ញ និង `docker build`
- [ ] ប្រើ `.dockerignore`

### ថ្នាក់កណ្តាល

- [ ] Named volumes + bind mounts
- [ ] User-defined networks + DNS តាមឈ្មោះ
- [ ] Env files និង config បែប 12-factor (`labs/04-env-secrets`)
- [ ] កម្មវិធី Compose ពហុសេវា
- [ ] ដោះស្រាយ «db not ready» ដោយ healthchecks

### ថ្នាក់ខ្ពស់

- [ ] Multi-stage builds; បង្រួម images
- [ ] User មិនមែន root, healthchecks, restart policies
- [ ] Debug ដោយ `inspect`, `logs`, `stats`, shell បណ្ដោះអាសន្ន (`labs/10-debugging`)
- [ ] ស្កេន images; BuildKit secrets; pin tags/digests (`labs/11-security`)
- [ ] Push/pull ពី registry
- [ ] បញ្ចប់ checklist deploy ជំពូក 17; បញ្ចប់ `labs/12-ci-cd`
- [ ] ពន្យល់ CI vs CD និងផ្លូវ build → registry → pull → up
- [ ] បញ្ចប់ capstone stack (`labs/13-capstone`)

---

## ផែនការប្រចាំសប្តាហ៍ (ណែនាំ)

| ថ្ងៃ | ផ្តោត | Lab |
|-----|--------|-----|
| 1 | Isolation basics + hello workflow | `labs/01-isolation-basics`, `labs/02-hello` |
| 2 | Dockerfile + env/secrets | `labs/03-dockerfile`, `labs/04-env-secrets` |
| 3 | Compose មូលដ្ឋាន | `labs/05-compose` |
| 4 | Networks និង volumes | `labs/06-networks`, `labs/07-volumes` |
| 5 | Multi-stage + ទម្លាប់ prod | `labs/08-multi-stage`, `labs/09-production` |
| 6 | Debug + សុវត្ថិភាព | `labs/10-debugging`, `labs/11-security` |
| 7 | Deploy + CI/CD (ពិសេស) | `labs/12-ci-cd` |
| 8–9 | Capstone | `labs/13-capstone` |

---

## វចនានុក្រម

| ពាក្យ | និយមន័យ |
|------|------------|
| Containerization | ការវេចខ្ចប់ app ជាមួយ deps ទៅជា unit ដាច់ដោយឡែកលើ kernel រួម |
| OCI | Open Container Initiative — ស្តង់ដារ images និង runtimes |
| Daemon | Docker engine ផ្ទៃខាងក្រោយ (`dockerd`) |
| Layer | ភាពខុសគ្នានៃ filesystem ដែលមិនប្តូរក្នុង image |
| Tag | ស្លាកដែលប្តូរបានសម្រាប់កំណែ image |
| Digest | Hash មាតិកាដែលមិនប្តូរនៃ image |
| Context | ឯកសារផ្ញើទៅ daemon ពេល `build` |
| Registry | ឃ្លាំងពីចម្ងាយសម្រាប់ images |
| Orchestrator | ប្រព័ន្ធកំណត់ពេល containers លើម៉ាស៊ីនច្រើន |
| Namespace | Isolation ក្នុង Linux (pid, net, mnt, …) |
| cgroups | ដែនកំណត់ resource ក្នុង Linux (CPU, memory) |

---

## ជំហានបន្ទាប់បន្ទាប់ពីមគ្គុទ្ទេសក៍នេះ

1. អនុវត្ត labs តាមលំដាប់ក្រោម `labs/` (Lab 04 ជាមួយជំពូក 10; Lab 12 សម្រាប់ deploy/CI; Lab 13 សម្រាប់ capstone)។
2. រត់ឧទាហរណ៍ isolation ជំពូក 2 ឡើងវិញរហូតមានអារម្មណ៍ច្បាស់។
3. Containerize app ពិតដែលអ្នកស្គាល់ — រួចភ្ជាប់ pipeline ជំពូក 17។
4. អានឯកសារផ្លូវការ: [https://docs.docker.com/](https://docs.docker.com/)
5. រៀន Compose Watch / Dev Containers សម្រាប់ការអភិវឌ្ឍប្រចាំថ្ងៃ។
6. រឹត CD: ស្កេន image ក្នុង CI, ការយល់ព្រម prod ដោយដៃ, រួច Kubernetes ច្រើន node (Pods, Deployments, Services)។

---

*បង្កើតសម្រាប់គម្រោងរៀន `rean-docker`។ ធ្វើតាមជំពូក; ចូលចិត្តការយល់ដឹងជាងការប្រញាប់ពាក្យបញ្ជា។*
