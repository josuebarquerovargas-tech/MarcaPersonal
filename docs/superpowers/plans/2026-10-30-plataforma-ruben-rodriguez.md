# Plataforma de marca personal de Rubén Rodríguez — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir una plataforma de creador de contenido (sitio público animado con tema claro/oscuro, videos propios y embebidos, membresía con pasarela simulada, panel administrativo) para Rubén Rodríguez, como demo funcional.

**Architecture:** Next.js 15 App Router con Server Components para lectura y Server Actions para escritura; Prisma sobre PostgreSQL; archivos en disco servidos por rutas propias con control de acceso; dos sesiones JWT independientes (admin y miembro) verificadas en `middleware.ts`; pasarela de pago detrás de una interfaz con implementación falsa.

**Tech Stack:** Next.js 15.x, React 19, TypeScript 5, Tailwind CSS 4, Motion 12, Prisma 6, PostgreSQL 16 (Docker), Zod 3, bcryptjs, jose, sharp, @dnd-kit, Vitest 3, Playwright 1.5x.

**Spec:** `docs/superpowers/specs/2026-10-30-sitio-marca-personal-design.md`

## Global Constraints

- Node 24, npm 11. Sin dependencias de pago. Sin servicios externos salvo PostgreSQL.
- Idioma de toda interfaz, mensajes y commits de copy: español de Costa Rica. Código y nombres de símbolos en inglés.
- Tokens de color del spec 5.1: claro fondo `#FAFAF7` tinta `#111111`; oscuro fondo `#0C0C0B` texto `#ECEAE4`; acento `#C8782A` (claro) / `#E09A4B` (oscuro). Un solo acento.
- Animaciones: revelado 500 ms ease-out con 16 px de desplazamiento; transición de tema 200 ms; todo desactivado con `prefers-reduced-motion`.
- Formularios que crean registros: botón deshabilitado mientras envía (`useActionState` pending) y token de un solo uso verificado en el servidor (`FormToken`).
- Validación Zod en cliente y servidor. Nunca se guardan números de tarjeta: solo `cardLast4`.
- Límites: video 500 MB (MP4/WebM/MOV), imagen 8 MB (JPEG/PNG/WebP → WebP). Chunk de subida 5 MB.
- Rate limit admin login: 5 fallos por IP en 15 minutos bloquean 15 minutos.
- Sesiones: cookies `rr_admin` y `rr_member`, httpOnly, sameSite lax, secure en producción, 7 días, JWT HS256 firmado con `SESSION_SECRET`, con `sessionVersion` para invalidar al cambiar contraseña.
- Textos por defecto: solo hechos de la sección 2 del spec. Nada del sitio viejo. Aviso en checkout: "Modo demostración: no se realizan cobros reales."
- Móvil desde 360 px sin scroll horizontal. Contraste AA en ambos temas.
- Commits pequeños en la rama `claude/plataforma-ruben` con mensaje en inglés convencional y la línea `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus

1. Un visitante sin sesión pide `/api/stream/<id>` de un video `MEMBERS` directamente: debe recibir 403, no el archivo. (Test en Tarea 9.)
2. Una petición `Range` fuera de tamaño (`bytes=999999999-`) al stream: debe responder 416, no 500. (Test en Tarea 3.)
3. Subida de video interrumpida: `complete` con chunks faltantes debe fallar con 400 y no ensamblar un archivo corrupto. (Test en Tarea 8.)
4. Doble clic en "Pagar": solo un `Payment` y una `Subscription`. (Test en Tarea 12.)
5. Miembro con suscripción `CANCELED` pero `currentPeriodEnd` futuro: sigue viendo exclusivos hasta esa fecha; con fecha pasada, no. (Test en Tarea 10.)

---

## Estructura de archivos

```
prisma/schema.prisma, prisma/seed.ts, prisma/migrations/
docker-compose.yml, Dockerfile, .env.example, README.md
src/middleware.ts                      — protege /admin y /cuenta
src/app/(site)/                        — layout público, page.tsx, videos/, membresia/, pago/, registro/, ingresar/, cuenta/, sobre-mi/, galeria/, contacto/
src/app/admin/                         — login/, layout.tsx, page.tsx (resumen), videos/, miembros/, pagos/, contenido/, galeria/, ajustes/
src/app/api/uploads/                   — init, [id]/chunk, [id]/complete
src/app/api/stream/[videoId]/route.ts  — video con Range y control de acceso
src/app/media/[...path]/route.ts       — imágenes públicas
src/app/sitemap.ts, robots.ts
src/components/ui/                     — Button, Input, Field, Badge, Dialog, ThemeToggle, Reveal, Container
src/components/site/                   — Nav, Hero, VideoCard, VideoGrid, Player, LockedPlayer, Footer, Lightbox, CheckoutForm
src/components/admin/                  — Sidebar, DataTable, VideoUploader, SortableList, StatCard
src/lib/theme.ts                       — resolveTheme, script inline
src/lib/auth/password.ts, session.ts, rate-limit.ts
src/lib/storage/storage.ts, disk.ts, range.ts
src/lib/uploads/chunks.ts
src/lib/videos/slug.ts, embed.ts, access.ts
src/lib/payments/gateway.ts, fake-gateway.ts, luhn.ts
src/lib/membership/subscription.ts
src/lib/content/keys.ts, defaults.ts, repo.ts
src/lib/form-token.ts
src/server/db.ts                       — PrismaClient singleton
src/server/actions/*.ts                — Server Actions por dominio
tests/unit/**                          — Vitest
tests/e2e/**                           — Playwright
scripts/reset-admin-password.ts
```

---

### Task 1: Scaffold, base de datos y esquema

**Files:**
- Create: proyecto con `create-next-app`, `docker-compose.yml`, `.env.example`, `prisma/schema.prisma`, `prisma/seed.ts`, `src/server/db.ts`, `vitest.config.ts`, `tests/unit/smoke.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `prisma` client con los modelos del spec §7 más `sessionVersion Int @default(0)` en `AdminUser` y `Member`; `db` singleton en `src/server/db.ts`; scripts `db:up`, `db:migrate`, `db:seed`, `test`, `test:e2e`.

- [ ] **Step 1: Crear el proyecto**

Run (en la carpeta del proyecto, vacía salvo `docs/`):
```bash
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
git init && git checkout -b claude/plataforma-ruben
npm i prisma@6 @prisma/client@6 zod bcryptjs jose sharp motion @dnd-kit/core @dnd-kit/sortable
npm i -D vitest @vitest/coverage-v8 @types/bcryptjs tsx @playwright/test
```

- [ ] **Step 2: docker-compose y entorno**

`docker-compose.yml`: servicio `db` imagen `postgres:16-alpine`, puerto `5432:5432`, `POSTGRES_USER=ruben`, `POSTGRES_PASSWORD=ruben`, `POSTGRES_DB=ruben`, volumen `pgdata`.
`.env.example`:
```
DATABASE_URL=postgresql://ruben:ruben@localhost:5432/ruben
SESSION_SECRET=cambia-esto-por-32-caracteres-o-mas
ADMIN_EMAIL=admin@rubenrodriguez.cr
ADMIN_PASSWORD=Admin1234!
UPLOADS_DIR=./data/uploads
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Copiar a `.env`. Añadir `data/` y `.env` a `.gitignore`.

- [ ] **Step 3: Esquema Prisma**

Escribir `prisma/schema.prisma` con los modelos de §7 del spec exactamente con estos nombres: `AdminUser`, `LoginAttempt`, `FormToken`, `Member`, `Plan`, `Subscription`, `Payment`, `Video`, `Photo`, `SiteContent`. Enums: `MemberStatus {ACTIVE SUSPENDED}`, `PlanCode {MONTHLY YEARLY}`, `SubscriptionStatus {ACTIVE CANCELED EXPIRED}`, `PaymentMethod {CARD SINPE}`, `PaymentStatus {APPROVED DECLINED INSUFFICIENT_FUNDS}`, `VideoKind {FILE EMBED}`, `Platform {TIKTOK INSTAGRAM YOUTUBE}`, `VideoAccess {FREE MEMBERS}`, `VideoStatus {DRAFT PUBLISHED}`. Ids `String @id @default(cuid())`. `SiteContent.value Json`. `Video.slug @unique`, `Video.sourceUrl String? @unique`.

- [ ] **Step 4: Scripts y migración**

`package.json` scripts: `"db:up": "docker compose up -d"`, `"db:migrate": "prisma migrate dev"`, `"db:seed": "tsx prisma/seed.ts"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`, `"admin:reset-password": "tsx scripts/reset-admin-password.ts"`. Añadir `"prisma": {"seed": "tsx prisma/seed.ts"}`.
Run: `npm run db:up && npx prisma migrate dev --name init`
Expected: migración creada en `prisma/migrations/`, cliente generado.

- [ ] **Step 5: Singleton y seed mínimo**

`src/server/db.ts`: `export const db: PrismaClient` con el patrón global para desarrollo.
`prisma/seed.ts`: crea el admin desde `ADMIN_EMAIL`/`ADMIN_PASSWORD` (hash con `hashPassword` de la Tarea 4; hasta entonces usar `bcryptjs.hash(p, 12)` directo) con `upsert` por email, y los dos planes: `MONTHLY` "Mensual" 4900, `YEARLY` "Anual" 49000.
Run: `npm run db:seed` → Expected: sin error; `npx prisma studio` muestra 1 admin y 2 planes (verificar con `psql` o un `findMany` rápido vía `tsx -e`).

- [ ] **Step 6: Vitest y prueba de humo**

`vitest.config.ts`: `environment: 'node'`, `include: ['tests/unit/**/*.test.ts']`, alias `@` → `src`.
`tests/unit/smoke.test.ts`: `expect(1 + 1).toBe(2)`.
Run: `npm test` → Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app, Prisma schema, docker-compose and vitest"
```

---

### Task 2: Sistema de diseño, tema claro/oscuro y animación

**Files:**
- Create: `src/lib/theme.ts`, `src/components/ui/ThemeToggle.tsx`, `src/components/ui/Reveal.tsx`, `src/components/ui/Button.tsx`, `src/components/ui/Container.tsx`, `src/components/ui/Badge.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Field.tsx`, `src/components/ui/Dialog.tsx`, `tests/unit/theme.test.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

