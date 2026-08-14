# Pin Node 22 + Alpine — not :latest. Image digests are Chapter 15.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./

# Alpine Node images often have no wget/curl. Use the same Node runtime as the app.
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

USER node
EXPOSE 3000
CMD ["node", "server.js"]
