import { expect, test } from "@playwright/test";

test("el navegador tiene un enlace Inicio que lleva a la portada y se marca al estar ahí", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/contenido");
  const link = page.getByRole("banner").getByRole("link", { name: "Inicio", exact: true });
  await expect(link).toHaveAttribute("href", "/");
  await expect(link).not.toHaveAttribute("aria-current", "page");
  await link.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(link).toHaveAttribute("aria-current", "page");
});

test("Inicio también aparece en el menú del celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contenido");
  await page.getByRole("button", { name: /menú/i }).click();
  await page.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("el menú del celular cubre la pantalla y deja alcanzar todas sus opciones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /menú/i }).click();
  const panel = page.locator("#mobile-nav");
  const box = await panel.boundingBox();
  expect(box!.y + box!.height).toBeGreaterThanOrEqual(843);

  // A short phone must still reach the last option by scrolling inside the panel.
  await page.setViewportSize({ width: 320, height: 480 });
  const contacto = panel.getByRole("link", { name: "Contacto", exact: true });
  await contacto.scrollIntoViewIfNeeded();
  await expect(contacto).toBeInViewport();
  expect(await panel.evaluate((el) => getComputedStyle(el).overflowY)).toBe("auto");
});
