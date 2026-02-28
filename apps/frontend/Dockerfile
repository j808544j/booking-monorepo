FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE=http://localhost:4000/api
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm install -g pnpm@10

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/frontend/package.json apps/frontend/package.json
COPY apps/shared/package.json apps/shared/package.json

RUN pnpm install

COPY apps/frontend apps/frontend
COPY apps/shared apps/shared

RUN pnpm install

RUN pnpm --filter @booking/shared build && pnpm --filter frontend build

FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g serve

ENV NODE_ENV=production

COPY --from=builder /app/apps/frontend/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]

