import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { loginAsAdmin } from "./helpers";
import { setMembership } from "./membership";

const uploadsDir = process.env.UPLOADS_DIR ?? "./data/uploads";

test.describe.serial("membresía desactivable", () => {
  let videoId = "";

  test.beforeAll(async () => {
    await mkdir(path.join(uploadsDir, "videos"), { recursive: true });
    await copyFile(path.join(__dirname, "fixtures", "sample.mp4"), path.join(uploadsDir, "videos", "flag.mp4"));
    const db = new PrismaClient();
    const v = await db.video.upsert({
      where: { slug: "flag-exclusivo" },
      update: {},
      create: { slug: "flag-exclusivo", title: "Flag exclusivo", kind: "FILE", filePath: "videos/flag.mp4", access: "MEMBERS", status: "PUBLISHED" },
    });
    videoId = v.id;
    await db.$disconnect();
    await setMembership(false);
  });

  test.afterAll(async () => {
    const db = new PrismaClient();
    await db.video.deleteMany({ where: { slug: "flag-exclusivo" } });
    await db.$disconnect();
    await setMembership(true);
  });

  test("apagada: sus páginas no existen", async ({ request }) => {
    for (const p of ["/registro", "/ingresar", "/pago/exito", "/pago/error"]) {
      expect((await request.get(p)).status(), p).toBe(404);
    }
  });

  test("apagada: el video exclusivo no aparece", async ({ page, request }) => {
    await page.goto("/contenido");
    await expect(page.getByRole("heading", { name: "Flag exclusivo" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Exclusivos" })).toHaveCount(0);
    await expect(page.locator("#membresia")).toHaveCount(0);
    expect((await request.get("/contenido/flag-exclusivo")).status()).toBe(404);
    expect((await request.get(`/api/stream/${videoId}`)).status()).toBe(403);
  });

  test("el admin la activa desde Ajustes y vuelve todo", async ({ page, request }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/ajustes");
    await page.getByLabel("Activar membresía y pagos").check();
    await page.getByRole("button", { name: "Guardar módulos" }).click();
    await expect(page.getByText("Módulos actualizados")).toBeVisible();
    await expect(page.getByRole("link", { name: "Miembros" })).toBeVisible();
    expect((await request.get("/registro")).status()).toBe(200);
    await page.goto("/contenido");
    await expect(page.getByRole("heading", { name: "Flag exclusivo" })).toBeVisible();
  });

  test("apagada: el panel oculta miembros y pagos", async ({ page }) => {
    await setMembership(false);
    await loginAsAdmin(page);
    await expect(page.getByRole("link", { name: "Miembros" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Pagos" })).toHaveCount(0);
  });
});
