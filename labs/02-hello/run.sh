#!/usr/bin/env bash
# Optional helper for Lab 02 — non-interactive workflow checks.
# Still do the interactive `ubuntu` + `docker exec -it` steps from the README once by hand.
set -euo pipefail

cleanup() {
  docker rm -f lab02-nginx >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== 1. Hello World =="
docker run --rm hello-world

echo "== 2. Nginx in the background =="
docker run -d --name lab02-nginx -p 8080:80 nginx:1.28-alpine >/dev/null
for _ in 1 2 3 4 5 6 7 8 9 10; do
  code="$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ || true)"
  [[ "${code}" == "200" ]] && break
  sleep 1
done
echo "HTTP ${code}"
[[ "${code}" == "200" ]]
docker logs lab02-nginx >/dev/null
docker exec lab02-nginx ls /usr/share/nginx/html >/dev/null
docker stop lab02-nginx >/dev/null
docker rm lab02-nginx >/dev/null

echo "Lab 02 helper OK (run the interactive Ubuntu + exec -it steps from the README yourself)."
