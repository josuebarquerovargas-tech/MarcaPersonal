# Rubén Rodríguez · plataforma de marca personal (demo)

Sitio público y panel administrativo para un creador de contenido: videos propios y embebidos,
membresía con pasarela de pago **simulada**, galería, tema claro/oscuro y textos editables.

> Es una demostración: los pagos no son reales y el video se sirve desde el disco del servidor.
> La pasarela (`FakeGateway`) y el almacenamiento (`DiskStorage`) están detrás de interfaces
> pensadas para reemplazarse por servicios reales (ONVO Pay / Tilopay, Cloudflare Stream / R2).

## Stack

Next.js 15 (App Router, Server Actions) · React 19 · TypeScript · Tailwind CSS 4 · Motion ·
Prisma 6 · PostgreSQL 16 · Vitest · Playwright.

## Requisitos

- Node 24 y npm 11
- Docker (para PostgreSQL en desarrollo)

## Puesta en marcha

```bash
cp .env.example .env          # ajustá SESSION_SECRET, ADMIN_EMAIL y ADMIN_PASSWORD
npm install                   # también genera el cliente de Prisma
npm run db:up                 # PostgreSQL en Docker (puerto 5432)
npm run db:migrate            # aplica migraciones
npm run db:seed               # admin, planes y contenido de demostración
npm run dev                   # http://localhost:3000
```

Variables de entorno (ver `.env.example`):

| Variable               | Uso                                                          |
| ---------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`         | Conexión a PostgreSQL                                        |
| `SESSION_SECRET`       | Firma de las cookies de sesión (mínimo 32 caracteres)        |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del administrador que crea el seed    |
| `UPLOADS_DIR`          | Carpeta de videos, miniaturas y fotos (`./data/uploads`). En producción usá una ruta absoluta: el servidor standalone cambia el directorio de trabajo |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadatos, sitemap)                             |
| `SEED_DEMO`            | `false` para sembrar solo admin y planes, sin contenido demo |
| `TRUST_PROXY`          | `true` solo detrás de un proxy que fije `X-Forwarded-For`; si no, el límite de intentos de login usa un único cubo global |

## Credenciales de la demo

| Rol           | Correo                   | Contraseña     |
| ------------- | ------------------------ | -------------- |
| Administrador | el de `ADMIN_EMAIL`      | `ADMIN_PASSWORD` |
| Miembro       | `miembro@demo.cr`        | `Miembro1234!` |

Panel: `/admin`. Cuenta de miembro: `/cuenta`.

### Pasarela simulada

En `/pago` no se realiza ningún cobro. El resultado se decide por reglas visibles:

| Tarjeta termina en | Resultado            |
| ------------------ | -------------------- |
| `4242`             | Aprobada             |
| `0002`             | Rechazada            |
| `9995`             | Fondos insuficientes |
| otra válida (Luhn) | Aprobada             |

SINPE Móvil: un número terminado en `0000` se rechaza; el resto se aprueba.

## Scripts

| Comando                          | Qué hace                                             |
| -------------------------------- | ---------------------------------------------------- |
| `npm run dev` / `build` / `start`| Desarrollo, compilación y servidor de producción     |
| `npm test`                       | Pruebas unitarias (Vitest)                            |
| `npm run test:e2e`               | Pruebas end-to-end (Playwright; reinicia la base local) |
| `npm run lint`                   | ESLint                                               |
| `npm run db:up` / `db:migrate` / `db:seed` | Base de datos local                        |
| `npm run admin:reset-password -- <correo> <clave>` | Restablece la contraseña del admin y cierra sus sesiones |

## Estructura

```
prisma/            esquema, migraciones, seed y clips de demostración
src/app/(site)     sitio público (portada, videos, membresía, pago, cuenta, galería…)
src/app/admin      panel (resumen, videos, blog, miembros, pagos, contenido, galería, ajustes)
src/app/api        subida por partes y stream de video con control de acceso
src/components     ui/ (base), site/ (público), admin/ (panel)
src/lib            lógica pura y probada: auth, storage, uploads, videos, payments, membership, content
src/server         acceso a datos y Server Actions
tests/unit         Vitest · tests/e2e Playwright
```

## Cómo funciona

- **Sesiones**: dos cookies JWT independientes (`rr_admin`, `rr_member`) con `sessionVersion`
  para invalidar sesiones al cambiar la contraseña o suspender una cuenta. `middleware.ts`
  protege `/admin`, `/cuenta` y `/pago`.
- **Videos propios**: se suben por partes de 5 MB (`/api/uploads/*`), se ensamblan en
  `UPLOADS_DIR/videos` y se sirven por `/api/stream/:id` con soporte de `Range`; los
  exclusivos exigen membresía activa. La miniatura se captura en el navegador.
- **Videos por enlace**: TikTok, Instagram y YouTube se embeben bajo demanda; TikTok y
  YouTube obtienen miniatura automática.
- **Membresía**: planes en la tabla `Plan`; una suscripción cancelada conserva el acceso
  hasta `currentPeriodEnd`. Todo formulario que crea registros usa un token de un solo uso.
- **Contenido**: los textos del sitio viven en `SiteContent` con valores por defecto en
  `src/lib/content/defaults.ts` y se editan en `/admin/contenido`.

## Reemplazar las simulaciones

- **Pagos**: implementá `PaymentGateway` (`src/lib/payments/gateway.ts`) con el proveedor real
  y exportalo desde `fake-gateway.ts` (o cambiá el import en `src/server/actions/checkout.ts`).
- **Almacenamiento**: implementá `Storage` (`src/lib/storage/storage.ts`) para S3/R2 y
  cambiá la instancia exportada. Para video a escala, sustituí `/api/stream` por URLs firmadas
  de un servicio de streaming.

## Despliegue con Docker

```bash
export SESSION_SECRET="una-clave-larga-de-al-menos-32-caracteres"
export POSTGRES_PASSWORD="otra-clave"
export NEXT_PUBLIC_SITE_URL="https://tu-dominio.com"
docker compose -f docker-compose.prod.yml up -d --build
# primera vez: crear el administrador y los planes
docker compose -f docker-compose.prod.yml exec -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... -e SEED_DEMO=false app \
  node node_modules/tsx/dist/cli.mjs prisma/seed.ts
```

El contenedor aplica las migraciones al arrancar y guarda los archivos en el volumen
`uploads` (`/data/uploads`). Detrás de un proxy, pasá `X-Forwarded-For` y definí `TRUST_PROXY=true`
para que el límite de intentos de login funcione por IP. Sin eso, todos los intentos comparten un
solo contador: 5 fallos bloquean el ingreso de todos durante 15 minutos. Permití en el proxy cuerpos
de hasta 100 MB (subida de fotos).
