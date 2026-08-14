# Lab 07 — Multi-stage builds

## គោលដៅ

ប្រៀបធៀប image single-stage ធំ (compiler + source + app) ជាមួយ multi-stage image ដែលដឹកតែ JavaScript ដែល compile រួច និង production dependencies។

Lab នេះ compile TypeScript ដោយចេតនា ដើម្បីឱ្យគម្លាតទំហំច្បាស់។ `typescript` គឺ **devDependency** — slim image មិនត្រូវមាន `tsc`។

## ជំហាន

```bash
cd labs/07-multi-stage

docker build -t rean-multi:fat -f Dockerfile.fat .
docker build -t rean-multi:slim .

docker images 'rean-multi*'
docker history rean-multi:slim
docker history rean-multi:fat

docker run --rm -p 3001:3000 rean-multi:slim
# curl http://localhost:3001/
```

`:fat` គួរធំជាងច្បាស់ (រាប់សិប MB)។ ទម្ងន់បន្ថែមនោះគឺ TypeScript compiler និង type packages នៅក្នុង image ចុងក្រោយ។

## អ្វីដែលត្រូវសង្កេត

- `COPY --from=build` យកតែ `dist/` មិនមែន `server.ts` ឬ `tsc`។
- Runtime stage install **production** deps តែប៉ុណ្ណោះ (`--omit=dev`)។
- Image size និង layer history ខុសគ្នារវាង `:fat` និង `:slim`។

## លក្ខខណ្ឌជោគជ័យ

- [ ] Images ទាំងពីរ build ហើយ slim image serve `/`
- [ ] `docker images` បង្ហាញ `:fat` ធំជាង `:slim` គួរឱ្យកត់សម្គាល់
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី multi-stage បង្កើន security និងបន្ថយ size
