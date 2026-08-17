# Lab 10 — Debug និងដោះស្រាយបញ្ហា

## គោលដៅ

អនុវត្តពាក្យបញ្ជាដែលអ្នកចាប់ពេល container **ចេញ**, **ភ្ជាប់មិនបាន** ឬ **ប្រើ hostname ខុស**។ ផ្គូផ្គង handbook **ជំពូក 14**។

អ្នកមិនត្រូវការ app ថ្មី — តែ `docker logs`, `docker inspect` និង Compose file ដែល *ត្រូវ* fail រហូតអ្នកកែ។

## ជំហាន

### 1. Container ដែលមិននៅ up

```bash
docker run --name lab10-crash alpine:3.22 sh -c 'echo boom >&2; exit 7'
docker ps -a --filter name=lab10-crash
docker logs lab10-crash
docker inspect -f '{{.State.ExitCode}} {{.State.Error}}' lab10-crash
docker rm lab10-crash
```

Exit code `7` គឺ `exit 7` របស់ app។ `Error` ធម្មតាទទេសម្រាប់ exit មិនសូន្យស្អាត — **logs** គឺរឿង។

### 2. Debug shell បែប interactive

```bash
docker run --rm -it --entrypoint sh alpine:3.22
# inside: ps aux; ls /; exit
```

ប្រើពេល `CMD` លំនាំដើមខុស ហើយអ្នកចង់មើលជុំវិញ។

### 3. Hostname ខុស (`localhost` ក្នុង container)

```bash
cd labs/10-debugging

# This client talks to localhost — that is *itself*, not Redis
docker compose run --rm client || true
docker compose logs cache
docker compose down
```

កែ `compose.yaml`: ប្ដូរ `-h localhost` ទៅ `-h cache`។ រត់ម្ដងទៀត៖

```bash
docker compose run --rm client
# → PONG
docker compose down
```

`localhost` ពី browser អ្នកនៅតែអាចទៅដល់ port ដែល publish។ Containers បងប្អូនត្រូវប្រើ **ឈ្មោះ service**។

### 4. Inspect មួយវាល មិនមែនលិចក្នុង JSON

```bash
docker run -d --name lab10-inspect alpine:3.22 sleep 30
docker inspect -f '{{.State.Status}} {{.HostConfig.NetworkMode}}' lab10-inspect
docker rm -f lab10-inspect
```

## ពិភាក្សា

- ពេលណាអាន `logs` vs `inspect` vs `compose ps`?
- ហេតុអ្វី `depends_on` គ្មាន `condition: service_healthy` នៅតែប្រណាំង?
- នេះខុសពី Lab 06 (networks) យ៉ាងដូចម្ដេច ដែល bug hostname ដូចគ្នាគឺ *មេរៀន* មិនមែន failure ដែលអ្នក debug?

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នករកឃើញ exit code និងបន្ទាត់ `boom` ពី logs
- [ ] Compose client បង្ហាញ `PONG` បន្ទាប់ពីប្ដូរ `localhost` → `cache`
- [ ] អ្នកអាចឈ្មោះពាក្យបញ្ជាបីដែលនឹងរត់មុន rebuild «សាកមើល»

## បន្ទាប់

ទៅ **Lab 11 — សុវត្ថិភាពសំខាន់ៗ** (non-root, scans, BuildKit secrets)។
