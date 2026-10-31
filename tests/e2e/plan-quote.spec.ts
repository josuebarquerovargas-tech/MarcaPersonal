import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("la membresía se presenta por planes, sin precios inventados", async ({ page }) => {
  await page.goto("/membresia");
  await expect(page.getByRole("heading", { level: 1, name: "Planes para tu marca" })).toBeVisible();
  const cards = page.locator("[data-quote-plan]");
  await expect(cards).toHaveCount(3);
  for (const name of ["Plan Inicio", "Plan Crecimiento", "Plan Completo"]) {
    await expect(cards.filter({ has: page.getByRole("heading", { name, exact: true }) }).getByText("Precio según cotización")).toBeVisible();
  }
  expect(await cards.allInnerTexts()).not.toContainEqual(expect.stringContaining("₡"));
});

test("se cotiza un plan de una vez, sin cuenta y sin salir de la página", async ({ page }) => {
  const name = `Plan ${Date.now()}`;
  await page.goto("/membresia");
  await page.getByRole("link", { name: "Solicitar cotización del Plan Crecimiento" }).click();
  await expect(page).toHaveURL(/\/membresia#cotizar$/);
  await expect(page.getByLabel("Servicio de interés")).toHaveValue("plan-crecimiento");
  await expect(page.getByLabel("Nombre")).toBeFocused();

  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Correo o teléfono").fill("6336 0450");
  await page.getByLabel(/Autorizo/).check();
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("/admin/cotizaciones");
  await expect(page.getByRole("row", { name: new RegExp(name) }).getByText("Plan Crecimiento")).toBeVisible();
});

test("cambiar de plan actualiza el formulario sin borrar lo escrito", async ({ page }) => {
  await page.goto("/membresia");
  await page.getByLabel("Nombre").fill("Ana Pérez");
  await page.getByRole("link", { name: "Solicitar cotización del Plan Completo" }).click();
  await expect(page.getByLabel("Servicio de interés")).toHaveValue("plan-completo");
  await expect(page.getByLabel("Nombre")).toHaveValue("Ana Pérez");
});

test("la suscripción a los videos exclusivos sigue disponible", async ({ page }) => {
  await page.goto("/membresia");
  await expect(page.getByRole("heading", { name: "Contenido exclusivo para tu marca" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Suscribirme", exact: true })).toBeVisible();
});

test("sin JavaScript el botón del plan lleva al formulario", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/membresia");
  await expect(page.getByRole("link", { name: "Solicitar cotización del Plan Inicio" })).toHaveAttribute("href", /#cotizar$/);
  await expect(page.locator("#cotizar form")).toBeAttached();
  await ctx.close();
});
