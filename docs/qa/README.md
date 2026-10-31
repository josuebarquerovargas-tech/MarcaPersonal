# Evidencia de QA · 2026-10-30

Capturas tomadas contra el build de producción (`next build` + servidor standalone) con el
contenido de demostración del seed. Tema claro y oscuro, escritorio (1280 px) y móvil (360 px).

| Archivo | Qué muestra |
| --- | --- |
| `01-portada-claro.png` | Portada completa, tema claro |
| `02-portada-oscuro.png` | Portada completa, tema oscuro |
| `03-portada-movil.png` | Portada a 360 px (sin scroll horizontal) |
| `04-videos-claro.png` | Catálogo con filtros |
| `05-video-gratis-oscuro.png` | Reproductor propio con controles |
| `06-video-exclusivo-bloqueado.png` | Vista bloqueada para no miembros |
| `07-membresia-oscuro.png` | Planes, beneficios y preguntas |
| `08-pago-claro.png` | Checkout simulado con aviso de demo |
| `09-videos-movil-oscuro.png` | Catálogo en móvil |
| `10` a `16` | Panel: resumen, videos (escritorio y móvil), nuevo video, contenido, pagos, ajustes |

## Lighthouse (móvil, build de producción, Chromium de Playwright)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO | FCP | LCP | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 96 | 100 | 100 | 100 | 1,7 s | 2,5 s | 30 ms |
| `/videos` | 94 | 100 | 100 | 100 | 1,5 s | 2,9 s | 20 ms |
| `/membresia` | 95 | 100 | 100 | 100 | 1,5 s | 2,9 s | 40 ms |

Ajustes de rendimiento aplicados a partir de la primera medición (82 / 92 / 82):

- La entrada del hero pasó de Motion a animaciones CSS, así el LCP no espera la hidratación.
- Fraunces se carga sin ejes extra (118 KB → 37 KB en el preload).
- El símbolo ₡ se dibuja con la fuente del sistema para no descargar el subconjunto
  latin-ext de ambas fuentes (≈190 KB).

## Pruebas automatizadas

- Unitarias (Vitest): 88 pruebas en 14 archivos.
- End-to-end (Playwright): 35 pruebas en 9 archivos: login y ajustes del panel, subida de
  video por partes con anti doble envío, catálogo y stream con control de acceso, registro e
  ingreso de miembros, checkout simulado (aprobado, rechazado, doble clic, SINPE, cancelar y
  reactivar), galería, portada, tema, redirecciones 301, sitemap y robots.
