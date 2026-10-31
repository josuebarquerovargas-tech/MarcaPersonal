import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { isMembershipEnabled } from "@/server/features";
import { formTokens } from "@/server/security";
import { createVideo } from "@/server/actions/videos";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { VideoForm } from "@/components/admin/VideoForm";

export const metadata: Metadata = { title: "Nuevo video" };
export const dynamic = "force-dynamic";

export default async function NewVideoPage() {
  await requireAdmin();
  const formToken = await formTokens.issueFormToken();
  return (
    <>
      <AdminPageHeader title="Nuevo video" description="Sube un archivo o pega un enlace." />
      <div className="mt-8">
        <VideoForm action={createVideo} formToken={formToken} showAccess={await isMembershipEnabled()} />
      </div>
    </>
  );
}
