# Lab 04 — Docker Compose (API + Postgres + Redis)

## គោះល៊ែម

Run app ច្រើន container ជាមួយ service DNS, volumes, និង healthchecks។

## ជំហាន

```bash
cd labs/04-compose

docker compose up --build
# or detached:
# docker compose up -d --build
```

សាកល្បងៗ

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
# hit / a few times — "hits" should increase (Redis)
```

ពាក្យបិញ្ញដំលែរប្រេះយោក៉ង់ៗ

```bash
docker compose ps
docker compose logs -f api
docker compose exec db psql -U rean -d rean -c '\dt'
docker compose down        # keep volume
docker compose down -v     # DELETE database volume
```

## គំនិតសំខាន់ដំលែរក្រេញ្ញ

1. Hostname `db` និង `redis` ដំណើរការ **នៅក្នុង** Compose network។
2. `depends_on` + `service_healthy` រង់ចាំរហូត Postgres ទទួល connections។
3. Named volume `pgdata` រស់នៅបន្ទាប់ពី `docker compose down` (លុះត្រាតែ `-v`)។

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] Services ទាំងបី up
- [ ] `/` បង្ហាញ `hits` និង `dbTime`
- [ ] បន្ទាប់ពី `down` + `up` អ្នកយល់ថាទិន្នន័យកើតអ្វីជាមួយ/គ្មាន `-v`
