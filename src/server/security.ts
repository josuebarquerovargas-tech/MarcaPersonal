import { headers } from "next/headers";
import { db } from "@/server/db";
import { createRateLimiter } from "@/lib/auth/rate-limit";
import { createFormTokens } from "@/lib/form-token";

/** Rate limiter backed by the LoginAttempt table. */
export const loginLimiter = createRateLimiter({
  findFailures: (ip, since) =>
    db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }),
  record: async (ip, success) => {
    await db.loginAttempt.create({ data: { ip, success } });
  },
});

/** One-time form tokens backed by the FormToken table. */
export const formTokens = createFormTokens({
  insert: async (row) => {
    await db.formToken.create({ data: row });
  },
  find: (token) => db.formToken.findUnique({ where: { token } }),
  markUsed: async (token, at) => {
    const r = await db.formToken.updateMany({
      where: { token, usedAt: null },
      data: { usedAt: at },
    });
    return r.count === 1;
  },
  purge: async (before) => {
    await db.formToken.deleteMany({
      where: { OR: [{ usedAt: { lt: before } }, { expiresAt: { lt: before } }] },
    });
  },
});

export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "127.0.0.1";
}
