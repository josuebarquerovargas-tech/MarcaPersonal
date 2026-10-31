"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireAdmin } from "@/server/auth";
import { clientIp, formTokens } from "@/server/security";
import { hashSource, QUOTE_WINDOW_MS, quoteAllowed, quoteSchema } from "@/lib/quotes/quote";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";

export type QuoteFormState = { ok?: boolean; error?: string };

export async function submitQuote(_prev: QuoteFormState, fd: FormData): Promise<QuoteFormState> {
  // Honeypot: real visitors never see this field. Bots get a normal-looking success.
  if (fd.get("website")) return { ok: true };

  const parsed = quoteSchema.safeParse({
    name: fd.get("name") ?? "",
    contact: fd.get("contact") ?? "",
    service: fd.get("service") ?? "",
    message: fd.get("message") ?? "",
    consent: fd.get("consent") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };

  const sourceKey = hashSource(await clientIp(), process.env.SESSION_SECRET ?? "");
  const recent = await db.quoteRequest.count({
    where: { sourceKey, createdAt: { gte: new Date(Date.now() - QUOTE_WINDOW_MS) } },
  });
  if (!quoteAllowed(recent, sourceKey)) {
    return { error: "Recibimos muchas solicitudes en poco tiempo. Intenta más tarde o escríbenos por WhatsApp." };
  }

  // Spent only after validation, so correcting an error never blocks the retry.
  const token = fd.get(FORM_TOKEN_FIELD);
  if (typeof token !== "string" || !(await formTokens.consumeFormToken(token))) {
    return { error: "Este formulario venció o ya se envió. Copia tu mensaje, recarga la página e intenta de nuevo." };
  }

  const { consent: _consent, ...data } = parsed.data;
  void _consent;
  await db.quoteRequest.create({ data: { ...data, sourceKey, consentAt: new Date() } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setQuoteStatus(id: string, status: "NEW" | "CONTACTED" | "CLOSED"): Promise<void> {
  await requireAdmin();
  if (!["NEW", "CONTACTED", "CLOSED"].includes(status)) return;
  await db.quoteRequest.updateMany({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteQuote(id: string): Promise<void> {
  await requireAdmin();
  await db.quoteRequest.deleteMany({ where: { id } });
  revalidatePath("/admin", "layout");
}
