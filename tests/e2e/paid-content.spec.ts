import { expect, test } from "@playwright/test";

const EXCLUSIVE = "Demo: contenido exclusivo para hacer crecer tu marca";

test("el contenido de pago se ve en el sitio sin configurar nada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Principal", exact: true }).getByRole("link", { name: "Membresía" })).toBeVisible();
  await expect(page.getByRole("heading", { name: EXCLUSIVE })).toBeVisible();
  await expect(page.getByRole("link", { name: "Hazte miembro" }).first()).toHaveAttribute("href", "/membresia");
});

test("sin membresía el video de pago queda bloqueado y lleva a los planes", async ({ page }) => {
  await page.goto("/videos");
  await page.getByRole("heading", { name: EXCLUSIVE }).click();
  await expect(page.getByText("Contenido exclusivo para miembros")).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("main").getByRole("link", { name: "Hazte miembro" }).first().click();
  await expect(page).toHaveURL(/\/membresia$/);
});

test("los precios se presentan como ejemplo y el pago como simulado", async ({ page }) => {
  await page.goto("/membresia");
  await expect(page.getByText("Precios de ejemplo para esta demostración.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Suscribirme/ }).first()).toBeVisible();
});

test("la cuenta de miembro de prueba desbloquea el video de pago", async ({ page }) => {
  await page.goto("/ingresar?next=%2Fvideos");
  await page.getByLabel("Correo").fill("miembro@demo.cr");
  await page.getByLabel("Contraseña", { exact: true }).fill("Miembro1234!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/videos$/);
  await page.getByRole("heading", { name: EXCLUSIVE }).click();
  await expect(page.locator("video")).toHaveCount(1);
  await expect(page.getByText("Contenido exclusivo para miembros")).toHaveCount(0);
});

test("la privacidad explica los datos de cuentas y pagos", async ({ page }) => {
  await page.goto("/privacidad");
  await expect(page.getByRole("heading", { name: "Cuentas y pagos" })).toBeVisible();
  await expect(page.getByText(/últimos 4 dígitos/)).toBeVisible();
});
