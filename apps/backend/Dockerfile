FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/shared/package.json apps/shared/package.json

RUN pnpm install

COPY apps/backend apps/backend
COPY apps/shared apps/shared

RUN pnpm install

RUN pnpm --filter @booking/shared build && pnpm --filter backend build

FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@10

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/migrations ./apps/backend/migrations
COPY --from=builder /app/apps/shared/dist ./apps/shared/dist
COPY --from=builder /app/apps/shared/package.json ./apps/shared/package.json

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["sh", "-c", "node dist/migrate.js && node dist/index.js"]

