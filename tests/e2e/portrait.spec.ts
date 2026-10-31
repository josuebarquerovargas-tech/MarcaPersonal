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

for (const path of ["/", "/sobre-mi"]) {
  test(`la foto en ${path} se ve completa y en tamaño contenido`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const img = page.getByRole("img", { name: "Rubén Rodríguez" }).first();
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(300);
    const size = await img.evaluate((el) => {
      const i = el as HTMLImageElement;
      const r = i.getBoundingClientRect();
      return { natural: i.naturalWidth / i.naturalHeight, shown: r.width / r.height, width: r.width };
    });
    // The file keeps the original photo's proportions (1179x1479), so nothing was cropped.
    expect(Math.abs(size.natural - 1179 / 1479)).toBeLessThan(0.01);
    expect(Math.abs(size.natural - size.shown)).toBeLessThan(0.02);
    expect(size.width).toBeLessThanOrEqual(400);
  });
}
