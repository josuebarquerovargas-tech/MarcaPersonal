import { createHash } from "node:crypto";
import { z } from "zod";
import { getServiceBySlug } from "@/lib/services/catalog";

export const QUOTE_OTHER = "otro";
export const DIRECT_SOURCE = "direct";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[\d\s()-]{8,20}$/;

export const quoteSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(80, "El nombre es demasiado largo"),
  contact: z
    .string()
    .trim()
    .max(120, "El contacto es demasiado largo")
    .refine((v) => EMAIL.test(v) || PHONE.test(v), "Ingresa un correo o un teléfono válido"),
  service: z
    .string()
    .refine((v) => v === QUOTE_OTHER || !!getServiceBySlug(v), "Elige un servicio de la lista"),
  message: z.string().trim().max(2000, "El mensaje admite hasta 2000 caracteres"),
  consent: z.literal("on", { message: "Necesitamos tu autorización para responderte" }),
});

export const QUOTE_STATUS_LABEL = { NEW: "Nueva", CONTACTED: "Contactada", CLOSED: "Cerrada" } as const;

const LIMIT_PER_SOURCE = 5;
const LIMIT_SHARED = 30;
export const QUOTE_WINDOW_MS = 60 * 60 * 1000;

/** Without a trusted proxy every visitor shares one bucket, so its limit is higher. */
export function quoteAllowed(recentCount: number, sourceKey: string): boolean {
  return recentCount < (sourceKey === DIRECT_SOURCE ? LIMIT_SHARED : LIMIT_PER_SOURCE);
}

/** Stores a one-way hash so spam can be limited without keeping visitors' IP addresses. */
export function hashSource(ip: string, secret: string): string {
  if (ip === DIRECT_SOURCE) return DIRECT_SOURCE;
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex").slice(0, 32);
}
