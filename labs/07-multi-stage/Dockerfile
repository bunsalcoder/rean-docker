# syntax=docker/dockerfile:1

# ---- build stage: TypeScript compiler + full node_modules ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json server.ts ./
RUN npm run build

# ---- runtime: production deps + compiled JS only (no tsc) ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
