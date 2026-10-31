import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { isMembershipEnabled } from "@/server/features";
import { getVideoBySlug, incrementViews, relatedVideos } from "@/server/videos";
import { storage } from "@/lib/storage/storage";
import { canWatch } from "@/lib/videos/access";
import { parseEmbedUrl, PLATFORM_LABEL } from "@/lib/videos/embed";
import { formatLongDate, formatViews } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Player } from "@/components/site/Player";
import { LockedPlayer } from "@/components/site/LockedPlayer";
import { EmbedFrame } from "@/components/site/EmbedFrame";
import { VideoGrid } from "@/components/site/VideoGrid";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || video.status !== "PUBLISHED") return { title: "Video no encontrado" };
  const image = video.thumbnailPath ? storage.publicUrl(video.thumbnailPath) : undefined;
  return {
    title: video.title,
    description: video.description || undefined,
    openGraph: { title: video.title, description: video.description || undefined, images: image ? [image] : undefined, type: "video.other" },
  };
}

export default async function VideoPage({ params }: Params) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video || video.status !== "PUBLISHED") notFound();
  if (video.access === "MEMBERS" && !(await isMembershipEnabled())) notFound();

  const member = await getMember();
  const membership = await getMembership(member);
  const allowed = canWatch(video, membership);
  await incrementViews(video.id);

  const poster = video.thumbnailPath ? storage.publicUrl(video.thumbnailPath) : null;
  const related = (await relatedVideos(video, 4)).map((v) => ({
    ...v,
    thumbUrl: v.thumbnailPath ? storage.publicUrl(v.thumbnailPath) : null,
  }));
  const embed = video.kind === "EMBED" && video.sourceUrl ? parseEmbedUrl(video.sourceUrl) : null;

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto max-w-4xl">
          {!allowed ? (
            <LockedPlayer poster={poster} title={video.title} signedIn={!!member} slug={video.slug} />
          ) : video.kind === "FILE" ? (
            <Player src={`/api/stream/${video.id}`} poster={poster} title={video.title} />
          ) : embed ? (
            <div className={embed.platform === "YOUTUBE" ? "" : "flex justify-center"}>
              <EmbedFrame embedUrl={embed.embedUrl} platform={embed.platform} poster={poster} title={video.title} />
            </div>
          ) : (
            <p className="text-muted">Este video no está disponible.</p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {video.access === "MEMBERS" ? <Badge tone="accent">Exclusivo para miembros</Badge> : <Badge>Gratis</Badge>}
            {video.kind === "EMBED" && video.platform && <Badge>{PLATFORM_LABEL[video.platform]}</Badge>}
            <span className="text-sm text-muted">
              {formatLongDate(video.publishedAt)} · {formatViews(video.views + 1)} vistas
            </span>
          </div>
          <h1 className="font-display mt-4 text-4xl leading-[1.05] sm:text-5xl">{video.title}</h1>
          {video.description && (
            <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-muted">{video.description}</p>
          )}
          {video.kind === "EMBED" && video.sourceUrl && (
            <a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline"
            >
              Ver en {video.platform ? PLATFORM_LABEL[video.platform] : "la plataforma"} ↗
            </a>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <h2 id="related" className="font-display text-3xl">
              Sigue viendo
            </h2>
            <div className="mt-8">
              <VideoGrid videos={related} />
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
