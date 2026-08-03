# Lab 02 — Hello containers

## Level

**Beginner.** Everyday Docker workflow.

## Goal

Practice the commands you will use constantly: run a container, publish a port, read logs, `exec` inside, and clean up.

**Already done Lab 01?** Good — that showed *isolation*. This lab is the *daily workflow* (not more theory).

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
docker run -d --name lab02-nginx -p 8080:80 nginx:alpine
curl -I http://localhost:8080
docker logs lab02-nginx
docker exec -it lab02-nginx sh
# inside: ls /usr/share/nginx/html && exit
docker stop lab02-nginx
docker rm lab02-nginx
```

## Success criteria

- [ ] You saw the hello-world success message
- [ ] Nginx returned HTTP 200 on port 8080
- [ ] You listed files inside the container with `docker exec`
- [ ] The container is removed (`docker ps -a` shows no `lab02-nginx`)
