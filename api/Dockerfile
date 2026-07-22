# syntax=docker/dockerfile:1.7
# Build context: repository root
#   docker build -f api/Dockerfile -t revhackers-api:local .

FROM node:22-bookworm-slim AS build
WORKDIR /workspace

# Toolchain TypeScript do repositório (build only).
COPY package.json package-lock.json ./
RUN npm ci

# Dependências isoladas da API (pg + Cloud SQL Connector e tipos de build).
COPY api/package.json api/package-lock.json ./api/
RUN npm ci --prefix api

COPY api/tsconfig.json api/tsconfig.build.json ./api/
COPY api/src ./api/src
RUN npm run build:api
RUN npm prune --omit=dev --prefix api

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    APP_ENV=production \
    PORT=8080
WORKDIR /app

COPY --from=build --chown=node:node /workspace/api/package.json ./package.json
COPY --from=build --chown=node:node /workspace/api/node_modules ./node_modules
COPY --from=build --chown=node:node /workspace/api/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
