export const PLAN_CODES = ["MONTHLY", "YEARLY"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

export type PlanInput = { code: PlanCode; name: string; priceCRC: number };

export type PlansFormResult = { ok: true; plans: PlanInput[] } | { ok: false; error: string };

/** Parses the admin "Planes" form: `<CODE>.name` and `<CODE>.priceCRC` per plan. */
export function parsePlansForm(fd: FormData): PlansFormResult {
  const plans: PlanInput[] = [];
  for (const code of PLAN_CODES) {
    const rawName = fd.get(`${code}.name`);
    const rawPrice = fd.get(`${code}.priceCRC`);
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (name.length < 2 || name.length > 40) {
      return { ok: false, error: `El nombre del plan ${code === "MONTHLY" ? "mensual" : "anual"} es obligatorio.` };
    }
    const digits = typeof rawPrice === "string" ? rawPrice.replace(/[\s.,₡]/g, "") : "";
    const priceCRC = Number(digits);
    if (!/^\d+$/.test(digits) || !Number.isInteger(priceCRC) || priceCRC < 100 || priceCRC > 10_000_000) {
      return { ok: false, error: `El precio del plan ${code === "MONTHLY" ? "mensual" : "anual"} debe ser un entero en colones.` };
    }
    plans.push({ code, name, priceCRC });
  }
  return { ok: true, plans };
}
