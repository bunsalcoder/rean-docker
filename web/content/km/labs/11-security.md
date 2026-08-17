# Lab 11 — សុវត្ថិភាពសំខាន់ៗ

## គោលដៅ

មើលទម្លាប់បីពី handbook **ជំពូក 15**: កុំ run ជា root ពេលអាចជៀស, កុំដុត secrets ចូល layers និងមើលរបាយការណ៍ scan image។

ផ្គូផ្គង Lab 04 (`ENV` លេច) និង Lab 08/09 (non-root + images ស្ដើង)។

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
docker run --rm aquasec/trivy:0.63.0 image alpine:3.22
```

អានរបាយការណ៍; កុំភ័យនឹង «LOW» គ្រប់មួយ។ ចំណុចគឺ៖ **ដឹងរបៀបស្កេន** មុន promote image។ `docker scout` ជាជម្រើសមួយទៀត បើ Docker Desktop មាន។

### 4. Digest vs tag

```bash
docker image inspect alpine:3.22 --format '{{index .RepoDigests 0}}'
```

Tags ផ្លាស់ទី។ Digest (`alpine@sha256:…`) គឺ bits ដែលអ្នកពិតជា pull។ Pin digests ពេលគ្រប់គ្រង supply-chain សំខាន់ (CI, production)។

## ពិភាក្សា

- ហេតុអ្វី mount `/var/run/docker.sock` ចូល app container ស្ទើរតែដូចឱ្យវា root លើ host?
- ពេលណា `ENV NODE_ENV=production` ទទួលបាន ហើយពេលណា `ENV` លេច secret (Lab 04)?
- អ្នកនឹង fail CI លើអ្វី: critical CVEs ក្នុង deps *របស់ app* ឬ CVE គ្រប់មួយក្នុង base image?

## លក្ខខណ្ឌជោគជ័យ

- [ ] `whoami` បង្ហាញ `node` លើ `rean-hello:1.0` និង `root` លើ Alpine
- [ ] BuildKit `--secret` បាន build; `docker history` មិនបោះពុម្ព token
- [ ] អ្នកអាចពន្យល់ tag vs digest ក្នុងមួយប្រយោគ

## បន្ទាប់

ទៅ **Lab 12 — Deploy & CI/CD** ហើយរត់ជំហាន pipeline លើម៉ាស៊ីនផ្ទាល់។
