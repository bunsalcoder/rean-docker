# Pin Node 22 + Alpine by digest (Chapter 15). Tags move; this digest is the bits we mean.
# Refresh with: docker buildx imagetools inspect node:22-alpine --format '{{json .Manifest}}'
FROM node:26-alpine@sha256:2d984a15c9b54fd0aeb608b8e0d0d83529eb34d2966db27a1fb4f1edc3d298a3

WORKDIR /app

COPY package.json package-lock.json ./
# Install app deps, then drop the base image's npm/corepack (CVE surface we do not need at runtime).
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
