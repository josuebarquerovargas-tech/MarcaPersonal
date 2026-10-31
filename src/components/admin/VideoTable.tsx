"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Video } from "@prisma/client";
import { deleteVideo, reorderVideos, setVideoStatus } from "@/server/actions/videos";
import { PLATFORM_LABEL } from "@/lib/videos/embed";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SortableList } from "./SortableList";

type Row = Video & { thumbUrl: string | null };

export function VideoTable({ videos }: { videos: Row[] }) {
  const [pending, start] = useTransition();
  const [toDelete, setToDelete] = useState<Row | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-line bg-surface">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th className="w-10 px-2 py-3" aria-label="Orden" />
              <th className="px-3 py-3">Video</th>
              <th className="px-3 py-3">Tipo</th>
              <th className="px-3 py-3">Acceso</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3 text-right">Vistas</th>
              <th className="px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <SortableList
            as="tbody"
            items={videos}
            onReorder={(ids) => start(() => reorderVideos(ids))}
            renderRow={(v, handle) => (
              <>
                <td className="px-2 py-2 align-middle">{handle}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    {v.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.thumbUrl} alt="" className="h-12 w-20 shrink-0 rounded-[6px] object-cover" />
                    ) : (
                      <div className="h-12 w-20 shrink-0 rounded-[6px] bg-line" />
                    )}
                    <div className="min-w-0">
                      <Link href={`/admin/videos/${v.id}`} className="block truncate font-medium hover:underline">
                        {v.title}
                      </Link>
                      <p className="text-xs text-muted">
                        {new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(new Date(v.publishedAt))}
                        {v.featured ? " · Destacado" : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-muted">
                  {v.kind === "FILE" ? "Archivo" : v.platform ? PLATFORM_LABEL[v.platform] : "Enlace"}
                </td>
                <td className="px-3 py-2">
                  {v.access === "MEMBERS" ? <Badge tone="accent">Miembros</Badge> : <Badge>Gratis</Badge>}
                </td>
                <td className="px-3 py-2">
                  {v.status === "PUBLISHED" ? <Badge tone="success">Publicado</Badge> : <Badge tone="warning">Borrador</Badge>}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{v.views}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => start(() => setVideoStatus(v.id, v.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"))}
                    >
                      {v.status === "PUBLISHED" ? "Ocultar" : "Publicar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setToDelete(v)} disabled={pending}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </>
            )}
          />
        </table>
        {videos.length === 0 && (
          <p className="px-4 py-10 text-center text-muted">Todavía no hay videos. Subí el primero.</p>
        )}
      </div>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} title="Eliminar video">
        <p className="text-sm text-muted">
          Se eliminará <strong className="text-ink">{toDelete?.title}</strong> y sus archivos. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            pending={pending}
            onClick={() => {
              const v = toDelete;
              if (!v) return;
              start(async () => {
                await deleteVideo(v.id);
                setToDelete(null);
              });
            }}
          >
            Eliminar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
