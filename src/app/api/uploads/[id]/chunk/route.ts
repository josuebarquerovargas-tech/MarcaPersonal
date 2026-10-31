import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/server/auth";
import { chunkUploads } from "@/server/uploads";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const rawIndex = req.nextUrl.searchParams.get("index");
  if (rawIndex === null || !/^\d+$/.test(rawIndex)) {
    return Response.json({ error: "Falta el índice de la parte" }, { status: 400 });
  }
  const index = Number(rawIndex);
  const data = Buffer.from(await req.arrayBuffer());
  try {
    await chunkUploads.writeChunk(id, index, data);
    return new Response(null, { status: 204 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
