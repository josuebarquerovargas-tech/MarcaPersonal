import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Storage } from "@/lib/storage/storage";
import { VIDEO_MIME_TO_EXT } from "@/lib/storage/mime";

export const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

export type UploadSession = {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  ext: string;
  size: number;
  mime: string;
  createdAt: string;
};

export class MissingChunksError extends Error {
  constructor(public readonly missing: number[]) {
    super(`Faltan partes: ${missing.join(", ")}`);
    this.name = "MissingChunksError";
  }
}

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Chunked uploads on top of the Storage adapter. Session metadata and chunks
 * live under `tmp/<uploadId>/`; the assembled file lands in `videos/`.
 */
export function createChunkUploads(
  storage: Storage,
  opts: { chunkSize?: number; maxBytes?: number } = {},
) {
  const chunkSize = opts.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const maxBytes = opts.maxBytes ?? MAX_VIDEO_BYTES;

  const dirOf = (id: string) => storage.resolvePath(`tmp/${id}`);
  const metaOf = (id: string) => path.join(dirOf(id), "session.json");

  async function readSession(id: string): Promise<UploadSession> {
    if (!/^[a-z0-9]+$/i.test(id)) throw new Error("Sesión de subida inválida");
    try {
      return JSON.parse(await readFile(metaOf(id), "utf8")) as UploadSession;
    } catch {
      throw new Error("Sesión de subida desconocida");
    }
  }

  return {
    async createUploadSession(input: {
      filename: string;
      size: number;
      mime: string;
    }): Promise<UploadSession> {
      const ext = VIDEO_MIME_TO_EXT[input.mime];
      if (!ext) throw new Error("Formato no permitido. Usá MP4, WebM o MOV.");
      if (!Number.isInteger(input.size) || input.size <= 0) throw new Error("Tamaño inválido");
      if (input.size > maxBytes) throw new Error("El video supera el límite de 500 MB.");
      const session: UploadSession = {
        uploadId: newId(),
        chunkSize,
        totalChunks: Math.ceil(input.size / chunkSize),
        ext,
        size: input.size,
        mime: input.mime,
        createdAt: new Date().toISOString(),
      };
      await mkdir(dirOf(session.uploadId), { recursive: true });
      await writeFile(metaOf(session.uploadId), JSON.stringify(session));
      return session;
    },

    async writeChunk(uploadId: string, index: number, data: Buffer): Promise<void> {
      const session = await readSession(uploadId);
      if (!Number.isInteger(index) || index < 0 || index >= session.totalChunks) {
        throw new Error("Índice de parte fuera de rango");
      }
      if (data.length > session.chunkSize) throw new Error("Parte demasiado grande");
      await writeFile(path.join(dirOf(uploadId), String(index)), data);
    },

    async completeUpload(uploadId: string): Promise<{ key: string; size: number; mime: string }> {
      const session = await readSession(uploadId);
      // Every part must exist with its exact expected size (the last one may be shorter).
      const missing: number[] = [];
      for (let i = 0; i < session.totalChunks; i++) {
        const expected =
          i === session.totalChunks - 1 ? session.size - i * session.chunkSize : session.chunkSize;
        const s = await storage.stat(`tmp/${uploadId}/${i}`);
        if (!s || s.size !== expected) missing.push(i);
      }
      if (missing.length) throw new MissingChunksError(missing);

      const key = `videos/${uploadId}.${session.ext}`;
      const dest = storage.resolvePath(key);
      await mkdir(path.dirname(dest), { recursive: true });
      const out = createWriteStream(dest);
      for (let i = 0; i < session.totalChunks; i++) {
        await pipeline(createReadStream(path.join(dirOf(uploadId), String(i))), out, {
          end: false,
        });
      }
      await new Promise<void>((resolve, reject) => {
        out.end((err?: Error | null) => (err ? reject(err) : resolve()));
      });
      await rm(dirOf(uploadId), { recursive: true, force: true });
      const final = await storage.stat(key);
      if (!final || final.size !== session.size) {
        await storage.delete(key).catch(() => {});
        throw new Error("El archivo ensamblado no coincide con el tamaño declarado. Subilo de nuevo.");
      }
      return { key, size: final.size, mime: session.mime };
    },

    async abortUpload(uploadId: string): Promise<void> {
      if (!/^[a-z0-9]+$/i.test(uploadId)) return;
      await rm(dirOf(uploadId), { recursive: true, force: true });
    },
  };
}
