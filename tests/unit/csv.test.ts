import { expect, test } from "vitest";
import { toCsv } from "@/lib/csv";

test("escapa comas y comillas y usa CRLF", () => {
  expect(toCsv([{ a: "x,y", b: 'di "hola"' }])).toBe('a,b\r\n"x,y","di ""hola"""\r\n');
});

test("números y nulos", () => {
  expect(toCsv([{ n: 4900, v: null }])).toBe("n,v\r\n4900,\r\n");
});

test("sin filas devuelve solo salto de línea", () => {
  expect(toCsv([])).toBe("\r\n");
});

test("escapa saltos de línea dentro de un valor", () => {
  expect(toCsv([{ t: "a\nb" }])).toBe('t\r\n"a\nb"\r\n');
});
