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

const pages = [
  { path: "/", file: /ruben-inicio\.webp/, maxWidth: 460 },
  { path: "/sobre-mi", file: /ruben\.webp/, maxWidth: 400 },
];

for (const { path, file, maxWidth } of pages) {
  test(`${path} muestra su foto de Rubén, completa y en tamaño contenido`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const img = page.getByRole("img", { name: "Rubén Rodríguez" }).first();
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", file);
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(300);
    const size = await img.evaluate((el) => {
      const i = el as HTMLImageElement;
      const r = i.getBoundingClientRect();
      return { natural: i.naturalWidth / i.naturalHeight, shown: r.width / r.height, width: r.width };
    });
    // Same proportions on screen as in the file means the frame is not cutting the photo.
    expect(Math.abs(size.natural - size.shown)).toBeLessThan(0.02);
    expect(size.width).toBeLessThanOrEqual(maxWidth);
  });
}
