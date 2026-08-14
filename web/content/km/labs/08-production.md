# Lab 08 — Container តាមទម្លាប់ production

## គោលដៅ

Run API ជាមួយ healthchecks, `init`, restart policy, read-only rootfs, log rotation និង resource limits។

## ជំហាន

```bash
cd labs/08-production

docker compose up --build -d
docker compose ps
# STATUS should become healthy

curl http://localhost:3000/health
docker inspect --format='{{json .State.Health}}' "$(docker compose ps -q api)" | jq .

docker compose down
```

## ពិភាក្សា

- ហេតុអ្វី `read_only: true` + `tmpfs: /tmp`?
- ហេតុអ្វី `no-new-privileges`?
- ហេតុអ្វី `init: true` (PID 1 / `docker stop` / SIGTERM)?
- ហេតុអ្វី pin `image: rean-prod-api:1.0` បន្ទាប់ពី build ហើយ `FROM node:22-alpine` មិនមែន `node:latest`?
- ហេតុអ្វី healthcheck ប្រើ `node` + `fetch` មិនមែន `wget` ឬ `curl`?

## លក្ខខណ្ឌជោគជ័យ

- [ ] Container រាយការណ៍ healthy
- [ ] អ្នកអាចរាយ practices production យ៉ាងហោចណាស់ 5 ពីជំពូក 13 ក្នុងមគ្គុទ្ទេសក៍
