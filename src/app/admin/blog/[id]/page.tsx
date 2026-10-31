import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth";
import { getPostById } from "@/server/posts";
import { updatePost } from "@/server/actions/posts";
import { storage } from "@/lib/storage/storage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/PostForm";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Editar artículo" };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();
  return (
    <>
      <AdminPageHeader
        title="Editar artículo"
        description={post.title}
        actions={
          post.status === "PUBLISHED" ? (
            <LinkButton href={`/blog/${post.slug}`} variant="secondary" size="sm">
              Ver en el sitio ↗
            </LinkButton>
          ) : null
        }
      />
      <div className="mt-8">
        <PostForm
          action={updatePost.bind(null, post.id)}
          post={post}
          coverUrl={post.coverPath ? storage.publicUrl(post.coverPath) : null}
        />
      </div>
    </>
  );
}
