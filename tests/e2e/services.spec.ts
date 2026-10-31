import { expect, test } from "@playwright/test";

test("la portada explica la oferta y lleva a servicios y cotización", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("¿Estás listo a mostrar tu marca?").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Rubén Rodríguez" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Ver servicios" }).first()).toHaveAttribute("href", "/servicios");
  await expect(page.getByRole("main").getByRole("link", { name: "Solicitar cotización" }).first()).toHaveAttribute("href", "/contacto#cotizacion");
  for (const title of ["Sitios web", "Manejo de redes sociales", "Contenido que vende", "Herramientas tecnológicas para vender", "Asesoría y acompañamiento"]) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  for (const step of ["Análisis del mercado", "Conexión con el mercado", "Campañas estratégicas", "Resultados medibles", "Confianza y acompañamiento"]) {
    await expect(page.getByRole("heading", { name: step })).toBeVisible();
  }
});

test("el sitio público no conserva textos del enfoque anterior ni promesas prohibidas", async ({ page }) => {
  for (const path of ["/", "/servicios", "/servicios/asesoria", "/sobre-mi", "/contacto", "/videos", "/blog", "/galeria"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text, path).not.toMatch(/perro|canin|adiestr|mascota|manada|maltrato|mae de los|ACAN|24\/7|garantiz/i);
  }
});

test("cada servicio tiene su página con detalle y llamada a cotizar", async ({ page }) => {
  await page.goto("/servicios");
  await page.getByRole("link", { name: /Contenido que vende/ }).first().click();
  await expect(page).toHaveURL(/\/servicios\/contenido$/);
  await expect(page.getByRole("heading", { level: 1, name: "Contenido que vende" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué incluye" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Para quién es" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Solicitar cotización" }).first()).toHaveAttribute("href", "/contacto?servicio=contenido#cotizacion");
});

test("un servicio inexistente responde 404", async ({ request }) => {
  expect((await request.get("/servicios/no-existe")).status()).toBe(404);
});

test("WhatsApp usa el número autorizado", async ({ page }) => {
  await page.goto("/contacto");
  await expect(page.getByRole("link", { name: "Hablar por WhatsApp" }).first()).toHaveAttribute("href", /wa\.me\/50663360450/);
});

test("la portada lleva el mensaje de Rubén y su llamada a contactar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/tenemos los creadores, tenemos una plataforma/)).toBeVisible();
  await expect(page.getByText(/nos adaptamos a su presupuesto/)).toBeVisible();
  await expect(page.getByText("Rubén Rodríguez", { exact: true }).last()).toBeVisible();
});

test("el menú presenta las secciones nuevas", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal", exact: true });
  await expect(nav.getByRole("link", { name: "Servicios" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Sobre Rubén" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Membresía" })).toBeVisible();
});

test("los servicios entran al sitemap", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/servicios/herramientas-tecnologicas");
  expect(xml).toContain("/membresia");
});
