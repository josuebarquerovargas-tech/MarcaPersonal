import Link from "next/link";
import type { Video } from "@prisma/client";
import { Reveal } from "@/components/ui/Reveal";
import { PLATFORM_LABEL } from "@/lib/videos/embed";
import { formatDate, formatDuration } from "@/lib/format";

export type VideoCardData = Pick<
  Video,
  "slug" | "title" | "kind" | "platform" | "access" | "publishedAt" | "durationSec"
> & { thumbUrl: string | null };

export function VideoCard({ video, index = 0 }: { video: VideoCardData; index?: number }) {
  const chip = video.kind === "FILE" ? "Video" : video.platform ? PLATFORM_LABEL[video.platform] : "Enlace";
  const duration = formatDuration(video.durationSec);

  return (
    <Reveal as="li" delay={Math.min(index, 5) * 0.06} className="group">
      <Link href={`/videos/${video.slug}`} className="block focus-visible:outline-none">
        <div
          className={`relative overflow-hidden rounded-[14px] bg-surface-2 shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-accent aspect-video`}
        >
          {video.thumbUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbUrl}
              alt=""
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_60%)]">
              <span className="font-display text-5xl text-ink/20">RR</span>
            </div>
          )}
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-14 scale-90 items-center justify-center rounded-full bg-white/90 text-black opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out)] group-hover:scale-100 group-hover:opacity-100">
              <svg viewBox="0 0 24 24" className="ml-0.5 size-6" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">{chip}</span>
            {video.access === "MEMBERS" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                Miembros
              </span>
            )}
          </div>
          {duration && (
            <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-1.5 py-0.5 text-xs tabular-nums text-white">
              {duration}
            </span>
          )}
        </div>
        <h3 className="mt-3 line-clamp-2 text-[17px] font-medium leading-snug group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
          {video.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{formatDate(video.publishedAt)}</p>
      </Link>
    </Reveal>
  );
}
