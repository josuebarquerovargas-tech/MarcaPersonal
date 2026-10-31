import { expect, test } from "vitest";
import { parsePlansForm } from "@/lib/membership/plans-form";

test("lee nombre y precio de cada plan", () => {
  const fd = new FormData();
  fd.set("MONTHLY.name", " Mensual ");
  fd.set("MONTHLY.priceCRC", "5 900");
  fd.set("YEARLY.name", "Anual");
  fd.set("YEARLY.priceCRC", "59000");
  expect(parsePlansForm(fd)).toEqual({
    ok: true,
    plans: [
      { code: "MONTHLY", name: "Mensual", priceCRC: 5900 },
      { code: "YEARLY", name: "Anual", priceCRC: 59000 },
    ],
  });
});

test("rechaza precios inválidos o nombres vacíos", () => {
  const fd = new FormData();
  fd.set("MONTHLY.name", "");
  fd.set("MONTHLY.priceCRC", "4900");
  fd.set("YEARLY.name", "Anual");
  fd.set("YEARLY.priceCRC", "-5");
  const r = parsePlansForm(fd);
  expect(r.ok).toBe(false);
  if (!r.ok) expect(r.error).toMatch(/nombre|precio/i);
});
