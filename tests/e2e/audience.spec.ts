import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { loginAsAdmin } from "./helpers";
import { defaults } from "../../src/lib/content/defaults";

async function saveAbout(value: unknown) {
  const db = new PrismaClient();
  try {
    if (value === null) await db.siteContent.deleteMany({ where: { key: "about" } });
    else await db.siteContent.upsert({ where: { key: "about" }, update: { value: value as object }, create: { key: "about", value: value as object } });
  } finally {
    await db.$disconnect();
  }
}

test.afterEach(() => saveAbout(null));

test("la portada lista a quién sirve Rubén, como en su anuncio", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Estamos para servirte" })).toBeVisible();
  const list = page.locator("#sobre-mi li");
  await expect(list).toHaveCount(7);
  await expect(list.filter({ hasText: "Microempresarios" })).toBeVisible();
});

test("un detalle escrito en el panel se muestra junto a su público", async ({ page }) => {
  await saveAbout({ ...defaults.about, facts: [{ label: "Emprendedores", value: "Desde tu primera venta" }] });
  await page.goto("/");
  await expect(page.locator("#sobre-mi li").filter({ hasText: "Emprendedores" })).toContainText("Desde tu primera venta");
});

test("el panel nombra esa lista por lo que es", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/contenido?seccion=about");
  await expect(page.getByText("A quién servimos")).toBeVisible();
  await expect(page.getByLabel("Público 1")).toHaveValue("Empresas grandes y medianas");
});
