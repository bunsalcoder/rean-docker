# Lab 01 — មូលដ្ឋាន isolation

## កម្រិទ

**ថ្នាក់ចាប់ផ្តើម។** អ្នកត្រូវការតែ `docker run`, `docker exec`, និង `docker rm`។  
អ្នក **មិន** ត្រូវការយល់ដឹងជ្រៅអំពី kernel internals, OCI, ឬ Kubernetes។

## គោះល៊ែម

មើលដោយភ្នែកផ្ទាល់ថា container មួយ **ដាច់ដោយឡែក** ពី host និងពី container ផ្សេងទៀត៖

- processes
- files
- network ports
- memory limits

អាន **Chapter 2** សម្រាប់ "ហេតុអ្វី"។ Lab នេះគ្រាន់តែជាការអនុវត្ត **មានអារម្មណ៍**។

## រោបៀបមិន្នេះ lab នេះស្របម្បប់ជាម្យូវ៉ផ្លូវ

| Lab | អ្វីដែលអ្នករៀន |
|-----|----------------|
| **01 (lab នេះ)** | រូបរាង isolation |
| **02 Hello containers** | Workflow ប្រចាំថ្ងៃ៖ run, ports, logs, clean up |
| **03+** | Build images, Compose, volumes, production |

ធ្វើ **01 → 02** តាមលំដាប់។ ការស្ទួនគ្នាគឺចេតនា៖ ពាក្យបញ្ជាងាយៗដូចគ្នា ប៉ុន្តែផ្តោតផ្សេងគ្នា។

## ស្រំរាប់ការមុន

Docker បានដំឡើង និងដំណើរការបាន (Chapter 4)៖

```bash
docker --version
docker run --rm hello-world
```

## ជំហាន

### 1. Process isolation

នៅក្នុង container អ្នកឃើញតែ processes *របស់វា* — មិនមែន apps របស់ host។

```bash
docker run -d --name lab01-ps alpine:3.20 sleep 3600

# Small list inside (sleep is usually PID 1)
docker exec lab01-ps ps aux

# Much larger list on the host
ps aux | head

docker rm -f lab01-ps
```

### 2. Filesystem isolation

Files ដែលបង្កើតក្នុង container នៅក្នុង container នោះ លុះត្រាតែអ្នកចែករំលែក folder ដោយប្រព័ន្ធនោះ។

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

Container នីមួយៗអាចប្រើ "port 80" នៅខាងក្នុង។ នៅ host អ្នក publish ports ផ្សេងគ្នា។

```bash
docker run -d --name lab01-web-a -p 18080:80 nginx:alpine
docker run -d --name lab01-web-b -p 18081:80 nginx:alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f lab01-web-a lab01-web-b
```

### 4. Memory limits

Docker អាចកំណត់ចំនួន RAM ដែល container មួយអាចប្រើបាន។

```bash
docker run -d --name lab01-limited -m 256m alpine:3.20 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' lab01-limited
# → 268435456 (bytes = 256 MiB)

docker rm -f lab01-limited
```

### 5. Image មួយរោះ, containers ច្រេន់

Image ដូចគ្នា → containers ដាច់ដោយឡែកច្រើន (នេះហេតុអ្វី containers មានប្រសិទ្ធភាព)។

```bash
docker pull redis:7-alpine
docker run -d --name lab01-r1 redis:7-alpine
docker run -d --name lab01-r2 redis:7-alpine
docker run -d --name lab01-r3 redis:7-alpine

docker ps --filter name=lab01-r
docker rm -f lab01-r1 lab01-r2 lab01-r3
```

## អ្វីដំលែរានែរយកំរាយ

| Demo | គំនិតសាមញ្ញ |
|------|-------------|
| `ps` ក្នុង vs host | Container មិនឃើញ processes របស់ host |
| `/tmp/note.txt` | Container មាន filesystem ផ្ទាល់ខ្លួន |
| nginx អ្នៃនៅ port 80 | នីមួយៗមាន network ផ្ទាល់; host map ports |
| `-m 256m` | អ្នកអាចកំណត់ដែនកំណត់ resources |
| Redis បូន | Image មួយ, instances ដាច់ដោយឡែកច្រើន |

*(ឈ្មោះជម្រើសសម្រាប់ពេលក្រោយ៖ namespaces, cgroups, layers — Chapter 2។ រំលងពួកវាឥឡូវនេះបើវាធ្វើអោយធ្ងន់។)*

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] Process list ខ្លីនៅក្នុង container; list វែងនៅ host
- [ ] Bind mount បង្ហាញការចែករំលែក; ដោយគ្មាន mount files នៅតែដាច់ដោយឡែក
- [ ] URL nginx ទាំងពីរបាន HTTP 200
- [ ] Inspect បង្ហាញ memory limit 256 MiB
- [ ] Redis containers បីដំណើរការ រួចអ្នកសម្អាតវាចោល

## បន្ទាប់

ទៅ **Lab 02 — Hello containers** សម្រាប់ workflow `run` / logs / clean-up ប្រចាំថ្ងៃ។
