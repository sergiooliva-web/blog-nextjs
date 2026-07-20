# ============================================================
# 1 СТАДИЯ: ЗАВИСИМОСТИ И PRISMA
# ============================================================
FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/ 

RUN npm ci

# ============================================================
# 2 СТАДИЯ: СБОРКА ПРИЛОЖЕНИЯ
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

RUN npm run build

# ============================================================
# 3 СТАДИЯ: ПРОДАКШЕН (запуск приложения)
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install prisma --no-save

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/.next/server ./.next/server

ENV NODE_ENV=production
ENV PORT=4040

EXPOSE 4040

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]