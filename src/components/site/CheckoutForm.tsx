"use client";

import { useActionState, useState } from "react";
import type { CheckoutState } from "@/server/actions/checkout";
import { DEMO_CARD_RULES } from "@/lib/payments/fake-gateway";
import { luhnValid } from "@/lib/payments/luhn";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Money } from "@/components/ui/Money";

type Props = {
  action: (prev: CheckoutState, fd: FormData) => Promise<CheckoutState>;
  planCode: string;
  amountCRC: number;
  formToken: string;
};

function groupDigits(v: string): string {
  return v
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function CheckoutForm({ action, planCode, amountCRC, formToken }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [method, setMethod] = useState<"CARD" | "SINPE">("CARD");
  const [number, setNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const numberError = touched && number && !luhnValid(number) ? "El número de tarjeta no es válido" : undefined;
  const year = new Date().getFullYear();

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />
      <input type="hidden" name="plan" value={planCode} />
      <input type="hidden" name="method" value={method} />

      <div role="tablist" aria-label="Método de pago" className="flex gap-1 rounded-full border border-line bg-surface-2/60 p-1">
        {(["CARD", "SINPE"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={method === m}
            onClick={() => setMethod(m)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              method === m ? "bg-ink text-bg" : "text-muted hover:text-ink"
            }`}
          >
            {m === "CARD" ? "Tarjeta" : "SINPE Móvil"}
          </button>
        ))}
      </div>

      {method === "CARD" ? (
        <div role="tabpanel" className="flex flex-col gap-4">
          <Field label="Número de tarjeta" htmlFor="number" error={numberError ?? (state.field === "number" ? state.error : undefined)}>
            <Input
              id="number"
              name="number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={number}
              onChange={(e) => setNumber(groupDigits(e.target.value))}
              onBlur={() => setTouched(true)}
              aria-invalid={!!numberError || undefined}
              className="tabular-nums tracking-[0.08em]"
            />
          </Field>
          <Field label="Nombre en la tarjeta" htmlFor="name" error={state.field === "name" ? state.error : undefined}>
            <Input id="name" name="name" autoComplete="cc-name" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Mes" htmlFor="expMonth" error={state.field === "expMonth" ? state.error : undefined}>
              <Input id="expMonth" name="expMonth" inputMode="numeric" placeholder="MM" maxLength={2} autoComplete="cc-exp-month" />
            </Field>
            <Field label="Año" htmlFor="expYear" error={state.field === "expYear" ? state.error : undefined}>
              <Input id="expYear" name="expYear" inputMode="numeric" placeholder={String(year)} maxLength={4} autoComplete="cc-exp-year" />
            </Field>
            <Field label="CVV" htmlFor="cvv" error={state.field === "cvv" ? state.error : undefined}>
              <Input id="cvv" name="cvv" inputMode="numeric" placeholder="123" maxLength={4} autoComplete="cc-csc" />
            </Field>
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="flex flex-col gap-4">
          <Field
            label="Número SINPE Móvil"
            htmlFor="phone"
            hint="Recibirás una solicitud de transferencia simulada."
            error={state.field === "phone" ? state.error : undefined}
          >
            <Input id="phone" name="phone" inputMode="tel" placeholder="8888 8888" autoComplete="tel-national" />
          </Field>
        </div>
      )}

      {state.error && !state.field && <FormMessage tone="error">{state.error}</FormMessage>}

      <div className="rounded-[12px] border border-dashed border-accent/50 bg-accent/5 px-4 py-3 text-sm">
        <p className="font-medium text-ink">Modo demostración: no se realizan cobros reales.</p>
        <p className="mt-1 text-muted">
          Probá con {DEMO_CARD_RULES.map((r, i) => (
            <span key={r.ending}>
              {i > 0 && ", "}
              <span className="tabular-nums text-ink">{r.ending === "4242" ? "4242 4242 4242 4242" : `…${r.ending}`}</span> ({r.outcome})
            </span>
          ))}
          . En SINPE, un número terminado en 0000 se rechaza.
        </p>
      </div>

      <Button type="submit" size="lg" pending={pending} pendingLabel="Procesando…" className="w-full">
        Pagar <Money amount={amountCRC} />
      </Button>
      <p className="text-center text-xs text-muted">Al pagar aceptás que la membresía se renueva por el período elegido y que podés cancelarla cuando querás.</p>
    </form>
  );
}
