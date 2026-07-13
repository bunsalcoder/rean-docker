# Lab 02 — Your first Dockerfile

## Goal

Build a custom image for a tiny Node/Express API and run it.

## Steps

```bash
cd labs/02-dockerfile

# Build (the trailing dot is the build context)
docker build -t rean-hello:1.0 .

# Run
docker run --rm -p 3000:3000 --name lab02-api rean-hello:1.0
```

In another terminal:

```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```

Inspect layers:

```bash
docker history rean-hello:1.0
```

## Experiments

1. Change the message in `server.js`, rebuild, rerun — notice which layers rebuild.
2. Reorder Dockerfile to `COPY . .` *before* `npm install` and rebuild twice after tiny code edits — feel the cache pain.
3. Add an `ENV PORT=3000` instruction and confirm with `docker inspect`.

## Success criteria

- [ ] Image builds without errors
- [ ] `/` returns JSON
- [ ] `/health` returns `{"status":"ok"}`
- [ ] You can explain why `package.json` is copied before source
