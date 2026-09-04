# Lab 03 — Dockerfile ដំបូងរបស់អ្នក

## គោលដៅ

Build image ផ្ទាល់ខ្លួនសម្រាប់ Node/Express API តូចមួយ ហើយ run វា។

Dockerfile នេះ **សាមញ្ញ** ដោយចេតនា (`FROM` តាម tag, គ្មាន digest pin, គ្មាន healthcheck, npm នៅក្នុង image)។ Labs ក្រោយរឹតគំនិតដូចគ្នា៖ Lab 08 multi-stage + non-root, Lab 09 healthchecks / read-only / digest pins, Lab 11 secrets + scanning។ កុំ copy pattern Lab 03 ទៅ production ដោយមិនកែ។

**Optional helper:** `./run.sh` build, run និង curl `/` + `/health`។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

## ជំហាន

```bash
cd labs/03-dockerfile

# Build (the trailing dot is the build context)
docker build -t rean-hello:1.0 .

# Run
docker run --rm -p 3000:3000 --name lab03-api rean-hello:1.0
```

នៅ terminal មួយទៀត៖

```bash
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/health
```

ពិនិត្យ layers៖

```bash
docker history rean-hello:1.0
```

## ការសាកល្បង

1. ប្ដូរសារក្នុង `server.js`, rebuild, rerun — សង្កេតថា layers ណាខ្លះ rebuild។
2. រៀប Dockerfile ឡើងវិញឱ្យ `COPY . .` *មុន* `npm ci` ហើយ rebuild ពីរដងបន្ទាប់ពីកែ code តិច — មានអារម្មណ៍ «cache pain»។ (ឯកសារពិតប្រើ `npm ci` ដែលត្រូវការ `package-lock.json` ហើយគួរប្រើជាង `npm install` ក្នុង Dockerfiles។)
3. បន្ថែម instruction `ENV PORT=3000` ហើយបញ្ជាក់ដោយ `docker inspect`។
4. បើក `.dockerignore` ក្នុងថតនេះ។ វារក្សា `node_modules`, `.env` និង `*.md` ចេញពី build context។ ពន្យល់ខ្លីថាហេតុអ្វីមិនគួរដឹក host `node_modules` ចូល image រួចបញ្ជាក់ថា paths ទាំងនោះមិននៅក្នុង context៖

```bash
# paths listed in .dockerignore should not appear
docker build -t rean-hello:1.0 . 2>&1 | head -n 5
# or: docker build --no-cache -t rean-hello:ctx . && docker run --rm rean-hello:1.0 ls -la /app
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Image build ដោយគ្មាន error
- [ ] `/` ត្រឡប់ JSON
- [ ] `/health` ត្រឡប់ `{"status":"ok"}`
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី `package.json` / `package-lock.json` ត្រូវ copy មុន source
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី lab នេះមាន `.dockerignore` (អ្វីដែលវារក្សាចេញពី context)

## បន្ទាប់

ទៅ **Lab 04 — Environment, secrets និង config** មុន Compose។ អ្នកនឹងផ្ទេរ config ពេល run ហើយមើលថាហេតុអ្វី secrets មិនត្រូវនៅក្នុង image layers។
