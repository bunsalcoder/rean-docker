# Lab 01 — Hello Containers

## Goal

Run your first containers, publish a port, inspect logs, and clean up.

## Steps

### 1. Hello World

```bash
docker run --rm hello-world
```

### 2. Interactive Ubuntu

```bash
docker run -it --rm ubuntu:24.04 bash
# inside:
cat /etc/os-release
exit
```

### 3. Nginx in the background

```bash
docker run -d --name lab01-nginx -p 8080:80 nginx:alpine
curl -I http://localhost:8080
docker logs lab01-nginx
docker exec -it lab01-nginx sh
# inside: ls /usr/share/nginx/html && exit
docker stop lab01-nginx
docker rm lab01-nginx
```

## Success criteria

- [ ] You saw the hello-world success message
- [ ] Nginx returned HTTP 200 on port 8080
- [ ] You listed files inside the container with `docker exec`
- [ ] The container is removed (`docker ps -a` shows no `lab01-nginx`)
