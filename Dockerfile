# syntax=docker/dockerfile:1.7
# Imagen de producción: Next.js standalone + Prisma + sharp.
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Dependencias completas para compilar.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npx prisma generate

# Solo dependencias de producción (incluye la CLI de Prisma y sus motores para `migrate deploy`).
FROM base AS proddeps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate && npm cache clean --force

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma valida DATABASE_URL al instanciar el cliente mientras Next recopila las rutas;
# esta URL de relleno nunca se usa para conectar (todas las páginas son dinámicas).
ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm run build && npm run build:scripts

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOADS_DIR=/data/uploads
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data/uploads && chown -R app:app /data
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=proddeps --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=build --chown=app:app /app/prisma/migrations ./prisma/migrations
COPY --from=build --chown=app:app /app/prisma/demo ./prisma/demo
# Seed y reinicio de contraseña compilados a JS (sin tsx en producción).
COPY --from=build --chown=app:app /app/dist/scripts ./dist/scripts
COPY --from=build --chown=app:app /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh
USER app
EXPOSE 3000
VOLUME ["/data/uploads"]
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
