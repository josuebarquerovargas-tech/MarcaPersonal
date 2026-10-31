import { expect, test } from "vitest";
import { safeNext } from "@/lib/safe-next";

test("acepta rutas internas", () => {
  expect(safeNext("/cuenta")).toBe("/cuenta");
  expect(safeNext("/pago?plan=MONTHLY")).toBe("/pago?plan=MONTHLY");
  expect(safeNext("/videos/un-slug#top")).toBe("/videos/un-slug#top");
});

test("rechaza redirecciones abiertas", () => {
  expect(safeNext("//evil.com")).toBeNull();
  expect(safeNext("/\\evil.com")).toBeNull();
  expect(safeNext("https://evil.com")).toBeNull();
  expect(safeNext("javascript:alert(1)")).toBeNull();
  expect(safeNext("/\\/evil.com")).toBeNull();
  expect(safeNext("cuenta")).toBeNull();
});

test("rechaza valores que no son texto o vacíos", () => {
  expect(safeNext(null)).toBeNull();
  expect(safeNext(undefined)).toBeNull();
  expect(safeNext("")).toBeNull();
  expect(safeNext(42)).toBeNull();
});
