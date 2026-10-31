import "server-only";
import type { Post } from "@prisma/client";
import { db } from "@/server/db";
import { isMembershipEnabled } from "@/server/features";
import { readingMinutes } from "@/lib/blog/markdown";

export type { Post };

/** A public view of a post. It carries no body, so exclusive text cannot leak through it. */
export type PostPreview = Omit<Post, "body">;
export type PostCardData = PostPreview & { minutes: number };

export function listPostsAdmin(): Promise<Post[]> {
  return db.post.findMany({ orderBy: [{ updatedAt: "desc" }] });
}

/** With membership switched off, exclusive articles do not exist for the public site. */
export async function listPublishedPosts(opts: { take?: number; access?: "FREE" | "MEMBERS" } = {}): Promise<PostCardData[]> {
  const on = await isMembershipEnabled();
  if (!on && opts.access === "MEMBERS") return [];
  const access = on ? opts.access : "FREE";
  const posts = await db.post.findMany({ where: { status: "PUBLISHED", ...(access ? { access } : {}) }, orderBy: { publishedAt: "desc" }, take: opts.take });
  return posts.map(({ body, ...post }) => ({ ...post, minutes: readingMinutes(body) }));
}

export function getPostById(id: string): Promise<Post | null> {
  return db.post.findUnique({ where: { id } });
}

/** Only published posts are reachable from the public site. */
export async function getPublishedPostBySlug(slug: string): Promise<PostPreview | null> {
  const on = await isMembershipEnabled();
  return db.post.findFirst({ where: { slug, status: "PUBLISHED", ...(on ? {} : { access: "FREE" as const }) }, omit: { body: true } });
}

/** Call only after checking access: this is the one public path to an article's text. */
export async function getPostBody(id: string): Promise<string> {
  const post = await db.post.findUniqueOrThrow({ where: { id }, select: { body: true } });
  return post.body;
}
