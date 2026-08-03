# Lab 03 — Dockerfile ដំបូងរបស់អ្នក

## គោះល៊ែម

Build image ផ្ទាល់ខ្លួនសម្រាប់ Node/Express API តូចមួយ ហើយ run វា។

## ជំហាន

```bash
cd labs/03-dockerfile

# Build (the trailing dot is the build context)
docker build -t rean-hello:1.0 .

# Run
docker run --rm -p 3000:3000 --name lab03-api rean-hello:1.0
```

នៅ terminal ផ្សេងមួយរោះៗ

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

ពិត្តិត្តិ layersៗ

```bash
docker history rean-hello:1.0
```

## ការសាកល្បងs

1. ផ្លាស់ប្តូរសារក្នុង `server.js`, rebuild, rerun — សង្កេត layers ណាដែល rebuild។
2. រៀបចំ Dockerfile ឡើងវិញឱ្យ `COPY . .` *មុន* `npm install` ហើយ rebuild ពីរដងបន្ទាប់ពីកែ code តិច — មានអារម្មណ៍ "cache pain"។
3. បន្ថែម instruction `ENV PORT=3000` ហើយបញ្ជាក់ដោយ `docker inspect`។

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] Image build ដោយគ្មាន error
- [ ] `/` ត្រឡប់ JSON
- [ ] `/health` ត្រឡប់ `{"status":"ok"}`
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី `package.json` ត្រូវ copy មុន source
