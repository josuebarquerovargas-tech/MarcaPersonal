import { requireAdminApi } from "@/server/auth";
import { chunkUploads } from "@/server/uploads";
import { MissingChunksError } from "@/lib/uploads/chunks";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const { id } = await params;
  try {
    const result = await chunkUploads.completeUpload(id);
    return Response.json(result);
  } catch (e) {
    if (e instanceof MissingChunksError) {
      return Response.json({ error: e.message, missing: e.missing }, { status: 400 });
    }
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;
  const { id } = await params;
  await chunkUploads.abortUpload(id);
  return new Response(null, { status: 204 });
}
