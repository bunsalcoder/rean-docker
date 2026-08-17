# Lab 13 — Capstone

## គោលដៅ

បង្កើត stack **API + Postgres + Redis** តូចមួយដែលអ្នកអាចបង្ហាញមិត្តរួមការ។ ផ្គូផ្គង handbook **ជំពូក 18**។

អ្នកអាច copy Lab 05 (`labs/05-compose`) ជាចំណុចចាប់ផ្ដើម រួចអនុវត្ត Labs 08–12៖ multi-stage (បើ compile), production Compose និង workflow រាង CI។

ធ្វើការក្នុងថតនេះ (`labs/13-capstone`) ដើម្បីឱ្យ capstone ដាច់ពី labs បង្រៀន។

## តម្រូវការ

1. `Dockerfile` សម្រាប់ API (multi-stage បើអ្នក compile/build)។
2. `compose.yaml` មាន `api`, `db`, `redis`។
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
cp -R ../05-compose/. .
# remove what you don’t need, then make it yours
cp .env.example .env
docker compose up --build
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `docker compose up --build` ចាប់ផ្ដើម services ទាំងអស់
- [ ] `/health` បៃតង ហើយ API និយាយជាមួយ `db` និង `redis`
- [ ] `.env` ត្រូវ gitignore; `.env.example` ត្រូវ commit
- [ ] អ្នកអាច `docker compose down` ហើយពន្យល់ថា `-v` នឹងលុបអ្វី

អ្នកបញ្ចប់ផ្លូវណែនាំហើយ។ ជំហានបន្ទាប់៖ containerize app ដែលអ្នកស្គាល់ រួចភ្ជាប់ pipeline ជំពូក 17។
