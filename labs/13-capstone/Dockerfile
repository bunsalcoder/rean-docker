# Pin Node 22 + Alpine by digest (Chapter 15). Tags move; this digest is the bits we mean.
# Refresh with: docker buildx imagetools inspect node:22-alpine --format '{{json .Manifest}}'
FROM node:25-alpine@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4

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
