#!/bin/sh
# Aplica migraciones pendientes y arranca el servidor.
set -e
if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  echo "Aplicando migraciones…"
  ./node_modules/.bin/prisma migrate deploy
fi
exec "$@"
