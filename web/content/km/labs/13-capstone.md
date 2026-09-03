# Lab 13 — Capstone

## គោលដៅ

បង្កើត stack **API + Postgres + Redis** តូចមួយដែលអ្នកអាចបង្ហាញមិត្តរួមការ។ ផ្គូផ្គង handbook **ជំពូក 18**។

ថតនេះមាន **day-one runnable baseline** (Compose + Node API) ដើម្បីឱ្យ CI និងអ្នកថ្មី `up` បានភ្លាម។ Baseline នោះ **មិនមែន** ជាចុងបញ្ចប់ — Capstone មានន័យថាអ្នក **own** stack (marker: `CAPSTONE_OWN`)។

ធ្វើការក្នុងថតនេះ (`labs/13-capstone`) ដើម្បីឱ្យ capstone ដាច់ពី labs បង្រៀន។

## តម្រូវការ

1. `Dockerfile` សម្រាប់ API (baseline pin Node តាម digest — ជំពូក 15; multi-stage បើ compile/build)។
2. `compose.yaml` មាន `api`, `db`, `redis` (baseline pin Postgres/Redis តាម digest — ជំពូក 15)។
3. Named volume សម្រាប់ Postgres។
4. `.env.example` រាយ variables ដែលត្រូវការ (គ្មាន secrets ពិត)។
5. Healthchecks លើ API និង Postgres។
6. API ភ្ជាប់តាម hostname `db` និង `redis` — មិនមែន `localhost`។
7. README នេះ (ឬផ្នែកដែលអ្នកបន្ថែម) ពន្យល់ `up`, ជំហាន migrate បើមាន និង `down`។

## Own it (`CAPSTONE_OWN`)

Run baseline ដោយមិនកែ **មិន** បញ្ចប់ lab នេះ។ កែផលិតផលឱ្យមិត្តរួមការដឹងថាជារបស់អ្នក។ ធ្វើ **យ៉ាងហោចណាស់ពីរ** ពីបញ្ជីនេះ (stretch goals ខាងក្រោមរាប់)៖

1. បន្ថែម API route ថ្មី (មើល `// CAPSTONE_OWN:` ក្នុង `server.js`) ហើយ document ក្នុង README នេះ។
2. ប្តូរឈ្មោះ services ឬ Compose project ហើយ update healthchecks / env docs ឱ្យត្រូវ។
3. ប្តូរ API image ទៅ **multi-stage** (Lab 08) ខណៈរក្សា digests / non-root។
4. បន្ថែម reverse proxy (Nginx ឬ Caddy) មុខ API — គ្មានឯកសារ reference ដោយចេតនា។
5. Customize `compose.prod.yaml` និង/ឬ `workflows/ci.yml` ហួសពី copy-paste (limits, scan, ឈ្មោះ image របស់អ្នក)។

Optional clean-room restart ពី Lab 05 បើចង់សរសេរ Compose ពីដើម៖

```bash
cp -R ../05-compose/. .
# then restore this README and re-apply digests + your ideas
```

## Stretch goals

- `compose.prod.yaml` ដាច់ដោយឡែក ជាមួយ restart policy និង resource limits (ជំពូក 17 / Lab 12)
- Nginx ឬ Caddy reverse proxy មុខ API
- CI job: `docker compose config` + build + smoke + push (pattern: `workflows/ci.yml` ពី Lab 12)
- ស្កេន image ក្នុង CI (Lab 11)

**Optional references** (ចូលចិត្តសរសេរដោយខ្លួនឯងមុន)៖ ថតនេះមាន baseline `compose.prod.yaml` និង `workflows/ci.yml` តាម Lab 12។ Validate prod config ដោយ៖

```bash
REGISTRY_OWNER=example IMAGE_REF=:sha-deadbee \
  docker compose -f compose.prod.yaml config
```

## ចាប់ផ្ដើមណែនាំ

```bash
cd labs/13-capstone
cp .env.example .env
docker compose up --build
curl -s http://localhost:3000/health
curl -s http://localhost:3000/ | python3 -m json.tool
docker compose down
```

រួចអនុវត្តការផ្លាស់ប្តូរ `CAPSTONE_OWN` របស់អ្នក ហើយ curl ម្ដងទៀត (បូក route ថ្មីបើមាន)។

## Run / tear down

| ពាក្យបញ្ជា | អ្វីដែលវាធ្វើ |
|---------|----------------|
| `docker compose up --build` | Build image API ហើយចាប់ផ្ដើម `api`, `db`, `redis` |
| `curl http://localhost:3000/health` | ផ្ទៀងផ្ទាត់ dependencies |
| `docker compose down` | ឈប់ containers; **រក្សា** named volume |
| `docker compose down -v` | ឈប់ containers ហើយ **លុប** `pgdata` |

## លក្ខខណ្ឌជោគជ័យ

- [ ] `docker compose up --build` ចាប់ផ្ដើម services ទាំងអស់
- [ ] `/health` បៃតង ហើយ API និយាយជាមួយ `db` និង `redis`
- [ ] `.env` ត្រូវ gitignore; `.env.example` ត្រូវ commit
- [ ] អ្នកអាច `docker compose down` ហើយពន្យល់ថា `-v` នឹងលុបអ្វី
- [ ] `CAPSTONE_OWN`: ការផ្លាស់ប្តូរ ownership យ៉ាងហោចពីរពីបញ្ជីខាងលើរួច ហើយកត់ក្នុង README នេះ

អ្នកបញ្ចប់ផ្លូវណែនាំហើយ។ ជំហានបន្ទាប់៖ containerize app ដែលអ្នកស្គាល់ រួចភ្ជាប់ pipeline ជំពូក 17។
