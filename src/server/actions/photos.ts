"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";
import { formTokens } from "@/server/security";
import { storeImage } from "@/server/uploads";
import { storage } from "@/lib/storage/storage";
import { IMAGE_MIMES } from "@/lib/storage/mime";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";

export type PhotoFormState = { error?: string; ok?: boolean };

const MAX_FILES = 12;

export async function uploadPhotos(_prev: PhotoFormState, fd: FormData): Promise<PhotoFormState> {
  await requireAdmin();
  const token = fd.get(FORM_TOKEN_FIELD);
  if (typeof token !== "string" || !(await formTokens.consumeFormToken(token))) {
    return { error: "El formulario ya fue enviado. Recargá la página para subir más fotos." };
  }
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Elegí al menos una foto." };
  if (files.length > MAX_FILES) return { error: `Podés subir hasta ${MAX_FILES} fotos por vez.` };
  const caption = z.string().trim().max(200).parse(fd.get("caption") ?? "");

  for (const f of files) {
    if (!IMAGE_MIMES.has(f.type)) return { error: `“${f.name}” no es JPEG, PNG ni WebP.` };
    if (f.size > MAX_IMAGE_BYTES) return { error: `“${f.name}” supera los 8 MB.` };
  }

  await db.$transaction(async (tx) => {
    await tx.photo.updateMany({ data: { sortOrder: { increment: files.length } } });
    let i = 0;
    for (const f of files) {
      const { key, width, height } = await storeImage(Buffer.from(await f.arrayBuffer()), "images");
      await tx.photo.create({
        data: { url: storage.publicUrl(key), alt: caption, caption, width, height, sortOrder: i++ },
      });
    }
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updatePhoto(id: string, _prev: PhotoFormState, fd: FormData): Promise<PhotoFormState> {
  await requireAdmin();
  const caption = z.string().trim().max(200).safeParse(fd.get("caption") ?? "");
  if (!caption.success) return { error: "El pie de foto es demasiado largo." };
  await db.photo.update({ where: { id }, data: { caption: caption.data, alt: caption.data } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deletePhoto(id: string): Promise<void> {
  await requireAdmin();
  const photo = await db.photo.findUnique({ where: { id } });
  if (!photo) return;
  await db.photo.delete({ where: { id } });
  const key = photo.url.replace(/^\/media\//, "");
  if (key.startsWith("images/")) await storage.delete(key).catch(() => {});
  revalidatePath("/", "layout");
}

export async function reorderPhotos(ids: string[]): Promise<void> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) return;
  await db.$transaction(ids.map((id, i) => db.photo.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePath("/", "layout");
}
