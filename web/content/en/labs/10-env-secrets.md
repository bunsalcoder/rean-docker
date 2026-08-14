# Lab 10 — Environment, secrets, and config

## Goal

Pass config at **runtime**, and see why a password must never be `ENV` in a Dockerfile.

Pair with handbook **Chapter 10**. Best done after Lab 03 (you already write Dockerfiles) and before Lab 04 (Compose will keep using env files).

## Steps

### 1. Runtime env (the good path)

```bash
cd labs/10-env-secrets

cp .env.example .env
# edit .env if you want — this file is gitignored

docker run --rm --env-file .env alpine:3.20 \
  sh -c 'printenv GREETING; printenv DB_PASSWORD'
```

You should see the values from `.env`. They live on the host, not in an image layer.

### 2. Compose `env_file`

```bash
docker compose run --rm demo
docker compose down
```

Same values, injected when the container starts.

### 3. Baked-in secret (the bad path)

```bash
docker build -t rean-leaky:lab10 -f Dockerfile.leaky .
docker run --rm rean-leaky:lab10
docker history rean-leaky:lab10
```

`docker history` still shows `ENV DB_PASSWORD=super-secret-do-not-copy`. Anyone with the image can read it. Deleting the line later does **not** erase older layers.

Cleanup:

```bash
docker rmi rean-leaky:lab10
```

## Discuss

- Why is `ENV NODE_ENV=production` fine, but `ENV DB_PASSWORD=...` is not?
- Where should production passwords live (host `.env`, Docker secrets, a vault) vs the image?
- What happens if you commit `.env` by accident?

## Success criteria

- [ ] `--env-file` and Compose both printed the `.env` values
- [ ] `docker history` on the leaky image showed the baked password
- [ ] You can explain “same image, different env per environment”
