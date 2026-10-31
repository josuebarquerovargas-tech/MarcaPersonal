import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import { getMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { canWatch } from "@/lib/videos/access";
import { storage } from "@/lib/storage/storage";
import { fileResponse } from "@/lib/storage/respond";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video || video.kind !== "FILE" || video.status !== "PUBLISHED" || !video.filePath) {
    return new Response("No encontrado", { status: 404 });
  }

  if (video.access === "MEMBERS") {
    const membership = await getMembership(await getMember());
    if (!canWatch(video, membership)) {
      return new Response("Contenido exclusivo para miembros", { status: 403 });
    }
  }

  try {
    return await fileResponse(storage, video.filePath, req.headers.get("range"), {
      "Cache-Control": "private, no-store",
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
