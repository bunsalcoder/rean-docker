# Lab 14 — BuildKit, Watch, and SBOM

## Level

**Advanced.** Handbook **Chapter 16**. Do this after Lab 11 and before Lab 12. The number stays 14 so Labs 12 and 13 keep their existing paths.

## Goal

Practice three Chapter 16 habits on their own, separate from Lab 11’s security checks: a BuildKit cache mount, Compose Watch for local iteration, and a short SBOM peek.

**Optional helper:** `./run.sh` covers the cache-mount build, `compose.watch.yaml` config, and an SPDX peek. The interactive Watch loop stays manual. Prefer typing the commands yourself the first time.

## Steps

### 1. BuildKit cache mount + multi-arch inspect

No new app images. The second build should reuse the apk cache.

```bash
docker buildx version

cat > /tmp/rean-lab14-cache.Dockerfile <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine:3.22
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache curl
EOF

docker build -t rean-cache:lab14 -f /tmp/rean-lab14-cache.Dockerfile /tmp
docker build -t rean-cache:lab14 -f /tmp/rean-lab14-cache.Dockerfile /tmp

# Multi-platform inspect (pushing multi-arch needs a registry; skip --push here)
docker buildx imagetools inspect alpine:3.22 | head -n 40

rm -f /tmp/rean-lab14-cache.Dockerfile
docker rmi rean-cache:lab14 >/dev/null 2>&1 || true
```

Cache mounts speed package installs without baking the cache into the image. `imagetools inspect` shows the amd64/arm64 manifests behind one tag.

> **Expected output:** The second build finishes without re-downloading apk packages, and `imagetools inspect` lists more than one platform.

### 2. Compose Watch

Validate the teaching file, then try Watch if you want the live loop.

```bash
cd labs/14-advanced
docker compose -f compose.watch.yaml config >/dev/null

# Interactive (Ctrl+C when done):
docker compose -f compose.watch.yaml up -d
docker compose -f compose.watch.yaml watch
# In another terminal, edit watch-demo/hello.txt and watch the container pick it up.
docker compose -f compose.watch.yaml down
```

> **Tip:** `develop.watch` is for laptop iteration. Keep it out of production Compose (Chapter 17).

### 3. SBOM peek

Same Trivy image Lab 11 uses for scanning, different output: a small SPDX bill of materials.

```bash
docker run --rm aquasec/trivy:0.63.0 image --format spdx alpine:3.22 | head -n 40
```

You should see package identity lines (SPDX). Signing with Cosign stays orientation-only in the handbook — this lab does not install it.

> **Expected output:** The SPDX text includes package identity lines (`SPDXID` or `PackageName`).

## Discuss

- Predict: if `develop.watch` shipped in `compose.prod.yaml`, what breaks for a teammate who only pulls images?
- Why keep the apk cache mount out of the image layers?

## Success criteria

- [ ] You ran a BuildKit cache-mount build or inspected a multi-arch manifest
- [ ] You validated `compose.watch.yaml` or ran `docker compose watch`
- [ ] You peeked at an SPDX SBOM (or can explain why one matters)

## Next

Go to **Lab 12 — Deploy & CI/CD** and run the pipeline steps locally.
