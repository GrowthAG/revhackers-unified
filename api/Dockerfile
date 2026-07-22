# syntax=docker/dockerfile:1.7
# Build context: repository root
#   docker build -f api/Dockerfile -t revhackers-api:local .

FROM node:22-bookworm-slim AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
RUN npm ci

COPY api ./api
RUN npm run build:api

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    APP_ENV=production \
    PORT=8080
WORKDIR /app

COPY --from=build --chown=node:node /workspace/api/package.json ./package.json
COPY --from=build --chown=node:node /workspace/api/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
