import Link from "next/link";
import type { Post } from "@prisma/client";
import { storage } from "@/lib/storage/storage";
import { readingMinutes } from "@/lib/blog/markdown";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <Reveal as="li" delay={Math.min(index, 5) * 0.06} className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden rounded-[14px] bg-surface-2 shadow-soft">
          {post.coverPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storage.publicUrl(post.coverPath)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_60%)]">
              <span className="font-display text-5xl text-ink/20">RR</span>
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">
          {post.publishedAt && formatDate(post.publishedAt)} · {readingMinutes(post.body)} min de lectura
        </p>
        <h3 className="font-display mt-1 text-2xl leading-snug group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-muted">{post.excerpt}</p>}
      </Link>
    </Reveal>
  );
}

export function PostGrid({ posts }: { posts: Post[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} index={i} />
      ))}
    </ul>
  );
}
