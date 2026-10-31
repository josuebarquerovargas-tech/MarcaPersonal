import type { NextRequest } from "next/server";
import { storage } from "@/lib/storage/storage";
import { fileResponse } from "@/lib/storage/respond";

export const dynamic = "force-dynamic";

const PUBLIC_PREFIXES = ["images/", "thumbs/"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = path.join("/");
  if (!PUBLIC_PREFIXES.some((p) => key.startsWith(p))) {
    return new Response("No encontrado", { status: 404 });
  }
  try {
    return await fileResponse(storage, key, req.headers.get("range"), {
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  } catch {
    return new Response("No encontrado", { status: 404 });
  }
}
