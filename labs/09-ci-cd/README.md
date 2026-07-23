# Lab 09 — Deploy path & CI/CD (special)

## Goal

Practice the same steps a CI pipeline runs: validate Compose, build an image, smoke-test `/health`, tag for a registry, and understand how `compose.prod.yaml` pulls that image on a server.

Pair with handbook **Chapter 17 — Deploy with Docker & CI/CD**.

## Steps

### 1. Validate (CI “config” stage)

```bash
cd labs/09-ci-cd

docker compose -f compose.yaml config >/dev/null
REGISTRY_OWNER=example IMAGE_TAG=sha-deadbee \
  docker compose -f compose.prod.yaml config >/dev/null
echo "compose files OK"
```

### 2. Build + smoke (CI “build/test” stage)

```bash
docker compose up --build -d

# Wait until healthy, then:
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/ | jq .

docker compose down -v
```

### 3. Tag like CI would

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker build -t "rean-deploy-api:sha-$GIT_SHA" .
docker images "rean-deploy-api"
```

### 4. Read the workflow template

Open `workflows/ci.yml`. This is the GitHub Actions pattern from Chapter 17.

Optional (only if you own a GitHub repo and want a real push):

1. Copy `workflows/ci.yml` → `.github/workflows/rean-deploy-ci.yml` at the **repo root**.
2. Push to `main` (path filter includes this lab).
3. In GitHub → Packages, confirm `rean-deploy-api` appears.
4. On a server with Docker:

```bash
cp .env.example .env
# edit APP_VERSION etc. (Compose reads .env for ${VAR} interpolation)

export REGISTRY_OWNER=YOUR_GITHUB_USER
export IMAGE_TAG=sha-YOURSHA
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
curl -fsS http://127.0.0.1:3000/health
```

You do **not** need a real server to finish this lab — steps 1–4 (through reading the workflow) are enough.

## Discuss

- Why does `compose.prod.yaml` use `image:` instead of `build:`?
- Why publish `127.0.0.1:3000` in prod Compose instead of `0.0.0.0:3000`?
- What is the difference between CI (build/smoke/push) and CD (deploy to a host)?
- How would you roll back to yesterday’s SHA tag?

## Success criteria

- [ ] `docker compose … config` succeeds for both files
- [ ] Local smoke test returns `{"status":"ok",…}` from `/health`
- [ ] You can explain build → tag → (push) → pull → `compose up` without notes
- [ ] You know where you would put secrets for SSH deploy (host / GitHub Secrets — not the image)
