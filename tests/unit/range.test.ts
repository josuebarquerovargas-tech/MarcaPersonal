import { expect, test } from "vitest";
import { parseRange } from "@/lib/storage/range";

test("sin cabecera devuelve null", () => {
  expect(parseRange(null, 100)).toBeNull();
});

test("rango explícito", () => {
  expect(parseRange("bytes=0-9", 100)).toEqual({ start: 0, end: 9 });
});

test("rango abierto hasta el final", () => {
  expect(parseRange("bytes=90-", 100)).toEqual({ start: 90, end: 99 });
});

test("sufijo: últimos N bytes", () => {
  expect(parseRange("bytes=-10", 100)).toEqual({ start: 90, end: 99 });
});

test("inicio fuera del tamaño es inválido", () => {
  expect(parseRange("bytes=200-", 100)).toBe("invalid");
});

test("inicio mayor que fin es inválido", () => {
  expect(parseRange("bytes=5-2", 100)).toBe("invalid");
});

test("fin mayor que el tamaño se recorta", () => {
  expect(parseRange("bytes=50-500", 100)).toEqual({ start: 50, end: 99 });
});

test("unidad desconocida se ignora", () => {
  expect(parseRange("items=0-1", 100)).toBeNull();
});
