#!/bin/sh
# Aplica migraciones pendientes y arranca el servidor.
set -e
if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  echo "Aplicando migraciones…"
  node ./node_modules/prisma/build/index.js migrate deploy
fi
exec "$@"
