"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";
import { formTokens } from "@/server/security";
import { decodeDataUrl, storeImage, storeRemoteThumbnail } from "@/server/uploads";
import { deleteVideoFiles } from "@/server/videos";
import { storage } from "@/lib/storage/storage";
import { IMAGE_MIMES } from "@/lib/storage/mime";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { isShortTikTokLink, parseEmbedUrl, resolveShortTikTokLink } from "@/lib/videos/embed";
import { slugify, uniqueSlug } from "@/lib/videos/slug";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";

export type VideoFormState = { error?: string; ok?: boolean };

const base = z.object({
  title: z.string().trim().min(2, "El título es obligatorio").max(140),
  description: z.string().trim().max(2000).default(""),
  access: z.enum(["FREE", "MEMBERS"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.coerce.boolean().default(false),
  publishedAt: z.string().optional(),
  durationSec: z.coerce.number().int().nonnegative().optional(),
});

const fileSchema = base.extend({ kind: z.literal("FILE"), fileKey: z.string().min(1) });
const embedSchema = base.extend({ kind: z.literal("EMBED"), sourceUrl: z.string().trim().url() });
const schema = z.discriminatedUnion("kind", [fileSchema, embedSchema]);

function str(fd: FormData, k: string) {
  const v = fd.get(k);
  return typeof v === "string" ? v : undefined;
}

function readForm(fd: FormData) {
  return schema.safeParse({
    kind: str(fd, "kind"),
    title: str(fd, "title"),
    description: str(fd, "description") ?? "",
    access: str(fd, "access"),
    status: str(fd, "status"),
    featured: fd.get("featured") === "on" || fd.get("featured") === "true",
    publishedAt: str(fd, "publishedAt") || undefined,
    durationSec: str(fd, "durationSec") || undefined,
    fileKey: str(fd, "fileKey") || undefined,
    sourceUrl: str(fd, "sourceUrl") || undefined,
  });
}

async function thumbnailFromForm(fd: FormData): Promise<string | null> {
  const file = fd.get("thumbnail");
  if (file instanceof File && file.size > 0) {
    if (!IMAGE_MIMES.has(file.type)) throw new Error("La miniatura debe ser JPEG, PNG o WebP.");
    if (file.size > MAX_IMAGE_BYTES) throw new Error("La miniatura supera los 8 MB.");
    const { key } = await storeImage(Buffer.from(await file.arrayBuffer()), "thumbs", { maxSide: 1280 });
    return key;
  }
  const data = str(fd, "thumbnailData");
  if (data) {
    const buf = decodeDataUrl(data);
    if (buf) {
      const { key } = await storeImage(buf, "thumbs", { maxSide: 1280 });
      return key;
    }
  }
  return null;
}

async function embedThumbnail(platform: "TIKTOK" | "INSTAGRAM" | "YOUTUBE", externalId: string, url: string) {
  if (platform === "YOUTUBE") {
    return storeRemoteThumbnail(`https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`);
  }
  if (platform === "TIKTOK") {
    try {
      const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { thumbnail_url?: string };
      return json.thumbnail_url ? storeRemoteThumbnail(json.thumbnail_url) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function createVideo(_prev: VideoFormState, fd: FormData): Promise<VideoFormState> {
  await requireAdmin();
  const parsed = readForm(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const data: Prisma.VideoCreateInput = {
    slug: await uniqueSlug(slugify(d.title), async (s) => !!(await db.video.findUnique({ where: { slug: s } }))),
    title: d.title,
    description: d.description,
    kind: d.kind,
    access: d.access,
    status: d.status,
    featured: d.featured,
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : new Date(),
    durationSec: d.durationSec ?? null,
    sortOrder: 0,
  };

  try {
    if (d.kind === "FILE") {
      if (!d.fileKey.startsWith("videos/") || !(await storage.stat(d.fileKey))) {
        return { error: "El archivo de video no se encontró. Súbelo de nuevo." };
      }
      data.filePath = d.fileKey;
      data.thumbnailPath = await thumbnailFromForm(fd);
    } else {
      const sourceUrl = isShortTikTokLink(d.sourceUrl) ? await resolveShortTikTokLink(d.sourceUrl) : d.sourceUrl;
      if (!sourceUrl) return { error: "No pudimos abrir ese enlace corto de TikTok. Revísalo o pega el enlace completo." };
      const parsedUrl = parseEmbedUrl(sourceUrl);
      if (!parsedUrl) return { error: "El enlace debe ser de TikTok, Instagram o YouTube." };
      if (await db.video.findUnique({ where: { sourceUrl } })) {
        return { error: "Ese enlace ya está en la lista de videos." };
      }
      data.sourceUrl = sourceUrl;
      data.platform = parsedUrl.platform;
      data.thumbnailPath =
        (await thumbnailFromForm(fd)) ??
        (await embedThumbnail(parsedUrl.platform, parsedUrl.externalId, sourceUrl));
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (!(await formTokens.consumeFormToken(str(fd, FORM_TOKEN_FIELD) ?? ""))) {
    return { error: "Este formulario ya fue enviado. Revisa la lista de videos." };
  }
  await db.$transaction(async (tx) => {
    await tx.video.updateMany({ data: { sortOrder: { increment: 1 } } });
    await tx.video.create({ data });
  });
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

export async function updateVideo(id: string, _prev: VideoFormState, fd: FormData): Promise<VideoFormState> {
  await requireAdmin();
  const existing = await db.video.findUnique({ where: { id } });
  if (!existing) return { error: "El video no existe." };
  const parsed = readForm(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  const d = parsed.data;

  const data: Prisma.VideoUpdateInput = {
    title: d.title,
    description: d.description,
    access: d.access,
    status: d.status,
    featured: d.featured,
    publishedAt: d.publishedAt ? new Date(d.publishedAt) : existing.publishedAt,
  };
  if (d.title !== existing.title) {
    data.slug = await uniqueSlug(slugify(d.title), async (s) =>
      !!(await db.video.findFirst({ where: { slug: s, id: { not: id } } })),
    );
  }
  try {
    const newThumb = await thumbnailFromForm(fd);
    if (newThumb) {
      data.thumbnailPath = newThumb;
      if (existing.thumbnailPath) await storage.delete(existing.thumbnailPath).catch(() => {});
    }
  } catch (e) {
    return { error: (e as Error).message };
  }

  await db.video.update({ where: { id }, data });
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

export async function deleteVideo(id: string): Promise<void> {
  await requireAdmin();
  const video = await db.video.findUnique({ where: { id } });
  if (!video) return;
  await db.video.delete({ where: { id } });
  await deleteVideoFiles(video);
  revalidatePath("/", "layout");
}

export async function setVideoStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<void> {
  await requireAdmin();
  await db.video.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout");
}

export async function reorderVideos(ids: string[]): Promise<void> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) return;
  await db.$transaction(ids.map((id, i) => db.video.update({ where: { id }, data: { sortOrder: i } })));
  revalidatePath("/", "layout");
}
