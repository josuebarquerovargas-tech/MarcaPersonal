"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@prisma/client";

type Props = { photos: Photo[]; index: number | null; onChange: (i: number | null) => void };

export function Lightbox({ photos, index, onChange }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const photo = index !== null ? photos[index] : null;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange(((index ?? 0) + 1) % photos.length);
      if (e.key === "ArrowLeft") onChange(((index ?? 0) - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, photos.length, onChange]);

  return (
    <dialog
      ref={ref}
      onClose={() => onChange(null)}
      onClick={(e) => {
        if (e.target === ref.current) onChange(null);
      }}
      aria-label={photo?.caption || "Foto ampliada"}
      className="m-auto h-dvh w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
    >
      {photo && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.alt} className="max-h-[80vh] max-w-full rounded-[12px] object-contain shadow-soft" />
          {photo.caption && <p className="text-center text-sm text-white/80">{photo.caption}</p>}
          <div className="flex items-center gap-3 text-sm text-white/70">
            <button type="button" onClick={() => onChange(((index ?? 0) - 1 + photos.length) % photos.length)} className="rounded-full border border-white/30 px-4 py-1.5 hover:bg-white/10" aria-label="Anterior">
              ←
            </button>
            <span className="tabular-nums">
              {(index ?? 0) + 1} / {photos.length}
            </span>
            <button type="button" onClick={() => onChange(((index ?? 0) + 1) % photos.length)} className="rounded-full border border-white/30 px-4 py-1.5 hover:bg-white/10" aria-label="Siguiente">
              →
            </button>
            <button type="button" onClick={() => onChange(null)} className="ml-4 rounded-full border border-white/30 px-4 py-1.5 hover:bg-white/10">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
