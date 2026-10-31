import { expect, test } from "@playwright/test";

for (const [device, width, height] of [["computadora", 1440, 900], ["celular", 390, 844]] as const) {
  test(`en ${device} el encabezado muestra el logo en lugar del nombre`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/contenido");
    const header = page.getByRole("banner");
    await expect(header.getByText("Rubén Rodríguez")).toHaveCount(0);
    const logo = header.getByRole("link", { name: "Rubén Rodríguez" });
    await expect(logo.locator("svg")).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });
}

test("el logo sigue visible en tema oscuro y el pie conserva el nombre", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await expect(page.getByRole("banner").getByRole("link", { name: "Rubén Rodríguez" }).locator("svg")).toBeVisible();
  await expect(page.getByRole("contentinfo").getByText("Rubén Rodríguez", { exact: true }).first()).toBeVisible();
});
