import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/server/posts";
import { storage } from "@/lib/storage/storage";
import { readingMinutes } from "@/lib/blog/markdown";
import { formatLongDate } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { PostBody } from "@/components/site/PostBody";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Artículo no encontrado" };
  const image = post.coverPath ? storage.publicUrl(post.coverPath) : undefined;
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      publishedTime: post.publishedAt?.toISOString(),
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="py-10 sm:py-16">
      <Container>
        <article className="mx-auto max-w-2xl">
          <Link href="/contenido#articulos" className="text-sm text-muted underline-offset-4 hover:underline">
            ← Volver al blog
          </Link>
          <h1 className="font-display mt-6 text-4xl leading-[1.05] sm:text-6xl">{post.title}</h1>
          <p className="mt-4 text-sm text-muted">
            {post.publishedAt && formatLongDate(post.publishedAt)} · {readingMinutes(post.body)} min de lectura
          </p>
          {post.excerpt && <p className="mt-6 text-xl leading-relaxed text-muted">{post.excerpt}</p>}
          {post.coverPath && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storage.publicUrl(post.coverPath)} alt="" className="mt-8 w-full rounded-[16px] object-cover shadow-soft" />
          )}
          <div className="mt-10">
            <PostBody source={post.body} />
          </div>
        </article>
      </Container>
    </main>
  );
}