**Interfaces:**
- Produces: `resolveTheme(stored: string | null, prefersDark: boolean): 'light' | 'dark'`; `THEME_INIT_SCRIPT: string` (se inyecta en `<head>` antes del CSS); `<ThemeToggle />` (cliente, escribe `localStorage.theme` y `document.documentElement.dataset.theme`); `<Reveal delay?: number>` (Motion `whileInView`, once, respeta reduced motion); `Button` con variantes `primary | secondary | ghost` y prop `pending` que deshabilita y muestra spinner; `Container` (max 1200 px, gutter 16 px móvil / 32 px desktop).

- [ ] **Step 1: Test de resolveTheme**

```ts
import { resolveTheme } from '@/lib/theme'
test('stored wins over system', () => expect(resolveTheme('dark', false)).toBe('dark'))
test('system when nothing stored', () => expect(resolveTheme(null, true)).toBe('dark'))
test('invalid stored falls back to system', () => expect(resolveTheme('blue', false)).toBe('light'))
```

- [ ] **Step 2: Ejecutar y ver fallar** — Run: `npm test` → FAIL "Cannot find module".

- [ ] **Step 3: Implementar `src/lib/theme.ts`** con `resolveTheme` y `THEME_INIT_SCRIPT` (IIFE que lee `localStorage.theme`, `matchMedia('(prefers-color-scheme: dark)')`, y pone `data-theme` en `<html>`; envuelto en try/catch).

- [ ] **Step 4: Tokens en `globals.css`**

Con Tailwind 4 `@theme inline`: definir `--color-bg`, `--color-ink`, `--color-muted`, `--color-line`, `--color-accent`, `--color-surface` como variables en `:root` (claro) y `:root[data-theme="dark"]` (oscuro) con los valores de Global Constraints; `--font-display` (Fraunces) y `--font-sans` (Inter) vía `next/font/google` en `layout.tsx` con `variable`. `html { color-scheme: light dark }`, `body { background: var(--color-bg); color: var(--color-ink); transition: background-color 200ms, color 200ms }`. `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } }`.

- [ ] **Step 5: Componentes UI** listados arriba. `Reveal` usa `motion.div` con `initial={{opacity:0, y:16}}`, `whileInView={{opacity:1, y:0}}`, `viewport={{once:true, margin:'-10%'}}`, `transition={{duration:0.5, ease:'easeOut', delay}}` y `useReducedMotion()` para pasar directo a visible.

