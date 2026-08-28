# Lab 13 — Capstone

## គោលដៅ

បង្កើត stack **API + Postgres + Redis** តូចមួយដែលអ្នកអាចបង្ហាញមិត្តរួមការ។ ផ្គូផ្គង handbook **ជំពូក 18**។

ថតនេះមាន **starter scaffold** (Compose + Node API) រួចហើយ ដើម្បី run បានពីថ្ងៃដំបូង រួចកែតម្រូវតាម Labs 08–12៖ multi-stage, production Compose និង workflow រាង CI។

ធ្វើការក្នុងថតនេះ (`labs/13-capstone`) ដើម្បីឱ្យ capstone ដាច់ពី labs បង្រៀន។

## តម្រូវការ

1. `Dockerfile` សម្រាប់ API (starter pin Node តាម digest — ជំពូក 15; multi-stage បើ compile/build)។
2. `compose.yaml` មាន `api`, `db`, `redis` (starter pin Postgres/Redis តាម digest — ជំពូក 15)។
3. Named volume សម្រាប់ Postgres។
4. `.env.example` រាយ variables ដែលត្រូវការ (គ្មាន secrets ពិត)។
5. Healthchecks លើ API និង Postgres។
6. API ភ្ជាប់តាម hostname `db` និង `redis` — មិនមែន `localhost`។
7. README នេះ (ឬផ្នែកដែលអ្នកបន្ថែម) ពន្យល់ `up`, ជំហាន migrate បើមាន និង `down`។

## Stretch goals

- `compose.prod.yaml` ដាច់ដោយឡែក ជាមួយ restart policy និង resource limits (ជំពូក 17 / Lab 12)
- Nginx ឬ Caddy reverse proxy មុខ API
- CI job: `docker compose config` + build + smoke + push (copy `workflows/ci.yml` ពី Lab 12)
- ស្កេន image ក្នុង CI (Lab 11)

## ចាប់ផ្ដើមណែនាំ

```bash
cd labs/13-capstone
cp .env.example .env
docker compose up --build
curl -s http://localhost:3000/health
curl -s http://localhost:3000/ | python3 -m json.tool
docker compose down
```

ធ្វើឱ្យជារបស់អ្នក៖ ប្តូរឈ្មោះ services, កែ API responses, បន្ថែម route, រឹត Dockerfile ឬបន្ថែម Compose ផលិតកម្ម។ ចូលចិត្តកែ scaffold នេះជាង copy Lab 05 ម្ដងទៀត — លុះត្រាត្រូវចាប់ផ្ដើមស្អាត៖

```bash
# optional clean restart from Lab 05
cp -R ../05-compose/. .
# then restore this README and re-apply your ideas
```

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

អ្នកបញ្ចប់ផ្លូវណែនាំហើយ។ ជំហានបន្ទាប់៖ containerize app ដែលអ្នកស្គាល់ រួចភ្ជាប់ pipeline ជំពូក 17។
