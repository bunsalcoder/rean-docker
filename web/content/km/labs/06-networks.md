# Lab 06 — Networks

## គោលដៅ

មើល Docker DNS៖ containers ទៅដល់គ្នាតាម **ឈ្មោះ** លើ user-defined network។

## ជំហាន

```bash
docker network create lab06-net

docker run -d --name lab06-redis --network lab06-net redis:7-alpine

# Ping Redis by hostname "lab06-redis"
docker run --rm --network lab06-net redis:7-alpine \
  redis-cli -h lab06-redis ping

# This should FAIL (different/default network, name not resolved)
docker run --rm redis:7-alpine redis-cli -h lab06-redis ping || true

# Cleanup
docker rm -f lab06-redis
docker network rm lab06-net
```

## ការសាកល្បង

ភ្ជាប់ alias ទីពីរ៖

```bash
docker network create lab06-net
docker run -d --name lab06-redis --network lab06-net --network-alias cache redis:7-alpine
docker run --rm --network lab06-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab06-redis && docker network rm lab06-net
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `PONG` ពេលនៅលើ network ដូចគ្នា
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី `localhost` លើ host ខុសសម្រាប់ containers បងប្អូន

## បន្ទាប់

ទៅ **Lab 07 — Volumes** ហើយបង្ហាញថា named volumes នៅរស់បន្ទាប់ពី `docker rm`។
