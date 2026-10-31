"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { requireMembershipEnabled } from "@/server/features";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearMemberSession, setMemberSession } from "@/server/auth";
import { clientIp, formTokens, loginLimiter } from "@/server/security";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";
import { safeNext } from "@/lib/safe-next";

export type MemberAuthState = { error?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(80),
  email: z.string().trim().toLowerCase().email("Ingresa un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});

export async function registerMember(_prev: MemberAuthState, fd: FormData): Promise<MemberAuthState> {
  await requireMembershipEnabled();
  const parsed = registerSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const existing = await db.member.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Ya existe una cuenta con ese correo" };

  const token = fd.get(FORM_TOKEN_FIELD);
  if (typeof token !== "string" || !(await formTokens.consumeFormToken(token))) {
    return { error: "El formulario expiró. Recarga la página e intenta de nuevo." };
  }

  const member = await db.member.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  await setMemberSession(member);
  redirect(safeNext(fd.get("next")) ?? "/contenido?ver=membresia");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export async function loginMember(_prev: MemberAuthState, fd: FormData): Promise<MemberAuthState> {
  await requireMembershipEnabled();
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const ip = await clientIp();
  const allowed = await loginLimiter.checkLoginAllowed(ip);
  if (!allowed.allowed) {
    return { error: "Demasiados intentos. Espera unos minutos e intenta de nuevo." };
  }

  const member = await db.member.findUnique({ where: { email: parsed.data.email } });
  const ok = member ? await verifyPassword(parsed.data.password, member.passwordHash) : false;
  await loginLimiter.recordLoginAttempt(ip, ok);
  if (!member || !ok) return { error: "Correo o contraseña incorrectos" };
  if (member.status === "SUSPENDED") return { error: "Tu cuenta está suspendida. Escríbenos para más información." };

  await setMemberSession(member);
  redirect(safeNext(fd.get("next")) ?? "/cuenta");
}

export async function logoutMember(): Promise<void> {
  await clearMemberSession();
  redirect("/");
}
