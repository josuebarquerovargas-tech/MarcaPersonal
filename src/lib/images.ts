import sharp from "sharp";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const DEFAULT_MAX_SIDE = 2000;

export type ProcessedImage = { data: Buffer; width: number; height: number };

/** Re-encodes any supported image as WebP, capping the longest side. */
export async function processImage(
  input: Buffer,
  opts: { maxSide?: number; quality?: number } = {},
): Promise<ProcessedImage> {
  const maxSide = opts.maxSide ?? DEFAULT_MAX_SIDE;
  const pipeline = sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .webp({ quality: opts.quality ?? 82 });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