- [ ] **Step 6: Layout raíz** inyecta `<script dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}} />` en `<head>`, `lang="es-CR"`, fuentes y `suppressHydrationWarning` en `<html>`. Página temporal en `/` con un título en display, un párrafo y el `ThemeToggle` para verificar.

- [ ] **Step 7: Verificar** — Run: `npm test` → PASS. `npm run dev`, abrir `/`, alternar tema, recargar: no parpadea y persiste.

- [ ] **Step 8: Commit** — `git commit -m "feat: design tokens, light/dark theme without flash, base UI and Reveal"`

---

### Task 3: Almacenamiento en disco y respuesta con Range

**Files:**
- Create: `src/lib/storage/storage.ts`, `src/lib/storage/disk.ts`, `src/lib/storage/range.ts`, `src/app/media/[...path]/route.ts`, `tests/unit/storage.test.ts`, `tests/unit/range.test.ts`

**Interfaces:**
- Produces: `interface Storage { save(key: string, data: Buffer | ReadableStream): Promise<void>; stat(key): Promise<{size:number} | null>; createReadStream(key, range?: {start:number; end:number}): NodeJS.ReadableStream; delete(key): Promise<void>; publicUrl(key): string }`; `export const storage: Storage` (DiskStorage con raíz `process.env.UPLOADS_DIR ?? './data/uploads'`); `parseRange(header: string | null, size: number): {start:number; end:number} | 'invalid' | null`; `publicUrl(key)` devuelve `/media/${key}`.

- [ ] **Step 1: Tests**

`range.test.ts`:
```ts
expect(parseRange(null, 100)).toBeNull()
expect(parseRange('bytes=0-9', 100)).toEqual({start:0, end:9})
expect(parseRange('bytes=90-', 100)).toEqual({start:90, end:99})
expect(parseRange('bytes=-10', 100)).toEqual({start:90, end:99})
expect(parseRange('bytes=200-', 100)).toBe('invalid')
expect(parseRange('bytes=5-2', 100)).toBe('invalid')
```
`storage.test.ts` (usa `UPLOADS_DIR` temporal con `fs.mkdtemp`): guarda `Buffer.from('hola')` en `t/a.txt`, `stat` devuelve `{size:4}`, leer stream devuelve `hola`, `delete` deja `stat` en `null`; `save('../x', ...)` lanza (anti path traversal).

- [ ] **Step 2: Ver fallar** — `npm test` → FAIL.

- [ ] **Step 3: Implementar** `range.ts`, `disk.ts` (resolver con `path.resolve` y rechazar claves que salgan de la raíz; `mkdir -p` del directorio), `storage.ts` (interfaz y `export const storage = new DiskStorage()`).

- [ ] **Step 4: Ruta `/media/[...path]`** — GET: solo claves bajo `images/` o `thumbs/`; 404 si no existe; `Content-Type` por extensión; `Cache-Control: public, max-age=31536000, immutable`; soporta Range (206 / 416 con `Content-Range: bytes */size`).

- [ ] **Step 5: Verificar** — `npm test` → PASS. Crear a mano `data/uploads/images/x.webp` y pedir `curl -I localhost:3000/media/images/x.webp` → 200; `curl -H "Range: bytes=999999999-" -I ...` → 416.

- [ ] **Step 6: Commit** — `git commit -m "feat: disk storage, range parsing and public media route"`

---

### Task 4: Núcleo de autenticación (contraseñas, sesiones, rate limit)

**Files:**
- Create: `src/lib/auth/password.ts`, `src/lib/auth/session.ts`, `src/lib/auth/rate-limit.ts`, `src/lib/form-token.ts`, `tests/unit/auth.test.ts`

**Interfaces:**
- Produces: `hashPassword(plain): Promise<string>`, `verifyPassword(plain, hash): Promise<boolean>`; `signSession(kind: 'admin'|'member', payload: {sub:string; v:number}, secret?: string): Promise<string>`, `verifySession(kind, token, secret?): Promise<{sub:string; v:number} | null>` (rechaza si `kind` no coincide con el claim `k`); `SESSION_COOKIE = {admin:'rr_admin', member:'rr_member'}`; `cookieOptions(): CookieOptions`; `checkLoginAllowed(ip, now?: Date): Promise<{allowed:boolean; retryAfterSec?:number}>` y `recordLoginAttempt(ip, success)` sobre `LoginAttempt` (ventana 15 min, 5 fallos); `issueFormToken(): Promise<string>` y `consumeFormToken(token): Promise<boolean>` (expira 1 h, un solo uso, borra usados al consumir).
- Nota: los helpers que tocan `db` se prueban con un `db` falso inyectable: exportar `createRateLimiter(deps: {findFailures(ip, since): Promise<number>; record(ip, success): Promise<void>})`.

- [ ] **Step 1: Tests**

```ts
test('hash and verify', async () => { const h = await hashPassword('Secreta1!'); expect(await verifyPassword('Secreta1!', h)).toBe(true); expect(await verifyPassword('otra', h)).toBe(false) })
test('session roundtrip', async () => { const t = await signSession('admin', {sub:'a1', v:0}, 'x'.repeat(32)); expect(await verifySession('admin', t, 'x'.repeat(32))).toEqual({sub:'a1', v:0}) })
test('session kind mismatch', async () => { const t = await signSession('member', {sub:'m1', v:0}, 'x'.repeat(32)); expect(await verifySession('admin', t, 'x'.repeat(32))).toBeNull() })
test('tampered token', async () => { expect(await verifySession('admin', 'abc.def.ghi', 'x'.repeat(32))).toBeNull() })
test('rate limit blocks after 5 failures', async () => { const rl = createRateLimiter({ findFailures: async () => 5, record: async () => {} }); expect((await rl.checkLoginAllowed('1.1.1.1')).allowed).toBe(false) })
test('rate limit allows under 5', ...)
```

- [ ] **Step 2: Ver fallar** → FAIL.
- [ ] **Step 3: Implementar** los cuatro archivos. `form-token.ts` usa `db.formToken` con `crypto.randomUUID()`.
- [ ] **Step 4: `npm test`** → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: password hashing, signed sessions, login rate limit and form tokens"`

---

