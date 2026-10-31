import { expect, test } from "@playwright/test";

test("el navegador tiene un enlace Inicio que lleva a la portada y se marca al estar ahí", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/videos");
  const link = page.getByRole("banner").getByRole("link", { name: "Inicio", exact: true });
  await expect(link).toHaveAttribute("href", "/");
  await expect(link).not.toHaveAttribute("aria-current", "page");
  await link.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(link).toHaveAttribute("aria-current", "page");
});

test("Inicio también aparece en el menú del celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/videos");
  await page.getByRole("button", { name: /menú/i }).click();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});
