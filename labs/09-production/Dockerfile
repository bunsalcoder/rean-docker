# Pin Node 22 + Alpine by digest (Chapter 15). Tags move; this digest is the bits we mean.
# Refresh with: docker buildx imagetools inspect node:22-alpine --format '{{json .Manifest}}'
FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32

WORKDIR /app

# Config, not a secret (Lab 04 / Lab 11). Set here so `docker run` matches Compose.
ENV NODE_ENV=production

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

# Alpine Node images often have no wget/curl. Use the same Node runtime as the app.
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node
EXPOSE 3000
CMD ["node", "server.js"]
