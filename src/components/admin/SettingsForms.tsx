"use client";

import { useActionState, useTransition } from "react";
import { changeAdminPassword, removePortrait, uploadPortrait, type SettingsState } from "@/server/actions/settings";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export function PortraitForm({ currentUrl }: { currentUrl: string | null }) {
  const [state, action, pending] = useActionState(uploadPortrait, {} as SettingsState);
  const [removing, startRemove] = useTransition();

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <div className="flex items-start gap-5">
        <div className="aspect-[4/5] w-32 shrink-0 overflow-hidden rounded-[12px] bg-surface-2">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="Retrato actual" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted">Sin retrato</div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <Field label="Retrato de portada" htmlFor="portrait" hint="Vertical, JPEG, PNG o WebP · hasta 8 MB. Se muestra en la portada y en Sobre mí.">
            <Input id="portrait" name="portrait" type="file" accept="image/jpeg,image/png,image/webp" required />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" pending={pending} pendingLabel="Guardando…">
              Guardar retrato
            </Button>
            {currentUrl && (
              <Button type="button" variant="ghost" pending={removing} onClick={() => startRemove(() => removePortrait())}>
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && !pending && <FormMessage tone="success">{state.ok}</FormMessage>}
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changeAdminPassword, {} as SettingsState);
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4" noValidate>
      <Field label="Contraseña actual" htmlFor="current">
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nueva contraseña" htmlFor="next" hint="Al menos 10 caracteres, con letras y números.">
        <Input id="next" name="next" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Confirmar nueva contraseña" htmlFor="confirm">
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      {state.ok && !pending && <FormMessage tone="success">{state.ok}</FormMessage>}
      <div>
        <Button type="submit" pending={pending} pendingLabel="Cambiando…">
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}
