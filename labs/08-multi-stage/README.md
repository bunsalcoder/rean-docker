# Lab 08 — Multi-stage builds

## Goal

Compare a fat single-stage image (compiler + source + app) with a multi-stage image that ships only compiled JavaScript and production dependencies.

This lab compiles TypeScript on purpose so the size gap is obvious. `typescript` is a **devDependency** — the slim image must not contain `tsc`.

## Steps

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

`:fat` should be clearly larger (tens of MB). That extra weight is the TypeScript compiler and type packages left in the final image.

## What to observe

- `COPY --from=build` brings only `dist/`, not `server.ts` or `tsc`.
- Runtime stage installs **production** deps only (`--omit=dev`).
- Image size and layer history differ between `:fat` and `:slim`.
- `:slim` runs as `USER node`. `:fat` still runs as root — smaller is not the only win.

```bash
docker run --rm --entrypoint whoami rean-multi:slim
docker run --rm --entrypoint whoami rean-multi:fat
```

## Success criteria

- [ ] Both images build and the slim image serves `/`
- [ ] `docker images` shows `:fat` substantially larger than `:slim`
- [ ] You can explain why multi-stage improves security and size

## Next

Go to **Lab 09 — Production-minded container** for healthchecks, limits, and a read-only rootfs.
