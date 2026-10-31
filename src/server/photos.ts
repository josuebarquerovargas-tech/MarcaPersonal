import "server-only";
import type { Photo } from "@prisma/client";
import { db } from "@/server/db";

export type { Photo };

export async function listPhotos(): Promise<Photo[]> {
  return db.photo.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}
