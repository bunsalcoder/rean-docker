FROM node:22-alpine

WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json ./

RUN npm install --omit=dev

COPY server.js ./

EXPOSE 3000

USER node

CMD ["node", "server.js"]
