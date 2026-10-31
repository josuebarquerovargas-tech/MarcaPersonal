"use client";

import { useState, useTransition } from "react";
import { deleteQuote, setQuoteStatus } from "@/server/actions/quotes";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

const NEXT = {
  NEW: { status: "CONTACTED", label: "Marcar contactada" },
  CONTACTED: { status: "CLOSED", label: "Cerrar" },
  CLOSED: { status: "NEW", label: "Reabrir" },
} as const;

export function QuoteActions({ id, status, name }: { id: string; status: keyof typeof NEXT; name: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const next = NEXT[status];
  return (
    <div className="flex justify-end gap-1">
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => setQuoteStatus(id, next.status))}>
        {next.label}
      </Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => setConfirm(true)}>
        Eliminar
      </Button>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Eliminar solicitud">
        <p className="text-sm text-muted">
          Se eliminarán los datos de <strong className="text-ink">{name}</strong>. Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Cancelar
          </Button>
          <Button variant="danger" pending={pending} onClick={() => start(() => deleteQuote(id))}>
            Sí, eliminar
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
