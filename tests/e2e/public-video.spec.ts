import { expect, test } from "@playwright/test";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { setMembership } from "./membership";

test.beforeAll(async () => {
  await setMembership(true);
});

test.afterAll(async () => {
  await setMembership(true);
});


const uploadsDir = process.env.UPLOADS_DIR ?? "./data/uploads";
const fixture = path.join(__dirname, "fixtures", "sample.mp4");

let freeId = "";
let membersId = "";
let membersSlug = "";

test.beforeAll(async () => {
  await mkdir(path.join(uploadsDir, "videos"), { recursive: true });
  await copyFile(fixture, path.join(uploadsDir, "videos", "e2e-free.mp4"));
  await copyFile(fixture, path.join(uploadsDir, "videos", "e2e-members.mp4"));
  const db = new PrismaClient();
  try {
    await db.video.deleteMany({ where: { slug: { startsWith: "e2e-" } } });
    const free = await db.video.create({
      data: { slug: "e2e-gratis", title: "E2E paseo gratis", kind: "FILE", filePath: "videos/e2e-free.mp4", access: "FREE", status: "PUBLISHED" },
    });
    const members = await db.video.create({
      data: { slug: "e2e-exclusivo", title: "E2E sesión exclusiva", kind: "FILE", filePath: "videos/e2e-members.mp4", access: "MEMBERS", status: "PUBLISHED" },
    });
    await db.video.create({
      data: { slug: "e2e-borrador", title: "E2E borrador oculto", kind: "FILE", filePath: "videos/e2e-free.mp4", access: "FREE", status: "DRAFT" },
    });
    freeId = free.id;
    membersId = members.id;
    membersSlug = members.slug;
  } finally {
    await db.$disconnect();
  }
});

test("el catálogo lista los publicados y oculta los borradores", async ({ page }) => {
  await page.goto("/videos");
  await expect(page.getByRole("heading", { name: "E2E paseo gratis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "E2E sesión exclusiva" })).toBeVisible();
  await expect(page.getByText("E2E borrador oculto")).toHaveCount(0);
});

test("el stream de un video gratis responde completo y por rangos", async ({ request }) => {
  const full = await request.get(`/api/stream/${freeId}`);
  expect(full.status()).toBe(200);
  expect(full.headers()["accept-ranges"]).toBe("bytes");
  expect(full.headers()["content-type"]).toBe("video/mp4");
  expect((await full.body()).length).toBeGreaterThan(1000);
  const partial = await request.get(`/api/stream/${freeId}`, { headers: { Range: "bytes=0-99" } });
  expect(partial.status()).toBe(206);
  expect((await partial.body()).length).toBe(100);
  expect(partial.headers()["content-range"]).toMatch(/^bytes 0-99\//);
});

test("un video exclusivo niega el stream y muestra el candado sin sesión", async ({ page, request }) => {
  const res = await request.get(`/api/stream/${membersId}`);
  expect(res.status()).toBe(403);
  await page.goto(`/videos/${membersSlug}`);
  await expect(page.getByText("Contenido exclusivo para miembros")).toBeVisible();
  await expect(page.getByRole("link", { name: "Hazte miembro" }).first()).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
});

test("un video gratis muestra el reproductor y cuenta la vista", async ({ page }) => {
  await page.goto("/videos/e2e-gratis");
  await expect(page.locator("video")).toHaveCount(1);
  await page.goto("/videos/e2e-gratis");
  const db = new PrismaClient();
  try {
    const v = await db.video.findUniqueOrThrow({ where: { slug: "e2e-gratis" } });
    expect(v.views).toBeGreaterThanOrEqual(2);
  } finally {
    await db.$disconnect();
  }
});

test("el filtro de gratis excluye los exclusivos", async ({ page }) => {
  await page.goto("/videos?acceso=gratis");
  await expect(page.getByRole("heading", { name: "E2E paseo gratis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "E2E sesión exclusiva" })).toHaveCount(0);
});

test("un stream inexistente o de borrador responde 404", async ({ request }) => {
  expect((await request.get("/api/stream/no-existe")).status()).toBe(404);
  const db = new PrismaClient();
  const draft = await db.video.findUniqueOrThrow({ where: { slug: "e2e-borrador" } });
  await db.$disconnect();
  expect((await request.get(`/api/stream/${draft.id}`)).status()).toBe(404);
});
