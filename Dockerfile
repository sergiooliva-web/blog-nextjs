# ============================================================
# 1️⃣ СТАДИЯ: БИЛД (установка зависимостей)
# ============================================================
FROM node:20-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false

# ============================================================
# 2️⃣ СТАДИЯ: БИЛД (сборка приложения)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================
# 3️⃣ СТАДИЯ: ПРОДАКШЕН (запуск приложения)
# ============================================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache sqlite

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY ./src/database/migrations /app/migrations
COPY ./src/database/migrate.sh /app/migrate.sh
RUN chmod +x /app/migrate.sh

RUN mkdir -p /app/data

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=4040

# Открываем порт
EXPOSE 4040

# Запускаем приложение
CMD ["sh", "-c", "/app/migrate.sh && node server.js"]