# Plataforma de marca personal de Rubén Rodríguez — Diseño

Fecha: 2026-10-30
Estado: aprobado por Josue en conversación (alcance de demo)

## 1. Intención y por qué

Rubén David Rodríguez Pérez, conocido en Costa Rica como "el mae de los perros", tiene un
sitio actual (rubenrodriguezoficial.com, Joomla 5 con plantilla genérica) que se ve amateur.
Josue quiere reemplazarlo por una **plataforma de creador de contenido** con nivel de diseño
excelente: minimalista, profesional, animada con sobriedad, con tema claro y oscuro.

Es una **demo**: debe verse y sentirse como producto terminado, pero los servicios externos
(pasarela de pagos, streaming de video) se simulan dentro de la propia aplicación. El código
queda estructurado para sustituir las simulaciones por servicios reales (ONVO Pay o Tilopay,
Cloudflare Stream o Bunny Stream) sin rehacer el resto.

Quien lo visite (prensa, marcas, instituciones, seguidores) debe pensar "esto es un creador
profesional con su propia plataforma".

## 2. Quién es Rubén (hechos verificados)

Fuentes: su sitio actual, Instagram (@rubenrodriguezoficialdog, cuenta verificada, ~119 K
seguidores), la página de jueces de la Federación Canina de Costa Rica (ACAN), El Mundo CR,
Acontecer, NCR Noticias y Tome Pal Pinto.

- Ingeniero. Empresario y asesor privado en estrategia de negocios a nivel regional.
- Juez internacional de todas las razas, avalado por la Federación Canina Mundial y la
  International Kennel Union.
- Criador de pastor alemán.
- Fundador de la Asociación Cinológica Autónoma Nacional de Costa Rica (ACAN), hoy
  Federación Canina de Costa Rica, "primera federación debidamente inscrita en la República
  de Costa Rica".
- "Impulsor del modelo de crianza canina responsable" y "pionero y líder del movimiento de
  canofilia libre en Costa Rica".
- Adiestrador canino: talleres, cursos y consultoría de comportamiento.
- Activista y defensor de los animales: campañas de concientización, rescates con
  organizaciones, promoción de leyes contra el maltrato, charlas y talleres. Hitos:
  Festival de la Luz, Zaguaparade y la "Estatua Emblema del Maltrato Animal en Costa Rica",
  convenio con Aldeas Infantiles SOS, campaña "No a la mutilación estética", apariciones en
  televisión y prensa.
- Creador de contenido en TikTok, Instagram, YouTube y Facebook.
- Contacto público: WhatsApp (+506) 7015-0301, correo rr@rubenrodriguezoficial.com.
- Redes: TikTok @rubenrodriguezoficialdog, Instagram @rubenrodriguezoficialdog, YouTube
  @rubenrodriguez-lx1gr, Facebook /emprendedorconproyeccionsocial.

**No va en el sitio**: querellas, casos judiciales, política partidista.

**Decisión de Josue: no se reutiliza nada del sitio actual**, ni textos ni fotos. La
investigación sirve para escribir textos nuevos. Las fotos y videos reales los sube Rubén
desde el panel; la demo arranca con contenido de muestra claramente marcado como tal.

## 3. Objetivos, no objetivos, anti objetivos

**Objetivos**

1. Sitio público con nivel de agencia: tipografía cuidada, aire, animaciones de entrada y de
   scroll suaves, cero plantilla. Tema claro y oscuro sin parpadeo, preferencia recordada.
2. Videos propios: Rubén sube archivos de video desde el panel y el sitio los reproduce.
   También puede agregar videos por enlace (TikTok, Instagram, YouTube).
3. Membresía simulada: videos gratuitos y videos exclusivos para miembros. Un visitante se
   registra, elige un plan, paga en una pasarela simulada y accede al contenido exclusivo.
4. Panel administrativo completo: videos, miembros, pagos, contenido, galería, ajustes.
5. Rendimiento y accesibilidad reales: navegación por teclado, contraste en ambos temas,
   `prefers-reduced-motion` respetado, móvil desde 360 px.

**No objetivos**

- Cobro real. Transcodificación o CDN de video. Correo transaccional real.
- Blog, comentarios, chat, tienda de productos físicos.
- Varios administradores con roles.

**Anti objetivos**

- Parecer plantilla o constructor de sitios.
- Animaciones ruidosas o lentas.
- Textos inventados que Rubén no pueda respaldar.
- Un tema oscuro que sea un "invertido" descuidado del claro.
- Una simulación de pago que parezca real para un visitante (debe quedar claro, de forma
  elegante, que es modo demo).

