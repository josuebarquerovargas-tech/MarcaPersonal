import { describe, expect, test } from "vitest";
import { luhnValid } from "@/lib/payments/luhn";
import { cardSchema, sinpeSchema } from "@/lib/payments/schemas";
import { FakeGateway } from "@/lib/payments/fake-gateway";
import { computePeriodEnd, formatCRC } from "@/lib/membership/subscription";

describe("luhnValid", () => {
  test("acepta números válidos con espacios", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4000000000000002")).toBe(true);
  });
  test("rechaza números inválidos", () => {
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("")).toBe(false);
    expect(luhnValid("abcd")).toBe(false);
  });
});

describe("cardSchema", () => {
  const year = new Date().getFullYear();
  const valid = { number: "4242 4242 4242 4242", name: "Ana Pérez", expMonth: 12, expYear: year + 1, cvv: "123" };
  test("acepta una tarjeta válida", () => {
    expect(cardSchema.safeParse(valid).success).toBe(true);
  });
  test("rechaza Luhn inválido, nombre corto, mes y cvv", () => {
    expect(cardSchema.safeParse({ ...valid, number: "4242424242424241" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, expMonth: 13 }).success).toBe(false);
    expect(cardSchema.safeParse({ ...valid, cvv: "12" }).success).toBe(false);
  });
  test("rechaza una fecha de vencimiento pasada", () => {
    expect(cardSchema.safeParse({ ...valid, expYear: year - 1 }).success).toBe(false);
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    expect(
      cardSchema.safeParse({ ...valid, expMonth: lastMonth.getMonth() + 1, expYear: lastMonth.getFullYear() }).success,
    ).toBe(false);
  });
  test("sinpeSchema exige 8 dígitos", () => {
    expect(sinpeSchema.safeParse({ phone: "70150301" }).success).toBe(true);
    expect(sinpeSchema.safeParse({ phone: "7015030" }).success).toBe(false);
  });
});

describe("FakeGateway", () => {
  const gw = new FakeGateway({ delayMs: 0 });
  const card = (number: string) => ({ number, name: "Ana Pérez", expMonth: 12, expYear: 2030, cvv: "123" });

  test("4242 aprueba", async () => {
    const r = await gw.charge({ amountCRC: 4900, method: "CARD", card: card("4242424242424242") });
    expect(r.status).toBe("APPROVED");
    expect(r.last4).toBe("4242");
    expect(r.ref).toMatch(/^DEMO-[A-Z0-9]{10}$/);
  });
  test("0002 rechaza", async () => {
    const r = await gw.charge({ amountCRC: 4900, method: "CARD", card: card("4000000000000002") });
    expect(r.status).toBe("DECLINED");
    expect(r.message).toBe("Tarjeta rechazada por el emisor");
  });
  test("9995 fondos insuficientes", async () => {
    const r = await gw.charge({ amountCRC: 4900, method: "CARD", card: card("4000000000009995") });
    expect(r.status).toBe("INSUFFICIENT_FUNDS");
    expect(r.message).toBe("Fondos insuficientes");
  });
  test("otra tarjeta válida aprueba", async () => {
    const r = await gw.charge({ amountCRC: 4900, method: "CARD", card: card("5555555555554444") });
    expect(r.status).toBe("APPROVED");
    expect(r.last4).toBe("4444");
  });
  test("SINPE terminado en 0000 rechaza, el resto aprueba", async () => {
    expect((await gw.charge({ amountCRC: 4900, method: "SINPE", phone: "70150000" })).status).toBe("DECLINED");
    const ok = await gw.charge({ amountCRC: 4900, method: "SINPE", phone: "70150301" });
    expect(ok.status).toBe("APPROVED");
    expect(ok.last4).toBeNull();
  });
});

describe("computePeriodEnd", () => {
  test("suma meses", () => {
    expect(computePeriodEnd(new Date("2026-10-30T12:00:00Z"), 1).toISOString()).toBe("2026-11-30T12:00:00.000Z");
    expect(computePeriodEnd(new Date("2026-10-30T12:00:00Z"), 12).toISOString()).toBe("2027-10-30T12:00:00.000Z");
  });
  test("recorta el día al último del mes", () => {
    expect(computePeriodEnd(new Date("2027-01-31T12:00:00Z"), 1).toISOString()).toBe("2027-02-28T12:00:00.000Z");
  });
});

describe("formatCRC", () => {
  test("separa miles con espacio fino y sin decimales", () => {
    expect(formatCRC(4900)).toBe("₡4 900");
    expect(formatCRC(49000)).toBe("₡49 000");
    expect(formatCRC(500)).toBe("₡500");
  });
});
