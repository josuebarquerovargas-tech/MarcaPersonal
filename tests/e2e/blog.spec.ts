import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";

test.describe.serial("blog", () => {
  const title = `Artículo E2E ${Date.now()}`;

  test("el admin crea un borrador que el público no ve", async ({ page, request }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/blog/nuevo");
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Resumen").fill("Resumen de prueba");
    await page
      .getByLabel("Contenido")
      .fill("## Subtítulo\n\nTexto **fuerte** <script>window.__xss=1</script>\n\n[malo](javascript:alert(1))");
    const save = page.getByRole("button", { name: /Guardar|Guardando/ });
    await save.click({ noWaitAfter: true });
    await save.click({ noWaitAfter: true, force: true }).catch(() => {});
    await expect(page).toHaveURL(/\/admin\/blog$/);
    await expect(page.getByRole("row", { name: new RegExp(title) }).getByText("Borrador")).toBeVisible();

    const db = new PrismaClient();
    const posts = await db.post.findMany({ where: { title } });
    await db.$disconnect();
    expect(posts).toHaveLength(1);
    expect((await request.get(`/blog/${posts[0].slug}`)).status()).toBe(404);
    await page.goto("/contenido");
    await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  });

  test("al publicarlo aparece y el contenido se muestra sin ejecutar HTML", async ({ page, request }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/blog");
    const row = page.getByRole("row", { name: new RegExp(title) });
    await row.getByRole("button", { name: "Publicar" }).click();
    await expect(row.getByText("Publicado")).toBeVisible();

    await page.goto("/contenido");
    await page.getByRole("heading", { name: title }).click();
    await expect(page).toHaveURL(/\/blog\/articulo-e2e-/);
    await expect(page.getByRole("heading", { level: 2, name: "Subtítulo" })).toBeVisible();
    await expect(page.locator("article strong", { hasText: "fuerte" })).toBeVisible();
    await expect(page.getByText("<script>window.__xss=1</script>")).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(page.locator('article a[href^="javascript"]')).toHaveCount(0);

    await page.goto("/");

    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/blog/articulo-e2e-");
  });

  test("un error de validación conserva lo escrito", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/blog/nuevo");
    await page.getByLabel("Contenido").fill("Texto que no debe perderse");
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("El título es obligatorio")).toBeVisible();
    await expect(page.getByLabel("Contenido")).toHaveValue("Texto que no debe perderse");
  });

  test("editar conserva la dirección y eliminar lo quita del sitio", async ({ page, request }) => {
    const db = new PrismaClient();
    const before = await db.post.findFirstOrThrow({ where: { title } });
    await loginAsAdmin(page);
    await page.goto(`/admin/blog/${before.id}`);
    await page.getByLabel("Título").fill(`${title} editado`);
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page).toHaveURL(/\/admin\/blog$/);
    const after = await db.post.findUniqueOrThrow({ where: { id: before.id } });
    await db.$disconnect();
    expect(after.slug).toBe(before.slug);

    await page
      .getByRole("row", { name: new RegExp(`${title} editado`) })
      .getByRole("button", { name: "Eliminar" })
      .click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
    expect((await request.get(`/blog/${before.slug}`)).status()).toBe(404);
  });

  test("sin sesión el panel de artículos redirige", async ({ page }) => {
    await page.goto("/");
    await page.goto("/admin/blog");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