## 4. Decisiones tomadas

**Por Josue**

- Next.js con TypeScript y PostgreSQL.
- Subida de archivos de video y contenido desde el panel.
- Pasarela de pagos y membresía, simuladas (demo).
- Minimalista, dos temas, animado, profesional, sin reutilizar material del sitio viejo.

**Por Claude**

- Next.js 15 (App Router, React 19), Tailwind CSS 4, Motion para animaciones, `next/font`.
- Prisma + PostgreSQL. PostgreSQL en Docker para desarrollo (`docker-compose.yml`).
- Almacenamiento de archivos (videos, miniaturas, fotos): disco persistente en
  `UPLOADS_DIR`, fuera del bundle, servido por una ruta propia con soporte de `Range`
  (necesario para reproducir y adelantar video). Interfaz `Storage` con un solo adaptador
  (disco); un adaptador S3 queda como extensión futura.
- Subida de video: MP4, WebM o MOV hasta 500 MB, por partes (chunks) desde el navegador con
  barra de progreso, para no chocar con límites de cuerpo de petición. La miniatura se
  captura en el navegador desde el propio video (canvas) y se envía junto al archivo; el
  admin puede reemplazarla por una imagen. Sin ffmpeg en el servidor.
- Reproductor: `<video>` nativo con controles propios mínimos (play, progreso, volumen,
  pantalla completa), poster con la miniatura.
- Pasarela simulada: módulo `PaymentGateway` con interfaz (`createCheckout`, `confirm`,
  `cancel`) implementada por `FakeGateway`. La página de pago muestra un formulario de
  tarjeta con validación real de formato (Luhn, fecha, CVV); el resultado se decide por
  reglas visibles en la página: tarjeta que termina en `4242` aprueba, `0002` rechaza,
  `9995` fondos insuficientes. Pago en colones (₡) con SINPE Móvil simulado como segunda
  opción. Un aviso discreto "Modo demostración: no se realizan cobros reales" acompaña el
  formulario.
- Cuentas de miembro: registro con nombre, correo y contraseña (bcrypt), sesión en cookie
  httpOnly firmada (jose). Separada de la sesión de administrador.
- Autenticación admin: un usuario, correo y contraseña, límite de intentos (5 fallos → 15
  min). Semilla por `ADMIN_EMAIL` y `ADMIN_PASSWORD`. Comando `npm run admin:reset-password`.
- Correo: no se envía; las "confirmaciones" se muestran en pantalla y quedan registradas.
- Pruebas: Vitest (lógica: Luhn, validaciones, acceso a videos, gateway falso, parseo de
  URLs) y Playwright (login admin, subir video, registro + pago simulado + ver exclusivo,
  cambio de tema). TDD.
- Idioma: español de Costa Rica.

## 5. Sitio público

### 5.1 Dirección visual

- Editorial minimalista. Grilla de 12 columnas, mucho aire. Display serif con carácter
  (Fraunces o Instrument Serif) para titulares; sans neutra (Inter o Geist) para texto y
  panel.
- Paleta: claro sobre blanco cálido (`#FAFAF7`) con tinta `#111`; oscuro sobre `#0C0C0B`
  con texto hueso `#ECEAE4`. Un solo acento ámbar (`#C8782A` claro / `#E09A4B` oscuro).
  Tokens en variables CSS; el tema oscuro redefine tokens.
- Imágenes con esquinas apenas redondeadas. Sin fotos de stock. Donde falte foto, marcador
  tipográfico o forma abstracta en los tonos del sitio.
- Animación: entrada escalonada del hero, revelado por scroll (opacidad + 16 px, 500 ms,
  ease-out), hover con elevación mínima, transición de tema 200 ms. Todo respeta
  `prefers-reduced-motion`.

### 5.2 Páginas

- `/` Portada: navegación (Inicio, Videos, Membresía, Sobre mí, Contacto, interruptor de
  tema, botón "Hazte miembro" o "Mi cuenta"). Hero con nombre, "El mae de los perros", frase
  editable, botones "Ver videos" y "Hazte miembro". Sección "Últimos videos" (6, mezcla de
  gratis y exclusivos, los exclusivos con candado). Sección "Sobre mí" con tarjetas de datos.
  Trayectoria en cuatro pilares. Llamado a membresía con el plan y precio. Galería (si hay
  fotos). Contacto. Pie.
- `/videos` Catálogo con filtros (Todos, Gratis, Exclusivos, por plataforma) y búsqueda.
- `/videos/[slug]` Página del video: reproductor, título, fecha, descripción, vistas,
  relacionados. Si es exclusivo y el visitante no es miembro activo: vista previa borrosa
  con el poster, candado y llamado a suscribirse.
