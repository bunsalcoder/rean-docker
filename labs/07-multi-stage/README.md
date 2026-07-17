# Lab 07 — Multi-stage builds

## Goal

Compare a fat single-stage image with a multi-stage production image.

## Steps

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

## What to observe

- `COPY --from=build` brings only `dist/`, not build leftovers you do not need.
- Runtime stage installs **production** deps only (`--omit=dev`).
- Image size and layer history differ between `:fat` and `:slim`.

## Success criteria

- [ ] Both images build and the slim image serves `/`
- [ ] You can explain why multi-stage improves security and size
