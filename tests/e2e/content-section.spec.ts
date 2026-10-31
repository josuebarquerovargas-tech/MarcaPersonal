import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const POST_SLUG = "e2e-articulo-contenido";

test.beforeAll(async () => {
  const db = new PrismaClient();
  await db.post.upsert({
    where: { slug: POST_SLUG },
    update: {},
    create: { slug: POST_SLUG, title: "Artículo dentro de Contenido", excerpt: "Resumen", body: "Cuerpo", status: "PUBLISHED", publishedAt: new Date() },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.post.deleteMany({ where: { slug: POST_SLUG } });
  await db.$disconnect();
});

test("el menú queda con Inicio, Servicios, Contenido, Sobre Rubén y Contacto", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const links = page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link");
  await expect(links).toHaveText(["Inicio", "Servicios", "Contenido", "Sobre Rubén", "Contacto"]);
});

test("Contenido reúne videos, artículos y la suscripción", async ({ page }) => {
  await page.goto("/contenido");
  await expect(page.getByRole("heading", { level: 1, name: "Todo el contenido" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Llegó el momento de facturar" })).toBeVisible();
  await expect(page.locator("#articulos").getByRole("link", { name: /Artículo dentro de Contenido/ })).toBeVisible();
  await expect(page.locator("#membresia").getByRole("link", { name: "Suscribirme", exact: true })).toBeVisible();
  await expect(page.locator("#membresia").getByRole("heading", { name: "Preguntas frecuentes" })).toBeVisible();
});

test("un filtro de videos no mezcla los artículos", async ({ page }) => {
  await page.goto("/contenido?plataforma=TIKTOK");
  await expect(page.locator("#articulos")).toHaveCount(0);
});

test("Contenido se marca activo también dentro de un video o un artículo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const link = page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Contenido" });
  await page.goto("/contenido/tiktok-que-empiece-la-accion");
  await expect(link).toHaveAttribute("aria-current", "page");
  await page.goto(`/blog/${POST_SLUG}`);
  await expect(link).toHaveAttribute("aria-current", "page");
});

test("Servicios incluye los planes", async ({ page }) => {
  await page.goto("/servicios");
  await expect(page.getByRole("heading", { level: 2, name: "Planes para tu marca" })).toBeVisible();
  await expect(page.locator("[data-quote-plan]")).toHaveCount(3);
});

for (const [from, to] of [
  ["/videos", /\/contenido$/],
  ["/videos/tiktok-que-empiece-la-accion", /\/contenido\/tiktok-que-empiece-la-accion$/],
  ["/membresia", /\/contenido#membresia$/],
  ["/blog", /\/contenido#articulos$/],
] as const) {
  test(`el enlace viejo ${from} sigue funcionando`, async ({ page }) => {
    const res = await page.goto(from);
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(to);
  });
}

test("el mapa del sitio lista Contenido y ya no Membresía", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/contenido/");
  expect(xml).not.toContain("/membresia");
  expect(xml).not.toContain("/videos");
});
