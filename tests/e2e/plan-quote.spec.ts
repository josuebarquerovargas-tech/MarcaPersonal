import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("los planes se presentan sin precios inventados", async ({ page }) => {
  await page.goto("/servicios");
  await expect(page.getByRole("heading", { level: 2, name: "Planes para tu marca" })).toBeVisible();
  const cards = page.locator("[data-quote-plan]");
  await expect(cards).toHaveCount(3);
  for (const name of ["Plan Inicio", "Plan Crecimiento", "Plan Completo"]) {
    await expect(cards.filter({ has: page.getByRole("heading", { name, exact: true }) }).getByText("Precio según cotización")).toBeVisible();
  }
  expect(await cards.allInnerTexts()).not.toContainEqual(expect.stringContaining("₡"));
});

test("Servicios ya no tiene formulario de cotización", async ({ page }) => {
  await page.goto("/servicios");
  await expect(page.locator("main form")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Solicita tu cotización" })).toHaveCount(0);
  await expect(page.locator("#cotizar")).toHaveCount(0);
});

test("el botón del plan lleva a Contacto con el plan elegido, sin pedir cuenta", async ({ page }) => {
  const name = `Plan ${Date.now()}`;
  await page.goto("/servicios");
  await page.getByRole("link", { name: "Solicitar cotización del Plan Crecimiento" }).click();
  await expect(page).toHaveURL(/\/contacto\?servicio=plan-crecimiento#cotizacion$/);
  await expect(page.getByLabel("Servicio de interés")).toHaveValue("plan-crecimiento");

  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Correo o teléfono").fill("6336 0450");
  await page.getByLabel(/Autorizo/).check();
  await page.locator("main form").getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("/admin/cotizaciones");
  await expect(page.getByRole("row", { name: new RegExp(name) }).getByText("Plan Crecimiento")).toBeVisible();
});

test("el botón final de Servicios también lleva al formulario de Contacto", async ({ page }) => {
  await page.goto("/servicios");
  const link = page.locator("main").getByRole("link", { name: "Solicitar cotización", exact: true });
  await expect(link).toHaveAttribute("href", "/contacto#cotizacion");
});

test("un plan inventado en la dirección no se preselecciona", async ({ page }) => {
  await page.goto("/contacto?servicio=plan-falso");
  await expect(page.getByLabel("Servicio de interés")).not.toHaveValue("plan-falso");
});

test("sin JavaScript el botón del plan sigue llevando a Contacto", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/servicios");
  await expect(page.getByRole("link", { name: "Solicitar cotización del Plan Inicio" })).toHaveAttribute("href", "/contacto?servicio=plan-inicio#cotizacion");
  await ctx.close();
});
