FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# ── deps: install all workspace dependencies ──────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/db/package.json    ./packages/db/
COPY packages/wa/package.json    ./packages/wa/
COPY apps/api/package.json       ./apps/api/
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── builder: compile packages + API ──────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
RUN pnpm --filter @gayatri/types build
RUN pnpm --filter @gayatri/db generate
RUN pnpm --filter @gayatri/api build

# ── runner: minimal production image ─────────────────────────────────────────
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY --from=builder /app/package.json          ./
COPY --from=builder /app/pnpm-workspace.yaml   ./
COPY --from=builder /app/node_modules          ./node_modules

COPY --from=builder /app/apps/api/dist         ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

COPY --from=builder /app/packages/types/dist        ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/
COPY --from=builder /app/packages/db                ./packages/db
COPY --from=builder /app/packages/wa/dist           ./packages/wa/dist
COPY --from=builder /app/packages/wa/package.json   ./packages/wa/

# WA session dir — mount a Railway Volume here to persist between deploys
RUN mkdir -p /app/.wa-session-api

COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE ${PORT:-4010}
ENTRYPOINT ["./docker-entrypoint.sh"]
