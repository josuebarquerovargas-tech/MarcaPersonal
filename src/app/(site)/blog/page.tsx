import type { Metadata } from "next";
import { listPublishedPosts } from "@/server/posts";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PostGrid } from "@/components/site/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos de Rubén Rodríguez sobre adiestramiento, crianza responsable y bienestar animal.",
};
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await listPublishedPosts();
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Blog" title="Para leer con calma" text="Adiestramiento, crianza responsable y bienestar animal." />
        <div className="mt-12">
          {posts.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-line px-6 py-16 text-center text-muted">Pronto habrá artículos aquí.</p>
          ) : (
            <PostGrid posts={posts} />
          )}
        </div>
      </Container>
    </main>
  );
}
