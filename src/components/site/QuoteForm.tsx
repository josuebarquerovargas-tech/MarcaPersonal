"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitQuote, type QuoteFormState } from "@/server/actions/quotes";
import { SERVICES } from "@/lib/services/catalog";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";

export function QuoteForm({ formToken, initialService }: { formToken: string; initialService: string }) {
  const [state, action, pending] = useActionState(submitQuote, {} as QuoteFormState);
  // Controlled so a validation error never wipes what was written.
  const [values, setValues] = useState({ name: "", contact: "", service: initialService, message: "" });
  const [consent, setConsent] = useState(false);
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  if (state.ok) {
    return (
      <div role="status" className="rounded-[16px] border border-accent/40 bg-accent/5 p-6 sm:p-8">
        <p className="font-display text-3xl">¡Recibimos tu solicitud!</p>
        <p className="mt-3 text-muted">Te contactaremos por el medio que indicaste para conversar sobre tu marca.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5 rounded-[16px] border border-line bg-surface p-6 shadow-soft sm:p-8" noValidate>
      <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />
      {/* Honeypot: hidden from people and assistive tech, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="q-name">
          <Input id="q-name" name="name" autoComplete="name" value={values.name} onChange={set("name")} required />
        </Field>
        <Field label="Correo o teléfono" htmlFor="q-contact">
          <Input id="q-contact" name="contact" autoComplete="email" value={values.contact} onChange={set("contact")} required />
        </Field>
      </div>
      <Field label="Servicio de interés" htmlFor="q-service">
        <Select id="q-service" name="service" value={values.service} onChange={set("service")}>
          {SERVICES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
          <option value="otro">Todavía no lo sé</option>
        </Select>
      </Field>
      <Field label="Mensaje" htmlFor="q-message" hint="Opcional. Cuéntame sobre tu marca o negocio.">
        <Textarea id="q-message" name="message" value={values.message} onChange={set("message")} maxLength={2000} />
      </Field>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-accent"
        />
        <span>
          Autorizo el uso de estos datos para responder mi consulta, según la{" "}
          <Link href="/privacidad" className="text-ink underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </span>
      </label>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <div>
        <Button type="submit" size="lg" pending={pending} pendingLabel="Enviando…" className="w-full sm:w-auto">
          Solicitar cotización
        </Button>
      </div>
    </form>
  );
}
