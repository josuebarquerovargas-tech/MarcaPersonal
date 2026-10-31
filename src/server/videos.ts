import "server-only";
import type { Prisma, Video } from "@prisma/client";
import { db } from "@/server/db";
import { isMembershipEnabled } from "@/server/features";
import { storage } from "@/lib/storage/storage";

export type { Video };

export async function listVideosAdmin(): Promise<Video[]> {
  return db.video.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export async function getVideoById(id: string): Promise<Video | null> {
  return db.video.findUnique({ where: { id } });
}

export async function getVideoBySlug(slug: string): Promise<Video | null> {
  return db.video.findUnique({ where: { slug } });
}

export type PublicVideoFilter = {
  access?: "FREE" | "MEMBERS";
  platform?: "TIKTOK" | "INSTAGRAM" | "YOUTUBE" | "FILE";
  q?: string;
  take?: number;
};

export async function listPublishedVideos(filter: PublicVideoFilter = {}): Promise<Video[]> {
  const where: Prisma.VideoWhereInput = { status: "PUBLISHED" };
  if (filter.access) where.access = filter.access;
  if (!(await isMembershipEnabled())) where.access = "FREE";
  if (filter.platform === "FILE") where.kind = "FILE";
  else if (filter.platform) where.platform = filter.platform;
  if (filter.q) {
    where.OR = [
      { title: { contains: filter.q, mode: "insensitive" } },
      { description: { contains: filter.q, mode: "insensitive" } },
    ];
  }
  return db.video.findMany({
    where,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: filter.take,
  });
}

export async function relatedVideos(video: Video, n = 4): Promise<Video[]> {
  return db.video.findMany({
    where: { status: "PUBLISHED", id: { not: video.id }, ...((await isMembershipEnabled()) ? {} : { access: "FREE" as const }) },
    orderBy: [{ access: video.access === "MEMBERS" ? "desc" : "asc" }, { publishedAt: "desc" }],
    take: n,
  });
}

export async function incrementViews(id: string): Promise<void> {
  await db.video.update({ where: { id }, data: { views: { increment: 1 } } });
}

export function thumbnailUrl(video: Pick<Video, "thumbnailPath">): string | null {
  return video.thumbnailPath ? storage.publicUrl(video.thumbnailPath) : null;
}

export async function deleteVideoFiles(video: Pick<Video, "filePath" | "thumbnailPath">) {
  if (video.filePath) await storage.delete(video.filePath).catch(() => {});
  if (video.thumbnailPath) await storage.delete(video.thumbnailPath).catch(() => {});
}
