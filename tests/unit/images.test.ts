import { expect, test } from "vitest";
import sharp from "sharp";
import { processImage } from "@/lib/images";

async function png(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 120, b: 42 } },
  })
    .png()
    .toBuffer();
}

test("convierte a WebP conservando dimensiones pequeñas", async () => {
  const out = await processImage(await png(10, 10));
  const meta = await sharp(out.data).metadata();
  expect(meta.format).toBe("webp");
  expect(out.width).toBe(10);
  expect(out.height).toBe(10);
});

test("reduce el lado mayor a 2000 px", async () => {
  const out = await processImage(await png(3000, 1000));
  expect(out.width).toBe(2000);
  expect(out.height).toBe(667);
});

test("respeta un ancho máximo personalizado", async () => {
  const out = await processImage(await png(1600, 900), { maxSide: 640 });
  expect(out.width).toBe(640);
  expect(out.height).toBe(360);
});

test("rechaza datos que no son imagen", async () => {
  await expect(processImage(Buffer.from("no soy una imagen"))).rejects.toThrow();
});
