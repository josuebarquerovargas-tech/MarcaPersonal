"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";
import { formTokens } from "@/server/security";
import { storeImage } from "@/server/uploads";
import { storage } from "@/lib/storage/storage";
import { IMAGE_MIMES } from "@/lib/storage/mime";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { slugify, uniqueSlug } from "@/lib/videos/slug";

export type PostFormState = { error?: string };

const schema = z.object({
  title: z.string().trim().min(2, "El título es obligatorio").max(140, "El título es demasiado largo"),
  excerpt: z.string().trim().max(300, "El resumen admite hasta 300 caracteres"),
  body: z.string().trim().min(1, "El contenido es obligatorio").max(50_000, "El contenido es demasiado largo"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

function readForm(fd: FormData) {
  return schema.safeParse({
    title: fd.get("title") ?? "",
    excerpt: fd.get("excerpt") ?? "",
    body: fd.get("body") ?? "",
    status: fd.get("status") ?? "DRAFT",
  });
}

function coverFile(fd: FormData): File | null | string {
  const file = fd.get("cover");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!IMAGE_MIMES.has(file.type)) return "La portada debe ser JPEG, PNG o WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "La portada supera los 8 MB.";
  return file;
}

async function storeCover(file: File): Promise<string> {
  const { key } = await storeImage(Buffer.from(await file.arrayBuffer()), "images", { maxSide: 1600 });
  return key;
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createPost(_prev: PostFormState, fd: FormData): Promise<PostFormState> {
  await requireAdmin();
  const parsed = readForm(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const cover = coverFile(fd);
  if (typeof cover === "string") return { error: cover };

  const token = fd.get(FORM_TOKEN_FIELD);
  if (typeof token !== "string" || !(await formTokens.consumeFormToken(token))) {
    return { error: "Este formulario ya fue enviado. Revisa la lista de artículos." };
  }

  const slug = await uniqueSlug(slugify(parsed.data.title), async (s) => !!(await db.post.findUnique({ where: { slug: s } })));
  await db.post.create({
    data: {
      ...parsed.data,
      slug,
      coverPath: cover ? await storeCover(cover) : null,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  refresh();
  redirect("/admin/blog");
}

export async function updatePost(id: string, _prev: PostFormState, fd: FormData): Promise<PostFormState> {
  await requireAdmin();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return { error: "El artículo ya no existe." };
  const parsed = readForm(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const cover = coverFile(fd);
  if (typeof cover === "string") return { error: cover };

  // The slug stays fixed so links already shared keep working after a title edit.
  const coverPath = cover ? await storeCover(cover) : existing.coverPath;
  await db.post.update({
    where: { id },
    data: {
      ...parsed.data,
      coverPath,
      publishedAt: existing.publishedAt ?? (parsed.data.status === "PUBLISHED" ? new Date() : null),
    },
  });
  if (cover && existing.coverPath) await storage.delete(existing.coverPath).catch(() => {});
  refresh();
  redirect("/admin/blog");
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<void> {
  await requireAdmin();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return;
  await db.post.update({
    where: { id },
    data: { status, publishedAt: existing.publishedAt ?? (status === "PUBLISHED" ? new Date() : null) },
  });
  refresh();
}

export async function deletePost(id: string): Promise<void> {
  await requireAdmin();
  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return;
  await db.post.delete({ where: { id } });
  if (existing.coverPath) await storage.delete(existing.coverPath).catch(() => {});
  refresh();
}
