import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";

async function fill(page: Page, name: string, contact = "ana@ejemplo.cr") {
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Correo o teléfono").fill(contact);
  await page.getByLabel("Servicio de interés").selectOption("sitios-web");
  await page.getByLabel("Mensaje").fill("Quiero una página para mi negocio <b>ya</b>");
  await page.getByLabel(/Autorizo/).check();
}

async function countByName(name: string) {
  const db = new PrismaClient();
  try {
    return await db.quoteRequest.count({ where: { name } });
  } finally {
    await db.$disconnect();
  }
}

test("la solicitud llega al panel, se confirma al visitante y el HTML no se interpreta", async ({ page }) => {
  const name = `Ana ${Date.now()}`;
  await page.goto("/contacto");
  await fill(page, name);
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();

  await loginAsAdmin(page);
  await page.goto("/admin/cotizaciones");
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row.getByText("Nueva")).toBeVisible();
  await expect(row.getByText("Sitios web")).toBeVisible();
  await expect(row.getByText("<b>ya</b>")).toBeVisible();
  await row.getByRole("button", { name: "Marcar contactada" }).click();
  await expect(row.getByText("Contactada")).toBeVisible();
});

test("el servicio llega preseleccionado desde su página", async ({ page }) => {
  await page.goto("/contacto?servicio=asesoria");
  await expect(page.getByLabel("Servicio de interés")).toHaveValue("asesoria");
});

test("un error de validación conserva lo escrito y permite reintentar", async ({ page }) => {
  const name = `Beto ${Date.now()}`;
  await page.goto("/contacto");
  await fill(page, name, "hola");
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("Ingresa un correo o un teléfono válido")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue(name);
  await page.getByLabel("Correo o teléfono").fill("6336 0450");
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();
  expect(await countByName(name)).toBe(1);
});

test("sin autorizar el tratamiento de datos no se envía", async ({ page }) => {
  const name = `Caro ${Date.now()}`;
  await page.goto("/contacto");
  await fill(page, name);
  await page.getByLabel(/Autorizo/).uncheck();
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("Necesitamos tu autorización para responderte")).toBeVisible();
  expect(await countByName(name)).toBe(0);
});

test("un doble clic crea una sola solicitud", async ({ page }) => {
  const name = `Dani ${Date.now()}`;
  await page.goto("/contacto");
  await fill(page, name);
  const send = page.getByRole("button", { name: /Solicitar cotización|Enviando/ });
  await send.click({ noWaitAfter: true });
  await send.click({ noWaitAfter: true, force: true }).catch(() => {});
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();
  expect(await countByName(name)).toBe(1);
});

test("el campo trampa simula éxito sin guardar nada", async ({ page }) => {
  const name = `Bot ${Date.now()}`;
  await page.goto("/contacto");
  await fill(page, name);
  await page.locator('input[name="website"]').evaluate((el: HTMLInputElement) => {
    el.value = "http://spam.example";
  });
  await page.getByRole("button", { name: "Solicitar cotización" }).click();
  await expect(page.getByText("¡Recibimos tu solicitud!")).toBeVisible();
  expect(await countByName(name)).toBe(0);
});

test("la bandeja exige sesión y el resumen cuenta las nuevas", async ({ page }) => {
  await page.goto("/admin/cotizaciones");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await loginAsAdmin(page);
  await expect(page.getByText("Solicitudes nuevas")).toBeVisible();
});

test("las páginas legales existen y el pie las enlaza", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" }).click();
  await expect(page).toHaveURL(/\/privacidad$/);
  await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
  await page.goto("/terminos");
  await expect(page.getByRole("heading", { level: 1, name: "Términos de uso" })).toBeVisible();
});
