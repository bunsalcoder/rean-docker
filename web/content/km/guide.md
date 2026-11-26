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

### តម្រូវការមុន (មុន Lab 01)

- **Docker Engine + Compose plugin** — `docker compose version` ត្រូវដំណើរការ។ ជំពូក 4 ណែនាំដំឡើង និងផ្ទៀងផ្ទាត់។
- **`curl`** — lab ជាច្រើន hit `/health` ឬ API endpoints ពី host របស់អ្នក។
- **Terminal** — វាយ commands ដោយខ្លួនឯង; អានតែប៉ុណ្ណោះមិនជាប់ទេ។
- **ជម្រើស: Python 3** — `make serve` សម្រាប់គេហទំព័ររៀន និង `python3 -m json.tool` ដើម្បី pretty-print JSON ក្នុង lab មួយចំនួន (មិនត្រូវការ `jq`)។
- **Windows:** ចូលចិត្ត **WSL 2** ជាមួយ Docker Desktop។ ឧទាហរណ៍ bind mount ខ្លះប្រើ `/tmp`; បើ path នោះពិបាក ប្រើ folder ក្នុង repo នេះជំនួស។

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
- [ផែនការប្រចាំសប្តាហ៍ (ណែនាំ)](#ផែនការប្រចាំសប្តាហ៍-ណែនាំ)
- [វចនានុក្រម](#វចនានុក្រម)
- [ជំហានបន្ទាប់បន្ទាប់ពីមគ្គុទ្ទេសក៍នេះ](#ជំហានបន្ទាប់បន្ទាប់ពីមគ្គុទ្ទេសក៍នេះ)

---

## 1. តើ Docker ដោះស្រាយបញ្ហាអ្វី?

### ការឈឺចាប់ដែលជួបញឹកញាប់

អ្នកសង់ app លើ laptop។ វាដើរ។ លើម៉ាស៊ីនមិត្តរួមការ៖ ខូច។ លើ server៖ ខូច។ មូលហេតុញឹកញាប់គឺ៖

- កញ្ចប់ OS មិនដូចគ្នា
- runtime ភាសាមិនដូចគ្នា (Node 20 ធៀប 22, Python 3.10 ធៀប 3.12)
- បណ្ណាល័យប្រព័ន្ធខ្វះ
- ការកំណត់រសាត់ — «ដើរលើម៉ាស៊ីនខ្ញុំ»

### ចម្លើយរបស់ Docker

**ខ្ចប់ application *និង* dependencies ដែលវាត្រូវការ ទៅក្នុងឯកតាដែលយកទៅរត់ទីណាក៏បាន ហៅថា container។**

ឯកតានោះ៖

- រត់ដូចគ្នាលើ laptop, CI និង server
- ចាប់ផ្តើមក្នុងពីរបីវិនាទី (ស្រាលជាង virtual machine ពេញលេញ)
- បំបែក processes, filesystems និង (បើជ្រើស) networks

### Container ធៀបនឹង virtual machine (VM)

| | Virtual machine | Container |
|--|-----------------|-----------|
| រួម guest OS? | បាទ (OS ពេញ) | ទេ — ចែក host kernel |
| ទំហំ | GB | MB ដល់រាប់រយ MB |
| ពេលចាប់ផ្តើម | នាទី | វិនាទី |
| ការបំបែក | រឹង (hypervisor) | កម្រិត process (namespaces + cgroups) |
| ចំនួនក្នុងមួយ host | តិច | ច្រើន |

**ឧបមា:** VM គឺផ្ទះមួយខ្នង។ Container គឺបន្ទប់ក្នុងអគារ ដែលចែកបំពង់ទឹក និងអគ្គិសនី (host kernel) ប៉ុន្តែមានបន្ទប់ចាក់សោផ្ទាល់ខ្លួន (filesystem, process tree, network namespace)។

បន្ទាប់ **ជំពូក 2** ពន្យល់ containerization ជាភាសាសាមញ្ញ (មូលដ្ឋានសម្រាប់អ្នកចាប់ផ្តើម) រួច **Lab 01** ឱ្យអ្នកមានអារម្មណ៍ពីការបំបែក តាមពាក្យបញ្ជាសាមញ្ញ។

### Docker គឺអ្វី (និងមិនមែនអ្វី)

**Docker គឺ៖**

- វេទិកាសម្រាប់សង់ (build), ផ្ញើ (ship) និងរត់ (run) containers
- client (`docker`) និយាយជាមួយ daemon (`dockerd`)
- ប្រព័ន្ធជុំវិញ៖ images, registries (Docker Hub), Compose ជាដើម

**Docker មិនមែន៖**

- ជំនួសស្ថាបត្យកម្ម application ដែលល្អ
- «មានសុវត្ថិភាពតាំងពីដើម» ដោយខ្លួនឯង (អ្នកនៅតែត្រូវរឹត images និង configs)
- ដូច Kubernetes (K8s *រៀបចំ* containers ពេលមានច្រើន; Docker *រត់* ពួកវា)

---

## 2. មូលដ្ឋាន containerization

Containerization គឺ **គំនិត**។ Docker គឺ **ឧបករណ៍** ដែលមនុស្សភាគច្រើនប្រើ ដើម្បីអនុវត្តគំនិតនោះ។

**ជំពូកនេះជាមូលដ្ឋានសម្រាប់អ្នកចាប់ផ្តើម** មិនមែនវគ្គប្រព័ន្ធកម្រិតខ្ពស់ទេ។ ការអានដំបូង អាចមើលឆ្លងផ្នែកជ្រៅ (namespaces, OCI, `runc`) បើចង់ — lab ដែលផ្គូផ្គងត្រូវការតែពាក្យបញ្ជា `docker` សាមញ្ញ។

**Lab ដែលផ្គូផ្គង៖** បន្ទាប់ (ឬកំឡុងពេល) អានជំពូកនេះ ធ្វើ **`labs/01-isolation-basics`** (Lab 01 — Isolation basics)។ រួចបន្ត Lab 02 សម្រាប់ការងារប្រចាំថ្ងៃ។

ជំពូកនេះពន្យល់ containerization ទូទៅ រួចលម្អិតគ្រប់គ្រាន់ ដើម្បីពាក្យបញ្ជា Docker ពេលក្រោយមានហេតុផល — មិនមែនវេទមន្តទេ។

### ក្នុងមួយប្រយោគ

**Containerization** ខ្ចប់ application ជាមួយអ្វីដែលវាត្រូវការ ដើម្បីរត់ (runtime, libraries, config) ទៅក្នុងឯកតាដែលបំបែក។ ឯកតានោះចែក kernel របស់ OS លើ host ប៉ុន្តែមានទស្សនៈផ្ទាល់ខ្លួន ចំពោះ processes, files និង network។

ឯកតានោះគឺ **container**។

### រូបភាពទូទៅ (ចាប់ផ្តើមទីនេះ)

គិតពីបីជាន់ នៃសំណួរ «រត់ software យ៉ាងដូចម្តេច?»៖

| វិធី | អ្វីដែលអ្នកផ្ញើ | ការបំបែក | ទំហំ / ពេលចាប់ផ្តើម ធម្មតា |
|----------|---------------|-----------|----------------------|
| Bare metal / ដំឡើងលើ host | App + សង្ឃឹមថាម៉ាស៊ីនដូចគ្នា | ស្ទើរគ្មាន | លឿន ប៉ុន្តែងាយខូច |
| Virtual machine | App + guest OS ពេញ | រឹង (kernel ដាច់ដោយឡែក) | ធ្ងន់ ចាប់ផ្តើមយឺត |
| Container | App + dependencies កម្រិត userland (គ្មាន guest OS ពេញ) | កម្រិត process (ចែក kernel) | ស្រាល ចាប់ផ្តើមក្នុងវិនាទី |

**គោលរបស់ containerization៖** app ភាគច្រើនមិនត្រូវការ OS ទីពីរពេញលេញទេ។ ពួកវាត្រូវការ **filesystem និង libraries ដែលដូចគ្នារាល់ដង** បូក **ការបំបែកគ្រប់គ្រាន់** ដើម្បី app មួយមិនធ្វើឱ្យ app ផ្សេងខូច។

#### ឧបមាប្រចាំថ្ងៃ

- **VM** គឺជួលផ្ទះមួយខ្នង (គ្រឹះ បំពង់ទឹក ផ្ទាំងភ្លើង = guest OS)។
- **Container** គឺបន្ទប់ឧបទ្វីប៖ បន្ទប់ឯកជន (files, processes, ports) ចែកប្រព័ន្ធអគារ (host kernel)។
- **Image** គឺប្លង់បន្ទប់ដែលមានគ្រឿងសង្ហារឹមរួច; **container** គឺបន្ទប់ដែលជួល ហើយចាប់ផ្តើមពីប្លង់នោះ។

#### បញ្ហាដែលវាដោះស្រាយ (លើសពីពាក្យ «Docker»)

1. **ធ្វើឡើងវិញបានដូចគ្នា** — bits ដូចគ្នារត់លើ laptop, CI និង server។
2. **ដាក់បានច្រើន** — apps ច្រើនក្នុងមួយម៉ាស៊ីន ដោយមិនចាំបាច់ VM មួយសម្រាប់ app មួយ។
3. **ល្បឿន** — ចាប់ផ្តើម/ឈប់ក្នុងវិនាទី សម្រាប់ deploy និង tests។
4. **យកទៅទីណាក៏បាន** — ផ្លាស់ឯកតារវាងបរិស្ថាន ដោយមិនដំឡើងអ្វីៗសាឡើងវិញ។
5. **ព្រំដែនច្បាស់** — dependencies នៅ *ក្នុង* ឯកតា មិនមែន «នៅណាមួយលើ host»។

#### Containerization ធៀប Docker ធៀប Kubernetes

| ពាក្យ | គឺអ្វី |
|------|------------|
| **Containerization** | *គំនិត*៖ បំបែក + ខ្ចប់ + រត់ ដោយចែក kernel |
| **Docker** | *វេទិកា* ពេញនិយម សម្រាប់ build, ship និង run containers |
| **OCI** | ស្តង់ដារបើក ចំពោះ images និង runtimes (ឧបករណ៍ធ្វើការជាមួយគ្នាបាន) |
| **Kubernetes** | *អ្នករៀបចំ*៖ កំណត់ពេល containers ច្រើន លើម៉ាស៊ីនច្រើន |

អ្នកអាចធ្វើ containerize ដោយមិនប្រើ Docker (Podman, containerd, nerdctl ជាដើម)។ ជាធម្មតារៀន Docker មុន ព្រោះជំហានច្បាស់ និងប្រព័ន្ធជុំវិញធំ។

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

### ប្រវត្តិខ្លី (ហេតុអ្វីវាមាន)

1. **chroot** (Unix) — ប្តូរ root filesystem ដែល process មើលឃើញ (គុក filesystem; ខ្សោយបើនៅម្នាក់ឯង)។
2. **Linux namespaces + cgroups** — លក្ខណៈ kernel ដែលធ្វើឱ្យ containers ពិតអាចមាន (បំបែកអត្តសញ្ញាណ; កំណត់ CPU/RAM)។
3. **LXC** និងផ្សេងទៀត — «Linux containers» ជំនាន់ដើម ដែលប្រើលក្ខណៈទាំងនោះ។
4. **Docker (2013+)** — ធ្វើឱ្យ *បទពិសោធន៍អ្នកអភិវឌ្ឍ* ទូទៅ៖ Dockerfile, images, Hub, CLI សាមញ្ញ។
5. **OCI** — កំណត់ទម្រង់ image/runtime ជាស្តង់ដារ ដើម្បីប្រព័ន្ធជុំវិញមិនជាប់អ្នកលក់តែមួយជារៀងរហូត។

មិនចាំបាច់ទន្ទេញប្រវត្តិទេ។ ចងចាំ៖ **containers = សំណុំលក្ខណៈ kernel Linux + ទម្រង់ខ្ចប់ + វិធីប្រើដែលងាយ**។

### គំរូលម្អិត៖ អ្វីដែលពិតជាត្រូវបានបំបែក?

លើ Linux, container ភាគច្រើនគឺ **processes ធម្មតា** បូកនឹងការគ្រប់គ្រង kernel បន្ថែម។

#### Namespaces — «ខ្ញុំឃើញអ្វី?»

Namespaces ផ្តល់ឱ្យ process នូវទស្សនៈផ្ទាល់ខ្លួន ចំពោះធនធានប្រព័ន្ធ៖

| Namespace | អ្វីដែលបំបែក | ហេតុអ្វីសំខាន់ |
|-----------|----------|----------------|
| **pid** | លេខ process | ក្នុង container, app អាចជា PID 1 |
| **mnt** | mounts / មែកធាង filesystem | Container មាន `/` ផ្ទាល់ខ្លួន មិនមែនរបស់ host |
| **net** | ជង់ network | interfaces, IPs, ports, routing ផ្ទាល់ខ្លួន |
| **uts** | Hostname | hostname របស់ container ≠ hostname របស់ host |
| **ipc** | shared memory / IPC | apps មិនប៉ះវត្ថុ IPC របស់គ្នា |
| **user** | លេខ user (បើជ្រើស) | ផ្គូ root ក្នុង container ទៅ user គ្មានសិទ្ធិពិសេសលើ host |

**គំនិតឧទាហរណ៍៖** containers ពីរអាចស្តាប់ port `80` *ក្នុង* network namespace ផ្ទាល់ខ្លួន។ លើ host អ្នកផ្សាយ ports ខុសគ្នា (`-p 8080:80` និង `-p 8081:80`)។

#### cgroups — «ខ្ញុំប្រើបានប៉ុន្មាន?»

**Control groups (cgroups)** កំណត់ និងរាប់ធនធាន៖

- ពេល CPU
- Memory
- PIDs / ចំនួន process
- Block I/O (ពេលខ្លះ)

គ្មាន cgroups, container មួយដែលរត់ហួសអាចស៊ីអស់ធនធាន host។ មានវា អ្នកអាចនិយាយថា «API នេះបាន RAM យ៉ាងច្រើន 512MB»។

#### Union filesystem / layers — «ថាសត្រូវបានសង់យ៉ាងដូចម្តេច?»

Images ជា **layers** ជង់គ្នា (អានបានតែ)។ ពេល container រត់ Docker បន្ថែម **writable layer** ស្តើងពីលើ៖

```
[ writable container layer ]  ← changes while running (unless volumes)
[ image layer: your app ]
[ image layer: npm deps ]
[ image layer: base OS userland ]
```

ហេតុនេះ៖

- Images ចែក layers លើថាស (សន្សំកន្លែង)។
- ការសង់ឡើងវិញអាចលឿន (cache layers ដែលមិនប្តូរ)។
- លុប container ចោល writable layer (លុះត្រាតែអ្នកប្រើ volumes)។

#### Kernel រួម — ការដោះដូរសំខាន់

Containers **ចែក host kernel**។ នោះមានន័យថា៖

- ស្រាលជាង VMs។
- bug ក្នុង kernel ឬ container ដែលមានសិទ្ធិពិសេស ហើយកំណត់ខុស ធ្ងន់ជាង VM ដែលបំបែកបានល្អ។
- រត់ Windows container kernel លើ Linux kernel (ឬផ្ទុយមកវិញ) មិនបាន ដោយគ្មាន virtualization នៅក្រោម (Docker Desktop ប្រើ VM តូចលើ Mac/Windows សម្រាប់ហេតុផលនេះ)។

### គំរូលម្អិត៖ image ធៀប container (វដ្តជីវិត)

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

- **Image** = គំរូដែលមិនប្តូរ (ជាធម្មតា)។
- **Container** = ធាតុដែលមានស្ថានភាព (កំពុងរត់ ឬបានឈប់)។
- **Registry** = ធ្នើពីចម្ងាយ សម្រាប់ images (Docker Hub, GHCR, …)។

Image មួយ → containers ច្រើន (ដូច class មួយ → objects ច្រើន)។

### Docker អនុវត្ត containerization យ៉ាងដូចម្តេច (stack សាមញ្ញ)

អ្នកវាយ `docker …`។ ជារួម៖

```
docker CLI  →  dockerd (Docker daemon)  →  containerd  →  runc  →  Linux namespaces/cgroups
```

| ផ្នែក | តួនាទី |
|-------|------|
| **CLI** | ចំណុចប្រទាក់សម្រាប់មនុស្ស (`docker run`, `build`, …) |
| **dockerd** | API/អ្នករៀបចំរបស់ Docker លើម៉ាស៊ីនមួយ |
| **containerd** | គ្រប់គ្រងវដ្តជីវិត container / images |
| **runc** | បង្កើត container ពិត តាម OCI runtime + លក្ខណៈ kernel |

លើ Docker Desktop (Mac/Windows) stack នេះរត់ **ក្នុង Linux VM ស្រាល** ព្រោះ kernel របស់ Mac/Windows មិនមែន Linux kernel ដែល containers រំពឹង។

អ្នកកម្រប៉ះ `runc` ផ្ទាល់។ ការយល់ stack ពន្យល់សារកំហុស និង «ទីកន្លែង» ដែលអ្វីៗរត់។

### Lab៖ `labs/01-isolation-basics` (អ្នកចាប់ផ្តើម)

**ផ្លូវដែលគួរធ្វើ៖** បញ្ចប់ Lab 01 (Isolation basics)។ វាជាគំនិតដូចឧទាហរណ៍ខាងក្រោម បូក checklist និង «អ្វីដែលត្រូវកត់សម្គាល់»។

អ្នក **មិន**ត្រូវការចំណេះដឹងកម្រិតខ្ពស់ទេ — ត្រឹម `docker run`, `exec` និង `rm`។

### ឧទាហរណ៍អនុវត្ត (ឯកសារយោង បើចង់)

ឧទាហរណ៍ដូច Lab 01 ទុកនៅទីនេះសម្រាប់សៀវភៅ។ ពួកវាសន្មតថា Docker បានដំឡើងរួច (ជំពូក 4)។ បើអ្នកកំពុងអានមុន អាចមើលឆ្លងឥឡូវ រួចរត់ម្តងទៀតក្រោយដំឡើង — ឬធ្វើ lab តែម្តង។

#### ឧទាហរណ៍ A — បំបែក process (pid namespace)

```bash
# Start a quiet container
docker run -d --name rean-ps alpine:3.22 sleep 3600

# Processes *inside* the container (small list; sleep is typically PID 1)
docker exec rean-ps ps aux

# Processes on the host (huge list) — different pid namespace
ps aux | head

docker rm -f rean-ps
```

→ ក្នុង container អ្នក **មិន**ឃើញ processes ដូច Chrome/Slack របស់ host ទេ។ នោះគឺការបំបែក pid។

#### ឧទាហរណ៍ B — បំបែក filesystem (mnt namespace)

```bash
docker run --rm -it alpine:3.22 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'
```

→ Container មាន `/tmp` និង `/` ផ្ទាល់ខ្លួន។ ការបង្កើត `/tmp/note.txt` នៅក្នុង មិនបង្កើតឯកសារនោះលើផ្ទៃតុ host ទេ។

ប្រៀបធៀបជាមួយ **bind mount** (ថតដែលចែកដោយចេតនា — អ្នកនឹងប្រើពេលក្រោយ សម្រាប់សរសេរកូដផ្ទាល់)៖

```bash
mkdir -p /tmp/rean-share
echo 'from-host' > /tmp/rean-share/msg.txt
docker run --rm -v /tmp/rean-share:/data alpine:3.22 cat /data/msg.txt
# → from-host
```

ការបំបែកជាលំនាំដើម; ការចែកត្រូវជ្រើស។

#### ឧទាហរណ៍ C — បំបែក network (net namespace)

```bash
# Two containers, each with nginx on container-port 80
docker run -d --name rean-web-a -p 18080:80 nginx:1.28-alpine
docker run -d --name rean-web-b -p 18081:80 nginx:1.28-alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f rean-web-a rean-web-b
```

→ Container នីមួយៗគិតថាខ្លួនកាន់ port `80`។ Host ផ្គូ ports ដែលផ្សាយ ឱ្យខុសគ្នា។ នោះគឺ network namespace បូកការផ្សាយ port។

#### ឧទាហរណ៍ D — កំណត់ធនធាន (cgroups)

```bash
# Limit memory; watch Docker enforce it
docker run --rm -m 128m --memory-swap 128m alpine:3.22 \
  sh -c 'echo "cgroup memory limit applied"; cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "(limit visible via docker inspect)"'
```

ពិនិត្យពីខាងក្រៅ៖

```bash
docker run -d --name rean-limited -m 256m alpine:3.22 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' rean-limited
# → 268435456 (bytes)
docker rm -f rean-limited
```

→ Containerization មិនត្រឹមបំបែក *អត្តសញ្ញាណ* ទេ; វាក៏ជា **ការប្រើប្រាស់ដែលកំណត់បាន**។

#### ឧទាហរណ៍ E — image ដូចគ្នា containers ច្រើន (ដាក់បានច្រើន)

```bash
docker pull redis:7-alpine
docker run -d --name rean-r1 redis:7-alpine
docker run -d --name rean-r2 redis:7-alpine
docker run -d --name rean-r3 redis:7-alpine
docker ps --filter name=rean-r
docker rm -f rean-r1 rean-r2 rean-r3
```

→ Image មួយ, processes Redis ដែលបំបែកបី។ នោះជាអត្ថប្រយោជន៍នៃការដាក់ច្រើន ធៀបនឹង VMs បី។

#### ឧទាហរណ៍ F — ខ្ចប់ «ដើរដូចគ្នា» (ឯកតាយកទៅបាន)

```bash
# Official image already packages Redis + its defaults
docker run --rm -p 6379:6379 redis:7-alpine
# In another terminal: docker run --rm -it redis:7-alpine redis-cli -h host.docker.internal ping
# (On Linux you may use --network host or the container IP instead)
```

ជំពូកក្រោយបង្រៀនឱ្យ **សង់ឯកតាផ្ទាល់ខ្លួន** ដោយ Dockerfile។ គំនិតដូចគ្នា៖ ផ្ញើបរិស្ថានជាមួយ app។

### ក្នុង image container ធម្មតាមានអ្វី?

ជាធម្មតា៖

- **Userland** តូច (Alpine, Debian slim, distroless, …) — *មិនមែន* kernel ទីពីរ
- runtime ភាសា (Node, Python, JVM, …) បើត្រូវការ
- ឯកសារ application
- ពាក្យបញ្ជាលំនាំដើម (`CMD` / `ENTRYPOINT`)
- Metadata (ports, env លំនាំដើម, labels)

ជាធម្មតា **គ្មាន**៖

- Hypervisor
- `/home` របស់ host (លុះត្រាតែអ្នក mount)
- filesystems របស់ containers ផ្សេង
- បរិស្ថាន desktop ពេញ

### អ្វីដែល containerization *មិន*មានន័យ

| ជំនឿខុស | ការពិត |
|------|---------|
| «Containers = VMs» | ទេ — kernel រួម, ការបំបែកកម្រិត process |
| «Containers មានសុវត្ថិភាពដោយស្វ័យប្រវត្តិ» | លំនាំដើមជួយ ប៉ុន្តែអ្នកនៅតែត្រូវរឹត (users, scans, សិទ្ធិតិចបំផុត) |
| «Container មួយ = ម៉ាស៊ីនទំហំ VM» | ចូលចិត្ត **កង្វល់ចម្បងមួយក្នុងមួយ container** (API, DB, worker) រួចផ្គុំជាមួយគ្នា |
| «មានតែ Docker» | Docker ធ្វើឱ្យវាទូទៅ; ឧបករណ៍ដែលត្រូវ OCI ក៏រត់ containers បាន |
| «រត់ក្នុង Docker = production រួច» | អ្នកនៅតែត្រូវការ config, secrets, networking, observability និងជារឿយៗអ្នករៀបចំ |

### ពេលណាគួរ containerize (និងពេលណាមិនគួរ)

**សមល្អ**

- Web APIs, workers, job runners
- Sidecars (proxy, អ្នកផ្ញើ log)
- Databases ក្នុង *dev/test* (DB production ជារឿយៗគ្រប់គ្រងដាច់ — ជម្រើសក្រុម)
- កិច្ចការ CI ដែលត្រូវការបរិស្ថានស្អាត ធ្វើឡើងវិញបាន
- ផ្ញើ artifact ដូចគ្នា ពី laptop → staging → prod

**សមខ្សោយ / ប្រយ័ត្ន**

- app desktop មាន GUI (ធ្វើបាន ប៉ុន្តែជារឿយៗរអាក់រអួល)
- app ដែលត្រូវការឧបករណ៍ host ពេញ / kernel module
- ការងារ kernel ដែលត្រូវ latency ទាបខ្លាំង ដែល VM ឬ bare metal ត្រូវបានកំណត់
- «លើកទាំងដុំ» monolith រញ៉េរញ៉ៃ *ដោយមិន*កែ config — containers ខ្ចប់ភាពវឹកវរទៅជាមួយដែរ

### បញ្ជីត្រួតពិនិត្យក្នុងចិត្ត មុនរាល់ container ដែលអ្នករត់

1. **Image** អ្វី ដែលខ្ញុំចាប់ផ្តើម? (ទុកចិត្ត + tag/digest)
2. **អ្វីបំបែក** ធៀប **អ្វីដែលខ្ញុំកំពុងចែក**? (ports, volumes, env)
3. **ធនធាន** ប៉ុន្មាន ដែលវាប្រើបាន? (កំណត់ memory/CPU ក្នុង prod)
4. **ទិន្នន័យ** ទៅណា ពេលលុប container? (volumes!)
5. **អ្នកណាទៅដល់វា**? (ports ដែលផ្សាយ, networks)

### ស្ពានទៅផ្នែកដែលនៅសល់នៃមគ្គុទ្ទេសក៍នេះ

| ប្រធានបន្ទាប់ | វាភ្ជាប់នឹង containerization យ៉ាងដូចម្តេច |
|------------|-------------------------------------|
| គំរូគំនិតស្នូល (ជំពូក 3) | វាក្យសព្ទ image / container / Dockerfile / registry |
| Isolation basics (Lab 01) | មានអារម្មណ៍ពីការបំបែក តាមពាក្យបញ្ជា `docker` សាមញ្ញ |
| Containers ដំបូង (ជំពូក 5 / Lab 02) | ការងារប្រចាំថ្ងៃ៖ រត់, logs, សម្អាត |
| Images និង Dockerfiles | របៀប *សង់* ឯកតាដែលយកទៅបាន |
| Volumes និង networks | ករណីលើកលែងដែលគ្រប់គ្រងបាន ពីការបំបែក |
| Compose | Containers ច្រើន ធ្វើការជាមួយគ្នាជា app មួយ |
| Production និងសុវត្ថិភាព | រឹតពិភព kernel រួម |

**ចំណុចចងចាំ៖** Containerization = **ខ្ចប់ + បំបែក + កំណត់ + ផ្ញើ** លើ kernel រួម។ Docker គឺរបៀបដែលអ្នកនឹងអនុវត្តវា នៅសល់នៃ `rean-docker`។

---

## 3. គំរូគំនិតស្នូល

ទន្ទេញពាក្យបួននេះ៖

### Image (គំរូ)

**គំរូអានបានតែ** — ដូច class ឬរូបថត filesystem បូក metadata (ពាក្យបញ្ជាលំនាំដើម, env, ports ដែលបើក)។

ឧទាហរណ៍៖ `nginx:1.28-alpine`, `postgres:16`, `node:22-alpine`។

### Container (ធាតុដែលរត់)

**ធាតុដែលកំពុងរត់ (ឬបានឈប់)** នៃ image មួយ — ដូច object ដែលបង្កើតពី class។

អ្នកអាចចាប់ផ្តើម containers ច្រើនពី image តែមួយ។

### Dockerfile (រូបមន្ត)

**រូបមន្ត** (ឯកសារអក្សរ) ប្រាប់ Docker ពីរបៀប build image មួយជួរម្តងៗ។

### Registry (ឃ្លាំង)

**កន្លែងផ្ទុក images**។ លំនាំដើមសាធារណៈ៖ [Docker Hub](https://hub.docker.com)។ ជម្រើសឯកជន៖ GHCR, ECR, GCR, Harbor ជាដើម។

```
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
                                    ↓
                              docker push/pull
                                    ↓
                                Registry
```

### Layers (ស្រទាប់)

Images ជាជង់ **layers**។ ពាក្យបញ្ជា Dockerfile នីមួយៗជារឿយៗបង្កើត layer មួយ។ Layers ដែលមិនប្តូរ ត្រូវបាន **cache** ដូច្នេះការសង់ឡើងវិញលឿន បើអ្នករៀបពាក្យបញ្ជាត្រូវ។

---

## 4. ដំឡើង និងផ្ទៀងផ្ទាត់

ត្រូវការ Docker លើ **កុំព្យូទ័រអ្នក** មុន labs នឹងដើរ។ អ្នករៀនភាគច្រើនដំឡើង **Docker Desktop** (Windows, macOS ឬ Linux)។ លើ Linux server អាចដំឡើង **Docker Engine** វិញ។

ទាញយក និងឯកសារផ្លូវការ៖ [https://docs.docker.com/get-started/get-docker/](https://docs.docker.com/get-started/get-docker/)

ជ្រើសប្រព័ន្ធប្រតិបត្តិការខាងក្រោម រួចបញ្ចប់ដោយជំហាន **ផ្ទៀងផ្ទាត់** រួម។

### Windows (ប្រព័ន្ធ)

**ណែនាំ៖** Docker Desktop ជាមួយ backend **WSL 2**។

1. **ពិនិត្យលក្ខខណ្ឌ**
   - Windows 10 64-bit (កំណែ 22H2+) ឬ Windows 11
   - បើក virtualization ក្នុង BIOS/UEFI (ជារឿយៗសរសេរ *Intel VT-x*, *AMD-V* ឬ *SVM*)
   - RAM ទំនេរប្រហែល 4 GB (ណែនាំ 8 GB+)

2. **ដំឡើង WSL 2** (ចាំបាច់សម្រាប់ការរៀបចំដែលណែនាំ)
   - បើក **PowerShell ជា Administrator** រួចរត់៖

```powershell
wsl --install
```

   - Restart ពេល Windows សុំ។
   - ក្រោយ reboot បញ្ចប់ការរៀបចំលើកដំបូងរបស់ Ubuntu (ឬ distro ផ្សេង) បើ terminal បើក។
   - បញ្ជាក់ថា WSL រួចរាល់៖

```powershell
wsl --status
```

3. **ទាញយក Docker Desktop សម្រាប់ Windows**
   - ចូល [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
   - ទាញ installer តាម CPU (AMD64 សម្រាប់ PC ភាគច្រើន, ARM64 សម្រាប់ Snapdragon/ARM)

4. **រត់ installer**
   - ចុចពីរដង `Docker Desktop Installer.exe`
   - ចូលចិត្តជម្រើសលំនាំដើម
   - ប្រាកដថា **Use WSL 2 instead of Hyper-V** ត្រូវបានជ្រើស ពេលវាសួរ
   - បញ្ចប់ wizard រួចចាប់ផ្តើម Docker Desktop ពេលវាសុំ

5. **ទទួលលក្ខខណ្ឌ រួចរង់ចាំ engine**
   - បើក Docker Desktop ពី Start menu បើវាមិនទាន់រត់
   - ទទួល Docker Subscription Service Agreement (ការប្រើផ្ទាល់ខ្លួន / រៀន ត្រូវបានអនុញ្ញាតតាមលក្ខខណ្ឌ Docker)
   - រង់ចាំរូបត្រីបាឡែក្នុង system tray បង្ហាញ Docker **running** (មិនមែន «starting»)

6. **ផ្ទៀងផ្ទាត់ក្នុង terminal**
   - បើក **PowerShell**, **Windows Terminal** ឬសែល **WSL** រួចបន្តផ្នែកផ្ទៀងផ្ទាត់ខាងក្រោម

**បើមានអ្វីខុសលើ Windows**

- Restart PC ក្រោយដំឡើង WSL រួចចាប់ផ្តើម Docker Desktop ម្តងទៀត
- ក្នុង Docker Desktop → Settings → General បញ្ជាក់ថា WSL 2 ត្រូវបានជ្រើស
- ក្នុង Docker Desktop → Settings → Resources → WSL Integration បើក distro ដែលបានដំឡើង
- រត់ `wsl --update` ក្នុង PowerShell ដែលមានសិទ្ធិខ្ពស់ បើ WSL ចាស់

### macOS (ប្រព័ន្ធ)

**ណែនាំ៖** Docker Desktop for Mac។

1. **ពិនិត្យលក្ខខណ្ឌ**
   - កំណែ macOS ដែលគាំទ្រ (កំណែបច្ចុប្បន្ន និងពីរកំណែធំមុន ជាធម្មតាត្រូវបានគាំទ្រ)
   - Apple Silicon (M1/M2/M3/M4…) **ឬ** Intel Mac
   - RAM ទំនេរប្រហែល 4 GB (ណែនាំ 8 GB+)

2. **ទាញ installer ឱ្យត្រូវ**
   - ចូល [Docker Desktop for Mac](https://docs.docker.com/desktop/setup/install/mac-install/)
   - ជ្រើស **Apple Silicon** ឬ **Intel Chip** ឱ្យត្រូវ Mac
   - គន្លឹះ៖ ម៉ឺនុយ Apple → About This Mac បង្ហាញប្រភេទ chip

3. **ដំឡើង Docker Desktop**
   - បើក `Docker.dmg` ដែលទាញមក
   - អូសរូប Docker ទៅក្នុង **Applications**
   - ដក disk image ចេញពេលរួច

4. **ចាប់ផ្តើម Docker លើកដំបូង**
   - បើក **Applications → Docker**
   - យល់ព្រមសំណើសុវត្ថិភាព / ឯកជនភាពរបស់ macOS (អាចត្រូវការ Password ឬ Touch ID)
   - ទទួល Docker Subscription Service Agreement
   - រង់ចាំរូបត្រីបាឡែលើ menu bar បង្ហាញ Docker **running**

5. **ផ្ទៀងផ្ទាត់ក្នុង Terminal**
   - បើក **Terminal** (ឬ iTerm) រួចបន្តផ្នែកផ្ទៀងផ្ទាត់ខាងក្រោម

**បើមានអ្វីខុសលើ macOS**

- System Settings → Privacy & Security៖ អនុញ្ញាត Docker បើ macOS បានទប់វា
- បិទ Docker អស់ (ម៉ឺនុយត្រីបាឡែ → Quit) រួចបើកម្តងទៀត
- បញ្ជាក់ថាអ្នកដំឡើងកំណែ Apple Silicon លើ Mac ស៊េរី M (កំណែ Intel រត់មិនល្អនៅទីនោះ)

### Linux (ប្រព័ន្ធ)

មានជម្រើសពីរដែលជួបញឹកញាប់៖

| ជម្រើស | សមពេលណា |
|--------|-----------|
| **Docker Desktop for Linux** | ចង់បាន GUI និងការរៀបចំរួមមួយដែលងាយ |
| **Docker Engine** (daemon + CLI) | ចង់ដំឡើងស្រាលជាង លើ Ubuntu/Debian/Fedora ជាដើម |

#### ជម្រើស A — Docker Desktop សម្រាប់ Linux

1. បញ្ជាក់ថា distro ត្រូវបានគាំទ្រ (Ubuntu, Debian និង Fedora ជាជម្រើសញឹកញាប់)៖ [Desktop for Linux](https://docs.docker.com/desktop/setup/install/linux/)
2. ដំឡើងកញ្ចប់តាម distro (`.deb` ឬ `.rpm`) ពីទំព័រផ្លូវការ
3. បើក Docker Desktop ពីម៉ឺនុយ app
4. ទទួលកិច្ចព្រមព្រៀង រួចរង់ចាំរហូត engine បង្ហាញថាកំពុងរត់
5. បន្តផ្នែកផ្ទៀងផ្ទាត់ខាងក្រោម

#### ជម្រើស B — Docker Engine (CLI) លើគ្រួសារ Ubuntu/Debian

ជំហានទាំងនេះជាផ្លូវធម្មតា សម្រាប់អ្នករៀន Linux ច្រើន។ Distro ផ្សេង សូមធ្វើតាមឯកសារ Engine របស់ Docker សម្រាប់គ្រួសារនោះ ([Install Docker Engine](https://docs.docker.com/engine/install/))។

1. **ធ្វើបច្ចុប្បន្នភាពកញ្ចប់ រួចដំឡើងអ្វីដែលត្រូវមានមុន**

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
```

2. **បន្ថែម GPG key ផ្លូវការរបស់ Docker និង apt repository**

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

> លើ Debian ប្រើការណែនាំ Debian របស់ Docker (`download.docker.com/linux/debian`) មិនមែន URL Ubuntu ខាងលើទេ។

3. **ដំឡើង Engine, CLI, Compose plugin និងឧបករណ៍ជំនួយ**

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. **ចាប់ផ្តើម Docker រួចបើកឱ្យរត់ពេល boot**

```bash
sudo systemctl enable --now docker
sudo systemctl status docker
```

អ្នកចង់ឃើញ `active (running)`។

5. **(ណែនាំ) ប្រើ Docker ដោយមិនវាយ `sudo` រាល់ដង**

```bash
sudo usermod -aG docker $USER
```

រួច **ចេញ ហើយចូលវិញ** (ឬ reboot) ដើម្បីសមាជិកភាពក្រុមមានប្រសិទ្ធភាព។ រហូតដល់ពេលនោះ បន្តប្រើ `sudo docker …`។

### ផ្ទៀងផ្ទាត់ (គ្រប់ប្រព័ន្ធ)

ក្រោយ Docker បានដំឡើង ហើយកំពុងរត់ បើក terminal រួចរត់៖

```bash
docker --version
docker compose version
docker info
docker run --rm hello-world
```

**អ្វីដែលអ្នកគួរឃើញ**

- កំណែ Docker (Engine / Desktop)
- កំណែ Compose (plugin៖ `docker compose` មិនមែនត្រឹម binary ចាស់ `docker-compose`)
- `docker info` បង្ហាញព័ត៌មាន server (storage driver, CPUs, memory)
- `hello-world` ទាញ image តូច រួចបោះពុម្ពសារជោគជ័យ

បើ `docker info` ឬ `hello-world` បរាជ័យ Docker មិនទាន់រត់ពេញទេ — ចាប់ផ្តើម Docker Desktop (ឬ `sudo systemctl start docker` លើ Linux Engine) រួចសាកម្តងទៀត។

### ចំណាំ Linux សំខាន់៖ សិទ្ធិ

បើអ្នកបាន `permission denied` ពេលនិយាយជាមួយ Docker socket៖

```bash
# Option A (common): add user docker group, log out/in
sudo usermod -aG docker $USER

# Option B: prefix sudo (works, less convenient)
sudo docker ps
```

### Daemon ធៀប client

- **Client៖** CLI `docker` ដែលអ្នកវាយ
- **Daemon៖** សេវា `dockerd` នៅផ្ទៃខាងក្រោយ ដែលបង្កើត containers ពិត

```bash
# Is the daemon running? (Linux Engine / many distros)
sudo systemctl status docker
```

លើ Windows និង macOS ជាមួយ Docker Desktop, daemon រត់ក្នុង Linux VM របស់ Desktop — ទុក app Desktop ឱ្យរត់ ពេលអ្នកធ្វើការ។

---
## 5. Container ដំបូងរបស់អ្នក

### Lab៖ `labs/02-hello`

### រត់ container នៅផ្ទៃមុខ (foreground)

```bash
docker run -it ubuntu:24.04 bash
```

| Flag | អត្ថន័យ |
|------|---------|
| `run` | បង្កើត ហើយចាប់ផ្តើម container ពី image |
| `-i` | ទុក STDIN ឱ្យបើក |
| `-t` | ផ្តល់ TTY (terminal អន្តរកម្ម) |
| `ubuntu:24.04` | ឈ្មោះ image + tag |
| `bash` | ពាក្យបញ្ជាដែលរត់នៅខាងក្នុង |

ក្នុង container សាក៖

```bash
cat /etc/os-release
whoami
exit
```

ពេលអ្នក `exit` container **ឈប់**។ វានៅមានរហូតដល់អ្នកលុប។

### រត់នៅផ្ទៃខាងក្រោយ (detached)

```bash
docker run -d --name my-nginx -p 8080:80 nginx:1.28-alpine
```

| Flag | អត្ថន័យ |
|------|---------|
| `-d` | Detached (ផ្ទៃខាងក្រោយ) |
| `--name` | ឈ្មោះងាយចាំ ជំនួស ID ចៃដន្យ |
| `-p 8080:80` | ផ្គូ port 8080 លើ host → port 80 ក្នុង container |

បើក៖ [http://localhost:8080](http://localhost:8080)

### ពាក្យបញ្ជាថ្ងៃដំបូងសំខាន់ៗ

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

### `--rm` សម្រាប់ containers ប្រើរួចលុប

```bash
docker run --rm -it alpine sh
# when you exit, container is auto-deleted
```

### សម្អាត (ទម្លាប់សុវត្ថិភាពតាំងពីដើម)

```bash
docker ps -a                      # see leftover containers
docker container prune            # remove all *stopped* containers
docker image ls                   # list images
docker image prune                # remove dangling images
# Nuclear (careful): remove unused images, networks, build cache
docker system prune -a
```

**លំហាត់ lab**

1. រត់ Nginx លើ port `8080`។
2. `curl localhost:8080` រួចបញ្ជាក់ថាឃើញ HTML។
3. `docker exec` ចូលទៅ រួចមើលបញ្ជី `/usr/share/nginx/html`។
4. ឈប់ ហើយលុប container។

---

## 6. ពន្យល់ images ឱ្យជ្រៅ

### មើលបញ្ជី និង inspect

```bash
docker images
# or
docker image ls

docker pull redis:7-alpine
docker image inspect redis:7-alpine
docker history redis:7-alpine
```

`history` បង្ហាញ layers និងទំហំប្រហែល — មានប្រយោជន៍ខ្លាំងសម្រាប់មើលថាតើ image ធំហួសហេតុនៅណា។

### Tags (ស្លាក)

`nginx:alpine` មានន័យថា៖

- Repository/ឈ្មោះ៖ `nginx`
- Tag៖ `alpine` (ទម្រង់ផ្អែកលើ Alpine Linux)

Tag ពិសេស៖ `latest` — **កុំពឹងវាក្នុង production**។ ចូលចិត្តកំណែច្បាស់៖ `nginx:1.28-alpine`។ Labs ក្នុង repo នេះ pin tag បែបនោះ សម្រាប់ពាក្យបញ្ជាដែលអ្នករត់។ `nginx:alpine` នៅតែជា tag ពិត; វាផ្លាស់ពេលអ្នកផ្សាយបោះពុម្ពឡើងវិញ។

### Image ផ្លូវការ និងផ្ទាល់ខ្លួន

- **Official images** លើ Docker Hub ត្រូវបានជ្រើសរើសហើយ (postgres, redis, python…)។
- **Images របស់អ្នក** ត្រូវបាន build ពី Dockerfile រួច push ទៅ registry។

### Image ID និងឈ្មោះ

Image មាន content digest / ID។ ឈ្មោះគឺស្លាកសម្រាប់មនុស្ស ដែលចង្អុលទៅ ID។ ការដាក់ tag ថ្មីមិនចម្លង layers ទេ — វាបន្ថែមឈ្មោះមួយទៀត។

```bash
docker tag nginx:1.28-alpine my-nginx:dev
docker images | grep nginx
```

---

## 7. Dockerfile — បង្កើត image ផ្ទាល់ខ្លួន

### Lab៖ `labs/03-dockerfile`

Dockerfile គឺ script នៃ instruction។ ឧទាហរណ៍ (app Node សាមញ្ញ)៖

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

### តារាងសង្ខេប instruction

| Instruction | គោលបំណង |
|-------------|---------|
| `FROM` | Image មូលដ្ឋាន (ត្រូវនៅដើម លើកលែង `ARG` មុន `FROM`) |
| `WORKDIR` | កំណត់ថតធ្វើការ (បង្កើតបើមិនទាន់មាន) |
| `COPY` / `ADD` | ចម្លងឯកសារចូល image (`COPY` ល្អជាង; `ADD` មានឥរិយាបថបន្ថែម) |
| `RUN` | រត់ពាក្យបញ្ជាពេល build (ដំឡើងកញ្ចប់ ជាដើម) |
| `ENV` | កំណត់អថេរបរិស្ថាន |
| `EXPOSE` | កត់ត្រា ports (ឯកសារ + គន្លឹះសម្រាប់ឧបករណ៍) |
| `CMD` | ពាក្យបញ្ជាលំនាំដើម (ងាយសរសេរជាន់) |
| `ENTRYPOINT` | កម្មវិធីចម្បងថេរ (args ជារឿយៗត្រូវបានបន្ថែមពីក្រោយ) |
| `USER` | ប្តូរទៅ user មិនមែន root |
| `VOLUME` | ប្រកាសចំណុច mount |
| `HEALTHCHECK` | របៀបដែល Docker សាកសុខភាព container |
| `ARG` | អថេរពេល build |

### CMD ធៀប ENTRYPOINT

```dockerfile
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
```

- `docker run img` → រត់ `nginx -g 'daemon off;'`
- `docker run img -t` → រត់ `nginx -t` (`CMD` ត្រូវបានជំនួស, `ENTRYPOINT` នៅ)

ចូលចិត្ត **ទម្រង់ exec** (អារេ JSON) មិនមែនទម្រង់ shell ទេ ដើម្បីសញ្ញា (SIGTERM) ទៅដល់ process ត្រូវ៖

```dockerfile
# Good
CMD ["node", "server.js"]

# Avoid for main process (PID 1 signal issues)
CMD node server.js
```

### Build និងរត់

ពី `labs/03-dockerfile`៖

```bash
cd labs/03-dockerfile
docker build -t rean-hello:1.0 .
docker run --rm -p 3000:3000 rean-hello:1.0
```

| ផ្នែក | អត្ថន័យ |
|------|---------|
| `build` | Build image ពី Dockerfile |
| `-t rean-hello:1.0` | ឈ្មោះ:tag |
| `.` | Build context (ឯកសារដែលផ្ញើទៅ daemon) |

### Build context និង `.dockerignore`

អ្វីៗក្នុងថត context អាចត្រូវបានផ្ញើទៅ Docker។ ដករបស់មិនចាំបាច់ចេញ៖

```gitignore
node_modules
.git
*.md
.env
npm-debug.log
```

**ហេតុអ្វីសំខាន់៖** Context តូច = build លឿន។ កុំចម្លង secrets ចូល images ដោយចៃដន្យ។

### យុទ្ធសាស្ត្រ layer caching (ជំនាញសំខាន់)

**លំដាប់មិនល្អ** (ការប្តូរកូដណាមួយបំបែក cache របស់ `npm install`)៖

```dockerfile
COPY . .
RUN npm install
```

**លំដាប់ល្អ**៖

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
```

ច្បាប់៖ **ដាក់ជំហានដែលផ្លាស់កម្រ ហើយថ្លៃ នៅដើម; ដាក់ source ដែលផ្លាស់ញឹកញាប់នៅចុង។**

---

## 8. Volumes — រក្សាទិន្នន័យឱ្យនៅរស់

### Lab៖ `labs/07-volumes`

Containers **មិននៅជាអចិន្ត្រៃយ៍**។ លុប container → writable layer របស់វាបាត់។

ដើម្បីរក្សាទិន្នន័យ ប្រើ **volumes** ឬ **bind mounts**។

### ប្រភេទ mount បី

| ប្រភេទ | ប្រើពេលណា | ឧទាហរណ៍ |
|------|----------|---------|
| **Named volume** | ទិន្នន័យ DB, Docker គ្រប់គ្រង | `docker volume create pgdata` |
| **Bind mount** | កែ source លើ host ផ្ទាល់ | `-v $(pwd):/app` |
| **tmpfs** | អាថ៌កំបាំង/បណ្តោះអាសន្ន ក្នុង memory | `--tmpfs /tmp` |

### ឧទាហរណ៍ named volume (Postgres)

```bash
docker volume create rean-pgdata

docker run -d --name rean-pg \
  -e POSTGRES_PASSWORD=secret \
  -v rean-pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

`POSTGRES_PASSWORD=secret` នៅទីនេះគឺ **សម្រាប់សាកតែប៉ុណ្ណោះ** ដើម្បី copy-paste ខ្លី។ ចូលចិត្ត `.env` / `--env-file` (Labs 04/05 / Lab 07 Compose) ពេលចង់រក្សាទម្លាប់ secrets។

ឈប់/លុប container — **ទិន្នន័យនៅ** ក្នុង `rean-pgdata`។

```bash
docker volume ls
docker volume inspect rean-pgdata
```

### ឧទាហរណ៍ bind mount (dev)

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine node -e "console.log('hi from bind mount')"
```

### Volume ធៀប bind៖ ពេលណាប្រើអ្វី

- **Volume៖** ទិន្នន័យ production, databases, អ្វីដែល Docker គួរគ្រប់គ្រង
- **Bind៖** ការអភិវឌ្ឍក្នុងម៉ាស៊ីន, ឯកសារ config ដែលអ្នកកែលើ host

### ប្រយ័ត្នសិទ្ធិ

Bind mounts ទទួលបញ្ហា UID/GID របស់ host។ ចូលចិត្តផ្គូ user ក្នុង Dockerfile (`USER`) ឬកែម្ចាស់ឯកសារដោយប្រុងប្រយ័ត្ន។

---

## 9. Networks — របៀបដែល containers និយាយគ្នា

### Lab៖ `labs/06-networks`

តាមលំនាំដើម containers លើ bridge network ដែលអ្នកបង្កើតដូចគ្នា អាចទៅដល់គ្នា **តាមឈ្មោះ container** (DNS)។

```bash
docker network create rean-net

docker run -d --name rean-redis --network rean-net redis:7-alpine

docker run --rm --network rean-net redis:7-alpine \
  redis-cli -h rean-redis ping
# → PONG
```

Hostnames៖

- ពី container ផ្សេងលើ `rean-net`៖ `rean-redis`
- ពីម៉ាស៊ីន host៖ ជាធម្មតាតាម ports ដែលផ្សាយ (`localhost:6379`) មិនមែនឈ្មោះខាងក្នុង

### ប្រភេទ network (សាមញ្ញ)

| Driver | ការប្រើធម្មតា |
|--------|-------------|
| `bridge` | លំនាំដើមសម្រាប់ app លើ host តែមួយ (ញឹកញាប់បំផុត) |
| `host` | Container ចែក network stack របស់ host (Linux) |
| `none` | គ្មាន networking |
| `overlay` | ច្រើន host (Swarm) |

### ការផ្សាយ port ម្តងទៀត

`-p HOST:CONTAINER` ប៉ះតែការចូល **ពី host / ខាងក្រៅ**។ Containers លើ Docker network ដូចគ្នា និយាយគ្នាតាម port *ក្នុង container* ដោយមិនចាំបាច់ `-p`។

ឧទាហរណ៍៖ app ភ្ជាប់ `postgres:5432` ខាងក្នុង; ផ្សាយ `5432` តែពេលចង់ឱ្យឧបករណ៍លើ host (psql GUI) ភ្ជាប់។

---

## 10. Environment, secrets និង config

### Lab៖ `labs/04-env-secrets`

ធ្វើបន្ទាប់ពី Lab 03 (អ្នកសរសេរ Dockerfile រួច) និងមុន Lab 05។ អ្នកនឹងផ្ញើ config នៅ **ពេលរត់** រួចមើល password ដែលដុតក្នុង image លេចក្នុង `docker history`។

### បញ្ជូន env vars

```bash
docker run --rm -e GREETING=Hello alpine printenv GREETING

docker run --rm --env-file .env alpine printenv
```

### ក្នុង Dockerfile

```dockerfile
ENV NODE_ENV=production
```

### ច្បាប់ងាយៗ

1. **Config** (មិនមែន secret)៖ env vars, Compose `environment`, ឯកសារ config។
2. **Secrets** (passwords, API keys)៖ កុំដុតចូល layers របស់ image; ប្រើ env ពេលរត់, Docker secrets, ឬ vault — ហើយទុក `.env` ចេញពី git។
3. ចូលចិត្តរបៀប **12-factor**៖ image ដូចគ្នា, env ខុសគ្នាតាមបរិស្ថាន (dev/stage/prod)។

### ឧទាហរណ៍ `.env` (កុំ commit secrets)

```env
POSTGRES_USER=rean
POSTGRES_PASSWORD=change-me
POSTGRES_DB=rean
```

បន្ថែម `.env` ទៅ `.gitignore`។

---

## 11. Docker Compose — កម្មវិធីពហុ container

### Lab៖ `labs/05-compose`

`docker run` ដោយដៃសម្រាប់ app + db + redis ធុញ។ **Compose** ពិពណ៌នា stack ទាំងមូលក្នុង YAML។

### `compose.yaml` តូច (សាមញ្ញ)

Lab 05 រក្សា **password ក្នុង `.env`** មិនមែនក្នុង YAML (Lab 04)។ Compose បំពេញ `${POSTGRES_PASSWORD}` ពេល stack ចាប់ផ្តើម៖

```yaml
services:
  web:
    build: .
    ports:
      # Lab 05 binds localhost so a forgotten stack is not open on the LAN.
      - "127.0.0.1:3000:3000"
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

ចម្លង `.env.example` → `.env` មុន `docker compose up`។ តម្លៃក្នុងឯកសារ Compose មើលឃើញតាម `docker compose config` លើម៉ាស៊ីនអ្នក — នេះធម្មតា។ ច្បាប់គឺ៖ **កុំ commit `.env` ហើយកុំដុត secrets ចូល image**។ ប្រើ `3000:3000` (គ្រប់ interface) តែពេលអ្នកចង់ចូលពីចម្ងាយដោយចេតនា។

**Password ក្នុង URL៖** `DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:…` បែក បើ password មាន `@`, `:`, `/`, ឬ `#` (Compose បំពេញមុន URL parser)។ Password ក្នុង lab សាមញ្ញដោយចេតនា។ ក្នុង app ពិត ចូលចិត្ត env vars ដាច់ដោយឡែក ឬ URL-encode password មុនផ្គុំ string។

### ពាក្យបញ្ជា Compose សំខាន់

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

### គំនិត Compose សំខាន់

| គំនិត | អត្ថន័យ |
|---------|---------|
| `services` | Containers ក្នុង app របស់អ្នក |
| `build` | Build ពី Dockerfile |
| `image` | ប្រើ image ដែលមានស្រាប់ |
| `depends_on` | លំដាប់ចាប់ផ្តើម (មិនមែនរួចរាល់ពេញ លុះត្រាតែមាន healthchecks) |
| `volumes` | Named volumes ដែលប្រកាសនៅខាងក្រោម |
| `networks` | Networks ដាច់សម្រាប់គម្រោង |
| `env_file` / `.env` | Config និង secrets ពេលរត់ (មិនដុតក្នុង image) |

### Service DNS (ឈ្មោះ)

ក្នុង Compose ឈ្មោះ service = hostname។ Service web ភ្ជាប់ Postgres តាម host `db` មិនមែន `localhost`។

**`localhost` ក្នុង container មានន័យថា container នោះផ្ទាល់** មិនមែន host ឬ service បងប្អូនទេ។

### Profiles និង overrides (កម្រិតមធ្យម)

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

### Lab៖ `labs/08-multi-stage`

បញ្ហា៖ ឧបករណ៍ build (compilers, TypeScript/`tsc`, npm ជាមួយ deps ទាំងអស់, Go toolchain) ធ្វើឱ្យ image production ធំ ហើយពង្រីកផ្ទៃដែលអាចវាយប្រហារ។

**Multi-stage builds** ប្រើ `FROM` ច្រើនជួរ ហើយចម្លងតែ artifacts ទៅមុខ។

Lab 08 compile TypeScript ក្នុង build stage ដូច្នេះ `:fat` (compiler នៅសល់ក្នុង image) ធំជាង `:slim` (JS ដែល compile រួច + production deps តែប៉ុណ្ណោះ) ច្បាស់។

```dockerfile
# syntax=docker/dockerfile:1
# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

អត្ថប្រយោជន៍៖

- Image ចុងក្រោយគ្មាន compilers / build deps ដែលមិនប្រើ
- ផ្ទៃវាយប្រហារតូចជាង
- ការទាញយកតូចជាងញឹកញាប់

បន្ទាត់ `# syntax=docker/dockerfile:1` (Lab 08) បើកលក្ខណៈ BuildKit ដូច cache mounts។ `RUN --mount=type=cache,target=/root/.npm` រក្សា cache ទាញ npm រវាង builds **ដោយមិន** ចម្លងវាចូល image layer។

### Alpine ធៀប distroless ធៀប slim

| មូលដ្ឋាន | ចំណុចល្អ | ចំណុចខ្វះ |
|------|------|------|
| `*-alpine` | តូច | musl មានលក្ខណៈពិសេស, កញ្ចប់តិច |
| `*-slim` | ផ្អែកលើ Debian, តូចជាងពេញ | នៅតែធំជាង Alpine |
| Distroless | តិចបំផុត, សុវត្ថិភាពខ្លាំង | ពិបាក debug (គ្មាន shell) |

ជ្រើសតាមតម្រូវការ app; ការដូចគ្នារវាង services ជួយប្រតិបត្តិការ។

### ទម្លាប់ពិនិត្យទំហំ

```bash
docker images rean-hello
docker history rean-hello:1.0
dive rean-hello:1.0   # if you install dive — visual layer explorer
```

---

## 13. ទម្លាប់គិតបែប production

### Lab៖ `labs/09-production`

### បញ្ជីត្រួតពិនិត្យមុន deploy «ពិត»

1. **Pin កំណែ** — `postgres:16-alpine` មិនមែន `postgres:latest`។ Labs ដើមប្រើ series tag (`redis:7-alpine`, `node:22-alpine`, `nginx:1.28-alpine`)។ Labs ដែលមានច្រក CRITICAL / គិតបែប production pin digest (`FROM node:22-alpine@sha256:…` ក្នុង Labs 05, 08 slim, 09, 12, និង 13; Postgres/Redis ក្នុង Lab 13 Compose — Lab 05 Compose នៅអណ្តែត tags ទាំងនោះដោយចេតនា)។ ជំពូក 15 ពន្យល់ tag ធៀប digest។
2. **User មិនមែន root** — `USER node` ឬ UID ផ្ទាល់ខ្លួន
3. **Root filesystem អានបានតែ** ពេលអាច (`--read-only` + mounts សរសេរបានសម្រាប់ tmp)
4. **Healthchecks** — images Node លើ Alpine ភាគច្រើនគ្មាន `wget`/`curl`។ សាកដោយ Node runtime ដូច app៖

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

5. **កំណត់ធនធាន** — Compose V2 (`docker compose`) អនុវត្ត `deploy.resources` លើ node តែមួយ។ មិនត្រូវការ Swarm ឬ key ចាស់ `mem_limit` / `cpus`។

```yaml
deploy:
  resources:
    limits:
      cpus: "0.50"
      memory: 256M
```

6. **ច្បាប់ restart**

```yaml
restart: unless-stopped
```

7. **Init process** — `init: true` (ឬ `docker run --init`) ដើម្បីឱ្យ PID 1 ប្រមូល zombies និងបញ្ជូន `SIGTERM` ពី `docker stop`។ ផ្គូជាមួយ `CMD` ទម្រង់ exec និងការបិទថ្នមៗក្នុង app។

```yaml
init: true
```

8. **Logging** — កុំកត់ត្រា secrets; ផ្ញើ logs ទៅអ្នកប្រមូល; កំណត់ logs json-file របស់ Docker ដើម្បីកុំឱ្យ app សរសេរពេញថាស។

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

9. **Process មួយក្នុងមួយ container** (គោលណែនាំ) — app មួយ, db មួយទៀត; ប្រើ Compose/K8s ផ្គុំពួកវា។

10. **Images មិនប្តូរពេលរត់** — build ឡើងវិញ រួច deploy ឡើងវិញ; កុំ «ជួសជុល» containers ដែលកំពុងរត់។

11. **ផ្សាយនៅ localhost** ពេល reverse proxy នឹងបញ្ចប់ TLS — `127.0.0.1:3000:3000` ដើម្បីកុំឱ្យ API លេចនៅគ្រប់ interface របស់ host។ Lab 09 និង Compose prod របស់ Lab 12 ធ្វើបែបនេះ។

12. **ដក Linux capabilities** — `cap_drop: [ALL]` (ឬ `docker run --cap-drop ALL`) ដើម្បីកុំឱ្យ process ទទួលសិទ្ធិ kernel ដែលវាមិនត្រូវការ។ ផ្គូជាមួយ `no-new-privileges`។

### ច្បាប់ restart

| ច្បាប់ | អាកប្បកិរិយា |
|--------|----------|
| `no` | មិន restart |
| `always` | restart ជានិច្ច |
| `on-failure` | restart ពេលចេញដោយលេខមិនមែនសូន្យ |
| `unless-stopped` | ជានិច្ច លើកលែងពេលអ្នកឈប់ដោយដៃ |

---

## 14. Debug និងដោះស្រាយបញ្ហា

### Lab៖ `labs/10-debugging`

អនុវត្ត `logs`, `inspect` និង client Compose ដែលនិយាយទៅ `localhost` ខុស។ កែ hostname រួចត្រឡប់មកទីនេះសម្រាប់រោគសញ្ញាផ្សេងទៀត។

### Container មិននៅរស់

```bash
docker ps -a
docker logs <name>
docker inspect <name>   # look at State.ExitCode, Error, Mounts, NetworkSettings
```

### Debug បែបអន្តរកម្ម

```bash
docker run --rm -it --entrypoint sh myimage:tag
docker compose run --rm web sh
```

### ចម្លងឯកសារចូល/ចេញ

```bash
docker cp my-nginx:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./file.txt my-nginx:/tmp/
```

### មើល processes / ការប្រើធនធាន

```bash
docker top my-nginx
docker stats
```

### រោគសញ្ញាធម្មតា

| រោគសញ្ញា | មូលហេតុទំនង |
|---------|----------------|
| Port ត្រូវបានយកហើយ | Process/container ផ្សេងកំពុងប្រើ host port |
| ការភ្ជាប់ទៅ `db` ត្រូវបានបដិសេធ | Network ខុស, hostname ខុស, db មិនទាន់រួច |
| សិទ្ធិត្រូវបានបដិសេធលើ volume | UID មិនផ្គូលើ bind mount |
| Image ធំខ្លាំង | Base ធំ, ឧបករណ៍ build នៅសល់, គ្មាន multi-stage |
| ការផ្លាស់មិនលេច | Image ចាស់នៅ cache; build ឡើងវិញ; ឬ mount ខុស |
| `localhost` ក្នុង browser ដើរ តែ app មិនទៅដល់ db | App ប្រើ `localhost` មិនមែនឈ្មោះ service |

### ការប្រណាំង «Database មិនទាន់រួច»

`depends_on` រង់ចាំតែ **ការចាប់ផ្តើម** មិនមែន **រួចរាល់**។ ដោះស្រាយដោយ៖

- Healthcheck + `depends_on: condition: service_healthy` (Compose)
- សាកឡើងវិញ/backoff ក្នុង app
- Init containers / scripts រង់ចាំ

```yaml
depends_on:
  db:
    condition: service_healthy
```

---

## 15. សុវត្ថិភាពសំខាន់ៗ

### Lab៖ `labs/11-security`

ប្រៀបធៀប `whoami` លើ image ដែលមិនមែន root ធៀប Alpine, build ជាមួយ BuildKit `--secret` (គ្មានអ្វីក្នុង `docker history`) ហើយស្កេនដោយ Trivy បើចង់។ Lab 04 បានបង្ហាញ anti-pattern `ENV` ដែលលេច secret រួចហើយ។

1. **កុំរត់ជា root** ក្នុង containers production ពេលអាចជៀសបាន។
2. **ស្កេន images** រក CVEs (`docker scout`, Trivy, Grype)។
3. **Base images តូច** + multi-stage។
4. **កុំ commit secrets**; កុំ `ENV PASSWORD=...` ជាមួយ secret ពិតក្នុង Dockerfile។
5. **Pin digests** សម្រាប់គ្រប់គ្រង supply-chain ដែលសំខាន់៖

```bash
docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}'
# Labs 05/08(slim)/09/12/13 pin FROM node:22-alpine@sha256:…; Lab 13 Compose pin Postgres/Redis ដែរ។
```

```bash
docker pull nginx@sha256:...
```

6. **ដក capabilities** / ប្រើជម្រើសសុវត្ថិភាពពេលត្រូវ (`--cap-drop ALL`)។
7. **ធ្វើបច្ចុប្បន្នភាព Engine** ឱ្យទាន់។
8. **ចាត់ Docker socket ដូច root** — mount `/var/run/docker.sock` ចូល container ស្ទើរតែដូចឱ្យ container នោះ root លើ host។

---

## 16. ប្រធានបទកម្រិតខ្ពស់

### Lab៖ `labs/14-advanced`

Cache mounts របស់ BuildKit, ការពិនិត្យ multi-arch, Compose Watch និងការមើល SBOM។ ធ្វើបន្ទាប់ពី Lab 11 (secrets បានអនុវត្តនៅ §2) និងមុន Lab 12។ Profiles បានបង្ហាញខ្លីក្នុងជំពូក 11 — ត្រឡប់មកវិញពេល service ស្រេចចិត្តធ្វើឱ្យឯកសារ Compose ប្រចាំថ្ងៃរញ៉េរញ៉ៃ។

> **គន្លឹះ:** CTA អនុវត្តខាងលើជំពូកនេះបើក Lab 14។

### BuildKit (សំខាន់)

Builder ទំនើប (ធម្មតាជាលំនាំដើមឥឡូវ)៖

```bash
DOCKER_BUILDKIT=1 docker build -t myapp .
```

លក្ខណៈ៖ cache ល្អជាង, build ស្របគ្នា, mount secrets ពេល build (មិនទុក secrets ក្នុង layers) និង cache mounts សម្រាប់ package managers។

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=secret,id=npmrc \
    npm ci

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .
```

### Build ច្រើនស្ថាបត្យកម្ម

```bash
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t you/app:1.0 --push .
```

មានប្រយោជន៍សម្រាប់ Apple Silicon + Linux servers។

### Registries (ឃ្លាំង)

```bash
docker login
docker tag rean-hello:1.0 youruser/rean-hello:1.0
docker push youruser/rean-hello:1.0
docker pull youruser/rean-hello:1.0
```

ឧទាហរណ៍ tag GHCR៖ `ghcr.io/you/rean-hello:1.0`

### Compose Watch (ធ្វើឡើងវិញលើម៉ាស៊ីន)

`docker compose up` build ឡើងវិញពេលអ្នកស្នើ។ **Compose Watch** build ឡើងវិញ ឬ sync ពេលឯកសារផ្លាស់ — មានប្រយោជន៍សម្រាប់ការសាកបែប bind-mount ដោយមិនត្រូវ file watcher ផ្ទាល់ខ្លួន។

```yaml
# sketch — see labs/14-advanced/compose.watch.yaml
services:
  demo:
    image: alpine:3.22
    develop:
      watch:
        - action: sync
          path: ./watch-demo
          target: /data
```

```bash
docker compose -f compose.watch.yaml up -d
docker compose -f compose.watch.yaml watch
```

ប្រើ Watch សម្រាប់ **រង្វិលត្រឡប់មតិលើ laptop**។ ទុក Compose production គ្មាន `develop:` — ផ្ញើ images មិនមែនច្បាប់ sync របស់ laptop (ជំពូក 17)។

### SBOM និង provenance

**SBOM** (Software Bill of Materials) រាយអ្វីដែល image មាន ដើម្បីឱ្យ scanner និង auditor វិភាគ supply chain។ **Provenance** / attestations កត់ត្រា *របៀប* ដែលវាត្រូវបាន build (Dockerfile, git commit, builder)។

វិធីមើលដោយមិនត្រូវដំឡើងឧបករណ៍បន្ថែម៖

```bash
# Trivy can emit SPDX (Lab 14)
docker run --rm aquasec/trivy:0.63.0 image --format spdx alpine:3.22 | head

# BuildKit can attach SBOM + provenance when you build/push (needs a capable builder)
docker buildx build --sbom=true --provenance=true -t you/app:1.0 --push .
```

មិនត្រូវចាំ SPDX។ ត្រូវមានទម្លាប់៖ **បង្កើត ឬភ្ជាប់ SBOM មុនចាត់ image ថា «release candidate»។**

### ចុះហត្ថលេខា images (ទិសដៅ)

Tags និង digests និយាយ *bits ណា*។ **Signatures** និយាយ *នរណាបោះផ្សាយ* (និងថាវាមិនត្រូវបានប្តូរ)។ ឧបករណ៍ដូច [Sigstore Cosign](https://docs.sigstore.dev/cosign/system_config/installation/) verify signature ក្នុង CI ឬពេល deploy។

```bash
# Shape only — install cosign separately if you try this for real
cosign sign ghcr.io/you/app@sha256:...
cosign verify ghcr.io/you/app@sha256:...
```

ការចុះហត្ថលេខាផ្គូជាមួយ digests (ជំពូក 15) និងការផ្ញើទៅ registry (ជំពូក 17)។ កុំដំឡើង Cosign នៅថ្ងៃទីមួយ; ដឹងថា «pull តាម digest + verify signature» គឺរឿងទុកចិត្តកម្រិត production។

### Rootless Docker (ទិសដៅ)

តាមលំនាំដើម Docker daemon ច្រើនតែរត់ជា root លើ host។ **Rootless mode** រត់ daemon ជា user របស់អ្នក ដើម្បីឱ្យ container ដែលត្រូវគេវាយប្រហារពិបាកជាងក្នុងការគ្រប់គ្រងម៉ាស៊ីន។ ការដោះដូរ៖ លក្ខណៈខ្លះ (port ជាក់លាក់, storage driver, GPU) ត្រូវរៀបចំបន្ថែម។

```bash
# After installing rootless extras (distro-specific — see Docker docs):
dockerd-rootless-setuptool.sh install
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/docker.sock
docker info
```

ចូលចិត្ត non-root **ក្នុង** images មុន (Lab 11 §1 / Lab 09)។ ទៅ rootless Engine ពេលរឹត laptop រួម ឬ CI runner។

### Docker Swarm ធៀប Kubernetes (ទិសដៅ)

| ឧបករណ៍ | តួនាទី |
|------|------|
| Docker Compose | Stack ក្នុងម៉ាស៊ីន / host តែមួយ |
| Docker Swarm | Clustering ក្នុង Docker (ប្រើតិចជាងសព្វថ្ងៃ) |
| Kubernetes | Orchestration ស្តង់ដារឧស្សាហកម្មនៅទំហំធំ |

រៀន Compose ឱ្យជ្រៅមុន។ ទៅ K8s ពេលត្រូវការ scheduling ច្រើន node, rolling updates, service meshes ជាដើម។

### Init process និង zombies

ប្រើ `tini` ឬ `--init` របស់ Docker ដើម្បីឱ្យ PID 1 ប្រមូល zombie processes និងបញ្ជូន signals៖

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

> **ជំពូកពិសេស៖** ជំពូកនេះបង្ហាញផ្លូវយក app ដែលដាក់ក្នុង container ចេញពី laptop។ CI បង្កើត image រួច registry ទុកវា ហើយ server រត់វា។ សូមបញ្ចប់ជំពូក 11–13 មុន ហើយជំពូក 15–16 បើអាច។

### Lab៖ `labs/12-ci-cd`

Deploy មិនមែនជាពាក្យបញ្ជាតែមួយទេ។ វាជា **pipeline** នៃការសម្រេចចិត្តជាជំហានៗ៖

```
  Code → Build image → Test → Push to registry → Pull on server → Run (Compose) → Observe
```

បើជំហានណាមួយនៅធ្វើដោយដៃ ហើយគ្មានកំណត់ត្រា នោះ deploy នឹងបែកងាយ។ CI/CD យកផ្នែកដែលធ្វើដដែលៗ ទៅធ្វើស្វ័យប្រវត្តិ។

### Deploy ជាមួយ Docker មានន័យដូចម្តេច

| ផ្នែក | ការងារ |
|-------|-----|
| **Image** | វត្ថុដែលមិនប្តូរ (app បូក runtime) សម្គាល់ដោយ tag ឬ digest |
| **Registry** | កន្លែងផ្ទុក និងចែកចាយ images (Docker Hub, GHCR, ECR, …) |
| **Runtime host** | ម៉ាស៊ីនដែលមាន Docker Engine ទាញ image មករត់ |
| **Compose (ឬ orchestrator)** | ប្រកាស services, env, volumes, networks, restart និង health |
| **CI/CD** | Build, test និង push (ហើយជារឿយៗ deploy) ដោយស្វ័យប្រវត្តិរាល់ពេល code ផ្លាស់ |

Docker Compose គ្រប់គ្រាន់សម្រាប់ production លើ **host តែមួយ** (VPS ឬ VM តូច)។ ពេលត្រូវការ scheduling ច្រើន node, rolling update លើ cluster និង autoscaling កាន់តែពេញ អ្នកទៅ Kubernetes (ទិសដៅក្នុងជំពូក 16)។ Image នៅតែ **ដដែល**។

### Environments (បរិយាកាស)៖ image ដូចគ្នា config ផ្សេង

អនុវត្តទម្លាប់ 12-factor ពីជំពូក 10៖

| Environment | ប្រភព config ធម្មតា | Image |
|-------------|--------------------------|-------|
| Local / lab | `.env`, bind mounts, `compose.override.yaml` | Build លើម៉ាស៊ីនអ្នក |
| Staging | secrets លើ host ឬ variables ក្នុង CI | Image ដូច prod (ឬ release candidate) |
| Production | env លើ host ឬ secret manager; មិន bind-mount source | **តែ** images ពី registry |

ច្បាប់ទាំងនេះការពារកុំឱ្យ deploy ភាគច្រើនខូច៖

1. **Build ម្ដង រួចយក digest ដូចគ្នាឡើង** (ឬ git SHA tag ដូចគ្នា) ពី staging ទៅ prod។
2. **កុំដុត secrets ចូលក្នុង image។**
3. ចូលចិត្ត **`IMAGE:git-sha`** (ឬ semver) ជាងពឹង `latest`។
4. ទុក **Compose សម្រាប់ prod** ឱ្យ pull images (`image:`) កុំ build លើ server (`build:`) នៅពេលអាច។

### Compose សម្រាប់ production

Lab 12 បែងចែកឯកសារពីរយ៉ាង៖

**`compose.yaml`** — សម្រាប់ local និង smoke ក្នុង CI (អាចមាន `build:`)

```yaml
services:
  api:
    build: .
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: production
      PORT: "3000"
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 3s
      retries: 3
```

**`compose.prod.yaml`** — សម្រាប់ server (pull តែប៉ុណ្ណោះ)

```yaml
services:
  api:
    # IMAGE_REF is ":sha-…" (tag) or "@sha256:…" (digest)
    image: ghcr.io/YOUR_USER/rean-deploy-api${IMAGE_REF:?set IMAGE_REF to :sha-… or @sha256:…}
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
    cap_drop: ["ALL"]
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
export IMAGE_REF=:sha-abc1234   # or :1.2.3 — or @sha256:… for a digest pin
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
docker compose -f compose.prod.yaml ps
```

ពិនិត្យឯកសារបានគ្រប់ទីកន្លែង (laptop ឬ CI)៖

```bash
docker compose -f compose.yaml config
IMAGE_REF=:sha-deadbee docker compose -f compose.prod.yaml config
```

`compose.prod.yaml` បដិសេធ interpolate បើ `IMAGE_REF` ខ្វះ។ នេះចេតនា។ Prod ត្រូវ pin SHA tag ឬ digest (`:sha-…` / `@sha256:…`) មិនមែន `:latest`។

### ទម្លាប់ Registry (build → tag → push → pull)

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

**គន្លឹះ GHCR៖** ក្នុង GitHub Actions `GITHUB_TOKEN` push ទៅ `ghcr.io/<owner>/<image>` បាន ពេល workflow មានសិទ្ធិ `packages: write`។ ការកំណត់ package ជា public ឬ private ស្ថិតនៅ GitHub → Packages។

### រៀបចំ server (checklist VPS តែមួយ)

ធ្វើម្ដងក្នុងមួយ host៖

1. ដំឡើង Docker Engine និង Compose plugin (ផ្លូវ Linux ក្នុងជំពូក 4)។
2. បង្កើត user deploy ដែលមិនមែន root រួចបន្ថែមទៅក្រុម `docker` (ឬប្រើ rootless នៅពេលក្រោយ)។
3. រឹត SSH៖ ប្រើ key តែប៉ុណ្ណោះ កុំឱ្យ login ដោយ password។
4. Clone ឬ copy **តែ** ឯកសារ deploy (`compose.prod.yaml`, `.env` និង config reverse-proxy បើមាន)។ មិនចាំបាច់យក source របស់ app ទាំងមូល។
5. បង្កើត `.env` លើ server។ កុំ commit តម្លៃពិត។
6. ណែនាំ៖ ដាក់ **Caddy** ឬ **Nginx** ជា reverse proxy សម្រាប់ TLS (`https://your.domain` → `127.0.0.1:3000`)។

ផ្លូវខ្លីរបស់ TLS៖

```
Internet → :443 (Caddy/Nginx) → localhost:3000 (your container published port)
```

អ្នកអាចផ្សាយ app តែនៅ `127.0.0.1:3000` ដើម្បីកុំឱ្យវាបើកចំហទៅអ៊ីនធឺណិត៖

```yaml
ports:
  - "127.0.0.1:3000:3000"
```

### Reverse proxy (ហេតុអ្វីនៅជាប់ Docker)

Container ពូកែរត់ app។ Reverse proxy ទទួលផ្នែកទាំងនេះ៖

- វិញ្ញាបនបត្រ HTTPS (Let's Encrypt)
- Hostname ច្រើនលើម៉ាស៊ីនតែមួយ
- កត់ត្រា request និងកំណត់ rate limit មូលដ្ឋាន
- លាក់ port ខាងក្នុង

អ្នក **មិន** ត្រូវការ Kubernetes សម្រាប់ API មួយបូក Postgres លើ VPS តែមួយទេ។ Compose ជាមួយ proxy គឺ setup production ធម្មតា និងស្មោះត្រង់។

**អនុវត្ត៖** Lab 12 §5 មាន `compose.proxy.yaml` និង `Caddyfile`។ នោះជា demo HTTP លើម៉ាស៊ីនផ្ទាល់ តាមផ្លូវដូចគ្នា (`http://127.0.0.1:8080` → Caddy → `api:3000`)។ TLS ពិតនៅត្រូវការ DNS name។ Comment ក្នុង Caddyfile បង្ហាញរូបរាង production។

### Release ដោយគ្មានរឿងរ៉ាវ

| ទម្លាប់ | ហេតុអ្វី |
|----------|-----|
| Healthcheck និង `restart: unless-stopped` | Container ដែលខូច ឬ unhealthy ងើបឡើងវិញ ឬនៅសម្គាល់ថា unhealthy |
| `docker compose up -d` ក្រោយ `pull` | បង្កើតឡើងវិញតែ service ដែលផ្លាស់ |
| កត់ tag ឬ digest មុន | Rollback ភ្លាមៗ៖ ដាក់ `IMAGE_REF` ទៅ `:sha-…` ឬ `@sha256:…` ល្អចុងក្រោយ រួច `up -d` ម្ដងទៀត |
| Volume របស់ database | Named volume នៅរស់បន្ទាប់ពីបង្កើត container ឡើងវិញ (ជំពូក 8) |
| Migration | ធ្វើជាជំហានច្បាស់ (`compose run` ម្ដង) មុន ឬក្រោយប្តូរ API។ សរសេរលំដាប់នោះទុក |

គំនូស rollback៖

```bash
export IMAGE_REF=:sha-OLDGOOD
docker compose -f compose.prod.yaml pull api
docker compose -f compose.prod.yaml up -d api
```

### CI/CD៖ ជំហាននីមួយៗធ្វើអ្វី

គិតជា stage មិនមែន «script យក្សមួយ»៖

| Stage | ការពិនិត្យធម្មតា | បរាជ័យមានន័យថា |
|-------|----------------|---------------|
| **Validate** | `docker compose config` និងមាន Dockerfile | YAML ខុស ឬ layout គម្រោងខូច |
| **Test** | Unit test (លើ host ឬក្នុង build stage) | Logic របស់ app ខូច |
| **Build** | `docker build` (BuildKit) | Image មិន build |
| **Smoke** | `compose up` រួច `curl /health` ក្នុង CI | Container ចាប់ផ្ដើម តែ app ស្លាប់ |
| **Push** | `docker push` image ដែលមាន tag | Artifact មិនបានផ្សាយ |
| **Deploy** | SSH, API ឬ platform ធ្វើ «pull + up» | Host runtime មិនបាន update |

**Continuous Integration (CI)** គឺ validate, test, build និង smoke រាល់ PR ឬ push។

**Continuous Delivery/Deployment (CD)** គឺយក image ដែល build រួចទៅ environment ដោយស្វ័យប្រវត្តិ ឬដោយចុចម្ដង។

ចាប់ផ្ដើមដោយ CI ដែល **build ហើយ push**។ បន្ថែម deploy ស្វ័យប្រវត្តិទៅ staging ពេលផ្នែកនោះស្ថិរ។ ទុក deploy production ឱ្យមានច្រក (យល់ព្រមដោយដៃ) រហូតទាល់តែទុកចិត្ត pipeline។

### GitHub Actions — គំរូពេញ

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
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0

      - name: Validate Compose files
        working-directory: labs/12-ci-cd
        run: |
          docker compose -f compose.yaml config >/dev/null
          REGISTRY_OWNER=example IMAGE_REF=:sha-deadbee \
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
        uses: docker/login-action@c94ce9fb468520275223c153574b00df6fe4bcc9 # v3.7.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Push image
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: docker push "$IMAGE:$TAG"
```

កំណត់ចំណាំ៖

- **PR build និង smoke** តែមិន push ដើម្បីឱ្យ registry នៅស្អាត។
- **Push លើ `main`** ផ្សាយ **SHA tag** (`sha-abc1234`) មិនមែន `:latest`។ ឈ្មោះ `latest` ផ្លាស់ទី ហើយ rollback មិនបាន។
- ប្តូរឈ្មោះ image និង working directory ពេលភ្ជាប់ទៅ app ផ្ទាល់ខ្លួន។
- សម្រាប់ deploy key ឯកជន ឬជំហាន SSH deploy សូមទុក secrets ក្នុង GitHub → Settings → Secrets (`SSH_HOST`, `SSH_KEY`, …)។ កុំដាក់ក្នុង repo។

### CD ស្រេចចិត្ត៖ deploy តាម SSH ក្រោយ push

បន្ទាប់ពី job push ជោគជ័យ (workflow ដូចគ្នា ឬ job `deploy` ទីពីរ)៖

```yaml
      - name: Deploy over SSH
        uses: appleboy/ssh-action@823bd89e131d8d508129f9443cad5855e9ba96f0 # v1.2.4
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/rean-deploy
            export IMAGE_REF=:sha-$(echo ${{ github.sha }} | cut -c1-7)
            docker compose -f compose.prod.yaml pull
            docker compose -f compose.prod.yaml up -d
```

ឱ្យ script deploy **idempotent**៖ រត់ពីរដងនៅតែទុកប្រព័ន្ធឱ្យសុខភាពល្អ។

### Secrets និង supply chain ក្នុង CI

1. ប្រើ **masked secrets** របស់ GitHub ឬ GitLab សម្រាប់ពាក្យសម្ងាត់ registry, SSH key និង API token។
2. ចូលចិត្ត `GITHUB_TOKEN` ឬតួនាទី cloud តាម OIDC ជាង PAT រយៈពេលវែង នៅពេល platform គាំទ្រ។
3. Pin Action ភាគីទីបីទៅ **commit SHA ពេញ** (`owner/action@<40-hex>`) មិនមែន tag ដែលផ្លាស់ទីដូច `@v4`។ Tag អាច force-push បាន។ SHA មិនបាន។ Workflow ក្នុង repo នេះ និង template របស់ Lab 12 ធ្វើបែបនោះ។ Comment `# v4.4.0` គ្រាន់ជាស្លាកសម្រាប់មនុស្ស (Dependabot នៅតែ bump បាន)។
4. ស្កេន image ក្នុង CI (`docker scout`, Trivy, Grype) រួចឱ្យ fail លើ CVE កម្រិត critical ពេលអ្នកត្រៀមរបារនោះ (ជំពូក 15)។
5. ចាត់ Docker socket ក្នុង CI runner ថាជា infrastructure ដែលទុកចិត្ត។ កុំបើកឱ្យ code ពី PR របស់ fork ដែលមិនទុកចិត្ត ដោយគ្មាន isolation។

### មើលប្រព័ន្ធក្រោយ deploy

ភ្នែក production អប្បបរមា៖

```bash
docker compose -f compose.prod.yaml ps
docker compose -f compose.prod.yaml logs -f --tail=200 api
curl -fsS https://your.domain/health
```

បន្ទាប់ទៅដឹក logs និងពិនិត្យ uptime។ CI ពណ៌បៃតងមិនជំនួស `/health` ពិតពី URL សាធារណៈទេ។

### Checklist ពីដើមដល់ចប់ (រក្សាទុក)

- [ ] App មាន `/health` ពិត (ឬសមភាគី) ដែល Compose **និង** smoke test ក្នុង CI ប្រើ
- [ ] `compose.prod.yaml` ប្រើ `image:` និង `IMAGE_REF` (`:sha-…` ឬ `@sha256:…`) គ្មាន build ពីចម្ងាយដោយចៃដន្យ
- [ ] `.env.example` រាយអថេរគ្រប់គ្រាន់។ `.env` ពិតត្រូវ gitignore
- [ ] CI validate Compose, build, smoke រួច push លើ main
- [ ] Server មាន Docker Engine, ឯកសារ deploy និង secrets តែលើ host
- [ ] អ្នកដឹង tag សម្រាប់ rollback ពី deploy ល្អចុងក្រោយ
- [ ] TLS ចប់នៅ reverse proxy (ឬគែមរបស់ platform) មិនមែនជាការគិតក្រោយ
- [ ] អ្នកអាចពន្យល់ build → registry → pull → up ដោយមិនមើលកំណត់ចំណាំ

### របៀបដែលជំពូកនេះភ្ជាប់

| ជំពូកមុន | អ្វីដែលអ្នកប្រើឡើងវិញ |
|-----------------|---------------------|
| 7 / 12 | Dockerfile និង multi-stage សម្រាប់ build ក្នុង CI |
| 10 | Env និង secrets — secrets ក្នុង CI បូក `.env` លើ server |
| 11 | Compose ជាឯកតាដែលអ្នក deploy |
| 13 / 15 | Healthcheck, user មិនមែន root, limit និងការស្កេន |
| 16 | BuildKit, registry, multi-arch, Compose Watch, SBOM និងការចុះហត្ថលេខា |

បន្ទាប់៖ **Lab 12** ឱ្យអ្នករត់ជំហាន CI លើម៉ាស៊ីនផ្ទាល់ រួច push បើចង់។ ក្រោយនោះ **Capstone (ជំពូក 18)** អាចបន្ថែម CI workflow ពិត។ អ្នកស្គាល់រូបរាងហើយ។

---

## 18. គម្រោង capstone

### Lab៖ `labs/13-capstone`

បង្កើត stack តូចក្នុង repo នេះ។ **Day-one runnable baseline** (Compose + Node API) មានរួចក្នុងថត capstone ដើម្បី `up` ភ្លាម — រួច **own** វា (`CAPSTONE_OWN` ក្នុង Lab 13)៖ បន្ថែម routes, កែ Compose/Dockerfile ឬបន្ថែម proxy។ ចូលចិត្តកែថតនោះជាងទុក Lab 05 ដដែល (ឬចាប់ផ្ដើមស្អាតពី `labs/05-compose` បើចង់)។

Baseline `compose.yaml` ទន់ជាង Lab 09 / `compose.prod.yaml` ដោយចេតនា។ ឈប់បន្ទាប់ពី `/health` បៃតងលើ soft stack មិនមែន Capstone — own ផលិតផល **និង** validate (ឬយក) ទម្លាប់ prod Compose។

**គោលដៅ:** Web API + Postgres + Redis ដែលមិត្តរួមការដឹងថាជារបស់អ្នក

តម្រូវការ៖

1. `Dockerfile` សម្រាប់ API (multi-stage បើអ្នក compile/build)។
2. `compose.yaml` មាន `api`, `db`, `redis`។
3. Named volumes សម្រាប់ Postgres។
4. `.env.example` រាយ variables ដែលត្រូវការ (គ្មាន secrets ពិត)។
5. Healthchecks លើ API និង Postgres។
6. API ភ្ជាប់តាម hostname `db` និង `redis`។
7. ផ្នែក `README`: របៀប `up`, migrate (បើមាន) និង `down`។
8. ការផ្លាស់ប្តូរ ownership យ៉ាងហោចពីរពីបញ្ជី `CAPSTONE_OWN` ក្នុង Lab 13 (កត់ក្នុង lab README)។
9. Validate `compose.prod.yaml` ដោយកំណត់ `IMAGE_REF` ឬយក hardening យ៉ាងហោចមួយពីវាដាក់ចូល stack ដែលអ្នកផ្ញើ។

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
docker compose --profile tools up -d
docker compose watch
docker compose down

# Supply chain (orientation)
docker buildx imagetools inspect IMAGE
# cosign verify IMAGE@sha256:...

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
- [ ] Compose Watch, SBOM peek, ឬ multi-arch inspect (`labs/14-advanced` / ជំពូក 16)
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
| 6 | Debug, សុវត្ថិភាព, ជំពូក 16 | `labs/10-debugging`, `labs/11-security`, `labs/14-advanced` |
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
5. ប្រើរង្វិលជុំ Compose Watch របស់ Lab 14 ប្រចាំថ្ងៃ រួចមើល Dev Containers។
6. រឹត CD: ស្កេន image ក្នុង CI, ការយល់ព្រម prod ដោយដៃ, រួច Kubernetes ច្រើន node (Pods, Deployments, Services)។

---

*បង្កើតសម្រាប់គម្រោងរៀន `rean-docker`។ ធ្វើតាមជំពូក; ចូលចិត្តការយល់ដឹងជាងការប្រញាប់ពាក្យបញ្ជា។*