### Task 5: Login y layout del panel administrativo

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/layout.tsx`, `src/app/admin/page.tsx` (placeholder "Resumen"), `src/components/admin/Sidebar.tsx`, `src/server/actions/admin-auth.ts`, `src/server/auth.ts`, `playwright.config.ts`, `tests/e2e/global-setup.ts`, `tests/e2e/admin-login.spec.ts`

**Interfaces:**
- Produces: `getAdmin(): Promise<AdminUser | null>` y `requireAdmin(): Promise<AdminUser>` (redirige a `/admin/login`) en `src/server/auth.ts`; acciones `adminLogin(prev, formData)` y `adminLogout()`; `middleware.ts` con `matcher: ['/admin/:path*', '/cuenta/:path*']` que verifica la cookie correspondiente con `verifySession` y redirige a `/admin/login` o `/ingresar?next=...`; `/admin/login` con sesión activa redirige a `/admin`.
- Playwright: `global-setup` ejecuta `prisma migrate reset --force --skip-generate` (usa `DATABASE_URL` de `.env`) y el seed; `baseURL http://localhost:3000`; `webServer: npm run dev`.

- [ ] **Step 1: Test e2e**

`admin-login.spec.ts`: (a) visitar `/admin` sin sesión → URL termina en `/admin/login`; (b) credenciales malas → texto "Correo o contraseña incorrectos"; (c) credenciales de `.env` → URL `/admin` y texto "Resumen"; (d) el botón "Ingresar" queda `disabled` mientras envía (comprobar `toBeDisabled()` justo tras `click` con `noWaitAfter`).

- [ ] **Step 2: `npx playwright test tests/e2e/admin-login.spec.ts`** → FAIL.
- [ ] **Step 3: Implementar** middleware, página de login (formulario con `useActionState`, `Button pending`), acción (`checkLoginAllowed` por IP de `x-forwarded-for` o `127.0.0.1`, `verifyPassword`, `signSession('admin', {sub, v: sessionVersion})`, cookie), layout con `requireAdmin` y `Sidebar` (enlaces: Resumen, Videos, Miembros, Pagos, Contenido, Galería, Ajustes, Cerrar sesión). Estética del panel: misma tipografía y tokens, fondo `surface`, densidad compacta.
- [ ] **Step 4: Ejecutar e2e** → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: admin login, session middleware and admin layout"`

---

### Task 6: Contenido editable del sitio

**Files:**
- Create: `src/lib/content/keys.ts`, `src/lib/content/defaults.ts`, `src/lib/content/repo.ts`, `src/server/actions/content.ts`, `src/app/admin/contenido/page.tsx`, `src/components/admin/ContentForm.tsx`, `tests/unit/content.test.ts`

**Interfaces:**
- Produces: `contentSchemas` (Zod) por clave: `hero` {eyebrow, title, subtitle, ctaPrimary, ctaSecondary}, `about` {paragraphs: string[], facts: {label, value}[]}, `pillars` {items: {title, text}[]} (4), `membership` {title, text, benefits: string[], faq: {q, a}[]}, `contact` {title, text, whatsapp, email}, `social` {tiktok, instagram, youtube, facebook, tiktokFollowers, instagramFollowers}, `seo` {title, description}; `defaults: {[K in ContentKey]: Content[K]}`; `getContent<K>(key): Promise<Content[K]>` (lee `SiteContent`, parsea con el schema, cae a `defaults[key]` y mezcla campos faltantes); `setContent<K>(key, value)`; acción `saveContent(key, prev, formData)`.
- Textos por defecto (exactos, en `defaults.ts`): `hero.eyebrow` "El mae de los perros"; `hero.title` "Rubén Rodríguez"; `hero.subtitle` "Defensor del bienestar animal, juez internacional canino y creador de contenido en Costa Rica."; `about.facts`: "Juez internacional" / "Todas las razas, avalado por la Federación Canina Mundial y la International Kennel Union"; "Fundador" / "Federación Canina de Costa Rica (ACAN), primera federación inscrita en el país"; "Criador y adiestrador" / "Pastor alemán, talleres y consultoría de comportamiento"; "Activista" / "Campañas contra el maltrato animal, rescates y educación". Pilares: "Activismo y campañas", "Rescates y organizaciones", "Legislación", "Educación y conciencia social" con un texto de una frase cada uno basado en §2. Contacto: WhatsApp "+50670150301", correo "rr@rubenrodriguezoficial.com". Social con los handles de §2 y seguidores TikTok "" (vacío, editable) e Instagram "119 mil".

- [ ] **Step 1: Test** — `getContent` con repo falso (`createContentRepo({read, write})`): sin fila devuelve default; con fila parcial `{title:'X'}` devuelve default con `title` reemplazado; con JSON inválido devuelve default.
- [ ] **Step 2: Ver fallar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Página `/admin/contenido`**: una pestaña por clave, formulario por clave con campos según el schema (arrays como textarea de una línea por ítem, faq como pares), botón "Guardar" con pending, mensaje "Guardado" tras éxito. `revalidatePath('/')` al guardar.
- [ ] **Step 6: Verificar a mano** editar `hero.subtitle` y ver el cambio en `/` (la Tarea 15 construye la portada real; por ahora la página temporal lee `getContent('hero')`).
- [ ] **Step 7: Commit** — `git commit -m "feat: editable site content with defaults and admin editor"`

---

### Task 7: Dominio de videos (slug, embeds, acceso)

**Files:**
- Create: `src/lib/videos/slug.ts`, `src/lib/videos/embed.ts`, `src/lib/videos/access.ts`, `tests/unit/videos.test.ts`

**Interfaces:**
- Produces: `slugify(title): string` (minúsculas, sin tildes, guiones, máx 80); `uniqueSlug(base, exists: (s)=>Promise<boolean>): Promise<string>` (añade `-2`, `-3`…); `parseEmbedUrl(url): {platform: Platform; externalId: string; embedUrl: string} | null` (YouTube `watch?v=`, `youtu.be/`, `shorts/` → `https://www.youtube-nocookie.com/embed/<id>`; TikTok `/video/<id>` → `https://www.tiktok.com/embed/v2/<id>`; Instagram `/reel/<code>` o `/p/<code>` → `https://www.instagram.com/<kind>/<code>/embed`); `canWatch(video: {access}, membership: {active: boolean}): boolean`.

