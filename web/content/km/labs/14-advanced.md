# Lab 14 — BuildKit, Watch និង SBOM

## កម្រិត

**ថ្នាក់ខ្ពស់។** Handbook **ជំពូក 16**។ ធ្វើបន្ទាប់ពី Lab 11 និងមុន Lab 12។ លេខនៅ 14 ដើម្បីឱ្យ Lab 12 និង 13 រក្សាផ្លូវដើម។

## គោលដៅ

អនុវត្តទម្លាប់ជំពូក 16 បីយ៉ាងដាច់ពីការពិនិត្យសុវត្ថិភាព Lab 11៖ BuildKit cache mount, Compose Watch សម្រាប់ iteration លើ laptop និងការមើល SBOM ខ្លី។

**ជំនួយស្រេចចិត្ត:** `./run.sh` គ្រប cache-mount build, config `compose.watch.yaml` និង SPDX peek។ រង្វិលជុំ Watch អន្តរកម្មនៅដៃ។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

## ជំហាន

### 1. BuildKit cache mount + multi-arch inspect

មិនត្រូវ image app ថ្មី។ Build ទីពីរគួរប្រើ apk cache ឡើងវិញ។

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

Cache mounts បង្កើនល្បឿន package install ដោយមិន bake cache ចូល image។ `imagetools inspect` បង្ហាញ amd64/arm64 manifests ក្រោម tag តែមួយ។

> **លទ្ធផលដែលរំពឹងទុក:** Build ទីពីរចប់ដោយមិនទាញ apk packages សាឡើង ហើយ `imagetools inspect` រាយ platform ច្រើនជាងមួយ។

### 2. Compose Watch

Validate ឯកសារបង្រៀន រួចសាក Watch បើចង់ loop ផ្ទាល់។

```bash
cd labs/14-advanced
docker compose -f compose.watch.yaml config >/dev/null

# Interactive (Ctrl+C when done):
docker compose -f compose.watch.yaml up -d
docker compose -f compose.watch.yaml watch
# In another terminal, edit watch-demo/hello.txt and watch the container pick it up.
docker compose -f compose.watch.yaml down
```

> **គន្លឹះ:** `develop.watch` សម្រាប់ iteration លើ laptop។ កុំដាក់ក្នុង production Compose (ជំពូក 17)។

### 3. មើល SBOM

Image Trivy ដូច Lab 11 ប្រើសម្រាប់ស្កេន ទម្រង់ output ផ្សេង៖ SPDX bill of materials តូច។

```bash
docker run --rm aquasec/trivy:0.63.0 image --format spdx alpine:3.22 | head -n 40
```

អ្នកគួរឃើញបន្ទាត់អត្តសញ្ញាណ package (SPDX)។ Signing ជាមួយ Cosign នៅតែ orientation ក្នុង handbook — lab នេះមិនដំឡើងវាទេ។

> **លទ្ធផលដែលរំពឹងទុក:** អត្ថបទ SPDX មានបន្ទាត់អត្តសញ្ញាណ package (`SPDXID` ឬ `PackageName`)។

## ពិភាក្សា

- ទស្សន៍ទាយ៖ បើ `develop.watch` ជាប់ក្នុង `compose.prod.yaml` អ្វីខូចសម្រាប់ teammate ដែល pull តែ images?
- ហេតុអ្វីរក្សា apk cache mount ក្រៅពី image layers?

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកបានរត់ BuildKit cache-mount build ឬ inspect multi-arch manifest
- [ ] អ្នកបាន validate `compose.watch.yaml` ឬរត់ `docker compose watch`
- [ ] អ្នកបាន peek SPDX SBOM (ឬពន្យល់បានថាហេតុអ្វីវាសំខាន់)

## បន្ទាប់

ទៅ **Lab 12 — Deploy & CI/CD** ហើយរត់ជំហាន pipeline លើម៉ាស៊ីនផ្ទាល់។
