# Lab 03 — Dockerfile ដំបូងរបស់អ្នក

## កម្រិត

**ថ្នាក់ដើម។** សរសេរ និង build Dockerfile សាមញ្ញសម្រាប់ Node API។ Lab ក្រោយនឹងរឹតគំនិតដូចគ្នា។ កុំចាត់លំនាំ Lab 03 ថាជា production-ready។

## គោលដៅ

Build image ផ្ទាល់ខ្លួនសម្រាប់ Node/Express API តូចមួយ ហើយរត់វា។

Dockerfile នេះ **សាមញ្ញ** ដោយចេតនា។ `FROM` ប្រើ tag គ្មាន digest pin, គ្មាន healthcheck ហើយ npm នៅក្នុង image។ Lab ក្រោយរឹតគំនិតដូចគ្នា៖ Lab 08 ធ្វើ multi-stage និង user មិនមែន root, Lab 09 ធ្វើ healthcheck, filesystem អានបានតែ និង digest pin, Lab 11 ធ្វើ secret និងការស្កេន។ កុំ copy លំនាំ Lab 03 ទៅ production ដោយមិនកែ។

**ជំនួយស្រេចចិត្ត៖** `./run.sh` build, រត់ និង curl `/` ជាមួយ `/health`។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

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

> **លទ្ធផលដែលរំពឹងទុក:** `/` ត្រឡប់ JSON ដែលជាសារសួស្តី។ `/health` ត្រឡប់ `{"status":"ok"}`។

> **កំហុសទូទៅ:** `failed to solve: failed to read dockerfile` មានន័យថាអ្នកមិននៅក្នុង `labs/03-dockerfile` ឬភ្លេច `.` នៅចុង build context។ `cd` ចូលថត lab រួចរត់ `docker build -t rean-hello:1.0 .` ម្ដងទៀត។

ពិនិត្យ layer៖

```bash
docker history rean-hello:1.0
```

## ការសាកល្បង

1. ប្ដូរសារក្នុង `server.js` រួច rebuild និង rerun។ សង្កេតថា layer ណាខ្លះ rebuild។
2. រៀប Dockerfile ឡើងវិញឱ្យ `COPY . .` *មុន* `npm ci` ហើយ rebuild ពីរដងបន្ទាប់ពីកែ code តិច។ អ្នកនឹងឃើញ cache បែក ហើយ build យឺតឡើងវិញ។ ឯកសារពិតប្រើ `npm ci` ដែលត្រូវការ `package-lock.json` ហើយគួរប្រើជាង `npm install` ក្នុង Dockerfile។
3. បន្ថែម instruction `ENV PORT=3000` ហើយបញ្ជាក់ដោយ `docker inspect`។
4. បើក `.dockerignore` ក្នុងថតនេះ។ វារក្សា `node_modules`, `.env` និង `*.md` ចេញពី build context។ ពន្យល់ខ្លីថាហេតុអ្វីមិនគួរដឹក `node_modules` ពី host ចូល image រួចបញ្ជាក់ថា path ទាំងនោះមិននៅក្នុង context៖

```bash
# paths listed in .dockerignore should not appear
docker build -t rean-hello:1.0 . 2>&1 | head -n 5
# or: docker build --no-cache -t rean-hello:ctx . && docker run --rm rean-hello:1.0 ls -la /app
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Image build ដោយគ្មាន error
- [ ] `/` ត្រឡប់ JSON
- [ ] `/health` ត្រឡប់ `{"status":"ok"}`
- [ ] អ្នកអាចពន្យល់ថាហេតុអ្វី `package.json` និង `package-lock.json` ត្រូវ copy មុន source
- [ ] អ្នកអាចពន្យល់ថាហេតុអ្វី lab នេះមាន `.dockerignore` និងអ្វីដែលវារក្សាចេញពី context

## បន្ទាប់

ទៅ **Lab 04 — Environment, secrets និង config** មុន Compose។ អ្នកនឹងផ្ញើ config ពេលរត់ ហើយឃើញថាហេតុអ្វី secret មិនត្រូវនៅក្នុង layer របស់ image។
