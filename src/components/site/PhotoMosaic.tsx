"use client";

import { useState } from "react";
import type { Photo } from "@prisma/client";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "./Lightbox";

export function PhotoMosaic({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
        {photos.map((p, i) => (
          <Reveal as="li" key={p.id} delay={Math.min(i, 6) * 0.05}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-label={p.caption ? `Ampliar: ${p.caption}` : "Ampliar foto"}
              className="group block w-full overflow-hidden rounded-[14px] bg-surface-2 text-left shadow-soft focus-visible:outline-2 focus-visible:outline-accent"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.alt}
                width={p.width}
                height={p.height}
                loading="lazy"
                className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
              />
              {p.caption && <span className="block px-3 py-2.5 text-sm text-muted">{p.caption}</span>}
            </button>
          </Reveal>
        ))}
      </ul>
      <Lightbox photos={photos} index={index} onChange={setIndex} />
    </>
  );
}
