"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/server/actions/admin-auth";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

const initial: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <Field label="Correo" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <Button type="submit" pending={pending} pendingLabel="Ingresando…" className="mt-2 w-full">
        Ingresar
      </Button>
    </form>
  );
}