- `/membresia` Explicación de la membresía, beneficios, plan mensual y anual (precios
  editables), preguntas frecuentes, botón de suscribirse.
- `/registro`, `/ingresar` para miembros. `/cuenta` con estado de la suscripción, historial
  de pagos simulados, cancelar o reactivar.
- `/pago` Checkout simulado (resumen del plan, formulario de tarjeta o SINPE, aviso demo).
  `/pago/exito` y `/pago/error`.
- `/sobre-mi`, `/galeria`, `/contacto` páginas secundarias cortas.
- SEO: metadatos editables, Open Graph, `sitemap.xml`, `robots.txt` (excluye `/admin`,
  `/cuenta`, `/pago`), JSON LD Person.

## 6. Panel administrativo (`/admin`)

Barra lateral: Resumen, Videos, Miembros, Pagos, Contenido, Galería, Ajustes, Cerrar sesión.

- **Resumen**: tarjetas con miembros activos, ingresos del mes (simulados), videos
  publicados, vistas totales; últimos pagos y últimos registros.
- **Videos**: tabla ordenable por arrastre con miniatura, tipo (archivo/enlace), acceso
  (gratis/miembros), estado (publicado/borrador), vistas. Nuevo video: pestaña "Subir
  archivo" (arrastrar, progreso por partes, captura de miniatura) o "Enlace" (TikTok,
  Instagram, YouTube con vista previa). Campos: título, slug, descripción, acceso,
  destacado, fecha. Editar, despublicar, eliminar con confirmación.
- **Miembros**: lista con búsqueda, estado de suscripción, fecha; ver detalle; suspender.
- **Pagos**: lista de transacciones simuladas con estado, plan, monto, método; exportar CSV.
- **Contenido**: textos del sitio (frase, bio, pilares, tarjetas, contacto, redes, cifras,
  SEO), planes y precios, textos de la membresía y preguntas frecuentes.
- **Galería**: subir fotos (JPEG/PNG/WebP hasta 8 MB, reencodadas a WebP), pie, orden.
- **Ajustes**: retrato de portada, cambiar contraseña, interruptor "Modo demo" (solo
  informativo en esta versión).

Todos los formularios: botón bloqueado con indicador mientras envía, token de un solo uso en
creaciones, validación Zod en cliente y servidor, mensajes en español.

## 7. Modelo de datos (Prisma)

- `AdminUser`, `LoginAttempt`, `FormToken` (como antes).
- `Member`: id, name, email (único), passwordHash, status (`ACTIVE` | `SUSPENDED`),
  createdAt.
- `Plan`: id, code (`MONTHLY` | `YEARLY`), name, priceCRC, intervalMonths, active.
- `Subscription`: id, memberId, planId, status (`ACTIVE` | `CANCELED` | `EXPIRED`),
  startedAt, currentPeriodEnd, canceledAt.
- `Payment`: id, memberId, subscriptionId, amountCRC, method (`CARD` | `SINPE`), status
  (`APPROVED` | `DECLINED` | `INSUFFICIENT_FUNDS`), gatewayRef, cardLast4, createdAt.
- `Video`: id, slug (único), title, description, kind (`FILE` | `EMBED`), platform
  (`TIKTOK` | `INSTAGRAM` | `YOUTUBE` | null), sourceUrl, filePath, thumbnailPath,
  durationSec, access (`FREE` | `MEMBERS`), status (`DRAFT` | `PUBLISHED`), featured,
  sortOrder, views, publishedAt, createdAt, updatedAt.
- `Photo`, `SiteContent` (como antes).

## 8. Restricciones

- Nada inventado en los textos por defecto; solo hechos de la sección 2 y tono sobrio.
- Nada de cobro real ni datos de tarjeta guardados (solo últimos 4 dígitos simulados).
- Sin servicios externos obligatorios salvo PostgreSQL.
- Funciona sin JavaScript para leer el contenido y ver miniaturas.

## 9. Lo que queda al constructor

Fuentes finales, estructura de carpetas, librería de arrastre, textos exactos, detalles de
animación dentro de 5.1, diseño del reproductor, cobertura extra de pruebas.

## 10. Entregables

1. Proyecto Next.js en Git con `docker-compose.yml`, `.env.example`, README en español.
2. Migraciones y seed: admin, planes, contenido por defecto y contenido de muestra para la
   demo (videos de muestra marcados como tal, un miembro de prueba con suscripción activa).
3. Pruebas pasando y QA visual en ambos temas y en móvil.
