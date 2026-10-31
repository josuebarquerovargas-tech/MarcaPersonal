import { describe, expect, test } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { signSession, verifySession, SESSION_COOKIE } from "@/lib/auth/session";
import { createRateLimiter } from "@/lib/auth/rate-limit";

const SECRET = "x".repeat(32);

describe("password", () => {
  test("hash and verify", async () => {
    const h = await hashPassword("Secreta1!");
    expect(h).not.toBe("Secreta1!");
    expect(await verifyPassword("Secreta1!", h)).toBe(true);
    expect(await verifyPassword("otra", h)).toBe(false);
  });
});

describe("session", () => {
  test("cookie names", () => {
    expect(SESSION_COOKIE).toEqual({ admin: "rr_admin", member: "rr_member" });
  });

  test("roundtrip", async () => {
    const t = await signSession("admin", { sub: "a1", v: 0 }, SECRET);
    expect(await verifySession("admin", t, SECRET)).toEqual({ sub: "a1", v: 0 });
  });

  test("kind mismatch is rejected", async () => {
    const t = await signSession("member", { sub: "m1", v: 0 }, SECRET);
    expect(await verifySession("admin", t, SECRET)).toBeNull();
  });

  test("tampered token is rejected", async () => {
    expect(await verifySession("admin", "abc.def.ghi", SECRET)).toBeNull();
    const t = await signSession("admin", { sub: "a1", v: 0 }, SECRET);
    expect(await verifySession("admin", t, "y".repeat(32))).toBeNull();
  });

  test("expired token is rejected", async () => {
    const t = await signSession("admin", { sub: "a1", v: 0 }, SECRET, { expiresInSec: -10 });
    expect(await verifySession("admin", t, SECRET)).toBeNull();
  });
});

describe("rate limit", () => {
  test("blocks after 5 failures in the window", async () => {
    const rl = createRateLimiter({ findFailures: async () => 5, record: async () => {} });
    const r = await rl.checkLoginAllowed("1.1.1.1");
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSec).toBeGreaterThan(0);
  });

  test("allows under 5 failures", async () => {
    const rl = createRateLimiter({ findFailures: async () => 4, record: async () => {} });
    expect((await rl.checkLoginAllowed("1.1.1.1")).allowed).toBe(true);
  });

  test("records attempts with the outcome", async () => {
    const calls: Array<[string, boolean]> = [];
    const rl = createRateLimiter({
      findFailures: async () => 0,
      record: async (ip, ok) => {
        calls.push([ip, ok]);
      },
    });
    await rl.recordLoginAttempt("2.2.2.2", false);
    await rl.recordLoginAttempt("2.2.2.2", true);
    expect(calls).toEqual([
      ["2.2.2.2", false],
      ["2.2.2.2", true],
    ]);
  });

  test("asks for failures within the last 15 minutes", async () => {
    let askedSince: Date | null = null;
    const now = new Date("2026-10-30T12:00:00Z");
    const rl = createRateLimiter({
      findFailures: async (_ip, since) => {
        askedSince = since;
        return 0;
      },
      record: async () => {},
    });
    await rl.checkLoginAllowed("3.3.3.3", now);
    expect(askedSince).toEqual(new Date("2026-10-30T11:45:00Z"));
  });
});
