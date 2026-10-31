# Reposicionamiento a servicios digitales: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Convertir la plataforma de bienestar animal en el sitio de marca personal y servicios digitales de Rubén Rodríguez, con cotizaciones y WhatsApp como conversión principal.

**Architecture:** Se conserva la arquitectura actual. Los servicios viven en un catálogo con textos editables por el contenido del sitio. Las cotizaciones son un modelo nuevo con bandeja en el panel. La membresía se oculta con una bandera guardada en la base, activable desde Ajustes.

**Tech Stack:** Next.js 15, TypeScript, Tailwind 4, Prisma, PostgreSQL, Vitest, Playwright.

**Spec:** `docs/contexto-negocio.md` más la propuesta aprobada por Josue el 2026-10-31.

## Global Constraints

- No inventar experiencias, clientes, cifras, reseñas, credenciales, tarifas ni disponibilidad. No afirmar atención 24/7.
- No prometer resultados garantizados. No mostrar el posible reparto de ingresos.
- WhatsApp: +50663360450. Mensaje: «¿Estás listo a mostrar tu marca?».
- CTA: «Ver servicios», «Solicitar cotización», «Hablar por WhatsApp».
- Sin textos caninos en el sitio público. Membresía, pago y precios ocultos por defecto; código conservado.
- Sin cobros reales. Paleta amarilla y negra, por validar; contraste AA en ambos temas.
- Formularios: botón bloqueado, token de un solo uso en el servidor, Zod, consentimiento obligatorio.

## Review Focus

1. Un bot llena el campo trampa: responde éxito y no guarda nada. (T3)
2. Envío repetido del mismo formulario: una sola solicitud. (T3)
3. Con la membresía apagada, `/membresia`, `/pago`, `/registro`, `/ingresar` y `/cuenta` dan 404 y sus acciones no operan. (T4)
4. Un video exclusivo publicado no aparece ni se reproduce con la membresía apagada. (T4)
5. Texto con HTML en la cotización se muestra como texto en el panel. (T3)

---

### Task 1: Dominio

**Files:** `prisma/schema.prisma`, `src/lib/quotes/quote.ts`, `src/lib/services/catalog.ts`, `tests/unit/quote.test.ts`, `tests/unit/services.test.ts`

**Produces:** modelo `QuoteRequest`; `quoteSchema`, `QUOTE_STATUS_LABEL`, `quoteAllowed(recent, sourceKey)`, `hashSource(ip, secret)`; `SERVICES`, `getServiceBySlug(slug)`.

- [ ] Pruebas en rojo, implementación, verde, commit.

### Task 2: Marca y sitio público

**Files:** `src/lib/content/{keys,defaults,fields}.ts`, `globals.css`, Hero, Marquee, Nav, Footer, JsonLd, `Process`, `ServicesGrid`, páginas de servicios, portada, sobre mí, textos de videos, blog y galería; `prisma/seed.ts`.

- [ ] Prueba e2e `services.spec.ts` en rojo, implementación, verde, commit.

### Task 3: Cotización, panel y legal

**Files:** `QuoteForm`, `src/server/actions/quotes.ts`, `/contacto`, `/admin/cotizaciones`, resumen, `/privacidad`, `/terminos`.

- [ ] Prueba e2e `quotes.spec.ts` en rojo, implementación, verde, commit.

### Task 4: Membresía desactivable

**Files:** contenido `features`, `src/server/features.ts`, páginas y acciones de membresía, consultas de video, Sidebar, Ajustes, VideoForm, pruebas existentes.

- [ ] Prueba e2e `membership-flag.spec.ts` en rojo, implementación, verde, commit.

### Task 5: Verificación final

- [ ] Suite completa por grupos, build, Lighthouse, capturas, revisión de seguridad del formulario.
