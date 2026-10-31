import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth";
import { isMembershipEnabled } from "@/server/features";
import { getVideoById } from "@/server/videos";
import { updateVideo } from "@/server/actions/videos";
import { storage } from "@/lib/storage/storage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoForm } from "@/components/admin/VideoForm";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Editar video" };

export default async function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const video = await getVideoById(id);
  if (!video) notFound();
  const action = updateVideo.bind(null, video.id);

  return (
    <>
      <AdminPageHeader
        title="Editar video"
        description={video.title}
        actions={
          video.status === "PUBLISHED" ? (
            <LinkButton href={`/contenido/${video.slug}`} variant="secondary" size="sm">
              Ver en el sitio ↗
            </LinkButton>
          ) : null
        }
      />
      <div className="mt-8">
        <VideoForm
          action={action}
          video={video}
          showAccess={await isMembershipEnabled()}
          thumbnailUrl={video.thumbnailPath ? storage.publicUrl(video.thumbnailPath) : null}
        />
      </div>
    </>
  );
}
