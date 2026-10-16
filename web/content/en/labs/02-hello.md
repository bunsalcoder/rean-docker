# Lab 02 — Hello containers

## Level

**Beginner.** Everyday Docker workflow.

## Goal

Practice the commands you will use constantly: run a container, publish a port, read logs, `exec` inside, and clean up.

**Already done Lab 01?** Good — that showed *isolation*. This lab is the *daily workflow* (not more theory).

## Steps

**Optional helper:** `./run.sh` covers hello-world + nginx (cleanup included). Still do the interactive Ubuntu and `docker exec -it` steps below by hand.

### 1. Hello World

```bash
docker run --rm hello-world
```

> **Expected output:** A short Hello from Docker message ending with “This message shows that your installation appears to be working correctly.”

### 2. Interactive Ubuntu

```bash
docker run -it --rm ubuntu:24.04 bash
# inside:
cat /etc/os-release
exit
```

### 3. Nginx in the background

```bash
docker run -d --name lab02-nginx -p 8080:80 nginx:1.28-alpine
curl -I http://127.0.0.1:8080
docker logs lab02-nginx
docker exec -it lab02-nginx sh
# inside: ls /usr/share/nginx/html && exit
docker stop lab02-nginx
docker rm lab02-nginx
```

> **Common error:** `Bind for 0.0.0.0:8080 failed: port is already allocated` — another process (or an old `lab02-nginx`) is using 8080. Run `docker rm -f lab02-nginx` and/or pick a free host port (`-p 8081:80`).

## Success criteria

- [ ] You saw the hello-world success message
- [ ] Nginx returned HTTP 200 on port 8080
- [ ] You listed files inside the container with `docker exec`
- [ ] The container is removed (`docker ps -a` shows no `lab02-nginx`)

## Next

Go to **Lab 03 — Your first Dockerfile** and build an image of your own.