- [ ] **Step 1: Tests** con casos: `slugify('Rescate en Heredia: ¡Bruno!')` → `rescate-en-heredia-bruno`; `uniqueSlug` cuando existen `x` y `x-2` → `x-3`; una URL de cada forma listada arriba; URL de otro dominio → `null`; `canWatch({access:'FREE'}, {active:false})` true; `MEMBERS` con `active:false` false; `MEMBERS` con `active:true` true.
- [ ] **Step 2: Ver fallar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: video slug, embed url parsing and access rules"`

---

### Task 8: Subida de video por partes y CRUD de videos en el panel

**Files:**
- Create: `src/lib/uploads/chunks.ts`, `src/app/api/uploads/init/route.ts`, `src/app/api/uploads/[id]/chunk/route.ts`, `src/app/api/uploads/[id]/complete/route.ts`, `src/components/admin/VideoUploader.tsx`, `src/components/admin/SortableList.tsx`, `src/app/admin/videos/page.tsx`, `src/app/admin/videos/nuevo/page.tsx`, `src/app/admin/videos/[id]/page.tsx`, `src/server/actions/videos.ts`, `src/server/videos.ts`, `tests/unit/chunks.test.ts`, `tests/e2e/admin-video-upload.spec.ts`, `tests/e2e/fixtures/sample.mp4` (≤ 1 MB, generar con ffmpeg si está, o incluir un MP4 mínimo válido), `tests/e2e/fixtures/thumb.jpg`

**Interfaces:**
- Produces: `createUploadSession({filename, size, mime}): Promise<{uploadId, chunkSize: 5*1024*1024, totalChunks}>`, `writeChunk(uploadId, index, data: Buffer)`, `completeUpload(uploadId): Promise<{key: string}>` (verifica que existan todos los chunks, concatena en `videos/<uploadId>.<ext>`, borra temporales; lanza `MissingChunksError` con los índices faltantes); API: `POST /api/uploads/init` JSON → 201 `{uploadId, chunkSize, totalChunks}` (400 si mime no está en `video/mp4|video/webm|video/quicktime` o size > 500 MB); `PUT /api/uploads/:id/chunk?index=n` cuerpo binario → 204; `POST /api/uploads/:id/complete` → 200 `{key}` o 400 `{missing:[...]}`. Todas exigen admin (401 si no). Los `.mov` se guardan tal cual con `video/quicktime`.
- `VideoUploader` (cliente): drag & drop, lee el archivo, sube chunks en serie con progreso, captura miniatura con `<video>` + `<canvas>` en el segundo 1 (`toBlob('image/jpeg', 0.85)`), expone `onComplete({key, thumbnailBlob, durationSec})`. La miniatura se envía en el formulario de creación como archivo y se guarda vía `storage.save('thumbs/<cuid>.webp', sharp→webp)`.
- Acciones: `createVideo(prev, formData)` (campos: `kind`, `title`, `description`, `access`, `featured`, `status`, `publishedAt`, `sourceUrl` o `fileKey`, `thumbnail` File opcional, `durationSec`, `formToken`); `updateVideo(id, prev, formData)`; `deleteVideo(id)` (borra archivo y miniatura); `reorderVideos(ids: string[])`; `setVideoStatus(id, status)`. `src/server/videos.ts`: `listVideosAdmin()`, `getVideoById(id)`.
- Página lista: `SortableList` con @dnd-kit, columnas miniatura, título, tipo, acceso (Badge), estado, vistas, acciones. Nuevo: pestañas "Subir archivo" / "Enlace"; en "Enlace", al pegar se muestra el embed de vista previa con `parseEmbedUrl`.

- [ ] **Step 1: Test unitario de chunks** (`UPLOADS_DIR` temporal): sesión de 12 bytes con `chunkSize` forzado a 5 mediante `createUploadSession(..., {chunkSize: 5})` → `totalChunks` 3; escribir 0,1,2 y completar → archivo de 12 bytes con el contenido en orden; escribir solo 0 y 2 → `completeUpload` lanza `MissingChunksError` con `missing: [1]` y no existe el archivo final.
- [ ] **Step 2: Ver fallar.** — [ ] **Step 3: Implementar `chunks.ts`.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Rutas API** con `requireAdminApi()` (devuelve 401 JSON) en `src/server/auth.ts`.
- [ ] **Step 6: Test e2e** `admin-video-upload.spec.ts`: login; ir a `/admin/videos/nuevo`; `setInputFiles` con `sample.mp4`; esperar texto "Subida completa"; título "Video de prueba"; acceso "Miembros"; estado "Publicado"; guardar; en la lista aparece "Video de prueba" con badge "Miembros". Luego doble envío: en la página nueva, hacer clic dos veces rápido en "Guardar" y comprobar que hay un solo video con ese título.
- [ ] **Step 7: Implementar páginas, componentes y acciones.** — [ ] **Step 8: e2e PASS.**
- [ ] **Step 9: Commit** — `git commit -m "feat: chunked video upload, thumbnail capture and admin video management"`

---

### Task 9: Reproductor, stream con control de acceso y páginas públicas de video

**Files:**
- Create: `src/app/api/stream/[videoId]/route.ts`, `src/components/site/Player.tsx`, `src/components/site/LockedPlayer.tsx`, `src/components/site/EmbedFrame.tsx`, `src/components/site/VideoCard.tsx`, `src/components/site/VideoGrid.tsx`, `src/app/(site)/layout.tsx`, `src/components/site/Nav.tsx`, `src/components/site/Footer.tsx`, `src/app/(site)/videos/page.tsx`, `src/app/(site)/videos/[slug]/page.tsx`, `src/server/members.ts` (`getMember()`, `getMembership(memberId)` → `{active, subscription}`), `src/server/videos.ts` (añadir `listPublishedVideos({access?, platform?, q?})`, `getVideoBySlug`, `incrementViews(id)`, `relatedVideos(id, n)`), `tests/e2e/public-video.spec.ts`

