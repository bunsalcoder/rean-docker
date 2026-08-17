# Lab 03 — Your first Dockerfile

## Goal

Build a custom image for a tiny Node/Express API and run it.

## Steps

```bash
cd labs/03-dockerfile

# Build (the trailing dot is the build context)
docker build -t rean-hello:1.0 .

# Run
docker run --rm -p 3000:3000 --name lab03-api rean-hello:1.0
```

In another terminal:

```bash
curl http://127.0.0.1:3000/
curl http://127.0.0.1:3000/health
```

Inspect layers:

```bash
docker history rean-hello:1.0
```

## Experiments

1. Change the message in `server.js`, rebuild, rerun — notice which layers rebuild.
2. Reorder the Dockerfile to `COPY . .` *before* `npm ci` and rebuild twice after tiny code edits — feel the cache pain. (The real file uses `npm ci`, which needs `package-lock.json` and is what you should prefer over `npm install` in Dockerfiles.)
3. Add an `ENV PORT=3000` instruction and confirm with `docker inspect`.

## Success criteria

- [ ] Image builds without errors
- [ ] `/` returns JSON
- [ ] `/health` returns `{"status":"ok"}`
- [ ] You can explain why `package.json` / `package-lock.json` are copied before source

## Next

Go to **Lab 04 — Environment, secrets, and config** before Compose. You will pass config at runtime and see why secrets must not live in image layers.
