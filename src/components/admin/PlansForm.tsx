"use client";

import { useActionState } from "react";
import type { Plan } from "@prisma/client";
import { savePlans, type SaveContentState } from "@/server/actions/content";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function PlansForm({ plans }: { plans: Plan[] }) {
  const [state, action, pending] = useActionState(savePlans, {} as SaveContentState);
  const monthly = plans.find((p) => p.code === "MONTHLY");
  const yearly = plans.find((p) => p.code === "YEARLY");

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del plan mensual" htmlFor="MONTHLY.name">
          <Input id="MONTHLY.name" name="MONTHLY.name" defaultValue={monthly?.name ?? "Mensual"} />
        </Field>
        <Field label="Precio mensual (₡)" htmlFor="MONTHLY.priceCRC" hint="Entero en colones, sin decimales.">
          <Input id="MONTHLY.priceCRC" name="MONTHLY.priceCRC" inputMode="numeric" defaultValue={monthly?.priceCRC ?? 4900} />
        </Field>
        <Field label="Nombre del plan anual" htmlFor="YEARLY.name">
          <Input id="YEARLY.name" name="YEARLY.name" defaultValue={yearly?.name ?? "Anual"} />
        </Field>
        <Field label="Precio anual (₡)" htmlFor="YEARLY.priceCRC" hint="Se muestra el ahorro frente a 12 meses.">
          <Input id="YEARLY.priceCRC" name="YEARLY.priceCRC" inputMode="numeric" defaultValue={yearly?.priceCRC ?? 49000} />
        </Field>
      </div>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && !pending && <FormMessage tone="success">Guardado</FormMessage>}
      <div>
        <Button type="submit" pending={pending} pendingLabel="Guardando…">
          Guardar
        </Button>
      </div>
    </form>
  );
}
