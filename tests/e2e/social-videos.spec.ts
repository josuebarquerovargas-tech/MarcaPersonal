import { expect, test } from "@playwright/test";

const TITLES = [
  "Que empiece la acción",
  "Weltex Costa Rica: aproveche las promos",
  "Boanerges Miranda apoyó a mi hermano",
  "Leo todos sus comentarios",
  "Esto me molesta mucho",
  "¿Cierre del TEC en Limón?",
  "Llegó el momento de facturar",
  "Golden Tours Nicaragua: ¿listos para descubrir Nicaragua?",
];

test("los videos de Rubén en redes aparecen en la sección de Videos, con portada", async ({ page }) => {
  await page.goto("/videos");
  for (const title of TITLES) {
    const link = page.getByRole("link", { name: title });
    await expect(link).toBeVisible();
    await expect(link.locator("img").first()).toBeAttached();
  }
});

test("un video de Instagram se reproduce con su enlace", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("link", { name: "Llegó el momento de facturar" }).click();
  await page.getByRole("button", { name: "Reproducir Llegó el momento de facturar" }).click();
  await expect(page.locator('iframe[src*="instagram.com/reel/DfKsYMsv2y0/embed"]')).toBeAttached();
});

test("un video de TikTok se reproduce con su enlace", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("link", { name: "Que empiece la acción" }).click();
  await page.getByRole("button", { name: "Reproducir Que empiece la acción" }).click();
  await expect(page.locator('iframe[src*="tiktok.com/player/v1/7702832461750816020"]')).toBeAttached();
});
