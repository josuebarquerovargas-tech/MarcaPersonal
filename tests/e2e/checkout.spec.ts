import { expect, test, type Page } from "@playwright/test";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const uploadsDir = process.env.UPLOADS_DIR ?? "./data/uploads";
const fixture = path.join(__dirname, "fixtures", "sample.mp4");
const password = "Clave12345!";

async function register(page: Page, email: string, name = "Pago E2E") {
  await page.goto("/registro");
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/membresia$/);
}

async function fillCard(page: Page, number: string) {
  await page.getByLabel("Número de tarjeta").fill(number);
  await page.getByLabel("Nombre en la tarjeta").fill("Ana Pérez");
  await page.getByLabel("Mes").fill("12");
  await page.getByLabel("Año").fill("2031");
  await page.getByLabel("CVV").fill("123");
}

test.beforeAll(async () => {
  await mkdir(path.join(uploadsDir, "videos"), { recursive: true });
  await copyFile(fixture, path.join(uploadsDir, "videos", "e2e-checkout.mp4"));
  const db = new PrismaClient();
  try {
    await db.video.upsert({
      where: { slug: "e2e-checkout-exclusivo" },
      update: {},
      create: { slug: "e2e-checkout-exclusivo", title: "E2E exclusivo checkout", kind: "FILE", filePath: "videos/e2e-checkout.mp4", access: "MEMBERS", status: "PUBLISHED" },
    });
  } finally {
    await db.$disconnect();
  }
});

test("la membresía lleva al pago y una tarjeta 4242 activa la suscripción", async ({ page }) => {
  const email = `pago-ok-${Date.now()}@demo.cr`;
  await register(page, email);
  await page.getByRole("link", { name: /Suscribirme/ }).first().click();
  await expect(page).toHaveURL(/\/pago\?plan=MONTHLY$/);
  await expect(page.getByText("Modo demostración: no se realizan cobros reales.")).toBeVisible();
  await fillCard(page, "4242 4242 4242 4242");
  await page.getByRole("button", { name: /Pagar/ }).click();
  await expect(page).toHaveURL(/\/pago\/exito/);
  await expect(page.getByText("¡Bienvenido a la manada!")).toBeVisible();

  await page.goto("/cuenta");
  await expect(page.getByText(/Activa hasta/)).toBeVisible();

  await page.goto("/videos/e2e-checkout-exclusivo");
  await expect(page.locator("video")).toHaveCount(1);
  await expect(page.getByText("Contenido exclusivo para miembros")).toHaveCount(0);

  const db = new PrismaClient();
  try {
    const video = await db.video.findUniqueOrThrow({ where: { slug: "e2e-checkout-exclusivo" } });
    const res = await page.request.get(`/api/stream/${video.id}`);
    expect(res.status()).toBe(200);
  } finally {
    await db.$disconnect();
  }
});

test("una tarjeta 0002 termina en la página de error con el motivo", async ({ page }) => {
  await register(page, `pago-ko-${Date.now()}@demo.cr`);
  await page.goto("/pago?plan=YEARLY");
  await fillCard(page, "4000 0000 0000 0002");
  await page.getByRole("button", { name: /Pagar/ }).click();
  await expect(page).toHaveURL(/\/pago\/error/);
  await expect(page.getByText("Tarjeta rechazada por el emisor")).toBeVisible();
  await page.goto("/cuenta");
  await expect(page.getByText("Sin membresía")).toBeVisible();
  await expect(page.getByText("Rechazado")).toBeVisible();
});

test("un doble clic en Pagar crea un solo pago y una sola suscripción", async ({ page }) => {
  const email = `pago-doble-${Date.now()}@demo.cr`;
  await register(page, email);
  await page.goto("/pago?plan=MONTHLY");
  await fillCard(page, "4242 4242 4242 4242");
  const pay = page.getByRole("button", { name: /Pagar|Procesando/ });
  await pay.click({ noWaitAfter: true });
  await pay.click({ noWaitAfter: true, force: true }).catch(() => {});
  await expect(page).toHaveURL(/\/pago\/exito/);
  const db = new PrismaClient();
  try {
    const member = await db.member.findUniqueOrThrow({ where: { email } });
    expect(await db.payment.count({ where: { memberId: member.id, status: "APPROVED" } })).toBe(1);
    expect(await db.subscription.count({ where: { memberId: member.id } })).toBe(1);
  } finally {
    await db.$disconnect();
  }
});

test("SINPE Móvil aprueba y cancelar conserva el acceso hasta fin de período", async ({ page }) => {
  await register(page, `pago-sinpe-${Date.now()}@demo.cr`);
  await page.goto("/pago?plan=MONTHLY");
  await page.getByRole("tab", { name: "SINPE Móvil" }).click();
  await page.getByLabel("Número SINPE Móvil").fill("70150301");
  await page.getByRole("button", { name: /Pagar/ }).click();
  await expect(page).toHaveURL(/\/pago\/exito/);
  await page.goto("/cuenta");
  await page.getByRole("button", { name: "Cancelar membresía" }).click();
  await page.getByRole("button", { name: "Sí, cancelar" }).click();
  await expect(page.getByText(/Cancelada · acceso hasta/)).toBeVisible();
  await page.getByRole("button", { name: "Reactivar" }).click();
  await expect(page.getByText(/Activa hasta/)).toBeVisible();
});

test("el pago sin sesión redirige a ingresar", async ({ page }) => {
  await page.goto("/pago?plan=MONTHLY");
  await expect(page).toHaveURL(/\/ingresar\?next=/);
});

test("un error de validación no gasta el token y el pago sigue siendo posible", async ({ page }) => {
  await register(page, `pago-cvv-${Date.now()}@demo.cr`);
  await page.goto("/pago?plan=MONTHLY");
  await fillCard(page, "4242 4242 4242 4242");
  await page.getByLabel("CVV").fill("12");
  await page.getByRole("button", { name: /Pagar/ }).click();
  await expect(page.getByText("El CVV tiene 3 o 4 dígitos")).toBeVisible();
  await page.getByLabel("CVV").fill("123");
  await page.getByRole("button", { name: /Pagar/ }).click();
  await expect(page).toHaveURL(/\/pago\/exito/);
});
