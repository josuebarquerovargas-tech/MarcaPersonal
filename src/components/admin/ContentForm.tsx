"use client";

import { useActionState } from "react";
import type { FieldDef } from "@/lib/content/fields";
import type { SaveContentState } from "@/server/actions/content";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";

type Props = {
  fields: FieldDef[];
  value: Record<string, unknown>;
  action: (prev: SaveContentState, fd: FormData) => Promise<SaveContentState>;
};

export function ContentForm({ fields, value, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      {fields.map((f) => (
        <FieldRenderer key={f.name} def={f} value={value[f.name]} />
      ))}
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

function FieldRenderer({ def, value }: { def: FieldDef; value: unknown }) {
  if (def.kind === "text") {
    return (
      <Field label={def.label} htmlFor={def.name} hint={def.hint}>
        <Input id={def.name} name={def.name} defaultValue={String(value ?? "")} />
      </Field>
    );
  }
  if (def.kind === "textarea") {
    return (
      <Field label={def.label} htmlFor={def.name} hint={def.hint}>
        <Textarea id={def.name} name={def.name} defaultValue={String(value ?? "")} />
      </Field>
    );
  }
  if (def.kind === "lines") {
    const lines = Array.isArray(value) ? (value as string[]).join("\n") : "";
    return (
      <Field label={def.label} htmlFor={def.name} hint={def.hint}>
        <Textarea id={def.name} name={def.name} defaultValue={lines} className="min-h-40" />
      </Field>
    );
  }
  const rows = Array.isArray(value) ? (value as Record<string, string>[]) : [];
  const count = def.fixed ?? rows.length + 1;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{def.label}</legend>
      {def.hint && <p className="-mt-1 text-sm text-muted">{def.hint}</p>}
      {Array.from({ length: count }).map((_, i) => {
        const row = rows[i] ?? {};
        const extra = !def.fixed && i === rows.length;
        return (
          <div
            key={i}
            className="grid gap-2 rounded-[10px] border border-line bg-surface-2/50 p-3 sm:grid-cols-[1fr_2fr]"
          >
            <Field label={`${def.labels[0]} ${i + 1}`} htmlFor={`${def.name}.${i}.${def.keys[0]}`}>
              <Input
                id={`${def.name}.${i}.${def.keys[0]}`}
                name={`${def.name}.${i}.${def.keys[0]}`}
                defaultValue={row[def.keys[0]] ?? ""}
                placeholder={extra ? "Nuevo (opcional)" : undefined}
              />
            </Field>
            <Field label={`${def.labels[1]} ${i + 1}`} htmlFor={`${def.name}.${i}.${def.keys[1]}`}>
              <Textarea
                id={`${def.name}.${i}.${def.keys[1]}`}
                name={`${def.name}.${i}.${def.keys[1]}`}
                defaultValue={row[def.keys[1]] ?? ""}
                className="min-h-20"
              />
            </Field>
          </div>
        );
      })}
      {!def.fixed && (
        <p className="text-xs text-muted">
          Para quitar un elemento, dejá sus dos campos vacíos y guardá.
        </p>
      )}
    </fieldset>
  );
}
