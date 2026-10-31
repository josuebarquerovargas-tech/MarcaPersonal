"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { verifyPassword } from "@/lib/auth/password";
import { clearAdminSession, setAdminSession } from "@/server/auth";
import { clientIp, loginLimiter } from "@/server/security";

export type AdminLoginState = { error?: string };

const schema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const ip = await clientIp();
  const allowed = await loginLimiter.checkLoginAllowed(ip);
  if (!allowed.allowed) {
    const min = Math.ceil((allowed.retryAfterSec ?? 900) / 60);
    return { error: `Demasiados intentos. Espera ${min} minutos e intenta de nuevo.` };
  }

  const admin = await db.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  const ok = admin ? await verifyPassword(parsed.data.password, admin.passwordHash) : false;
  await loginLimiter.recordLoginAttempt(ip, ok);
  if (!admin || !ok) {
    return { error: "Correo o contraseña incorrectos" };
  }

  await setAdminSession(admin);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