**Interfaces:**
- `GET /api/stream/:videoId`: 404 si no existe o no es `FILE` o no está `PUBLISHED`; si `access === 'MEMBERS'` y `!(await getMembership(member)).active` → 403; si no, stream con Range (206/416), `Content-Type` del archivo, `Accept-Ranges: bytes`, `Cache-Control: private, no-store`.
- `Player` (cliente): `<video>` con `src=/api/stream/<id>`, `poster`, controles propios (play/pausa, barra de progreso con tiempo, volumen, pantalla completa), teclado (espacio, flechas), `playsInline`. `LockedPlayer`: poster con `filter: blur(12px)` y capa con candado, "Contenido exclusivo para miembros", botones "Hazte miembro" e "Ingresar". `EmbedFrame`: miniatura + botón play; al clic inserta el `iframe` (`embedUrl`) con `loading="lazy"`, `allow="autoplay; encrypted-media"`.
- `VideoCard`: miniatura con relación 9:16 para TikTok/Instagram y 16:9 para YouTube/FILE (prop `aspect`), chip de plataforma o "Video", candado si `MEMBERS`, título, fecha en español ("12 oct 2026"), `Reveal` al entrar.
- `/videos`: filtros por query string `?acceso=gratis|miembros&plataforma=...&q=`, con `<form method="get">` (funciona sin JS), grilla 3 columnas desktop / 2 tablet / 1 móvil.
- `/videos/[slug]`: `incrementViews` (no en borradores), `generateMetadata` con título y miniatura, relacionados (4).
- `getMembership`: activa si existe `Subscription` con `status in (ACTIVE, CANCELED)` y `currentPeriodEnd > now` y `member.status === 'ACTIVE'`.

- [ ] **Step 1: Test e2e** `public-video.spec.ts` (usa el seed demo de la Tarea 17; hasta entonces crea los videos por API/DB en `beforeAll` con `prisma`): (a) `/videos` lista los publicados y no los borradores; (b) video `FREE` de tipo `FILE`: `GET /api/stream/<id>` con `request.get` → 200 y `accept-ranges: bytes`; con `Range: bytes=0-99` → 206; (c) video `MEMBERS`: `GET /api/stream/<id>` sin sesión → 403 y la página muestra "Contenido exclusivo para miembros"; (d) `/videos?acceso=gratis` no muestra el exclusivo.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: video player, access-controlled streaming and public video pages"`

---

### Task 10: Dominio de membresía y pasarela simulada

**Files:**
- Create: `src/lib/payments/luhn.ts`, `src/lib/payments/gateway.ts`, `src/lib/payments/fake-gateway.ts`, `src/lib/membership/subscription.ts`, `tests/unit/payments.test.ts`, `tests/unit/subscription.test.ts`

**Interfaces:**
- `luhnValid(number: string): boolean` (ignora espacios).
- `cardSchema` (Zod): `number` 13–19 dígitos y Luhn, `name` min 3, `expMonth` 1–12, `expYear` ≥ año actual (y mes futuro si mismo año), `cvv` 3–4 dígitos. `sinpeSchema`: `phone` 8 dígitos.
- `interface PaymentGateway { charge(input: ChargeInput): Promise<ChargeResult> }` con `ChargeInput = {amountCRC: number; method: 'CARD'; card: Card} | {amountCRC; method: 'SINPE'; phone: string}` y `ChargeResult = {status: PaymentStatus; ref: string; last4: string | null; message: string}`.
- `FakeGateway`: tarjeta terminada en `4242` → `APPROVED`; `0002` → `DECLINED` "Tarjeta rechazada por el emisor"; `9995` → `INSUFFICIENT_FUNDS` "Fondos insuficientes"; cualquier otra válida → `APPROVED`; SINPE con teléfono terminado en `0000` → `DECLINED`, resto `APPROVED`. `ref` = `DEMO-` + 10 caracteres alfanuméricos. Simula latencia 600 ms (`delayMs` inyectable, 0 en tests). `export const gateway: PaymentGateway = new FakeGateway()`.
- `subscription.ts`: `computePeriodEnd(start: Date, intervalMonths: number): Date`; `isMembershipActive(sub: {status; currentPeriodEnd} | null, now: Date): boolean` (regla de Review Focus 5); `formatCRC(amount): string` → "₡4 900" (espacio fino como separador de miles, sin decimales).

- [ ] **Step 1: Tests** cubriendo cada regla anterior, incluido `isMembershipActive({status:'CANCELED', currentPeriodEnd: mañana})` true y con ayer false, `EXPIRED` siempre false, `null` false; `luhnValid('4242 4242 4242 4242')` true; `'4242424242424241'` false.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: fake payment gateway, card validation and membership rules"`

---

### Task 11: Cuentas de miembro (registro, ingreso, mi cuenta)

**Files:**
- Create: `src/server/actions/member-auth.ts`, `src/app/(site)/registro/page.tsx`, `src/app/(site)/ingresar/page.tsx`, `src/app/(site)/cuenta/page.tsx`, `src/components/site/AuthForm.tsx`, `tests/e2e/member-auth.spec.ts`
- Modify: `src/components/site/Nav.tsx` (botón "Hazte miembro" o "Mi cuenta" según sesión), `src/server/members.ts` (`getMember()`)

**Interfaces:**
- Acciones: `registerMember(prev, formData)` (name, email, password ≥ 8, formToken; email duplicado → "Ya existe una cuenta con ese correo"; crea sesión y redirige a `next` o `/membresia`), `loginMember(prev, formData)` (mensaje genérico "Correo o contraseña incorrectos"), `logoutMember()`.
- `/cuenta`: nombre, correo, estado de membresía ("Activa hasta 12 nov 2026", "Cancelada, acceso hasta …", "Sin membresía"), lista de pagos (fecha, plan, método, monto, estado), botones "Cancelar membresía" / "Reactivar" (acciones en Tarea 12), "Cerrar sesión".

- [ ] **Step 1: Test e2e**: registro con correo nuevo → `/membresia` y Nav muestra "Mi cuenta"; registro repetido → mensaje de duplicado; `/cuenta` sin sesión → `/ingresar?next=/cuenta`; ingresar y ver "Sin membresía".
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: member registration, login and account page"`

---

### Task 12: Membresía y checkout simulado

**Files:**
- Create: `src/app/(site)/membresia/page.tsx`, `src/app/(site)/pago/page.tsx`, `src/app/(site)/pago/exito/page.tsx`, `src/app/(site)/pago/error/page.tsx`, `src/components/site/CheckoutForm.tsx`, `src/components/site/PlanCard.tsx`, `src/server/actions/checkout.ts`, `src/server/plans.ts` (`listPlans()`), `tests/e2e/checkout.spec.ts`

