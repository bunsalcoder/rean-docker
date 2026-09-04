# Lab 11 — សុវត្ថិភាពសំខាន់ៗ

## គោលដៅ

មើលទម្លាប់បីពី handbook **ជំពូក 15**: កុំ run ជា root ពេលអាចជៀស, កុំដុត secrets ចូល layers និងមើលរបាយការណ៍ scan image។

ផ្គូផ្គង Lab 04 (`ENV` លេច) និង Lab 08/09 (non-root + images ស្ដើង)។

**Optional helper:** `./run.sh` គ្រប whoami, BuildKit secret check និង digest inspect (Trivy នៅដៃ)។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

## ជំហាន

### 1. នរណាជា PID 1?

Build image Lab 03 បើអ្នកមិននៅមាន រួច៖

```bash
docker run --rm --entrypoint whoami rean-hello:1.0
# → node  (USER node in that Dockerfile)

docker run --rm --entrypoint whoami alpine:3.22
# → root
```

Root ក្នុង container នៅតែបញ្ហា បើនរណាគេចចេញពី app។ ចូលចិត្ត `USER` មិនមែន root ក្នុង production images។

### 2. BuildKit secret (ផ្លូវត្រឹមត្រូវ)

ឯកសារ secret ត្រូវ **mount សម្រាប់ `RUN` មួយ**។ វាមិនត្រូវលេចក្នុង `docker history`។

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

Build គួរជោគជ័យ ហើយមានសារ runtime។ អ្នក **មិន** គួរឃើញ `super-secret-token` ក្នុង `docker history`។ ប្រៀបធៀបជាមួយ `Dockerfile.leaky` នៃ Lab 04។

សម្អាត៖

```bash
rm -f /tmp/rean-demo.secret
docker rmi rean-secret:lab11
```

### 3. ស្កេន image (ស្រេចចិត្ត)

បើមានបណ្ដាញ រត់ Trivy ក្នុង container (មិនត្រូវដំឡើងបន្ថែម)៖

```bash
# Prefer a digest pin in CI (this repo pins aquasec/trivy:0.63.0@sha256:…).
docker run --rm aquasec/trivy:0.63.0 image alpine:3.22
```

អានរបាយការណ៍; កុំភ័យនឹង «LOW» គ្រប់មួយ។ ចំណុចគឺ៖ **ដឹងរបៀបស្កេន** មុន promote image។ `docker scout` ជាជម្រើសមួយទៀត បើ Docker Desktop មាន។

CI របស់ repo នេះស្កេន teaching builds ជាមួយ Trivy៖ **HIGH** ជារបាយការណ៍ ហើយ **unfixed CRITICAL** fail job។ Runtime Dockerfiles លុប `npm`/`corepack` ពី base image បន្ទាប់ពី `npm ci` ដើម្បីឱ្យ gate ផ្តោតលើអ្វីដែល app ផ្ញើ — មិនមែន CVE គ្រប់មួយក្នុង package manager របស់ Node (ពិភាក្សា Lab 09)។

### 4. Digest vs tag

```bash
docker pull alpine:3.22
# Refresh today's digest (tags move — do not copy an old sha from a blog forever):
DIGEST=$(docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}')
echo "$DIGEST"
# Example shape: alpine@sha256:14358309a308569c32bdc37e2e0e9694be33a9d99e68afb0f5ff33cc1f695dce
docker pull "$DIGEST"
```

Tags ផ្លាស់ទី។ Digest (`alpine@sha256:…`) គឺ bits ដែលអ្នកពិតជា pull។ Pin digests ពេលគ្រប់គ្រង supply-chain សំខាន់ (CI, production)។ Labs 09, 12, និង 13 pin `FROM node:22-alpine@sha256:…`; Lab 13 pin Postgres/Redis ក្នុង Compose ដែរ។ Digest ហួសសម័យដោយចេតនា — refresh ពេល upgrade (Dependabot បើក PR សម្រាប់ Dockerfile ទាំងនោះ)។

### 5. Stretch — BuildKit cache + multi-arch (ជំពូក 16)

Optional។ ផ្គូផ្គង handbook **ជំពូក 16**។ មិនត្រូវ image ថ្មីក្រៅពី Alpine។

```bash
# Cache mount (BuildKit) — second build should reuse the apk cache layer faster
docker buildx version

cat > /tmp/rean-lab11-cache.Dockerfile <<'EOF'
# syntax=docker/dockerfile:1
FROM alpine:3.22
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache curl
EOF

docker build -t rean-cache:lab11 -f /tmp/rean-lab11-cache.Dockerfile /tmp
docker build -t rean-cache:lab11 -f /tmp/rean-lab11-cache.Dockerfile /tmp

# Multi-platform *inspect* (pushing multi-arch needs a registry; skip --push here)
docker buildx imagetools inspect alpine:3.22 | head -n 40

rm -f /tmp/rean-lab11-cache.Dockerfile
docker rmi rean-cache:lab11 >/dev/null 2>&1 || true
```

សម្គាល់៖ cache mounts បង្កើនល្បឿន package install ដោយមិន bake cache ចូល image; `imagetools inspect` បង្ហាញ amd64/arm64 manifests ក្រោម tag តែមួយ។

## ពិភាក្សា

- ហេតុអ្វី mount `/var/run/docker.sock` ចូល app container ស្ទើរតែដូចឱ្យវា root លើ host?
- ពេលណា `ENV NODE_ENV=production` ទទួលបាន ហើយពេលណា `ENV` លេច secret (Lab 04)?
- អ្នកនឹង fail CI លើអ្វី: critical CVEs ក្នុង deps *របស់ app* ឬ CVE គ្រប់មួយក្នុង base image?

## លក្ខខណ្ឌជោគជ័យ

- [ ] `whoami` បង្ហាញ `node` លើ `rean-hello:1.0` និង `root` លើ Alpine
- [ ] BuildKit `--secret` បាន build; `docker history` មិនបោះពុម្ព token
- [ ] អ្នកអាចពន្យល់ tag vs digest ក្នុងមួយប្រយោគ
- [ ] (Stretch) អ្នកបានរត់ BuildKit cache-mount build ឬ inspect multi-arch manifest

## បន្ទាប់

ទៅ **Lab 12 — Deploy & CI/CD** ហើយរត់ជំហាន pipeline លើម៉ាស៊ីនផ្ទាល់។
