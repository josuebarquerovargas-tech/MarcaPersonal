import { expect, test } from "@playwright/test";
import { setMembership } from "./membership";

test.beforeAll(async () => {
  await setMembership(true);
});

test.afterAll(async () => {
  await setMembership(true);
});


const email = `e2e-${Date.now()}@demo.cr`;
const password = "Clave12345!";

test.describe.serial("cuentas de miembro", () => {
  test("registro crea la cuenta y deja la sesión iniciada", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nombre").fill("Ana E2E");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page).toHaveURL(/\/membresia$/);
    await expect(page.getByRole("link", { name: "Mi cuenta" }).first()).toBeVisible();
  });

  test("registro repetido muestra el mensaje de duplicado", async ({ page }) => {
    await page.goto("/registro");
    await page.getByLabel("Nombre").fill("Ana otra vez");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await expect(page.getByText("Ya existe una cuenta con ese correo")).toBeVisible();
  });

  test("la cuenta sin sesión redirige a ingresar con next", async ({ page }) => {
    await page.goto("/cuenta");
    await expect(page).toHaveURL(/\/ingresar\?next=%2Fcuenta$/);
  });

  test("ingresar con credenciales incorrectas muestra error genérico", async ({ page }) => {
    await page.goto("/ingresar");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
  });

  test("ingresar lleva a la cuenta y muestra 'Sin membresía'", async ({ page }) => {
    await page.goto("/ingresar?next=%2Fcuenta");
    await page.getByLabel("Correo").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page).toHaveURL(/\/cuenta$/);
    await expect(page.getByText("Sin membresía")).toBeVisible();
    await expect(page.getByText("Ana E2E")).toBeVisible();
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Hazte miembro" }).first()).toBeVisible();
  });
});

test("tras un correo duplicado, corregirlo permite registrarse sin recargar", async ({ page }) => {
  const dup = `dup-${Date.now()}@demo.cr`;
  await page.goto("/registro");
  await page.getByLabel("Nombre").fill("Dup Uno");
  await page.getByLabel("Correo").fill(dup);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/membresia$/);
  await page.goto("/cuenta");
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("link", { name: "Hazte miembro" }).first()).toBeVisible();

  await page.goto("/registro");
  await page.getByLabel("Nombre").fill("Dup Dos");
  await page.getByLabel("Correo").fill(dup);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Ya existe una cuenta con ese correo")).toBeVisible();
  await page.getByLabel("Correo").fill(`otro-${Date.now()}@demo.cr`);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/membresia$/);
});

test("un next malicioso no saca al usuario del sitio", async ({ page }) => {
  await page.goto("/ingresar?next=//evil.com");
  await page.getByLabel("Correo").fill("miembro@demo.cr");
  await page.getByLabel("Contraseña", { exact: true }).fill("Miembro1234!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/cuenta$/);
  await page.goto("/ingresar?next=/%5Cevil.com");
  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/cuenta$/);
});
