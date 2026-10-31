import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { listVideosAdmin } from "@/server/videos";
import { storage } from "@/lib/storage/storage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoTable } from "@/components/admin/VideoTable";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Videos" };

export default async function AdminVideosPage() {
  await requireAdmin();
  const videos = await listVideosAdmin();
  const rows = videos.map((v) => ({
    ...v,
    thumbUrl: v.thumbnailPath ? storage.publicUrl(v.thumbnailPath) : null,
  }));

  return (
    <>
      <AdminPageHeader
        title="Videos"
        description="Arrastrá para cambiar el orden. Los destacados aparecen primero en la portada."
        actions={<LinkButton href="/admin/videos/nuevo">Nuevo video</LinkButton>}
      />
      <div className="mt-6">
        <VideoTable videos={rows} />
      </div>
    </>
  );
}
