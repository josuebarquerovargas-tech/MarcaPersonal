import "server-only";
import { storage } from "@/lib/storage/storage";
import { createChunkUploads } from "@/lib/uploads/chunks";
import { processImage } from "@/lib/images";

export const chunkUploads = createChunkUploads(storage);

function newKey(prefix: string, ext: string): string {
  return `${prefix}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}.${ext}`;
}

/** Stores an image buffer as WebP under the given prefix and returns its storage key. */
export async function storeImage(
  input: Buffer,
  prefix: "thumbs" | "images",
  opts: { maxSide?: number } = {},
): Promise<{ key: string; width: number; height: number }> {
  const img = await processImage(input, opts);
  const key = newKey(prefix, "webp");
  await storage.save(key, img.data);
  return { key, width: img.width, height: img.height };
}

/** Downloads a remote image (best effort, 6 s timeout) and stores it as a thumbnail. */
export async function storeRemoteThumbnail(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > 10 * 1024 * 1024) return null;
    const { key } = await storeImage(buf, "thumbs", { maxSide: 1280 });
    return key;
  } catch {
    return null;
  }
}

/** Decodes a `data:image/...;base64,...` URL into a Buffer, or null. */
export function decodeDataUrl(dataUrl: string): Buffer | null {
  const m = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const buf = Buffer.from(m[1], "base64");
  return buf.length > 0 && buf.length <= 4 * 1024 * 1024 ? buf : null;
}
