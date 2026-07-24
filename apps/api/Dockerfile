FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/worker/package.json ./apps/worker/

RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# Generate Prisma Client
FROM deps AS prisma
COPY prisma ./prisma
RUN cat /app/prisma/schema.prisma && cd packages/database && pnpm prisma generate --schema=../../prisma/schema.prisma

# Build the application
FROM deps AS builder
WORKDIR /app
COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/packages/database/node_modules ./packages/database/node_modules
COPY . .

RUN pnpm build:api

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/api ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]