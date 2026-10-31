import { z } from "zod";
import { luhnValid } from "./luhn";

export const cardSchema = z
  .object({
    number: z
      .string()
      .transform((s) => s.replace(/\s+/g, ""))
      .refine((s) => /^\d{13,19}$/.test(s), "Ingresa un número de tarjeta válido")
      .refine(luhnValid, "El número de tarjeta no es válido"),
    name: z.string().trim().min(3, "Ingresa el nombre como aparece en la tarjeta").max(80),
    expMonth: z.coerce.number().int().min(1, "Mes inválido").max(12, "Mes inválido"),
    expYear: z.coerce.number().int().min(2000).max(2100),
    cvv: z.string().regex(/^\d{3,4}$/, "El CVV tiene 3 o 4 dígitos"),
  })
  .superRefine((card, ctx) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    if (card.expYear < y || (card.expYear === y && card.expMonth < m)) {
      ctx.addIssue({ code: "custom", path: ["expYear"], message: "La tarjeta está vencida" });
    }
  });

export const sinpeSchema = z.object({
  phone: z
    .string()
    .transform((s) => s.replace(/[\s-]+/g, ""))
    .refine((s) => /^\d{8}$/.test(s), "Ingresa un número SINPE Móvil de 8 dígitos"),
});

export type Card = z.infer<typeof cardSchema>;
export type Sinpe = z.infer<typeof sinpeSchema>;
