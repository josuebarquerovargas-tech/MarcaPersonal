import { describe, expect, test } from "vitest";
import { parseMarkdown, readingMinutes, safeHref } from "@/lib/blog/markdown";

describe("parseMarkdown", () => {
  test("separa párrafos y encabezados", () => {
    expect(parseMarkdown("## Título\n\nUno\ncontinúa\n\n### Sub")).toEqual([
      { t: "h2", c: [{ t: "text", v: "Título" }] },
      { t: "p", c: [{ t: "text", v: "Uno continúa" }] },
      { t: "h3", c: [{ t: "text", v: "Sub" }] },
    ]);
  });

  test("listas y citas", () => {
    expect(parseMarkdown("- a\n- b\n\n1. c\n2. d\n\n> dicho")).toEqual([
      { t: "ul", items: [[{ t: "text", v: "a" }], [{ t: "text", v: "b" }]] },
      { t: "ol", items: [[{ t: "text", v: "c" }], [{ t: "text", v: "d" }]] },
      { t: "quote", c: [{ t: "text", v: "dicho" }] },
    ]);
  });

  test("negrita, cursiva y enlaces", () => {
    expect(parseMarkdown("a **b** *c* [d](https://x.cr/e) f")[0]).toEqual({
      t: "p",
      c: [
        { t: "text", v: "a " },
        { t: "strong", v: "b" },
        { t: "text", v: " " },
        { t: "em", v: "c" },
        { t: "text", v: " " },
        { t: "link", v: "d", href: "https://x.cr/e" },
        { t: "text", v: " f" },
      ],
    });
  });

  test("un enlace peligroso queda como texto y el HTML no se interpreta", () => {
    expect(parseMarkdown("[x](javascript:alert(1))")[0]).toEqual({ t: "p", c: [{ t: "text", v: "x" }] });
    expect(parseMarkdown("<script>alert(1)</script>")[0]).toEqual({
      t: "p",
      c: [{ t: "text", v: "<script>alert(1)</script>" }],
    });
  });

  test("texto vacío no produce bloques y CRLF funciona", () => {
    expect(parseMarkdown("  \n\n ")).toEqual([]);
    expect(parseMarkdown("uno\r\n\r\ndos")).toHaveLength(2);
  });
});

describe("safeHref", () => {
  test("permite http, https, mailto y rutas internas", () => {
    for (const h of ["http://a.cr", "https://a.cr/b", "mailto:a@b.cr", "/videos"]) expect(safeHref(h)).toBe(h);
  });
  test("rechaza esquemas peligrosos y rutas ambiguas", () => {
    for (const h of ["javascript:alert(1)", "JAVASCRIPT:alert(1)", "data:text/html,x", "//evil.com", "/\\evil.com"]) {
      expect(safeHref(h)).toBeNull();
    }
  });
});

test("readingMinutes redondea hacia arriba con mínimo de 1", () => {
  expect(readingMinutes("")).toBe(1);
  expect(readingMinutes(Array(201).fill("p").join(" "))).toBe(2);
});
