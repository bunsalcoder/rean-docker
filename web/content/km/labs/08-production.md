# Lab 08 — Container ស្រាប់ប៉ប្រូវ production

## គោះល៊ែម

Run API ជាមួយ healthchecks, restart policy, read-only rootfs, និង resource limits។

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

## ពិះភាស្រា

- ហេតុអ្វី `read_only: true` + `tmpfs: /tmp`?
- ហេតុអ្វី `no-new-privileges`?
- ហេតុអ្វី pin `image: rean-prod-api:1.0` បន្ទាប់ពី build?

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] Container រាយ healthy
- [ ] អ្នកអាច list practices production យ៉ាងហោចណាស់ 5 ពី main guide chapter 13
