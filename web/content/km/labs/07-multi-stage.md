# Lab 07 — Multi-stage builds

## គោះល៊ែម

ប្រៀបធៀប image single-stage ធំ ជាមួយ multi-stage production image។

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

## អ្វីដំលែរសំអ្រកេត

- `COPY --from=build` យកតែ `dist/` មិនមែន build leftovers ដែលអ្នកមិនត្រូវការ។
- Runtime stage install **production** deps តែប៉ុណ្ណោះ (`--omit=dev`)។
- Image size និង layer history ខុសគ្នារវាង `:fat` និង `:slim`។

## លក្ខខ្ណ្ឌជោគជៀយ

- [ ] Images ទាំងពីរ build ហើយ slim image serve `/`
- [ ] អ្នកអាចពន្យល់ហេតុអ្វី multi-stage បង្កើន security និងបន្ថយ size
