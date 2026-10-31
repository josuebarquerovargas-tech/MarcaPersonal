import "server-only";
import type { Post } from "@prisma/client";
import { db } from "@/server/db";

export type { Post };

export function listPostsAdmin(): Promise<Post[]> {
  return db.post.findMany({ orderBy: [{ updatedAt: "desc" }] });
}

export function listPublishedPosts(take?: number): Promise<Post[]> {
  return db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take });
}

export function getPostById(id: string): Promise<Post | null> {
  return db.post.findUnique({ where: { id } });
}

/** Only published posts are reachable from the public site. */
export function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  return db.post.findFirst({ where: { slug, status: "PUBLISHED" } });
}
