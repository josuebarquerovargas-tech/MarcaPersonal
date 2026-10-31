import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

test.beforeEach(async () => {
  const db = new PrismaClient();
  try {
    await db.siteContent.deleteMany({ where: { key: "portrait" } });
  } finally {
    await db.$disconnect();
  }
});

test("la portada muestra la foto de Rubén, no el monograma", async ({ page }) => {
  await page.goto("/");
  const img = page.getByRole("img", { name: "Rubén Rodríguez" }).first();
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", /ruben\.webp/);
  await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(300);
});

test("Sobre Rubén también muestra su foto", async ({ page }) => {
  await page.goto("/sobre-mi");
  const img = page.getByRole("img", { name: "Rubén Rodríguez" }).first();
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("src", /ruben\.webp/);
});
