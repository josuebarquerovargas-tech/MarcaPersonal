import Link from "next/link";
import type { PostCardData } from "@/server/posts";
import { storage } from "@/lib/storage/storage";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export function PostCard({ post, index = 0 }: { post: PostCardData; index?: number }) {
  return (
    <Reveal as="li" delay={Math.min(index, 5) * 0.06} className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-surface-2 shadow-soft">
          {post.access === "MEMBERS" && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink">
              <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Exclusivo
            </span>
          )}
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
          {post.publishedAt && formatDate(post.publishedAt)}
          {post.minutes > 0 && ` · ${post.minutes} min de lectura`}
        </p>
        <h3 className="font-display mt-1 text-2xl leading-snug group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">{post.title}</h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-muted">{post.excerpt}</p>}
      </Link>
    </Reveal>
  );
}

export function PostGrid({ posts }: { posts: PostCardData[] }) {
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <PostCard key={p.id} post={p} index={i} />
      ))}
    </ul>
  );
}
