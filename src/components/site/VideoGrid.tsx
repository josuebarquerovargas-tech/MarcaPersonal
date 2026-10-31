import { VideoCard, type VideoCardData } from "./VideoCard";

export function VideoGrid({ videos, emptyText }: { videos: VideoCardData[]; emptyText?: string }) {
  if (videos.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-line px-6 py-16 text-center text-muted">
        {emptyText ?? "Todavía no hay videos publicados."}
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((v, i) => (
        <VideoCard key={v.slug} video={v} index={i} />
      ))}
    </ul>
  );
}
