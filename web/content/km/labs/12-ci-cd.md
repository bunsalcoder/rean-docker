# Lab 12 — ផ្លូវ Deploy & CI/CD (ពិសេស)

## គោលដៅ

អនុវត្តជំហានដូច CI pipeline៖ validate Compose, build image, smoke-test `/health`, tag សម្រាប់ registry និងយល់ថា `compose.prod.yaml` pull image នោះនៅលើ server យ៉ាងដូចម្ដេច។

ផ្គូផ្គងជាមួយ handbook **ជំពូក 17 — Deploy ជាមួយ Docker & CI/CD**។

## ជំហាន

### 1. Validate (ដំណាក់កាល CI “config”)

```bash
cd labs/12-ci-cd

docker compose -f compose.yaml config >/dev/null
REGISTRY_OWNER=example IMAGE_TAG=sha-deadbee \
  docker compose -f compose.prod.yaml config >/dev/null
echo "compose files OK"
```

### 2. Build + smoke (ដំណាក់កាល CI “build/test”)

```bash
docker compose up --build -d

# Wait until healthy, then:
curl -fsS http://127.0.0.1:3000/health
curl -fsS http://127.0.0.1:3000/ | python3 -m json.tool

docker compose down -v
```

### 3. Tag ដូច CI

```bash
GIT_SHA=$(git rev-parse --short HEAD)
docker build -t "rean-deploy-api:sha-$GIT_SHA" .
docker images "rean-deploy-api"
```

### 4. អាន workflow template

បើក `workflows/ci.yml`។ នេះគឺ GitHub Actions pattern ពីជំពូក 17។

សង្កេត `uses:` pin commit SHA ៤០ តួ (មាន comment `# v…`) មិនមែន `@v4`។ គំនិតដូចមិន deploy `:latest`។

ជម្រើស (តែបើអ្នកមាន GitHub repo ហើយចង់ push ពិត)៖

1. Copy `workflows/ci.yml` → `.github/workflows/rean-deploy-ci.yml` នៅ **repo root**។
2. Push ទៅ `main` (path filter រួម lab នេះ)។
3. នៅ GitHub → Packages បញ្ជាក់ថា `rean-deploy-api` បង្ហាញ។
4. នៅ server ដែលមាន Docker៖

```bash
cp .env.example .env
# edit APP_VERSION etc. (Compose reads .env for ${VAR} interpolation)

export REGISTRY_OWNER=YOUR_GITHUB_USER
export IMAGE_TAG=sha-YOURSHA
docker compose -f compose.prod.yaml pull
docker compose -f compose.prod.yaml up -d
curl -fsS http://127.0.0.1:3000/health
```

អ្នក **មិន** ត្រូវការ server ពិតដើម្បីបញ្ចប់ lab នេះ — ជំហាន 1–4 (រហូតអាន workflow) គ្រប់គ្រាន់ហើយ។

## ពិភាក្សា

- ហេតុអ្វី `compose.prod.yaml` ប្រើ `image:` ហើយមិនមែន `build:`?
- ហេតុអ្វី publish `127.0.0.1:3000` ក្នុង prod Compose ហើយមិនមែន `0.0.0.0:3000`?
- តើអ្វីជាភាពខុសគ្នារវាង CI (build/smoke/push) និង CD (deploy ទៅ host)?
- តើ rollback ទៅ SHA tag កាលពីម្សិលមិញធ្វើដូចម្ដេច?
- ហេតុអ្វី `compose.prod.yaml` error បើ `IMAGE_TAG` មិនកំណត់ ជំនួសឱ្យ default `latest`?
- ហេតុអ្វី pin GitHub Actions ទៅ commit SHA ហើយមិនមែន `@v4`?

## លក្ខខណ្ឌជោគជ័យ

- [ ] `docker compose … config` ជោគជ័យសម្រាប់ files ទាំងពីរ
- [ ] Smoke test លើម៉ាស៊ីនផ្ទាល់ ត្រឡប់ `{"status":"ok",…}` ពី `/health`
- [ ] អ្នកអាចពន្យល់ build → tag → (push) → pull → `compose up` ដោយគ្មាន notes
- [ ] អ្នកដឹងហេតុអ្វី prod Compose ត្រូវការ `IMAGE_TAG` ហើយមិន fallback ទៅ `latest`
- [ ] អ្នកដឹងហេតុអ្វី workflow pin Actions តាម SHA មិនមែន `@v4`
- [ ] អ្នកដឹងថាដាក់ secrets សម្រាប់ SSH deploy នៅណា (host / GitHub Secrets — មិនមែនក្នុង image)

## បន្ទាប់

ទៅ **Lab 13 — Capstone** ហើយបង្កើត stack ផ្ទាល់ខ្លួន (ឬពង្រីក Lab 05)។
