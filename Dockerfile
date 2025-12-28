# ---------- deps ----------
FROM node:22-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# パッケージ管理ファイルをコピー
COPY package.json package-lock.json* ./
RUN npm ci

# Prisma Client を生成
COPY prisma ./prisma
RUN npx prisma generate

# ---------- builder ----------
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

COPY src ./src
COPY public ./public
COPY next.config.ts .
COPY tsconfig.json .
COPY package.json .
COPY prisma ./prisma

# Next.js のテレメトリを無効化
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- runner ----------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV LOG_OUTPUT=/logs/application.log

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# ログ保存用のディレクトリを作成し、所有者をnextjsに変更
# アプリ側でファイル出力を継続する場合に必要
RUN mkdir -p /logs && chown nextjs:nodejs /logs

# Next.js の出力トレースを活用して、イメージサイズを削減
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js は next build から standalone 出力によって作成
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
