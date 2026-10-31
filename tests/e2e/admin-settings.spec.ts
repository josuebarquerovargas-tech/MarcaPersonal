import { expect, test } from "@playwright/test";
import path from "node:path";
import { execSync } from "node:child_process";
import { ADMIN_EMAIL, ADMIN_PASSWORD, loginAsAdmin } from "./helpers";

const fixture = path.join(__dirname, "fixtures", "thumb.jpg");
const NEW_PASSWORD = "NuevaClave2026";

test.describe.serial("ajustes del panel", () => {
  test("subir el retrato lo muestra en la portada", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/ajustes");
    await page.getByLabel("Retrato de portada").setInputFiles(fixture);
    await page.getByRole("button", { name: "Guardar retrato" }).click();
    await expect(page.getByText("Retrato actualizado")).toBeVisible();
    await page.goto("/");
    const img = page.getByRole("img", { name: "Rubén Rodríguez" }).first();
    await expect(img).toHaveAttribute("src", /^\/media\/images\/portrait-/);
  });

  test("cambiar la contraseña invalida las sesiones anteriores", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await loginAsAdmin(pageA);
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await loginAsAdmin(pageB);

    await pageA.goto("/admin/ajustes");
    await pageA.getByLabel("Contraseña actual").fill(ADMIN_PASSWORD);
    await pageA.getByLabel("Nueva contraseña", { exact: true }).fill(NEW_PASSWORD);
    await pageA.getByLabel("Confirmar nueva contraseña").fill(NEW_PASSWORD);
    await pageA.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(pageA.getByText("Contraseña actualizada")).toBeVisible();
    await pageA.goto("/admin");
    await expect(pageA).toHaveURL(/\/admin$/);

    await pageB.goto("/admin");
    await expect(pageB).toHaveURL(/\/admin\/login$/);

    await pageB.getByLabel("Correo").fill(ADMIN_EMAIL);
    await pageB.getByLabel("Contraseña").fill(NEW_PASSWORD);
    await pageB.getByRole("button", { name: "Ingresar" }).click();
    await expect(pageB).toHaveURL(/\/admin$/);
    await ctxA.close();
    await ctxB.close();
  });

  test("el script de reinicio restaura la contraseña original", async ({ page }) => {
    const out = execSync(`npx tsx scripts/reset-admin-password.ts ${ADMIN_EMAIL} "${ADMIN_PASSWORD}"`, {
      encoding: "utf8",
      env: { ...process.env },
    });
    expect(out).toContain("Contraseña actualizada");
    await loginAsAdmin(page);
  });
});
