# Lab 06 — Volumes

## Goal

Prove that named volumes keep data after a container is deleted.

## Steps

```bash
docker volume create lab06-pgdata

docker run -d --name lab06-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab06-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

# Wait a few seconds for Postgres to boot, then create a table
docker exec -it lab06-pg \
  psql -U postgres -c "CREATE TABLE demo(id int); INSERT INTO demo VALUES (1);"

docker exec -it lab06-pg psql -U postgres -c "SELECT * FROM demo;"

# Destroy the container (NOT the volume)
docker rm -f lab06-pg

# New container, SAME volume
docker run -d --name lab06-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab06-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine

sleep 3
docker exec -it lab06-pg psql -U postgres -c "SELECT * FROM demo;"
# → row with id=1 still there

# Cleanup
docker rm -f lab06-pg
docker volume rm lab06-pgdata
```

## Bind mount contrast

```bash
mkdir -p /tmp/lab06-bind
echo "hello" > /tmp/lab06-bind/note.txt
docker run --rm -v /tmp/lab06-bind:/data alpine cat /data/note.txt
```

## Success criteria

- [ ] Data survived container recreation
- [ ] You know when to use a volume vs a bind mount
