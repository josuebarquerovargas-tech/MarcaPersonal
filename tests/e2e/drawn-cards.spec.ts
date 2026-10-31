import { expect, test } from "@playwright/test";

const icons = "#proceso .drawn-icon";
const photos = "#servicios img.service-photo";

test("el icono de cada paso se dibuja al entrar en pantalla", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(icons)).toHaveCount(5);
  await expect(page.locator(`${icons}.is-drawing`)).toHaveCount(0);
  await page.locator(icons).first().scrollIntoViewIfNeeded();
  await expect(page.locator(icons).first()).toHaveClass(/is-drawing/);
  const name = await page.locator(`${icons} > *`).first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("draw-stroke");
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

test("cada servicio muestra su propia foto realista, ya cargada", async ({ page }) => {
  await page.goto("/");
  const imgs = page.locator(photos);
  await expect(imgs).toHaveCount(5);
  await expect(page.locator("#servicios svg.drawn-illustration")).toHaveCount(0);
  const sources = await imgs.evaluateAll((els) => els.map((el) => (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src));
  expect(new Set(sources).size).toBe(5);
  for (let i = 0; i < 5; i++) {
    const img = imgs.nth(i);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth), { timeout: 15000 }).toBeGreaterThan(100);
  }
});

test("la foto hace su entrada al aparecer en pantalla", async ({ page }) => {
  await page.goto("/");
  const img = page.locator(photos).first();
  await img.scrollIntoViewIfNeeded();
  await expect(img).toHaveClass(/is-revealed/);
  expect(await img.evaluate((el) => getComputedStyle(el).animationName)).toBe("photo-settle");
});

test("con movimiento reducido la foto aparece sin animar", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const img = page.locator(photos).first();
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  expect(await img.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});

test("sin JavaScript la foto se ve", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  const img = page.locator(photos).first();
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  await ctx.close();
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
