# Lab 05 — Docker Compose (API + Postgres + Redis)

## គោលដៅ

Run កម្មវិធីពហុ container ជាមួយ service DNS, volumes, healthchecks និង config ពី `.env` (Lab 04)។

## ជំហាន

```bash
cd labs/05-compose

cp .env.example .env
# edit POSTGRES_PASSWORD if you want — never commit .env

docker compose up --build
# or detached:
# docker compose up -d --build
```

សាកល្បង៖

```bash
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/health
# hit / a few times — "hits" should increase (Redis)
```

ពាក្យបញ្ជាមានប្រយោជន៍៖

```bash
docker compose ps
docker compose logs -f api
docker compose exec db psql -U rean -d rean -c '\dt'
docker compose down        # keep volume
docker compose down -v     # DELETE database volume
```

បើអ្នកប្ដូរ `POSTGRES_USER` / `POSTGRES_DB` ក្នុង `.env` សូមប្រើឈ្មោះនោះក្នុង `psql` ជំនួស `rean`។

## គំនិតសំខាន់ដែលត្រូវសង្កេត

1. Hostname `db` និង `redis` ដំណើរការ **នៅក្នុង** Compose network។
2. `depends_on` + `service_healthy` រង់ចាំរហូត Postgres **និង** Redis ទទួល connections។
3. Named volume `pgdata` នៅរស់បន្ទាប់ពី `docker compose down` (លុះត្រាតែ `-v`)។
4. Password ស្ថិតក្នុង `.env` មិនមែនជាតួអក្សរក្នុង `compose.yaml`។ Compose interpolate `${POSTGRES_PASSWORD}` ពេលចាប់ផ្ដើម។
5. `DATABASE_URL` នៅតែត្រូវផ្គុំពី variables ទាំងនោះ។ រត់ `docker compose config` អ្នកនឹងឃើញ URL រួម password។ នោះហើយជាហេតុ production ចូលចិត្ត Docker secrets ឬ vault មិនមែន connection string នៅក្នុងលទ្ធផល Compose។

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នក copy `.env.example` → `.env` មុន `up`
- [ ] Services ទាំងបី up
- [ ] `/` បង្ហាញ `hits` និង `dbTime`
- [ ] បន្ទាប់ពី `down` + `up` អ្នកយល់ថាទិន្នន័យកើតអ្វីជាមួយ/គ្មាន `-v`

## បន្ទាប់

ទៅ **Lab 06 — Networks** ដើម្បីមើល DNS តាមឈ្មោះដោយគ្មាន Compose រួច **Lab 07 — Volumes** សម្រាប់ persistence ដាច់ដោយឡែក។
