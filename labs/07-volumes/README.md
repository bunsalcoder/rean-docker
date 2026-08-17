# Lab 07 — Volumes

## Goal

Prove that named volumes keep data after a container is deleted.

## Steps

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

## Bind mount contrast

On Windows without WSL, use a folder inside this repo instead of `/tmp`.

```bash
mkdir -p /tmp/lab07-bind
echo "hello" > /tmp/lab07-bind/note.txt
docker run --rm -v /tmp/lab07-bind:/data alpine:3.22 cat /data/note.txt
```

## Success criteria

- [ ] Data survived container recreation
- [ ] You know when to use a volume vs a bind mount

## Next

Go to **Lab 08 — Multi-stage builds** and compare a fat image with a slim runtime image.
