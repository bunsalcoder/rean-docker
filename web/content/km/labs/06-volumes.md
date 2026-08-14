# Lab 06 — Volumes

## គោលដៅ

បង្ហាញថា named volumes រក្សាទិន្នន័យបន្ទាប់ពី container ត្រូវបានលុប។

## ជំហាន

```bash
docker volume create lab06-pgdata

docker run -d --name lab06-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab06-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait until Postgres is ready (do not guess with sleep)
until docker exec lab06-pg pg_isready -U postgres; do sleep 1; done

docker exec lab06-pg \
  psql -U postgres -c "CREATE TABLE demo(id int); INSERT INTO demo VALUES (1);"

docker exec lab06-pg psql -U postgres -c "SELECT * FROM demo;"

# Destroy the container (NOT the volume)
docker rm -f lab06-pg

# New container, SAME volume
docker run -d --name lab06-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab06-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

until docker exec lab06-pg pg_isready -U postgres; do sleep 1; done
docker exec lab06-pg psql -U postgres -c "SELECT * FROM demo;"
# → row with id=1 still there

# Cleanup
docker rm -f lab06-pg
docker volume rm lab06-pgdata
```

## ប្រៀបធៀប bind mount

```bash
mkdir -p /tmp/lab06-bind
echo "hello" > /tmp/lab06-bind/note.txt
docker run --rm -v /tmp/lab06-bind:/data alpine cat /data/note.txt
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] ទិន្នន័យនៅរស់បន្ទាប់ពីបង្កើត container ឡើងវិញ
- [ ] អ្នកដឹងពេលណាប្រើ volume vs bind mount
