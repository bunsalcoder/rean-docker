# Lab 10 — Environment, secrets និង config

## គោលដៅ

ផ្ទេរ config នៅ **ពេល run** ហើយមើលថាហេតុអ្វី password មិនត្រូវដាក់ `ENV` ក្នុង Dockerfile។

ផ្គូផ្គងជាមួយ handbook **ជំពូក 10**។ ធ្វើបន្ទាប់ពី Lab 03 (អ្នកសរសេរ Dockerfile រួច) និងមុន Lab 04 (Compose នឹងប្រើ env files បន្ត)។

## ជំហាន

### 1. Runtime env (ផ្លូវត្រឹមត្រូវ)

```bash
cd labs/10-env-secrets

cp .env.example .env
# edit .env if you want — this file is gitignored

docker run --rm --env-file .env alpine:3.20 \
  sh -c 'printenv GREETING; printenv DB_PASSWORD'
```

អ្នកគួរឃើញតម្លៃពី `.env`។ វាស្ថិតនៅលើ host មិនមែនក្នុង image layer។

### 2. Compose `env_file`

```bash
docker compose run --rm demo
docker compose down
```

តម្លៃដូចគ្នា ត្រូវចាក់ចូលពេល container ចាប់ផ្ដើម។

### 3. Secret ដុតក្នុង image (ផ្លូវខុស)

```bash
docker build -t rean-leaky:lab10 -f Dockerfile.leaky .
docker run --rm rean-leaky:lab10
docker history rean-leaky:lab10
```

`docker history` នៅតែបង្ហាញ `ENV DB_PASSWORD=super-secret-do-not-copy`។ អ្នកណាមាន image អាចអានបាន។ លុបបន្ទាត់នោះក្រោយមិនលុប layer ចាស់។

សម្អាត៖

```bash
docker rmi rean-leaky:lab10
```

## ពិភាក្សា

- ហេតុអ្វី `ENV NODE_ENV=production` ទទួលបាន តែ `ENV DB_PASSWORD=...` មិនបាន?
- Password production គួរនៅណា (host `.env`, Docker secrets, vault) vs ក្នុង image?
- បើ commit `.env` ខុសមានអ្វីកើតឡើង?

## លក្ខខណ្ឌជោគជ័យ

- [ ] `--env-file` និង Compose បង្ហាញតម្លៃ `.env`
- [ ] `docker history` លើ leaky image បង្ហាញ password ដែលដុតក្នុង
- [ ] អ្នកអាចពន្យល់ «image ដូចគ្នា env ផ្សេងតាម environment»
