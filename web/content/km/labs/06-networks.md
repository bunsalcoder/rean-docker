# Lab 06 — Networks

## កម្រិត

**ថ្នាក់កណ្តាល។** User-defined networks និង DNS បន្ទាប់ពីមូលដ្ឋាន Compose (Lab 05)។

## គោលដៅ

មើល Docker DNS៖ containers ទៅដល់គ្នាតាម **ឈ្មោះ** លើ user-defined network។

## តម្រូវការមុន

- Lab 05 (Compose) រួច — អ្នកបានឃើញ services និយាយតាម hostname
- Docker Engine ដំណើរការ (`docker network ls` បាន)

## ជំហាន

**ជំនួយស្រេចចិត្ត:** `./run.sh`។ **Compose ស្រេចចិត្ត:** `docker compose run --rm client` → `PONG`។

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

> **លទ្ធផលដែលរំពឹងទុក:** `redis-cli` ទីមួយបង្ហាញ `PONG`។ ទីពីរ (គ្មាន `--network lab06-net`) បរាជ័យដោយ name-resolution ឬ connection error។

> **គន្លឹះ:** លើ user-defined network **ឈ្មោះ container** ជា DNS name ដែល siblings ប្រើ — មិនមែន `localhost` លើ host។

## ការសាកល្បង

ភ្ជាប់ alias ទីពីរ៖

```bash
docker network create lab06-net
docker run -d --name lab06-redis --network lab06-net --network-alias cache redis:7-alpine
docker run --rm --network lab06-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab06-redis && docker network rm lab06-net
```

## ពិភាក្សា

- ហេតុអ្វី `redis-cli -h localhost` ពី sibling container បរាជ័យទោះ Redis healthy?
- តើ default bridge និង user-defined network ខុសគ្នាយ៉ាងណាចំពោះ DNS?
- ពេលណាអ្នកបន្ថែម `--network-alias` ជំនួសការប្ដូរឈ្មោះ container?

## លក្ខខណ្ឌជោគជ័យ

- [ ] `PONG` ពេលនៅលើ network ដូចគ្នា
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី `localhost` លើ host ខុសសម្រាប់ containers បងប្អូន

## បន្ទាប់

ទៅ **Lab 07 — Volumes** ហើយបង្ហាញថា named volumes នៅរស់បន្ទាប់ពី `docker rm`។
