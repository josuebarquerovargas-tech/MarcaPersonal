import { afterEach, beforeEach, expect, test } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DiskStorage } from "@/lib/storage/disk";
import { createChunkUploads, MissingChunksError } from "@/lib/uploads/chunks";

let root: string;
let storage: DiskStorage;
let uploads: ReturnType<typeof createChunkUploads>;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "rr-chunks-"));
  storage = new DiskStorage(root);
  uploads = createChunkUploads(storage, { chunkSize: 5 });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function readAll(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  return Buffer.concat(chunks);
}

test("crea la sesión con el número de partes según el tamaño", async () => {
  const s = await uploads.createUploadSession({ filename: "a.mp4", size: 12, mime: "video/mp4" });
  expect(s.chunkSize).toBe(5);
  expect(s.totalChunks).toBe(3);
  expect(s.uploadId).toMatch(/^[a-z0-9]+$/i);
});

test("ensambla las partes en orden y limpia los temporales", async () => {
  const s = await uploads.createUploadSession({ filename: "a.mp4", size: 12, mime: "video/mp4" });
  await uploads.writeChunk(s.uploadId, 2, Buffer.from("KL"));
  await uploads.writeChunk(s.uploadId, 0, Buffer.from("ABCDE"));
  await uploads.writeChunk(s.uploadId, 1, Buffer.from("FGHIJ"));
  const { key } = await uploads.completeUpload(s.uploadId);
  expect(key).toBe(`videos/${s.uploadId}.mp4`);
  expect((await readAll(storage.createReadStream(key))).toString()).toBe("ABCDEFGHIJKL");
  expect(await storage.stat(`tmp/${s.uploadId}/0`)).toBeNull();
});

test("falla con las partes faltantes y no crea el archivo final", async () => {
  const s = await uploads.createUploadSession({ filename: "a.mp4", size: 12, mime: "video/mp4" });
  await uploads.writeChunk(s.uploadId, 0, Buffer.from("ABCDE"));
  await uploads.writeChunk(s.uploadId, 2, Buffer.from("KL"));
  const err = await uploads.completeUpload(s.uploadId).catch((e) => e);
  expect(err).toBeInstanceOf(MissingChunksError);
  expect((err as MissingChunksError).missing).toEqual([1]);
  expect(await storage.stat(`videos/${s.uploadId}.mp4`)).toBeNull();
});

test("rechaza mime no permitido y tamaño excesivo", async () => {
  await expect(
    uploads.createUploadSession({ filename: "a.avi", size: 10, mime: "video/x-msvideo" }),
  ).rejects.toThrow(/formato/i);
  await expect(
    uploads.createUploadSession({ filename: "a.mp4", size: 600 * 1024 * 1024, mime: "video/mp4" }),
  ).rejects.toThrow(/500 MB/);
});

test("rechaza índices de parte fuera de rango o sesión desconocida", async () => {
  const s = await uploads.createUploadSession({ filename: "a.mov", size: 12, mime: "video/quicktime" });
  await expect(uploads.writeChunk(s.uploadId, 3, Buffer.from("x"))).rejects.toThrow();
  await expect(uploads.writeChunk("nope", 0, Buffer.from("x"))).rejects.toThrow();
});
