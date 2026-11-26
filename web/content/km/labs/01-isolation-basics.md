# Lab 01 — មូលដ្ឋាន isolation

## កម្រិត

**ថ្នាក់ដើម។** អ្នកត្រូវការតែ `docker run`, `docker exec` និង `docker rm`។ អ្នក **មិន** ត្រូវស្ទាត់ kernel internals, OCI ឬ Kubernetes ទេ។

## គោលដៅ

មើលដោយភ្នែកផ្ទាល់ថា container មួយ **ដាច់ដោយឡែក** ពី host និងពី container ផ្សេង៖

- process
- ឯកសារ
- port នៃ network
- ដែនកំណត់ memory

អាន **ជំពូក 2** សម្រាប់ហេតុផល។ Lab នេះគ្រាន់តែឱ្យអ្នក **មានអារម្មណ៍** ពី isolation។

## របៀបដែល lab នេះសមនឹងផ្លូវរៀន

| Lab | អ្វីដែលអ្នករៀន |
|-----|----------------|
| **01 (lab នេះ)** | isolation មើលទៅដូចម្ដេច |
| **02 Hello containers** | ផ្លូវប្រចាំថ្ងៃ៖ run, port, log និងសម្អាត |
| **03+** | Build image, env, Compose, volume និង production |

ធ្វើ **01 ទៅ 02** តាមលំដាប់។ ការស្ទួនគ្នាគឺចេតនា។ ពាក្យបញ្ជាងាយដូចគ្នា តែផ្ដោតផ្សេងគ្នា។

## តម្រូវការមុន

Docker បានដំឡើង និងដំណើរការ (ជំពូក 4)៖

```bash
docker --version
docker run --rm hello-world
```

នៅ Windows ចូលចិត្ត **WSL2** ឬ Git Bash។ ឧទាហរណ៍ bind mount ប្រើ `/tmp/...`។ បើ path នោះពិបាកលើ OS របស់អ្នក សូមបង្កើតថតក្នុង repo នេះ ហើយប្រើថតនោះជំនួស។

## ជំហាន

**ជំនួយស្រេចចិត្ត៖** បន្ទាប់ពីយល់គំនិត រត់ `./run.sh` ក្នុងថតនេះ។ វាចាក់ demo ដែលមិនទាមទារអ្នកវាយបន្ត ហើយ bind mount ប្រើ `.share/` ជំនួស `/tmp`។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

### 1. បំបែក process

ក្នុង container អ្នកឃើញតែ process *របស់វា* មិនមែន app លើ host ទេ។

```bash
docker run -d --name lab01-ps alpine:3.22 sleep 3600

# Small list inside (sleep is usually PID 1)
docker exec lab01-ps ps aux

# Much larger list on the host
ps aux | head

docker rm -f lab01-ps
```

### 2. បំបែក filesystem

ឯកសារដែលបង្កើតក្នុង container នៅក្នុង container នោះ លុះត្រាតែអ្នកចែក folder ដោយចេតនា។

```bash
# This file lives only inside the container (gone when the container exits)
docker run --rm alpine:3.22 sh -c 'echo hello-from-container > /tmp/note.txt; cat /tmp/note.txt; ls /'

# Sharing is opt-in (bind mount) — isolation is the default
mkdir -p /tmp/lab01-share
echo 'from-host' > /tmp/lab01-share/msg.txt
docker run --rm -v /tmp/lab01-share:/data alpine:3.22 cat /data/msg.txt
# → from-host
# On Windows without WSL, use a folder inside this lab (e.g. .share/) instead of /tmp.
```

### 3. បំបែក network

Container នីមួយអាចប្រើ «port 80» ក្នុងខ្លួន។ លើ host អ្នកផ្សាយ port ផ្សេងគ្នា។

```bash
docker run -d --name lab01-web-a -p 18080:80 nginx:1.28-alpine
docker run -d --name lab01-web-b -p 18081:80 nginx:1.28-alpine

curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18080/
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:18081/

docker rm -f lab01-web-a lab01-web-b
```

> **លទ្ធផលដែលរំពឹងទុក:** curl ទាំងពីរបង្ហាញ `200`។

> **អន្ទាក់:** បើផ្សាយ host port ដូចគ្នាពីរដង (ឧទាហរណ៍ `-p 18080:80` លើ container ទាំងពីរ) នឹងបរាជ័យដោយ “port is already allocated.” ក្នុង container នីមួយ port `80` នៅតែដូចគ្នាបាន ព្រោះ isolation តាម network namespace។

### 4. កំណត់ memory

Docker អាចកំណត់ RAM ដែល container ប្រើបាន។

```bash
docker run -d --name lab01-limited -m 256m alpine:3.22 sleep 60
docker inspect -f '{{.HostConfig.Memory}}' lab01-limited
# → 268435456 (bytes = 256 MiB)

docker rm -f lab01-limited
```

### 5. Image មួយ containers ច្រើន

Image ដូចគ្នាអាចរត់ជា container ដាច់ដោយឡែកច្រើន។ នោះហើយជាហេតុដែល container មានប្រសិទ្ធភាព។

```bash
docker pull redis:7-alpine
docker run -d --name lab01-r1 redis:7-alpine
docker run -d --name lab01-r2 redis:7-alpine
docker run -d --name lab01-r3 redis:7-alpine

docker ps --filter name=lab01-r
docker rm -f lab01-r1 lab01-r2 lab01-r3
```

## អ្វីដែលគួរយកទៅ

| Demo | គំនិតសាមញ្ញ |
|------|--------------------|
| `ps` ក្នុង ធៀប host | Container មិនឃើញ process លើ host |
| `/tmp/note.txt` | Container មាន filesystem ផ្ទាល់ខ្លួន |
| nginx ពីរលើ port 80 | នីមួយមាន network ផ្ទាល់។ Host ផ្សាយ port |
| `-m 256m` | អ្នកអាចកំណត់ធនធាន |
| Redis បី | Image មួយ រត់បានច្រើន instance ដាច់ដោយឡែក |

*(ឈ្មោះស្រេចចិត្តសម្រាប់ក្រោយ៖ namespace, cgroup និង layer ក្នុងជំពូក 2។ រំលងពេលនេះបើធ្ងន់។)*

## លក្ខខណ្ឌជោគជ័យ

- [ ] បញ្ជី process ខ្លីក្នុង container និងបញ្ជីវែងលើ host
- [ ] Bind mount បង្ហាញការចែករំលែក។ គ្មាន mount ឯកសារនៅដាច់ដោយឡែក
- [ ] URL nginx ទាំងពីរត្រឡប់ HTTP 200
- [ ] Inspect បង្ហាញដែនកំណត់ memory 256 MiB
- [ ] Redis container បីបានរត់ រួចអ្នកសម្អាត

## បន្ទាប់

ទៅ **Lab 02 — សួស្តី containers** សម្រាប់ផ្លូវប្រចាំថ្ងៃនៃ `run`, log និងការសម្អាត។
