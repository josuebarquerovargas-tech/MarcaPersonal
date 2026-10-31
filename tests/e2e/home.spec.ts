import { expect, test } from "@playwright/test";

test("la portada muestra el nombre, el apodo y los llamados a la acción", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Rubén Rodríguez" })).toBeVisible();
  await expect(page.getByText("¿Estás listo a mostrar tu marca?").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver servicios" }).first()).toHaveAttribute("href", "/servicios");
  await expect(page.getByRole("link", { name: "Solicitar cotización" }).first()).toHaveAttribute("href", "/contacto#cotizacion");
});

test("en móvil no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(360);
});

test("el interruptor de tema cambia data-theme y persiste tras recargar", async ({ page }) => {
  await page.goto("/");
  const initial = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator("[data-theme-toggle]").first().click();
  const toggled = await page.evaluate(() => document.documentElement.dataset.theme);
  expect(toggled).not.toBe(initial);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(toggled);
});

test("las URL del sitio anterior redirigen con 301 a la portada", async ({ request }) => {
  for (const path of ["/index.php", "/index.php/noticias"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(301);
    expect(res.headers()["location"]).toMatch(/\/$/);
  }
});

test("sitemap y robots", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("/servicios");
  expect(xml).not.toContain("/admin");
  const robots = await request.get("/robots.txt");
  const txt = await robots.text();
  expect(txt).toMatch(/Disallow: \/admin/);
  expect(txt).toMatch(/Disallow: \/cuenta/);
});

test("las páginas secundarias cargan", async ({ page }) => {
  await page.goto("/sobre-mi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/contacto");
  await expect(page.getByRole("main").getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me\/50663360450/);
});

test("sin JavaScript el contenido y las miniaturas se ven", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  const card = page.locator("[data-reveal]").first();
  await expect(card).toBeVisible();
  expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(page.getByRole("heading", { name: "Sitios web" })).toBeVisible();
  await ctx.close();
});

test("el sitio no enlaza la cuenta vieja de TikTok ni el YouTube que ya no existe", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href*="tiktok.com/@rubenrodriguezoficialdog"]')).toHaveCount(0);
  await expect(page.locator('a[href*="rubenrodriguez-lx1gr"]')).toHaveCount(0);
});

test("los clips de muestra y los videos retirados no aparecen en el catálogo", async ({ page }) => {
  await page.goto("/contenido");
  for (const name of ["Demo: cómo mostrar tu marca", "Demo: rutina de paseo", "Cerro Negro: aventura y diversión", "Lanzamiento de la Federación Canina de Costa Rica"]) {
    await expect(page.getByRole("heading", { name })).toHaveCount(0);
  }
});
