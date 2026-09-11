# syntax=docker/dockerfile:1

# Pin Node on the slim (CRITICAL-gated) image. Dockerfile.fat stays on a floating tag
# as the contrast anti-pattern. Refresh with:
#   docker buildx imagetools inspect node:22-alpine --format '{{json .Manifest}}'
# ---- build stage: TypeScript compiler + full node_modules ----
FROM node:26-alpine@sha256:ef24c5053d50fdc3e4e56eb4e7ddb7861874ab0fdc797046ba897581deb8e868 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY tsconfig.json server.ts ./
RUN npm run build

# ---- runtime: production deps + compiled JS only (no tsc, no npm) ----
FROM node:26-alpine@sha256:ef24c5053d50fdc3e4e56eb4e7ddb7861874ab0fdc797046ba897581deb8e868 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev \
 && rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/corepack
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
