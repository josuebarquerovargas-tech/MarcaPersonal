import { expect, test } from "vitest";
import { contentFields, formDataToContent } from "@/lib/content/fields";
import { CONTENT_KEYS } from "@/lib/content/keys";

test("toda clave editable tiene descriptores de campos", () => {
  for (const key of CONTENT_KEYS) {
    if (key === "portrait" || key === "features") continue; // se editan en Ajustes
    expect(contentFields[key].length, key).toBeGreaterThan(0);
  }
});

test("campos de texto y textarea se copian tal cual", () => {
  const fd = new FormData();
  fd.set("eyebrow", "  El mae de los perros ");
  fd.set("title", "Rubén");
  fd.set("subtitle", "Sub");
  fd.set("ctaPrimary", "Ver");
  fd.set("ctaSecondary", "Unirme");
  expect(formDataToContent("hero", fd)).toEqual({
    eyebrow: "  El mae de los perros ",
    title: "Rubén",
    subtitle: "Sub",
    ctaPrimary: "Ver",
    ctaSecondary: "Unirme",
  });
});

test("campos de líneas se dividen por salto de línea y se descartan vacías", () => {
  const fd = new FormData();
  fd.set("title", "T");
  fd.set("text", "x");
  fd.set("benefits", "Uno\n\n  Dos  \n");
  expect(formDataToContent("membership", fd)).toMatchObject({ benefits: ["Uno", "Dos"] });
});

test("campos de pares se arman por índice y se descartan filas vacías", () => {
  const fd = new FormData();
  fd.set("title", "T");
  fd.set("text", "x");
  fd.set("benefits", "a");
  fd.set("faq.0.q", "¿Qué?");
  fd.set("faq.0.a", "Esto.");
  fd.set("faq.1.q", "");
  fd.set("faq.1.a", "");
  fd.set("faq.2.q", "¿Otra?");
  fd.set("faq.2.a", "Aquella.");
  expect(formDataToContent("membership", fd)).toMatchObject({
    faq: [
      { q: "¿Qué?", a: "Esto." },
      { q: "¿Otra?", a: "Aquella." },
    ],
  });
});
