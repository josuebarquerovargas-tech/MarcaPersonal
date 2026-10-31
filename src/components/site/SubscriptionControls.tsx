"use client";

import { useState, useTransition } from "react";
import { cancelSubscription, reactivateSubscription } from "@/server/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

export function SubscriptionControls({ status }: { status: "ACTIVE" | "CANCELED" | "EXPIRED" }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (status === "CANCELED") {
    return (
      <Button variant="secondary" pending={pending} onClick={() => start(() => reactivateSubscription())}>
        Reactivar
      </Button>
    );
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setConfirm(true)} disabled={pending}>
        Cancelar membresía
      </Button>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="¿Cancelar la membresía?">
        <p className="text-sm text-muted">Conservás el acceso hasta el final del período que ya pagaste. Podés reactivarla cuando quieras.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Volver
          </Button>
          <Button
            variant="danger"
            pending={pending}
            onClick={() =>
              start(async () => {
                await cancelSubscription();
                setConfirm(false);
              })
            }
          >
            Sí, cancelar
          </Button>
        </div>
      </Dialog>
    </>
  );
}
