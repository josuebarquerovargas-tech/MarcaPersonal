import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { formTokens } from "@/server/security";
import { createPost } from "@/server/actions/posts";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/PostForm";

export const metadata: Metadata = { title: "Nuevo artículo" };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireAdmin();
  const formToken = await formTokens.issueFormToken();
  return (
    <>
      <AdminPageHeader title="Nuevo artículo" description="Guardalo como borrador o publicalo de una vez." />
      <div className="mt-8">
        <PostForm action={createPost} formToken={formToken} />
      </div>
    </>
  );
}
