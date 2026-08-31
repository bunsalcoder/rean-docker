# Lab 08 — Multi-stage builds

## គោលដៅ

ប្រៀបធៀប image single-stage ធំ (compiler + source + app) ជាមួយ multi-stage image ដែលដឹកតែ JavaScript ដែល compile រួច និង production dependencies។

Lab នេះ compile TypeScript ដោយចេតនា ដើម្បីឱ្យគម្លាតទំហំច្បាស់។ `typescript` គឺ **devDependency** — slim image មិនត្រូវមាន `tsc`។

**Optional helper:** `./run.sh` build `:fat` និង `:slim`, assert size/USER, រួច curl slim image។ ចូលចិត្តវាយពាក្យបញ្ជាពី README ដោយខ្លួនឯងលើកដំបូង។

## ជំហាន

```bash
cd labs/08-multi-stage

docker build -t rean-multi:fat -f Dockerfile.fat .
docker build -t rean-multi:slim .

docker images 'rean-multi*'
docker history rean-multi:slim
docker history rean-multi:fat

docker run --rm -p 3001:3000 rean-multi:slim
# curl http://127.0.0.1:3001/
```

`:fat` គួរធំជាងច្បាស់ (រាប់សិប MB)។ ទម្ងន់បន្ថែមនោះគឺ TypeScript compiler និង type packages នៅក្នុង image ចុងក្រោយ។

## អ្វីដែលត្រូវសង្កេត

- `COPY --from=build` យកតែ `dist/` មិនមែន `server.ts` ឬ `tsc`។
- Runtime stage install **production** deps តែប៉ុណ្ណោះ (`--omit=dev`)។
- `RUN --mount=type=cache,target=/root/.npm` រក្សា cache download npm រវាង builds ដោយមិន copy វាចូល layer (BuildKit; ជំពូក 16)។
- Image size និង layer history ខុសគ្នារវាង `:fat` និង `:slim`។
- `:slim` run ជា `USER node`។ `:fat` នៅតែ run ជា root — តូចជាងមិនមែនជាជ័យជម្នះតែមួយ។

```bash
docker run --rm --entrypoint whoami rean-multi:slim
docker run --rm --entrypoint whoami rean-multi:fat
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Images ទាំងពីរ build ហើយ slim image serve `/`
- [ ] `docker images` បង្ហាញ `:fat` ធំជាង `:slim` គួរឱ្យកត់សម្គាល់
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី multi-stage បង្កើន security និងបន្ថយ size

## បន្ទាប់

ទៅ **Lab 09 — Container តាមទម្លាប់ production** សម្រាប់ healthchecks, limits និង read-only rootfs។
