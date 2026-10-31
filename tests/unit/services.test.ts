import { expect, test } from "vitest";
import { getServiceBySlug, SERVICES } from "@/lib/services/catalog";

test("son los cinco servicios del material publicitario", () => {
  expect(SERVICES.map((s) => s.slug)).toEqual([
    "sitios-web",
    "redes-sociales",
    "contenido",
    "herramientas-tecnologicas",
    "asesoria",
  ]);
});

test("cada servicio explica qué incluye, para quién es y cómo funciona", () => {
  for (const s of SERVICES) {
    expect(s.includes.length, s.slug).toBeGreaterThan(0);
    expect(s.forWhom.length, s.slug).toBeGreaterThan(0);
    expect(s.title.length, s.slug).toBeGreaterThan(0);
  }
});

test("no promete disponibilidad 24/7 ni resultados garantizados", () => {
  const all = JSON.stringify(SERVICES);
  expect(all).not.toMatch(/24\/7|garantiz/i);
});

test("busca por slug", () => {
  expect(getServiceBySlug("asesoria")?.slug).toBe("asesoria");
  expect(getServiceBySlug("nada")).toBeUndefined();
});
