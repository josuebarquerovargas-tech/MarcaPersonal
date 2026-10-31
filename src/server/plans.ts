import "server-only";
import type { Plan } from "@prisma/client";
import { db } from "@/server/db";

export async function listPlans(): Promise<Plan[]> {
  return db.plan.findMany({ where: { active: true }, orderBy: { intervalMonths: "asc" } });
}

export async function getPlanByCode(code: string): Promise<Plan | null> {
  if (code !== "MONTHLY" && code !== "YEARLY") return null;
  return db.plan.findFirst({ where: { code, active: true } });
}