**Interfaces:**
- `/membresia`: contenido `membership` (Tarea 6), dos `PlanCard` (Mensual ₡4 900 / Anual ₡49 000 con "Ahorrás 2 meses"), beneficios, FAQ en `<details>`, botón "Suscribirme" → `/pago?plan=MONTHLY|YEARLY` (si no hay sesión, `/registro?next=/pago?plan=...`). Si ya tiene membresía activa, muestra "Ya sos miembro" con enlace a `/cuenta`.
- `/pago`: resumen del plan, selector Tarjeta / SINPE Móvil, `CheckoutForm` con validación Zod en cliente (mensajes bajo cada campo, formato automático del número en grupos de 4), aviso "Modo demostración: no se realizan cobros reales." y una línea "Probá con 4242 4242 4242 4242 (aprobada), …0002 (rechazada), …9995 (sin fondos)". Botón "Pagar ₡4 900" con pending.
- Acción `payAndSubscribe(prev, formData)`: exige miembro; valida `formToken` (consumir antes de cobrar); valida esquema; `gateway.charge`; crea `Payment` siempre (con el estado devuelto, `cardLast4`); si `APPROVED`: si hay suscripción `ACTIVE/CANCELED` vigente, extiende `currentPeriodEnd` desde ella, si no crea `Subscription ACTIVE` con `computePeriodEnd(now, plan.intervalMonths)`; todo en `db.$transaction`; redirige a `/pago/exito?ref=` o `/pago/error?motivo=`.
- Acciones `cancelSubscription()` (status `CANCELED`, `canceledAt`), `reactivateSubscription()` (vuelve a `ACTIVE` si `currentPeriodEnd` futuro).

- [ ] **Step 1: Test e2e** `checkout.spec.ts`: registrar; `/membresia` → "Suscribirme" mensual → `/pago?plan=MONTHLY`; tarjeta `4242424242424242` → `/pago/exito` con "¡Bienvenido a la manada!" y en `/cuenta` "Activa hasta"; abrir el video `MEMBERS` del seed → se ve el `Player` (no el candado) y `GET /api/stream/<id>` con la cookie → 200; tarjeta `4000000000000002` en otro registro → `/pago/error` con "Tarjeta rechazada"; doble clic en "Pagar" (dos `click` con `noWaitAfter`) → en la base hay exactamente 1 `Payment APPROVED` y 1 `Subscription` para ese miembro.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: membership page and simulated checkout with subscriptions"`

---

### Task 13: Panel: resumen, miembros y pagos

**Files:**
- Create: `src/app/admin/page.tsx` (reemplaza placeholder), `src/app/admin/miembros/page.tsx`, `src/app/admin/miembros/[id]/page.tsx`, `src/app/admin/pagos/page.tsx`, `src/app/admin/pagos/export/route.ts`, `src/components/admin/StatCard.tsx`, `src/components/admin/DataTable.tsx`, `src/server/stats.ts`, `src/server/actions/members.ts`, `tests/unit/csv.test.ts`, `src/lib/csv.ts`

**Interfaces:**
- `getDashboardStats()` → `{activeMembers, monthRevenueCRC, publishedVideos, totalViews, recentPayments: Payment[] (5), recentMembers: Member[] (5)}`.
- `toCsv(rows: Record<string, string|number|null>[]): string` (cabecera de las claves, escapa comillas y comas, `\r\n`).
- Miembros: tabla con búsqueda `?q=`, estado, membresía, fecha; detalle con pagos; acción `setMemberStatus(id, 'ACTIVE'|'SUSPENDED')` (suspendido pierde acceso: `getMembership` ya lo contempla).
- Pagos: tabla con filtro por estado; `GET /admin/pagos/export` devuelve `text/csv` con `Content-Disposition: attachment; filename="pagos.csv"`.

- [ ] **Step 1: Test `toCsv`**: `[{a:'x,y', b:'di "hola"'}]` → `a,b\r\n"x,y","di ""hola"""\r\n`.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar csv y páginas.** — [ ] **Step 4: PASS.** Verificar a mano el panel con los datos del e2e anterior.
- [ ] **Step 5: Commit** — `git commit -m "feat: admin dashboard, members and payments with CSV export"`

---

### Task 14: Galería de fotos

**Files:**
- Create: `src/lib/images.ts` (`processImage(buf): Promise<{data: Buffer; width; height}>` → WebP calidad 82, máx 2000 px lado mayor), `src/server/actions/photos.ts` (`uploadPhoto`, `updatePhoto`, `deletePhoto`, `reorderPhotos`), `src/app/admin/galeria/page.tsx`, `src/app/(site)/galeria/page.tsx`, `src/components/site/Lightbox.tsx`, `src/components/site/PhotoMosaic.tsx`, `tests/unit/images.test.ts`

- [ ] **Step 1: Test** `processImage` con un PNG de 10×10 generado con sharp → salida WebP (`sharp(data).metadata()` format `webp`), y con un PNG de 3000×1000 → ancho 2000. Un buffer que no es imagen → lanza.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar** `images.ts`, acciones (límite 8 MB, mime JPEG/PNG/WebP, guarda en `images/<cuid>.webp`), admin con subida múltiple y `SortableList`, público con mosaico (columnas CSS) y `Lightbox` (diálogo nativo `<dialog>`, teclado ← → Esc). — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: photo gallery with WebP processing, admin ordering and lightbox"`

---

### Task 15: Portada, páginas secundarias y SEO

**Files:**
- Create: `src/app/(site)/page.tsx`, `src/components/site/Hero.tsx`, `src/components/site/About.tsx`, `src/components/site/Pillars.tsx`, `src/components/site/MembershipCta.tsx`, `src/components/site/ContactSection.tsx`, `src/app/(site)/sobre-mi/page.tsx`, `src/app/(site)/contacto/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/site/JsonLd.tsx`, `tests/e2e/home.spec.ts`
- Modify: `next.config.ts` (redirects 301: `/index.php` y `/index.php/noticias` → `/`), `src/app/layout.tsx` (metadata desde `getContent('seo')`, Open Graph con el retrato si existe)

