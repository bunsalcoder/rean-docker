# Lab 05 — Networks

## គោះល៊ែម

មើល Docker DNS៖ containers ទាក់ទងគ្នាដោយ **name** នៅ user-defined network។

## ជំហាន

```bash
docker network create lab05-net

docker run -d --name lab05-redis --network lab05-net redis:7-alpine

# Ping Redis by hostname "lab05-redis"
docker run --rm --network lab05-net redis:7-alpine \
  redis-cli -h lab05-redis ping

# This should FAIL (different/default network, name not resolved)
docker run --rm redis:7-alpine redis-cli -h lab05-redis ping || true

# Cleanup
docker rm -f lab05-redis
docker network rm lab05-net
```

## ការសាកល្បង

ភ្ជាប់ alias ទីពីរ៖

```bash
docker network create lab05-net
docker run -d --name lab05-redis --network lab05-net --network-alias cache redis:7-alpine
docker run --rm --network lab05-net redis:7-alpine redis-cli -h cache ping
docker rm -f lab05-redis && docker network rm lab05-net
```

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] `PONG` នៅពេលនៅ network ដូចគ្នា
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី host `localhost` ខុសសម្រាប់ sibling containers
