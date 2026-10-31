import { expect, test } from "@playwright/test";

test("la portada muestra el nombre, el apodo y los llamados a la acción", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Rubén Rodríguez" })).toBeVisible();
  await expect(page.getByText("El mae de los perros").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver videos" }).first()).toHaveAttribute("href", "/videos");
  await expect(page.getByRole("link", { name: "Hazte miembro" }).first()).toHaveAttribute("href", "/membresia");
  await expect(page.getByRole("heading", { name: "Trayectoria" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hablemos" })).toBeVisible();
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
  expect(xml).toContain("/membresia");
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
  await expect(page.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me\/50670150301/);
});

test("sin JavaScript el contenido y las miniaturas se ven", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  const card = page.locator("[data-reveal]").first();
  await expect(card).toBeVisible();
  expect(await card.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await expect(page.getByRole("heading", { name: "Demo: rutina de paseo" })).toBeVisible();
  await ctx.close();
});
