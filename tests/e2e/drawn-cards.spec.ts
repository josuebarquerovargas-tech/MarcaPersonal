import { expect, test } from "@playwright/test";

const icons = "#servicios .drawn-icon";

test("el icono de cada servicio se dibuja al entrar en pantalla", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(icons)).toHaveCount(5);
  await expect(page.locator(`${icons}.is-drawing`)).toHaveCount(0);
  await page.locator(icons).first().scrollIntoViewIfNeeded();
  await expect(page.locator(icons).first()).toHaveClass(/is-drawing/);
  const name = await page.locator(`${icons} > *`).first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("draw-stroke");
});

test("los pasos del proceso también se dibujan", async ({ page }) => {
  await page.goto("/");
  const stepIcons = page.locator("#proceso .drawn-icon");
  await expect(stepIcons).toHaveCount(5);
  await stepIcons.first().scrollIntoViewIfNeeded();
  await expect(stepIcons.first()).toHaveClass(/is-drawing/);
});

test("el trazo termina completo", async ({ page }) => {
  await page.goto("/");
  await page.locator(icons).first().scrollIntoViewIfNeeded();
  const first = page.locator(`${icons} > *`).first();
  await expect.poll(() => first.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)), { timeout: 5000 }).toBe(0);
});

test("la tarjeta lleva etiqueta y Ver más, y enlaza al servicio", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('#servicios a[href="/servicios/redes-sociales"]');
  await expect(card.getByText("Redes", { exact: true })).toBeVisible();
  await expect(card.getByText("Ver más")).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/servicios\/redes-sociales$/);
});

test("con movimiento reducido el icono aparece completo y sin animar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(icons).first().scrollIntoViewIfNeeded();
  const first = page.locator(`${icons} > *`).first();
  await expect(first).toBeVisible();
  expect(await first.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await first.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))).toBe(0);
});

test("sin JavaScript el icono se ve completo", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  const first = page.locator(`${icons} > *`).first();
  await expect(first).toBeAttached();
  expect(await first.evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset))).toBe(0);
  await ctx.close();
});
