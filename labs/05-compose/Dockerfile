# Pin Node for the CRITICAL-gated API image (same digest as Labs 08 slim / 09 / 12 / 13).
# Compose still uses floating postgres/redis tags — Capstone / Chapter 15 pin those.
# Refresh with: docker buildx imagetools inspect node:22-alpine --format '{{json .Manifest}}'
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev \
  && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm \
            /usr/local/lib/node_modules/corepack \
            /usr/local/bin/npm \
            /usr/local/bin/npx \
            /usr/local/bin/corepack

COPY server.js ./

EXPOSE 3000
USER node
CMD ["node", "server.js"]
