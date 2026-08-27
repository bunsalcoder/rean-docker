# Lab 01 — មូលដ្ឋាន isolation

## កម្រិត

**ថ្នាក់ដើម។** អ្នកត្រូវការតែ `docker run`, `docker exec` និង `docker rm`។  
អ្នក **មិន** ត្រូវស្ទាត់ kernel internals, OCI ឬ Kubernetes ទេ។

## គោលដៅ

មើលដោយភ្នែកផ្ទាល់ថា container មួយ **ដាច់ដោយឡែក** ពី host និងពី container ផ្សេង៖

- processes
- files
- network ports
- memory limits

អាន **ជំពូក 2** សម្រាប់ «ហេតុអ្វី»។ Lab នេះគឺការអនុវត្តឱ្យ **មានអារម្មណ៍** តែប៉ុណ្ណោះ។

## របៀបដែល lab នេះសមនឹងផ្លូវរៀន

| Lab | អ្វីដែលអ្នករៀន |
|-----|----------------|
| **01 (lab នេះ)** | isolation មើលទៅដូចម្ដេច |
| **02 Hello containers** | workflow ប្រចាំថ្ងៃ៖ run, ports, logs, clean up |
| **03+** | Build images, env, Compose, volumes, production |

ធ្វើ **01 → 02** តាមលំដាប់។ ការស្ទួនគ្នាគឺចេតនា៖ ពាក្យបញ្ជាងាយដូចគ្នា ប៉ុន្តែផ្ដោតផ្សេងគ្នា។

## តម្រូវការមុន

Docker បានដំឡើង និងដំណើរការ (ជំពូក 4)៖

```bash
docker --version
docker run --rm hello-world
```

នៅ Windows ចូលចិត្ត **WSL2** ឬ Git Bash។ ឧទាហរណ៍ bind-mount ប្រើ `/tmp/...`។ បើ path នោះពិបាកលើ OS របស់អ្នក សូមបង្កើតថតក្នុង repo នេះហើយប្រើថតនោះជំនួស។

## ជំហាន

**Optional helper:** បន្ទាប់ពីយល់គំនិត រត់ `./run.sh` ក្នុងថតនេះ (bind mount ប្រើ `.share/` ជំនួស `/tmp`)។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

### 1. Process isolation

ក្នុង container អ្នកឃើញតែ processes *របស់វា* — មិនមែន apps លើ host។

```bash
docker run -d --name lab01-ps alpine:3.22 sleep 3600

# Small list inside (sleep is usually PID 1)
docker exec lab01-ps ps aux

# Much larger list on the host
ps aux | head

docker rm -f lab01-ps
```

### 2. Filesystem isolation

ឯកសារដែលបង្កើតក្នុង container នៅក្នុង container នោះ លុះត្រាតែអ្នកចែករំលែក folder ដោយចេតនា។

```bash
# This file lives only inside the container (gone when the container exits)
docker run --rm alpine:3.22 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'

# Sharing is opt-in (bind mount) — isolation is the default
mkdir -p /tmp/lab01-share
echo 'from-host' > /tmp/lab01-share/msg.txt
docker run --rm -v /tmp/lab01-share:/data alpine:3.22 cat /data/msg.txt
# → from-host
```

### 3. Network isolation

Container នីមួយអាចប្រើ «port 80» ក្នុងខ្លួន។ លើ host អ្នក publish ports ផ្សេងគ្នា។

```bash
docker run -d --name lab01-web-a -p 18080:80 nginx:1.28-alpine
docker run -d --name lab01-web-b -p 18081:80 nginx:1.28-alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f lab01-web-a lab01-web-b
```

### 4. Memory limits

Docker អាចកំណត់ RAM ដែល container អាចប្រើ។

```bash
docker run -d --name lab01-limited -m 256m alpine:3.22 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' lab01-limited
# → 268435456 (bytes = 256 MiB)

docker rm -f lab01-limited
```

### 5. Image មួយ containers ច្រើន

Image ដូចគ្នា → containers ដាច់ដោយឡែកច្រើន (នេះហើយជាហេតុ containers មានប្រសិទ្ធភាព)។

```bash
docker pull redis:7-alpine
docker run -d --name lab01-r1 redis:7-alpine
docker run -d --name lab01-r2 redis:7-alpine
docker run -d --name lab01-r3 redis:7-alpine

docker ps --filter name=lab01-r
docker rm -f lab01-r1 lab01-r2 lab01-r3
```

## អ្វីដែលគួរយកទៅ

| Demo | គំនិតភាសាសាមញ្ញ |
|------|--------------------|
| `ps` ក្នុង vs host | Container មិនឃើញ host processes |
| `/tmp/note.txt` | Container មាន filesystem ផ្ទាល់ខ្លួន |
| nginx ពីរលើ port 80 | នីមួយមាន network ផ្ទាល់; host map ports |
| `-m 256m` | អ្នកអាចកំណត់ resources |
| Redis បី | Image មួយ instances ដាច់ដោយឡែកច្រើន |

*(ឈ្មោះស្រេចចិត្តសម្រាប់ក្រោយ: namespaces, cgroups, layers — ជំពូក 2។ រំលងពេលនេះបើធ្ងន់។)*

## លក្ខខណ្ឌជោគជ័យ

- [ ] បញ្ជី process ខ្លីក្នុង container; បញ្ជីវែងលើ host
- [ ] Bind mount បង្ហាញការចែករំលែក; គ្មាន mount ឯកសារនៅដាច់ដោយឡែក
- [ ] URL nginx ទាំងពីរត្រឡប់ HTTP 200
- [ ] Inspect បង្ហាញដែនកំណត់ memory 256 MiB
- [ ] Redis containers បីបានរត់ រួចអ្នកសម្អាត

## បន្ទាប់

ទៅ **Lab 02 — Hello containers** សម្រាប់ workflow `run` / logs / clean-up ប្រចាំថ្ងៃ។