**Interfaces:**
- `Hero`: animación escalonada con Motion (`staggerChildren 0.08`): eyebrow, título en display (clamp 44–112 px), subtítulo, botones "Ver videos" (→ `/videos`) y "Hazte miembro" (→ `/membresia`); a la derecha el retrato (`SiteContent` clave `portrait` con `{key}`; Tarea 16) o la composición tipográfica "RR" con una forma ámbar abstracta (SVG) si no hay retrato. Debajo, fila de redes con cifras de `social`.
- Secciones en orden del spec 5.2, cada una con `Reveal`. "Últimos videos": 6 publicados por `featured desc, publishedAt desc`. Galería solo si hay fotos. `MembershipCta` con precio mensual desde `listPlans()`.
- `sitemap`: `/`, `/videos`, `/videos/<slug>` (solo FREE y publicados), `/membresia`, `/sobre-mi`, `/galeria`, `/contacto`. `robots`: disallow `/admin`, `/cuenta`, `/pago`, `/api`.
- `JsonLd`: `@type Person`, `name`, `url`, `sameAs` (redes), `jobTitle` "Juez internacional canino y activista por el bienestar animal".

- [ ] **Step 1: Test e2e** `home.spec.ts`: `/` muestra "Rubén Rodríguez" y "El mae de los perros"; hay enlaces a `/videos` y `/membresia`; en viewport 360×740 no hay scroll horizontal (`document.documentElement.scrollWidth <= 360`); el toggle de tema cambia `data-theme` y persiste tras `reload`; `/index.php/noticias` responde 301 a `/`; `/sitemap.xml` incluye `/membresia`.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: home page sections, secondary pages, SEO and legacy redirects"`

---

### Task 16: Ajustes (retrato, contraseña) y script de reinicio

**Files:**
- Create: `src/app/admin/ajustes/page.tsx`, `src/server/actions/settings.ts` (`uploadPortrait`, `removePortrait`, `changeAdminPassword`), `scripts/reset-admin-password.ts`, `tests/e2e/admin-settings.spec.ts`

**Interfaces:**
- `changeAdminPassword(prev, formData)`: contraseña actual correcta, nueva ≥ 10 con letra y número, confirmación igual; incrementa `sessionVersion` y vuelve a emitir la cookie del admin actual (otras sesiones quedan inválidas porque `verifySession` + `requireAdmin` comparan `v` con `sessionVersion`).
- `scripts/reset-admin-password.ts`: `npm run admin:reset-password -- <email> <nueva>`; actualiza hash e incrementa `sessionVersion`; imprime "Contraseña actualizada".
- Retrato: `processImage` a `images/portrait-<cuid>.webp`, guarda `SiteContent` clave `portrait` `{key}`; `revalidatePath('/')`.

- [ ] **Step 1: Test e2e**: cambiar contraseña → sigue dentro; en un segundo contexto con la cookie antigua (copiada antes del cambio) `/admin` redirige a login; ingresar con la nueva funciona. Subir `thumb.jpg` como retrato → `/` muestra `img[alt="Rubén Rodríguez"]` con `src` que empieza por `/media/images/portrait-`.
- [ ] **Step 2: FAIL.** — [ ] **Step 3: Implementar** (añadir la comprobación de `sessionVersion` en `requireAdmin`/`getAdmin` y `getMember` si no estaba). — [ ] **Step 4: PASS.**
- [ ] **Step 5: Commit** — `git commit -m "feat: admin settings with portrait upload, password change and reset script"`

---

### Task 17: Seed de demostración, README, Dockerfile y QA final

**Files:**
- Modify: `prisma/seed.ts`
- Create: `README.md`, `Dockerfile`, `tests/e2e/fixtures/demo-*.mp4` (3 clips cortos ≤ 2 MB generados con ffmpeg: patrón de color y texto "Demo 1/2/3", o un MP4 mínimo repetido), `tests/e2e/fixtures/demo-thumb-*.jpg`

**Interfaces:**
- Seed demo (idempotente por `slug`/`email`): 3 videos `FILE` (uno `MEMBERS`, dos `FREE`, títulos "Demo: rutina de paseo", "Demo: señales de estrés en perros", "Demo: sesión exclusiva de adiestramiento" con descripción que empieza por "Contenido de muestra para la demostración."), 3 videos `EMBED` con URLs reales de sus cuentas si Josue las pasa, si no, se omiten; miembro de prueba `miembro@demo.cr` / `Miembro1234!` con suscripción mensual activa y un pago aprobado; `SiteContent` vacío (usa defaults).
- README en español: requisitos, `.env`, `npm run db:up`, `db:migrate`, `db:seed`, `dev`, credenciales demo, reglas de tarjetas, `admin:reset-password`, estructura, cómo reemplazar `FakeGateway` y `DiskStorage`, despliegue con Docker (volumen en `/data/uploads`).
- `Dockerfile` multi-stage con `output: 'standalone'` en `next.config.ts`, `sharp` incluido, `UPLOADS_DIR=/data/uploads`, `CMD ["node", "server.js"]`. `docker-compose.prod.yml` con app + db + volúmenes.

- [ ] **Step 1: Seed demo y fixtures.** Run: `npm run db:seed` dos veces → sin duplicados.
- [ ] **Step 2: Ejecutar todo**: `npm test` y `npm run test:e2e` → todo PASS. `npm run build` sin errores ni warnings de tipos. `npm run lint` limpio.
- [ ] **Step 3: QA visual** con `/qa-only` (gstack) sobre `/`, `/videos`, `/videos/<slug exclusivo>`, `/membresia`, `/pago`, `/admin` en ambos temas y a 360 px; capturas en `docs/qa/`. Lighthouse en `/` (móvil) ≥ 90 en rendimiento y accesibilidad; anotar resultado en `docs/qa/README.md`.
- [ ] **Step 4: Dockerfile**: `docker build -t ruben-demo .` termina bien.
- [ ] **Step 5: Commit** — `git commit -m "feat: demo seed, README, Dockerfile and QA evidence"`

---

## Self-review (hecho al escribir)

- Cobertura del spec: §5.2 páginas → T9, T11, T12, T14, T15; §6 panel → T5, T6, T8, T13, T14, T16; §7 modelo → T1; §4 decisiones (chunks, canvas, gateway, sesiones, rate limit, reset) → T4, T8, T10, T16; §10 entregables → T17. Interruptor "Modo demo" informativo en Ajustes: se omite por ser solo informativo (YAGNI); el aviso de demo vive en checkout.
- Consistencia de nombres: `getMembership`, `canWatch`, `storage`, `parseEmbedUrl`, `gateway`, `computePeriodEnd`, `isMembershipActive`, `requireAdmin`, `getMember`, `processImage`, `SortableList` se usan con el mismo nombre en todas las tareas.
- Review Focus: 1→T9, 2→T3, 3→T8, 4→T12, 5→T10. Todos con test asignado.
