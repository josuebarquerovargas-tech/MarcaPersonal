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

const digits = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

export function CheckoutForm({ action, planCode, amountCRC, formToken }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [method, setMethod] = useState<"CARD" | "SINPE">("CARD");
  // All fields are controlled: React resets uncontrolled inputs after a server
  // action, which would wipe what the user typed when a validation error comes back.
  const [card, setCard] = useState({ number: "", name: "", expMonth: "", expYear: "", cvv: "" });
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const numberError = touched && card.number && !luhnValid(card.number) ? "El número de tarjeta no es válido" : undefined;
  const year = new Date().getFullYear();
  const fieldError = (name: string) => (state.field === name ? state.error : undefined);
  const set = (k: keyof typeof card) => (v: string) => setCard((c) => ({ ...c, [k]: v }));

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
          <Field label="Número de tarjeta" htmlFor="number" error={numberError ?? fieldError("number")}>
            <Input
              id="number"
              name="number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={(e) => set("number")(groupDigits(e.target.value))}
              onBlur={() => setTouched(true)}
              aria-invalid={!!numberError || undefined}
              className="tabular-nums tracking-[0.08em]"
            />
          </Field>
          <Field label="Nombre en la tarjeta" htmlFor="name" error={fieldError("name")}>
            <Input id="name" name="name" autoComplete="cc-name" value={card.name} onChange={(e) => set("name")(e.target.value)} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Mes" htmlFor="expMonth" error={fieldError("expMonth")}>
              <Input
                id="expMonth"
                name="expMonth"
                inputMode="numeric"
                placeholder="MM"
                autoComplete="cc-exp-month"
                value={card.expMonth}
                onChange={(e) => set("expMonth")(digits(e.target.value, 2))}
              />
            </Field>
            <Field label="Año" htmlFor="expYear" error={fieldError("expYear")}>
              <Input
                id="expYear"
                name="expYear"
                inputMode="numeric"
                placeholder={String(year)}
                autoComplete="cc-exp-year"
                value={card.expYear}
                onChange={(e) => set("expYear")(digits(e.target.value, 4))}
              />
            </Field>
            <Field label="CVV" htmlFor="cvv" error={fieldError("cvv")}>
              <Input
                id="cvv"
                name="cvv"
                inputMode="numeric"
                placeholder="123"
                autoComplete="cc-csc"
                value={card.cvv}
                onChange={(e) => set("cvv")(digits(e.target.value, 4))}
              />
            </Field>
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="flex flex-col gap-4">
          <Field
            label="Número SINPE Móvil"
            htmlFor="phone"
            hint="Recibirás una solicitud de transferencia simulada."
            error={fieldError("phone")}
          >
            <Input
              id="phone"
              name="phone"
              inputMode="tel"
              placeholder="8888 8888"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(digits(e.target.value, 8))}
            />
          </Field>
        </div>
      )}

      {state.error && !state.field && <FormMessage tone="error">{state.error}</FormMessage>}

      <div className="rounded-[12px] border border-dashed border-accent/50 bg-accent/5 px-4 py-3 text-sm">
        <p className="font-medium text-ink">Modo demostración: no se realizan cobros reales.</p>
        <p className="mt-1 text-muted">
          Prueba con{" "}
          {DEMO_CARD_RULES.map((r, i) => (
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
      <p className="text-center text-xs text-muted">Al pagar aceptas que la membresía se renueva por el período elegido y que puedes cancelarla cuando quieras.</p>
    </form>
  );
}
