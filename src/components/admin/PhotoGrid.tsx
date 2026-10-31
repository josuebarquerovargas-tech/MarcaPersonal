"use client";

import { useState, useTransition } from "react";
import type { Photo } from "@prisma/client";
import { deletePhoto, reorderPhotos, updatePhoto } from "@/server/actions/photos";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { SortableList } from "./SortableList";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [pending, start] = useTransition();
  const [toDelete, setToDelete] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return <p className="rounded-[12px] border border-dashed border-line px-6 py-12 text-center text-muted">Todavía no hay fotos.</p>;
  }

  return (
    <>
      <SortableList
        items={photos}
        onReorder={(ids) => start(() => reorderPhotos(ids))}
        renderRow={(p, handle) => (
          <div className="flex items-center gap-4 rounded-[12px] border border-line bg-surface p-3">
            {handle}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.alt} className="h-20 w-28 shrink-0 rounded-[8px] object-cover" />
            <form
              className="flex min-w-0 flex-1 items-center gap-2"
              action={(fd) => start(async () => void (await updatePhoto(p.id, {}, fd)))}
            >
              <Input name="caption" defaultValue={p.caption} placeholder="Pie de foto" aria-label={`Pie de foto de ${p.caption || "la foto"}`} />
              <Button type="submit" size="sm" variant="secondary" disabled={pending}>
                Guardar
              </Button>
            </form>
            <span className="hidden text-xs text-muted sm:block">
              {p.width}×{p.height}
            </span>
            <Button size="sm" variant="ghost" onClick={() => setToDelete(p)} disabled={pending}>
              Eliminar
            </Button>
          </div>
        )}
      />
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} title="Eliminar foto">
        <p className="text-sm text-muted">La foto se borra del sitio y del almacenamiento. Esta acción no se puede deshacer.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            pending={pending}
            onClick={() => {
              const p = toDelete;
              if (!p) return;
              start(async () => {
                await deletePhoto(p.id);
                setToDelete(null);
              });
            }}
          >
            Sí, eliminar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
