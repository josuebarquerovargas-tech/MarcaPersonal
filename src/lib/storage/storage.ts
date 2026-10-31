import { DiskStorage } from "./disk";
import type { ByteRange } from "./range";

export interface Storage {
  save(key: string, data: Buffer | NodeJS.ReadableStream): Promise<void>;
  stat(key: string): Promise<{ size: number } | null>;
  createReadStream(key: string, range?: ByteRange): NodeJS.ReadableStream;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
  /** Absolute filesystem path for the key (disk adapter only). */
  resolvePath(key: string): string;
}

export const storage: Storage = new DiskStorage(process.env.UPLOADS_DIR ?? "./data/uploads");
