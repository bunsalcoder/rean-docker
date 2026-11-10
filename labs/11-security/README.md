# Lab 11 — Security essentials

## Level

**Advanced.** Non-root, BuildKit secrets, and image scanning (handbook Chapter 15).

## Goal

See three habits from handbook **Chapter 15**: don’t run as root when you can avoid it, don’t bake secrets into layers, and look at what an image scan reports.

Pair with Lab 04 (leaky `ENV`) and Lab 08/09 (non-root + slim images). Cache mounts, Compose Watch, and SBOM live in **Lab 14** (Chapter 16) — do that after this lab and before Lab 12.

**Optional helper:** `./run.sh` covers whoami, the BuildKit secret check, and digest inspect. Prefer typing the commands yourself the first time.

## Steps

### 1. Who is PID 1?

Build the Lab 03 image if you don’t still have it, then:

```bash
docker run --rm --entrypoint whoami rean-hello:1.0
# → node  (USER node in that Dockerfile)

docker run --rm --entrypoint whoami alpine:3.22
# → root
```

Root in a container is still a problem if someone escapes the app. Prefer a non-root `USER` in production images.

### 2. BuildKit secret (the good path)

The secret file is **mounted for one `RUN`**. It must not appear in `docker history`.

```bash
cd labs/11-security

echo 'super-secret-token' > /tmp/rean-demo.secret

docker build \
  --secret id=demo,src=/tmp/rean-demo.secret \
  -t rean-secret:lab11 \
  -f Dockerfile.secret \
  .

docker history rean-secret:lab11
docker run --rm rean-secret:lab11
```

You should see the build succeed and the runtime message. You should **not** see `super-secret-token` in `docker history`. Contrast with Lab 04’s `Dockerfile.leaky`.

> **Expected output:** The container prints its success message, and `docker history` does **not** contain `super-secret-token`.

Cleanup:

```bash
rm -f /tmp/rean-demo.secret
docker rmi rean-secret:lab11
```

### 3. Scan an image (optional)

If you have network access, run Trivy in a container (no extra install):

```bash
# Prefer a digest pin in CI (this repo pins aquasec/trivy:0.63.0@sha256:…).
docker run --rm aquasec/trivy:0.63.0 image alpine:3.22
```

Read the report; don’t panic at every “LOW”. The point is: **know how to scan** before you promote an image. Alternatives: Docker Scout (`docker scout` on Docker Desktop, or the Scout CLI where available), Grype, or any scanner your org already runs — this curriculum standardizes on **Trivy** in CI so the gate is reproducible without Desktop.

This repo’s CI scans teaching builds with Trivy: **HIGH** is reported, and **unfixed CRITICAL** fails the job for Labs **05, 08 (slim), 09, 12, and 13**. Builds that are **intentionally weak or early** (Lab 03, Lab 08 fat image, Lab 04 leaky `ENV`, Lab 11 secret demo) are still compiled in CI but are **not** on the CRITICAL gate — do not treat a green pipeline as “every Dockerfile is production-clean.” Runtime Dockerfiles drop the base image’s `npm`/`corepack` after `npm ci` so the gate focuses on what the app ships — not every CVE in the Node distribution’s package manager (Lab 09 discuss).

### 4. Digest vs tag

```bash
docker pull alpine:3.22
# Refresh today's digest (tags move — do not copy an old sha from a blog forever):
DIGEST=$(docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}')
echo "$DIGEST"
# Example shape: alpine@sha256:14358309a308569c32bdc37e2e0e9694be33a9d99e68afb0f5ff33cc1f695dce
docker pull "$DIGEST"
```

Tags move. A digest (`alpine@sha256:…`) is the bits you actually pulled. Pin digests when supply-chain control matters (CI, production). Labs 05, 08 (slim), 09, 12, and 13 pin `FROM node:22-alpine@sha256:…`; Lab 13 also pins Postgres/Redis in Compose. Digests go stale on purpose — refresh Dockerfiles via Dependabot, and Lab 13 Compose pins with `make refresh-digests` (a weekly CI workflow runs that target and opens a PR against `develop` when pins drift; optionally run `make refresh-digests-check` locally to fail if Hub moved).

## Discuss

- Why is mounting `/var/run/docker.sock` into an app container almost the same as giving it root on the host?
- When is `ENV NODE_ENV=production` fine, and when is `ENV` a secret leak (Lab 04)?
- What would you fail CI on: critical CVEs in *your* app deps, or every CVE in the base image?

## Success criteria

- [ ] `whoami` showed `node` on `rean-hello:1.0` and `root` on Alpine
- [ ] BuildKit `--secret` built; `docker history` did not print the token
- [ ] You can explain tag vs digest in one sentence

## Next

Go to **Lab 14 — BuildKit, Watch, and SBOM** (Chapter 16), then **Lab 12 — Deploy & CI/CD**.
