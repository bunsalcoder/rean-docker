# Lab 09 — Container តាមទម្លាប់ production

## គោលដៅ

Run API ជាមួយ healthchecks, `init`, restart policy, read-only rootfs, dropped capabilities, log rotation និង resource limits។ Port ដែល publish ត្រូវ bind តែ localhost។

## ជំហាន

```bash
cd labs/09-production

docker compose up --build -d
docker compose ps
# STATUS should become healthy

curl http://127.0.0.1:3000/health
docker inspect --format='{{json .State.Health}}' "$(docker compose ps -q api)" | python3 -m json.tool

docker compose down
```

## ពិភាក្សា

- ហេតុអ្វី `read_only: true` + `tmpfs: /tmp`?
- ហេតុអ្វី `no-new-privileges`?
- ហេតុអ្វី `cap_drop: ALL`?
- ហេតុអ្វី publish `127.0.0.1:3000` មិនមែន `0.0.0.0:3000`?
- ហេតុអ្វី `init: true` (PID 1 / `docker stop` / SIGTERM)?
- ហេតុអ្វី pin `image: rean-prod-api:1.0` បន្ទាប់ពី build ហើយ `FROM node:22-alpine` មិនមែន `node:latest`?
- ហេតុអ្វី `ENV NODE_ENV=production` នៅក្នុង Dockerfile ផង និងក្នុង Compose ផង?
- ហេតុអ្វី healthcheck ប្រើ `node` + `fetch` មិនមែន `wget` ឬ `curl`?

## លក្ខខណ្ឌជោគជ័យ

- [ ] Container រាយការណ៍ healthy
- [ ] អ្នកអាចរាយ practices production យ៉ាងហោចណាស់ 5 ពីជំពូក 13 ក្នុងមគ្គុទ្ទេសក៍

## បន្ទាប់

ទៅ **Lab 10 — Debug និងដោះស្រាយបញ្ហា** ហើយអនុវត្ត `logs` / `inspect` លើ stack ដែល *ត្រូវ* fail។
