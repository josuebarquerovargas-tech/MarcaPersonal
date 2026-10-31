import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Storage } from "./storage";
import type { ByteRange } from "./range";

export class DiskStorage implements Storage {
  private readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  resolvePath(key: string): string {
    const normalized = key.replace(/\\/g, "/");
    if (normalized.startsWith("/") || normalized.split("/").includes("..")) {
      throw new Error(`Clave de almacenamiento no permitida: ${key}`);
    }
    const full = path.resolve(this.root, normalized);
    if (full !== this.root && !full.startsWith(this.root + path.sep)) {
      throw new Error(`Clave de almacenamiento no permitida: ${key}`);
    }
    return full;
  }

  async save(key: string, data: Buffer | NodeJS.ReadableStream): Promise<void> {
    const full = this.resolvePath(key);
    await mkdir(path.dirname(full), { recursive: true });
    if (Buffer.isBuffer(data)) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(full, data);
      return;
    }
    await pipeline(data, createWriteStream(full));
  }

  async stat(key: string): Promise<{ size: number } | null> {
    const full = this.resolvePath(key);
    try {
      const s = await stat(full);
      return s.isFile() ? { size: s.size } : null;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  createReadStream(key: string, range?: ByteRange): NodeJS.ReadableStream {
    const full = this.resolvePath(key);
    return createReadStream(full, range ? { start: range.start, end: range.end } : undefined);
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolvePath(key), { force: true });
  }

  publicUrl(key: string): string {
    return `/media/${key.replace(/\\/g, "/")}`;
  }
}
