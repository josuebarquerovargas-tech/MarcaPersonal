import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";
import { setMembership } from "./membership";

test.beforeAll(async () => {
  await setMembership(true);
});

test.afterAll(async () => {
  await setMembership(true);
});


test("el admin edita el precio del plan mensual y se refleja en la membresía", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/contenido?seccion=planes");
  await page.getByLabel("Precio mensual (₡)").fill("5900");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Guardado")).toBeVisible();
  await page.goto("/contenido");
  await expect(page.getByText("5\u202F900").first()).toBeVisible();
  await page.goto("/admin/contenido?seccion=planes");
  await page.getByLabel("Precio mensual (₡)").fill("4900");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Guardado")).toBeVisible();
});
