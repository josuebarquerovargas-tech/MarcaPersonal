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

test("cada servicio tiene su propia ilustración de color, como en el anuncio", async ({ page }) => {
  await page.goto("/");
  const svgs = page.locator("#servicios svg.drawn-illustration");
  await expect(svgs).toHaveCount(5);
  const colors = await svgs.evaluateAll((els) => els.map((el) => getComputedStyle(el).stroke));
  expect(new Set(colors).size).toBe(5);
  const strokes = await svgs.first().evaluate((el) => el.children.length);
  expect(strokes).toBeGreaterThan(3);
});

test("los resúmenes siguen el anuncio pero sin prometer atención 24/7", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Creamos tu página web profesional para mostrar tu marca, productos y servicios.")).toBeVisible();
  await expect(page.getByText("Implementamos IA, automatización, anuncios digitales y estrategias modernas para aumentar tus ventas.")).toBeVisible();
  expect(await page.locator("#servicios").innerText()).not.toMatch(/24\/7/);
});

test("los pies de las tarjetas de servicio quedan alineados", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const links = page.locator("#servicios a").filter({ hasText: "Ver más" });
  await expect(links).toHaveCount(5);
  const bottoms = await page.getByText("Ver más").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().bottom)));
  expect(new Set(bottoms).size).toBe(1);
});
