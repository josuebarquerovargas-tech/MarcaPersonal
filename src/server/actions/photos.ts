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

const MAX_PHOTOS_PER_UPLOAD = 12;

export async function uploadPhotos(_prev: PhotoFormState, fd: FormData): Promise<PhotoFormState> {
  await requireAdmin();
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Elige al menos una foto." };
  if (files.length > MAX_PHOTOS_PER_UPLOAD) {
    return { error: `Puedes subir hasta ${MAX_PHOTOS_PER_UPLOAD} fotos por vez.` };
  }
  const caption = z.string().trim().max(200).parse(fd.get("caption") ?? "");
  for (const f of files) {
    if (!IMAGE_MIMES.has(f.type)) return { error: `“${f.name}” no es JPEG, PNG ni WebP.` };
    if (f.size > MAX_IMAGE_BYTES) return { error: `“${f.name}” supera los 8 MB.` };
  }

  // Validation passed: spend the one-time token now, then do the slow work
  // (image processing) outside of the database transaction.
  const token = fd.get(FORM_TOKEN_FIELD);
  if (typeof token !== "string" || !(await formTokens.consumeFormToken(token))) {
    return { error: "El formulario ya fue enviado. Recarga la página para subir más fotos." };
  }

  const stored: { key: string; width: number; height: number }[] = [];
  try {
    for (const f of files) {
      stored.push(await storeImage(Buffer.from(await f.arrayBuffer()), "images"));
    }
    await db.$transaction(async (tx) => {
      await tx.photo.updateMany({ data: { sortOrder: { increment: stored.length } } });
      await tx.photo.createMany({
        data: stored.map((s, i) => ({
          url: storage.publicUrl(s.key),
          alt: caption,
          caption,
          width: s.width,
          height: s.height,
          sortOrder: i,
        })),
      });
    });
  } catch (e) {
    await Promise.all(stored.map((s) => storage.delete(s.key).catch(() => {})));
    return { error: `No se pudieron guardar las fotos: ${(e as Error).message}` };
  }

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
  const existing = new Set((await db.photo.findMany({ select: { id: true } })).map((p) => p.id));
  const valid = ids.filter((id) => existing.has(id));
  await db.$transaction(valid.map((id, i) => db.photo.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePath("/", "layout");
}
