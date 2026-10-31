import { expect, test } from "@playwright/test";
import path from "node:path";
import { loginAsAdmin } from "./helpers";

const fixture = path.join(__dirname, "fixtures", "thumb.jpg");

test.describe.serial("galería", () => {
  test("sin fotos, la galería pública dice que está vacía", async ({ page }) => {
    await page.goto("/galeria");
    await expect(page.getByText("Pronto habrá fotos aquí.")).toBeVisible();
  });

  test("el admin sube una foto con pie y aparece en la galería pública", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/galeria");
    await page.getByLabel("Fotos").setInputFiles(fixture);
    await page.getByLabel("Pie de foto").fill("Foto de prueba E2E");
    await page.getByRole("button", { name: "Subir" }).click();
    await expect(page.getByText("Fotos subidas")).toBeVisible();
    await expect(page.locator("input[name=caption][value=\"Foto de prueba E2E\"]")).toBeVisible();
    const img = page.locator("img[src^='/media/images/']").first();
    await expect(img).toBeVisible();

    await page.goto("/galeria");
    await expect(page.getByRole("img", { name: "Foto de prueba E2E" })).toBeVisible();
    await page.getByRole("button", { name: /Foto de prueba E2E/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("eliminar la foto la quita de la galería", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/galeria");
    await page.getByRole("button", { name: "Eliminar" }).first().click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page.locator("input[name=caption][value=\"Foto de prueba E2E\"]")).toHaveCount(0);
    await page.goto("/galeria");
    await expect(page.getByText("Pronto habrá fotos aquí.")).toBeVisible();
  });
});
