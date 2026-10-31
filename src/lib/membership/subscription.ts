export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED";

export type SubscriptionLike = { status: SubscriptionStatus; currentPeriodEnd: Date };

/**
 * A membership grants access while the paid period lasts: ACTIVE or CANCELED
 * (cancel keeps access until the period end) with currentPeriodEnd in the future.
 */
export function isMembershipActive(sub: SubscriptionLike | null, now: Date = new Date()): boolean {
  if (!sub) return false;
  if (sub.status === "EXPIRED") return false;
  return sub.currentPeriodEnd.getTime() > now.getTime();
}

/** Adds whole months, clamping the day (31 ene + 1 mes → 28/29 feb). */
export function computePeriodEnd(start: Date, intervalMonths: number): Date {
  const d = new Date(start.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + intervalMonths);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

const THIN_SPACE = " ";

/** ₡4 900 — colones without decimals, thin space as thousands separator. */
export function formatCRC(amount: number): string {
  const digits = Math.round(amount).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, THIN_SPACE);
  return `₡${grouped}`;
}
