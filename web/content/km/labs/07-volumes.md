# Lab 07 — Volumes

## គោលដៅ

បង្ហាញថា named volumes រក្សាទិន្នន័យបន្ទាប់ពី container ត្រូវបានលុប។

## ជំហាន

```bash
docker volume create lab07-pgdata

docker run -d --name lab07-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab07-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait until Postgres is ready (do not guess with sleep)
until docker exec lab07-pg pg_isready -U postgres; do sleep 1; done

docker exec lab07-pg \
  psql -U postgres -c "CREATE TABLE demo(id int); INSERT INTO demo VALUES (1);"

docker exec lab07-pg psql -U postgres -c "SELECT * FROM demo;"

# Destroy the container (NOT the volume)
docker rm -f lab07-pg

# New container, SAME volume
docker run -d --name lab07-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab07-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

until docker exec lab07-pg pg_isready -U postgres; do sleep 1; done
docker exec lab07-pg psql -U postgres -c "SELECT * FROM demo;"
# → row with id=1 still there

# Cleanup
docker rm -f lab07-pg
docker volume rm lab07-pgdata
```

## ប្រៀបធៀប bind mount

នៅ Windows គ្មាន WSL សូមប្រើថតក្នុង repo នេះជំនួស `/tmp`។

```bash
mkdir -p /tmp/lab07-bind
echo "hello" > /tmp/lab07-bind/note.txt
docker run --rm -v /tmp/lab07-bind:/data alpine:3.22 cat /data/note.txt
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] ទិន្នន័យនៅរស់បន្ទាប់ពីបង្កើត container ឡើងវិញ
- [ ] អ្នកដឹងពេលណាប្រើ volume vs bind mount

## បន្ទាប់

ទៅ **Lab 08 — Multi-stage builds** ហើយប្រៀបធៀប image ធំជាមួយ runtime image ស្ដើង។
