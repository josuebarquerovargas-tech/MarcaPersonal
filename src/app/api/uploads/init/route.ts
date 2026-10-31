import { z } from "zod";
import { requireAdminApi } from "@/server/auth";
import { chunkUploads } from "@/server/uploads";

const schema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().int().positive(),
  mime: z.string().min(1),
});

export async function POST(req: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof Response) return admin;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Datos inválidos" }, { status: 400 });

  try {
    const s = await chunkUploads.createUploadSession(parsed.data);
    return Response.json(
      { uploadId: s.uploadId, chunkSize: s.chunkSize, totalChunks: s.totalChunks },
      { status: 201 },
    );
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
