"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin, setAdminSession } from "@/server/auth";
import { getContent, setContent } from "@/server/content";
import { storage } from "@/lib/storage/storage";
import { IMAGE_MIMES } from "@/lib/storage/mime";
import { MAX_IMAGE_BYTES, processImage } from "@/lib/images";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type SettingsState = { error?: string; ok?: string };

export async function uploadPortrait(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  const file = fd.get("portrait");
  if (!(file instanceof File) || file.size === 0) return { error: "Elige una imagen." };
  if (!IMAGE_MIMES.has(file.type)) return { error: "El retrato debe ser JPEG, PNG o WebP." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "El retrato supera los 8 MB." };

  const img = await processImage(Buffer.from(await file.arrayBuffer()), { maxSide: 1600, quality: 86 });
  const key = `images/portrait-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}.webp`;
  await storage.save(key, img.data);

  const previous = await getContent("portrait");
  await setContent("portrait", { key });
  if (previous.key) await storage.delete(previous.key).catch(() => {});

  revalidatePath("/", "layout");
  return { ok: "Retrato actualizado" };
}

export async function saveModules(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  await setContent("features", { membership: fd.get("membership") === "on" });
  revalidatePath("/", "layout");
  return { ok: "Módulos actualizados" };
}

export async function removePortrait(): Promise<void> {
  await requireAdmin();
  const previous = await getContent("portrait");
  await setContent("portrait", { key: "" });
  if (previous.key) await storage.delete(previous.key).catch(() => {});
  revalidatePath("/", "layout");
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Ingresa tu contraseña actual"),
    next: z
      .string()
      .min(10, "La nueva contraseña debe tener al menos 10 caracteres")
      .max(200)
      .regex(/[A-Za-z]/, "Debe incluir al menos una letra")
      .regex(/\d/, "Debe incluir al menos un número"),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { path: ["confirm"], message: "La confirmación no coincide" });

export async function changeAdminPassword(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  const admin = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    current: fd.get("current"),
    next: fd.get("next"),
    confirm: fd.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  if (!(await verifyPassword(parsed.data.current, admin.passwordHash))) {
    return { error: "La contraseña actual no es correcta" };
  }
  const updated = await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(parsed.data.next), sessionVersion: { increment: 1 } },
  });
  await setAdminSession(updated);
  return { ok: "Contraseña actualizada" };
}

