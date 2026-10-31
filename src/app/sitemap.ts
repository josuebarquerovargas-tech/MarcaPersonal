import type { MetadataRoute } from "next";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const videos = await db.video.findMany({
    where: { status: "PUBLISHED", access: "FREE" },
    select: { slug: true, updatedAt: true },
  });
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/videos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/membresia`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/sobre-mi`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/galeria`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    ...videos.map((v) => ({ url: `${base}/videos/${v.slug}`, lastModified: v.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
