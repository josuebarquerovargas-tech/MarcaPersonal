import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";
import { setMembership } from "./membership";

const SLUG = "e2e-exclusivo-secreto";
const TITLE = "Artículo exclusivo de prueba";
const SECRET = "FRASE-SECRETA-SOLO-MIEMBROS";

async function loginAsMember(page: Page) {
  await page.goto(`/ingresar?next=%2Fblog%2F${SLUG}`);
  await page.getByLabel("Correo").fill("miembro@demo.cr");
  await page.getByLabel("Contraseña", { exact: true }).fill("Miembro1234!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(new RegExp(`/blog/${SLUG}$`));
}

test.beforeAll(async () => {
  const db = new PrismaClient();
  await db.post.upsert({
    where: { slug: SLUG },
    update: {},
    create: { slug: SLUG, title: TITLE, excerpt: "Resumen público", body: `Texto privado: ${SECRET}`, status: "PUBLISHED", access: "MEMBERS", publishedAt: new Date() },
  });
  await db.$disconnect();
});

test.afterAll(async () => {
  const db = new PrismaClient();
  await db.post.deleteMany({ where: { OR: [{ slug: SLUG }, { title: "Exclusivo creado en el panel" }] } });
  await db.$disconnect();
  await setMembership(true);
});

test("la tarjeta del artículo dice Exclusivo", async ({ page }) => {
  await page.goto("/contenido");
  await expect(page.locator("#articulos").getByRole("link", { name: new RegExp(TITLE) }).getByText("Exclusivo", { exact: true })).toBeVisible();
});

test("el filtro Exclusivos también muestra los artículos exclusivos", async ({ page }) => {
  await page.goto("/contenido?acceso=miembros");
  await expect(page.locator("#articulos").getByRole("link", { name: new RegExp(TITLE) })).toBeVisible();
  await page.goto("/contenido?acceso=gratis");
  await expect(page.locator("#articulos").getByRole("link", { name: new RegExp(TITLE) })).toHaveCount(0);
});

test("sin membresía el texto no llega al navegador, y se invita a unirse", async ({ page, request }) => {
  for (const path of [`/blog/${SLUG}`, "/contenido", "/"]) {
    expect(await (await request.get(path)).text(), path).not.toContain(SECRET);
  }
  await page.goto(`/blog/${SLUG}`);
  await expect(page.getByText("Resumen público")).toBeVisible();
  await expect(page.getByRole("link", { name: "Hazte miembro" })).toHaveAttribute("href", "/contenido#membresia");
  await expect(page.getByRole("link", { name: "Ingresar", exact: true }).last()).toHaveAttribute("href", `/ingresar?next=/blog/${SLUG}`);
});

test("un miembro lee el artículo completo", async ({ page }) => {
  await loginAsMember(page);
  await expect(page.getByText(SECRET)).toBeVisible();
  await expect(page.getByText("Exclusivo", { exact: true })).toBeVisible();
});

test("el panel crea un artículo exclusivo", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/blog/nuevo");
  await page.getByLabel("Título").fill("Exclusivo creado en el panel");
  await page.getByRole("textbox", { name: "Contenido" }).fill("Cuerpo");
  await page.getByLabel("Estado").selectOption("PUBLISHED");
  await page.getByLabel("Acceso").selectOption("MEMBERS");
  await page.getByRole("button", { name: /Guardar|Crear|Publicar/ }).click();
  await expect(page).toHaveURL(/\/admin\/blog$/);
  await expect(page.getByRole("row", { name: /Exclusivo creado en el panel/ }).getByText("Exclusivo", { exact: true })).toBeVisible();
});

test.describe.serial("con la membresía apagada", () => {
  test.beforeAll(() => setMembership(false));
  test.afterAll(() => setMembership(true));

  test("el artículo exclusivo desaparece del sitio", async ({ page, request }) => {
    expect((await request.get(`/blog/${SLUG}`)).status()).toBe(404);
    await page.goto("/contenido");
    await expect(page.getByRole("link", { name: new RegExp(TITLE) })).toHaveCount(0);
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain(SLUG);
  });
});
