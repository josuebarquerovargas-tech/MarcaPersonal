"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Post } from "@prisma/client";
import { deletePost, setPostStatus } from "@/server/actions/posts";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

export function PostTable({ posts }: { posts: Post[] }) {
  const [pending, start] = useTransition();
  const [toDelete, setToDelete] = useState<Post | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-[12px] border border-line bg-surface">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3">Artículo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Publicado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="max-w-md px-4 py-3">
                  <Link href={`/admin/blog/${p.id}`} className="block truncate font-medium hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {p.status === "PUBLISHED" ? <Badge tone="success">Publicado</Badge> : <Badge tone="warning">Borrador</Badge>}
                </td>
                <td className="px-4 py-3 text-muted">{p.publishedAt ? formatDate(p.publishedAt) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => start(() => setPostStatus(p.id, p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"))}
                    >
                      {p.status === "PUBLISHED" ? "Ocultar" : "Publicar"}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={pending} onClick={() => setToDelete(p)}>
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && <p className="px-4 py-10 text-center text-muted">Todavía no hay artículos. Escribí el primero.</p>}
      </div>
      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} title="Eliminar artículo">
        <p className="text-sm text-muted">
          Se eliminará <strong className="text-ink">{toDelete?.title}</strong>. Esta acción no se puede deshacer.
        </p>
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
                await deletePost(p.id);
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
