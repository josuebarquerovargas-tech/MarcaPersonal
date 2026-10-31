import { expect, test } from "@playwright/test";

const VIDEO_YT = "lanzamiento-de-la-federacion-canina-de-costa-rica";
const VIDEO_IG = "cerro-negro-aventura-y-diversion";

test("la portada muestra sus videos de redes y no los clips de muestra gratis", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Lanzamiento de la Federación Canina de Costa Rica" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cerro Negro: aventura y diversión" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Demo: rutina de paseo" })).toHaveCount(0);
});

test("YouTube carga la versión sin cookies solo al hacer clic", async ({ page }) => {
  await page.goto(`/videos/${VIDEO_YT}`);
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: /Reproducir/ }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com\/embed\/cA8dTa2JIEs/);
});

test("Instagram usa el reproductor oficial y enlaza a la publicación", async ({ page }) => {
  await page.goto(`/videos/${VIDEO_IG}`);
  await page.getByRole("button", { name: /Reproducir/ }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /instagram\.com\/reel\/DfKj_JexdNo\/embed/);
  await expect(page.getByRole("link", { name: /Ver en Instagram/ })).toHaveAttribute("href", /instagram\.com\/reel\/DfKj_JexdNo/);
});

test("el catálogo filtra por plataforma", async ({ page }) => {
  await page.goto("/videos?plataforma=INSTAGRAM");
  await expect(page.getByRole("heading", { name: "Cerro Negro: aventura y diversión" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Lanzamiento de la Federación/ })).toHaveCount(0);
});

test("el sitio no enlaza las cuentas de TikTok y YouTube que ya no existen", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href*="tiktok.com"]')).toHaveCount(0);
  await expect(page.locator('a[href*="rubenrodriguez-lx1gr"]')).toHaveCount(0);
  await expect(page.locator('a[href*="instagram.com/rubenrodriguezoficialdog"]').first()).toBeVisible();
});
