# Lab 02 — Hello containers

## កម្រិទ

**ថ្នាក់ចាប់ផ្តើម។** Workflow Docker ប្រចាំថ្ងៃ។

## គោលដៅ

អនុវត្តពាក្យបញ្ជាដែលអ្នកនឹងប្រើញឹកញាប់៖ run container, publish port, អាន logs, `exec` ចូលក្នុង, និង clean up។

**ធ្លាប់ធ្វើ Lab 01 រួច?** ល្អ — lab នោះបង្ហាញ *isolation*។ Lab នេះគឺ *workflow ប្រចាំថ្ងៃ* (មិនមែនទ្រឹស្តីបន្ថែម)។

## ជំហាន

### 1. Hello World

```bash
docker run --rm hello-world
```

### 2. Ubuntu រោបៀប interactive

```bash
docker run -it --rm ubuntu:24.04 bash
# inside:
cat /etc/os-release
exit
```

### 3. Nginx ក្នុង background

```bash
docker run -d --name lab02-nginx -p 8080:80 nginx:alpine
curl -I http://localhost:8080
docker logs lab02-nginx
docker exec -it lab02-nginx sh
# inside: ls /usr/share/nginx/html && exit
docker stop lab02-nginx
docker rm lab02-nginx
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកឃើញសារជោគជ័យ hello-world
- [ ] Nginx បាន HTTP 200 នៅ port 8080
- [ ] អ្នកបាន list files ក្នុង container ដោយ `docker exec`
- [ ] Container ត្រូវបានលុប (`docker ps -a` មិនបង្ហាញ `lab02-nginx`)
