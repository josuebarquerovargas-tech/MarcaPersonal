"use client";

import { useState } from "react";

type Props = {
  embedUrl: string;
  platform: "TIKTOK" | "INSTAGRAM" | "YOUTUBE";
  poster?: string | null;
  title: string;
};

export function EmbedFrame({ embedUrl, platform, poster, title }: Props) {
  const [active, setActive] = useState(false);
  const vertical = platform !== "YOUTUBE";
  const box = vertical ? "aspect-[9/16] max-w-[420px]" : "aspect-video";

  if (active) {
    return (
      <div className={`w-full overflow-hidden rounded-[16px] bg-black ${box}`}>
        <iframe
          src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
          title={title}
          className="size-full border-0"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`Reproducir ${title}`}
      className={`group relative w-full overflow-hidden rounded-[16px] bg-surface-2 ${box}`}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="size-full object-cover" />
      ) : (
        <div className="size-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--accent)_35%,transparent),transparent_60%)]" />
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-white/90 text-black shadow-soft transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="ml-1 size-8" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
