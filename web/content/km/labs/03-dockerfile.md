# Lab 03 — Dockerfile ដំបូងរបស់អ្នក

## គោលដៅ

Build image ផ្ទាល់ខ្លួនសម្រាប់ Node/Express API តូចមួយ ហើយ run វា។

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

## លក្ខខណ្ឌជោគជ័យ

- [ ] Image build ដោយគ្មាន error
- [ ] `/` ត្រឡប់ JSON
- [ ] `/health` ត្រឡប់ `{"status":"ok"}`
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី `package.json` / `package-lock.json` ត្រូវ copy មុន source

## បន្ទាប់

ទៅ **Lab 04 — Environment, secrets និង config** មុន Compose។ អ្នកនឹងផ្ទេរ config ពេល run ហើយមើលថាហេតុអ្វី secrets មិនត្រូវនៅក្នុង image layers។
