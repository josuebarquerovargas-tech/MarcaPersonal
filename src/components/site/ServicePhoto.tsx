"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type ServicePhotoName = "web" | "social" | "video" | "tools" | "chat";

/** Realistic photo for a service card. It settles into place when it enters the viewport. */
export function ServicePhoto({ name }: { name: ServicePhotoName }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-revealed");
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative aspect-[3/2] overflow-hidden border-b border-line bg-surface-2">
      {/* Decorative: the card title right below already names the service. */}
      <Image
        ref={ref}
        src={`/images/servicios/${name}.webp`}
        alt=""
        fill
        sizes="(min-width: 1280px) 240px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="service-photo object-cover"
      />
    </div>
  );
}
