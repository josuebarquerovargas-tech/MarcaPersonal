import { expect, test } from "@playwright/test";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";

const fixture = path.join(__dirname, "fixtures", "thumb.jpg");

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.post.deleteMany({ where: { title: { startsWith: "Portada E2E" } } });
  await db.$disconnect();
});

test("la imagen de portada se guarda y se ve en el artículo publicado", async ({ page }) => {
  const title = `Portada E2E ${Date.now()}`;
  await loginAsAdmin(page);
  await page.goto("/admin/blog/nuevo");
  await page.getByLabel("Título").fill(title);
  await page.getByLabel("Contenido").fill("Texto con portada");
  await page.getByLabel("Estado").selectOption("PUBLISHED");
  await page.getByLabel("Imagen de portada").setInputFiles(fixture);
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);

  await page.goto("/blog");
  await page.getByRole("heading", { name: title }).click();
  const cover = page.locator('article img[src^="/media/images/"]');
  await expect(cover).toBeVisible();
  expect(await cover.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
});
