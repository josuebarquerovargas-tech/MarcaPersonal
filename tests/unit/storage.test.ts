import { afterEach, beforeEach, expect, test } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DiskStorage } from "@/lib/storage/disk";

let root: string;
let storage: DiskStorage;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "rr-storage-"));
  storage = new DiskStorage(root);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function readAll(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks).toString("utf8");
}

test("guarda y lee un archivo creando carpetas intermedias", async () => {
  await storage.save("t/a.txt", Buffer.from("hola"));
  expect(await storage.stat("t/a.txt")).toEqual({ size: 4 });
  expect(await readAll(storage.createReadStream("t/a.txt"))).toBe("hola");
});

test("lee un rango parcial", async () => {
  await storage.save("t/b.txt", Buffer.from("0123456789"));
  expect(await readAll(storage.createReadStream("t/b.txt", { start: 2, end: 4 }))).toBe("234");
});

test("stat de un archivo inexistente es null", async () => {
  expect(await storage.stat("no/existe.txt")).toBeNull();
});

test("delete elimina el archivo", async () => {
  await storage.save("t/c.txt", Buffer.from("x"));
  await storage.delete("t/c.txt");
  expect(await storage.stat("t/c.txt")).toBeNull();
});

test("rechaza claves que salen de la raíz", async () => {
  await expect(storage.save("../x.txt", Buffer.from("x"))).rejects.toThrow();
  await expect(storage.stat("t/../../x.txt")).rejects.toThrow();
});

test("publicUrl apunta a la ruta /media", () => {
  expect(storage.publicUrl("images/foto.webp")).toBe("/media/images/foto.webp");
});
