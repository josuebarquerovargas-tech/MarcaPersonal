import { expect, test } from "@playwright/test";

test("la franja de la portada se mueve de forma continua", async ({ page }) => {
  await page.goto("/");
  const track = page.locator("[data-marquee-track]");
  await expect(track).toHaveCount(1);
  const read = () => track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41);
  const first = await read();
  await page.waitForTimeout(500);
  expect(await read()).not.toBe(first);
});

test("la barra de progreso avanza al desplazarse", async ({ page }) => {
  await page.goto("/");
  const bar = page.locator("[data-scroll-progress]");
  const read = () => bar.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(await read()).toBeLessThan(0.05);
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }));
  await expect.poll(read).toBeGreaterThan(0.9);
});

test("el título entra línea por línea y queda visible", async ({ page }) => {
  await page.goto("/");
  const lines = page.locator("h1 .hero-line-inner");
  await expect(lines).toHaveCount(2);
  await expect(page.getByRole("heading", { level: 1, name: "Rubén Rodríguez" })).toBeVisible();
  await expect.poll(() => lines.last().evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42)).toBe(0);
});

test("con movimiento reducido nada se mueve y todo el contenido se ve", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const names = await page.evaluate(() =>
    [...document.querySelectorAll("[data-marquee-track], .hero-line-inner, .hero-in, .drift-a, .drift-b, .breathe, .scroll-cue-line")].map(
      (el) => getComputedStyle(el).animationName,
    ),
  );
  expect(names.length).toBeGreaterThan(3);
  expect(new Set(names)).toEqual(new Set(["none"]));
  await expect(page.locator("[data-scroll-progress]")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1, name: "Rubén Rodríguez" })).toBeVisible();
});

test("la franja no provoca scroll horizontal en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("la indicación de desplazamiento lleva a los servicios", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("link", { name: "Sigue bajando" }).click();
  await expect(page).toHaveURL(/#servicios$/);
  await expect(page.getByRole("heading", { name: "Creamos una estrategia a tu medida y a tu presupuesto" })).toBeInViewport();
});
