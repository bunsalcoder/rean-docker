# Lab 11 — Security essentials

## Goal

See three habits from handbook **Chapter 15**: don’t run as root when you can avoid it, don’t bake secrets into layers, and look at what an image scan reports.

Pair with Lab 04 (leaky `ENV`) and Lab 08/09 (non-root + slim images).

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

Cleanup:

```bash
rm -f /tmp/rean-demo.secret
docker rmi rean-secret:lab11
```

### 3. Scan an image (optional)

If you have network access, run Trivy in a container (no extra install):

```bash
docker run --rm aquasec/trivy:0.63.0 image alpine:3.22
```

Read the report; don’t panic at every “LOW”. The point is: **know how to scan** before you promote an image. `docker scout` is another option if your Docker Desktop includes it.

This repo’s CI scans teaching builds with Trivy: **HIGH** is reported, and **unfixed CRITICAL** fails the job. Runtime Dockerfiles drop the base image’s `npm`/`corepack` after `npm ci` so the gate focuses on what the app ships — not every CVE in the Node distribution’s package manager (Lab 09 discuss).

### 4. Digest vs tag

```bash
docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}'
# Example shape: alpine@sha256:14358309a308569c32bdc37e2e0e9694be33a9d99e68afb0f5ff33cc1f695dce
```

Tags move. A digest (`alpine@sha256:…`) is the bits you actually pulled. Pin digests when supply-chain control matters (CI, production). Labs 09 and 12 pin `FROM node:22-alpine@sha256:…`; Lab 13 pins Postgres/Redis the same way. Digests go stale on purpose — refresh them when you upgrade (Dependabot opens PRs for those Dockerfiles).

Try pulling by digest (same bits as the tag *today*):

```bash
docker pull alpine@sha256:14358309a308569c32bdc37e2e0e9694be33a9d99e68afb0f5ff33cc1f695dce
```

## Discuss

- Why is mounting `/var/run/docker.sock` into an app container almost the same as giving it root on the host?
- When is `ENV NODE_ENV=production` fine, and when is `ENV` a secret leak (Lab 04)?
- What would you fail CI on: critical CVEs in *your* app deps, or every CVE in the base image?

## Success criteria

- [ ] `whoami` showed `node` on `rean-hello:1.0` and `root` on Alpine
- [ ] BuildKit `--secret` built; `docker history` did not print the token
- [ ] You can explain tag vs digest in one sentence

## Next

Go to **Lab 12 — Deploy & CI/CD** and run the pipeline steps locally.
