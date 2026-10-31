"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { MemberAuthState } from "@/server/actions/member-auth";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { Button } from "@/components/ui/Button";
import { Field, FormMessage } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

type Props = {
  mode: "register" | "login";
  action: (prev: MemberAuthState, fd: FormData) => Promise<MemberAuthState>;
  next?: string | null;
  formToken?: string;
};

export function AuthForm({ mode, action, next, formToken }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  // Controlled so a server-side error (e.g. duplicate email) doesn't wipe the fields.
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const register = mode === "register";
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {formToken && <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />}
      {next && <input type="hidden" name="next" value={next} />}
      {register && (
        <Field label="Nombre" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" required value={values.name} onChange={set("name")} />
        </Field>
      )}
      <Field label="Correo" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required value={values.email} onChange={set("email")} />
      </Field>
      <Field label="Contraseña" htmlFor="password" hint={register ? "Mínimo 8 caracteres." : undefined}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={register ? "new-password" : "current-password"}
          required
          minLength={register ? 8 : undefined}
          value={values.password}
          onChange={set("password")}
        />
      </Field>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <Button type="submit" pending={pending} pendingLabel={register ? "Creando…" : "Ingresando…"} className="mt-2 w-full">
        {register ? "Crear cuenta" : "Ingresar"}
      </Button>
      <p className="text-center text-sm text-muted">
        {register ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href={`/ingresar${nextQuery}`} className="text-ink underline underline-offset-4">
              Ingresa
            </Link>
          </>
        ) : (
          <>
            ¿Todavía no tienes cuenta?{" "}
            <Link href={`/registro${nextQuery}`} className="text-ink underline underline-offset-4">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
