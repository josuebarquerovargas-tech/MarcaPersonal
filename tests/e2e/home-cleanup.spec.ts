import { expect, test } from "@playwright/test";

test("la portada ya no termina con la sección de contacto", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "¿Quieres cotizar?" })).toHaveCount(0);
});

test("la página de Contacto sigue completa", async ({ page }) => {
  await page.goto("/contacto");
  await expect(page.getByRole("heading", { name: "¿Quieres cotizar?" })).toBeVisible();
  await expect(page.locator("main form")).toBeVisible();
});

test("hay dos artículos de relleno, gratis y sin texto", async ({ page }) => {
  await page.goto("/contenido");
  const articles = page.locator("#articulos");
  await expect(articles.getByRole("listitem")).toHaveCount(3);
  for (const [title, slug] of [
    ["Artículo de ejemplo 1", "articulo-de-ejemplo-1"],
    ["Artículo de ejemplo 2", "articulo-de-ejemplo-2"],
  ]) {
    const link = articles.getByRole("link", { name: new RegExp(title) });
    await expect(link).toHaveAttribute("href", `/blog/${slug}`);
    await expect(link.getByText("Exclusivo", { exact: true })).toHaveCount(0);
    await expect(link.getByText(/min de lectura/)).toHaveCount(0);
  }
  await page.goto("/blog/articulo-de-ejemplo-1");
  await expect(page.getByRole("heading", { level: 1, name: "Artículo de ejemplo 1" })).toBeVisible();
  await expect(page.getByText(/min de lectura/)).toHaveCount(0);
  await expect(page.getByText("Artículo exclusivo para miembros")).toHaveCount(0);
});
