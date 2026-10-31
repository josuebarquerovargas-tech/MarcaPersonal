/** Stable ids stored with each quote. Names and contents are editable in the admin panel. */
export const QUOTE_PLAN_IDS = ["plan-inicio", "plan-crecimiento", "plan-completo"] as const;

export function isQuotePlan(value: string): boolean {
  return (QUOTE_PLAN_IDS as readonly string[]).includes(value);
}

export function quotePlanName(value: string, plans: { name: string }[]): string | undefined {
  const index = (QUOTE_PLAN_IDS as readonly string[]).indexOf(value);
  return index < 0 ? undefined : plans[index]?.name;
}
