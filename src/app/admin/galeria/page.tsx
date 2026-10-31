import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { formTokens } from "@/server/security";
import { listPhotos } from "@/server/photos";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { PhotoGrid } from "@/components/admin/PhotoGrid";

export const metadata: Metadata = { title: "Galería" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  await requireAdmin();
  const [photos, formToken] = await Promise.all([listPhotos(), formTokens.issueFormToken()]);
  return (
    <>
      <AdminPageHeader title="Galería" description="Las fotos se convierten a WebP. Arrastrá para ordenarlas." />
      <div className="mt-6">
        <PhotoUploadForm formToken={formToken} />
      </div>
      <div className="mt-6">
        <PhotoGrid photos={photos} />
      </div>
    </>
  );
}
