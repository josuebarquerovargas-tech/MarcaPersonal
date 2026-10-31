import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { listPostsAdmin } from "@/server/posts";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostTable } from "@/components/admin/PostTable";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await listPostsAdmin();
  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Los borradores no se ven en el sitio hasta publicarlos."
        actions={<LinkButton href="/admin/blog/nuevo">Nuevo artículo</LinkButton>}
      />
      <div className="mt-6">
        <PostTable posts={posts} />
      </div>
    </>
  );
}
