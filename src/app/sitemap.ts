import type { MetadataRoute } from "next";
import { db } from "@/server/db";
import { SERVICES } from "@/lib/services/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const videos = await db.video.findMany({
    where: { status: "PUBLISHED", access: "FREE" },
    select: { slug: true, updatedAt: true },
  });
  const posts = await db.post.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } });
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/contenido`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...SERVICES.map((s) => ({ url: `${base}/servicios/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/sobre-mi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/galeria`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...videos.map((v) => ({ url: `${base}/contenido/${v.slug}`, lastModified: v.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
