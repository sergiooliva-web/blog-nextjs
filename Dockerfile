# ============================================================
# 1️⃣ СТАДИЯ: БИЛД (сборка приложения)
# ============================================================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production=false

# Копируем исходный код
COPY . .

# Собираем Next.js приложение
RUN npm run build

# ============================================================
# 2️⃣ СТАДИЯ: ПРОДАКШЕН (запуск приложения)
# ============================================================
FROM node:20-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только необходимые файлы из стадии билда
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/node_modules ./node_modules

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=4040

# Открываем порт
EXPOSE 4040

# Запускаем приложение
CMD ["npm", "start"]