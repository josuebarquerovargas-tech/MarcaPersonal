import { describe, expect, test } from "vitest";
import { hashSource, quoteAllowed, quoteSchema } from "@/lib/quotes/quote";

const valid = {
  name: "Ana Pérez",
  contact: "ana@ejemplo.cr",
  service: "sitios-web",
  message: "Necesito una página para mi negocio.",
  consent: "on",
};

describe("quoteSchema", () => {
  test("acepta una solicitud válida", () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  test("acepta un teléfono como contacto y un mensaje vacío", () => {
    expect(quoteSchema.safeParse({ ...valid, contact: "6336 0450", message: "" }).success).toBe(true);
  });

  test("rechaza contacto que no es correo ni teléfono", () => {
    const r = quoteSchema.safeParse({ ...valid, contact: "hola" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toMatch(/correo o un teléfono/);
  });

  test("exige nombre y consentimiento", () => {
    expect(quoteSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, consent: undefined }).success).toBe(false);
  });

  test("rechaza un servicio desconocido pero admite 'no sé todavía'", () => {
    expect(quoteSchema.safeParse({ ...valid, service: "inventado" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, service: "otro" }).success).toBe(true);
  });

  test("limita el largo del mensaje", () => {
    expect(quoteSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("quoteAllowed", () => {
  test("una fuente identificada admite 5 por hora", () => {
    expect(quoteAllowed(4, "abc")).toBe(true);
    expect(quoteAllowed(5, "abc")).toBe(false);
  });

  test("sin proxy de confianza el cubo compartido admite 30 por hora", () => {
    expect(quoteAllowed(29, "direct")).toBe(true);
    expect(quoteAllowed(30, "direct")).toBe(false);
  });
});

describe("hashSource", () => {
  test("no guarda la IP en claro y es estable", () => {
    const h = hashSource("1.2.3.4", "secreto");
    expect(h).not.toContain("1.2.3.4");
    expect(h).toBe(hashSource("1.2.3.4", "secreto"));
    expect(h).not.toBe(hashSource("1.2.3.5", "secreto"));
  });

  test("conserva el cubo compartido", () => {
    expect(hashSource("direct", "secreto")).toBe("direct");
  });
});
