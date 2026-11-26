# Lab 02 — សួស្តី containers

## កម្រិត

**ថ្នាក់ដើម។** នេះជាផ្លូវ Docker ប្រចាំថ្ងៃ។

## គោលដៅ

អនុវត្តពាក្យបញ្ជាដែលអ្នកនឹងប្រើញឹកញាប់៖ រត់ container, ផ្សាយ port, អាន log, `exec` ចូលក្នុង និងសម្អាត។

**ធ្វើ Lab 01 រួចហើយ?** ល្អ។ Lab នោះបង្ហាញ *isolation*។ Lab នេះគឺ *ផ្លូវប្រចាំថ្ងៃ* មិនមែនទ្រឹស្តីបន្ថែមទេ។

## ជំហាន

**ជំនួយស្រេចចិត្ត៖** `./run.sh` គ្រប hello-world និង nginx រួមទាំងការសម្អាត។ នៅតែធ្វើជំហាន Ubuntu ដែលវាយអន្តរកម្ម និង `docker exec -it` ដោយដៃ។

### 1. Hello World (សួស្តី)

```bash
docker run --rm hello-world
```

> **លទ្ធផលដែលរំពឹងទុក:** សារខ្លី Hello from Docker ដែលបញ្ចប់ដោយ “This message shows that your installation appears to be working correctly.”

### 2. Ubuntu បែប interactive

```bash
docker run -it --rm ubuntu:24.04 bash
# inside:
cat /etc/os-release
exit
```

### 3. Nginx ក្នុង background

```bash
docker run -d --name lab02-nginx -p 8080:80 nginx:1.28-alpine
curl -I http://127.0.0.1:8080
docker logs lab02-nginx
docker exec -it lab02-nginx sh
# inside: ls /usr/share/nginx/html && exit
docker stop lab02-nginx
docker rm lab02-nginx
```

> **កំហុសទូទៅ:** `Bind for 0.0.0.0:8080 failed: port is already allocated` មានន័យថា process ផ្សេង ឬ `lab02-nginx` ចាស់ កំពុងប្រើ 8080។ រត់ `docker rm -f lab02-nginx` ឬជ្រើស host port ទំនេរ (`-p 8081:80`)។

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកឃើញសារជោគជ័យរបស់ hello-world
- [ ] Nginx ត្រឡប់ HTTP 200 នៅ port 8080
- [ ] អ្នកមើលបញ្ជី file ក្នុង container ដោយ `docker exec`
- [ ] Container ត្រូវបានលុប។ `docker ps -a` មិនបង្ហាញ `lab02-nginx`

## បន្ទាប់

ទៅ **Lab 03 — Dockerfile ដំបូងរបស់អ្នក** ហើយ build image ផ្ទាល់ខ្លួន។
