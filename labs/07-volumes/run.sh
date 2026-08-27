#!/usr/bin/env bash
# Optional helper for Lab 07 — named volume survives container recreate.
set -euo pipefail

cleanup() {
  docker rm -f lab07-pg >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== create volume + first Postgres =="
docker volume create lab07-pgdata >/dev/null
docker rm -f lab07-pg >/dev/null 2>&1 || true
docker run -d --name lab07-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab07-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine >/dev/null

until docker exec lab07-pg pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec lab07-pg psql -U postgres -c "DROP TABLE IF EXISTS demo; CREATE TABLE demo(id int); INSERT INTO demo VALUES (1);" >/dev/null
docker exec lab07-pg psql -U postgres -c "SELECT * FROM demo;"

echo "== recreate container, same volume =="
docker rm -f lab07-pg >/dev/null
docker run -d --name lab07-pg \
  -e POSTGRES_PASSWORD=secret \
  -v lab07-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine >/dev/null
until docker exec lab07-pg pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
out="$(docker exec lab07-pg psql -U postgres -tAc 'SELECT id FROM demo')"
echo "demo.id=${out}"
[[ "${out}" == "1" ]]

docker rm -f lab07-pg >/dev/null
docker volume rm lab07-pgdata >/dev/null

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIND="${ROOT}/.bind"
mkdir -p "${BIND}"
echo "hello" > "${BIND}/note.txt"
echo "== bind mount contrast =="
docker run --rm -v "${BIND}:/data" alpine:3.22 cat /data/note.txt

echo "Lab 07 helper OK."
echo "Optional Compose form: docker compose up -d && docker compose exec db … (see README)."
