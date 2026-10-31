import { expect, test } from "@playwright/test";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";
import { setMembership } from "./membership";

test.beforeAll(async () => {
  await setMembership(true);
});

test.afterAll(async () => {
  await setMembership(true);
});


const fixture = path.join(__dirname, "fixtures", "sample.mp4");

test.describe.serial("subida de videos en el panel", () => {
  test("sube un archivo, captura miniatura y lo lista como exclusivo", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/videos/nuevo");
    await page.getByLabel("Archivo de video").setInputFiles(fixture);
    await expect(page.getByText("Subida completa")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Título").fill("Video de prueba");
    await page.getByLabel("Acceso").selectOption("MEMBERS");
    await page.getByLabel("Estado").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/admin\/videos$/);
    const row = page.getByRole("row", { name: /Video de prueba/ });
    await expect(row).toBeVisible();
    await expect(row.getByText("Miembros")).toBeVisible();
    await expect(row.locator("img")).toHaveAttribute("src", /\/media\/thumbs\//);
  });

  test("un doble envío crea un solo video", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/videos/nuevo");
    await page.getByRole("tab", { name: "Enlace" }).click();
    await page.getByLabel("Enlace del video").fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.getByLabel("Título").fill("Doble envío");
    const save = page.getByRole("button", { name: /Guardar|Guardando/ });
    await save.click({ noWaitAfter: true });
    await save.click({ noWaitAfter: true, force: true }).catch(() => {});
    await expect(page).toHaveURL(/\/admin\/videos$/);
    const db = new PrismaClient();
    try {
      expect(await db.video.count({ where: { title: "Doble envío" } })).toBe(1);
    } finally {
      await db.$disconnect();
    }
  });
});
