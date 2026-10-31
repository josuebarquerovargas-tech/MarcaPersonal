import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

test.describe("botón flotante de WhatsApp", () => {
  for (const path of ["/", "/servicios", "/contenido", "/contacto"]) {
    test(`aparece fijo en ${path}, con el número de Rubén`, async ({ page }) => {
      await page.goto(path);
      const button = page.getByRole("link", { name: "Escribir por WhatsApp" });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute("href", /^https:\/\/wa\.me\/50663360450/);
      await expect(button).toHaveAttribute("target", "_blank");
      await expect(button).toHaveAttribute("rel", /noopener/);
      await expect(button).toHaveCSS("position", "fixed");
      await expect(button).toHaveCSS("background-color", "rgb(37, 211, 102)");
    });
  }

  test("sigue visible al bajar y queda dentro de la pantalla en el celular", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 1500));
    const button = page.getByRole("link", { name: "Escribir por WhatsApp" });
    await expect(button).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test("el menú abierto del celular lo tapa", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /menú/i }).click();
    const box = await page.getByRole("link", { name: "Escribir por WhatsApp" }).boundingBox();
    const top = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("#mobile-nav") !== null, [box!.x + box!.width / 2, box!.y + box!.height / 2]);
    expect(top).toBe(true);
  });
});

test.describe("redes sociales con su color", () => {
  test.beforeAll(async () => {
    const db = new PrismaClient();
    const value = {
      tiktok: "https://www.tiktok.com/@prueba",
      instagram: "https://www.instagram.com/prueba",
      youtube: "https://www.youtube.com/@prueba",
      facebook: "https://www.facebook.com/prueba",
      tiktokFollowers: "",
      instagramFollowers: "",
    };
    await db.siteContent.upsert({ where: { key: "social" }, update: { value }, create: { key: "social", value } });
    await db.$disconnect();
  });
  test.afterAll(async () => {
    const db = new PrismaClient();
    await db.siteContent.deleteMany({ where: { key: "social" } });
    await db.$disconnect();
  });

  test("cada red muestra su color de marca, en tema claro y oscuro", async ({ page }) => {
    for (const theme of ["light", "dark"]) {
      await page.goto("/contacto");
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      const list = page.getByRole("list", { name: "Redes sociales" }).first();
      await expect(list.getByRole("link", { name: "Facebook" })).toHaveCSS("background-color", "rgb(24, 119, 242)");
      await expect(list.getByRole("link", { name: "YouTube" })).toHaveCSS("background-color", "rgb(255, 0, 0)");
      await expect(list.getByRole("link", { name: "TikTok" })).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(list.getByRole("link", { name: "Instagram" })).toHaveCSS("background-image", /radial-gradient/);
      await expect(list.getByRole("link", { name: "Facebook" })).toHaveCSS("color", "rgb(255, 255, 255)");
    }
  });
});
