import { describe, expect, test } from "vitest";
import { isMembershipActive } from "@/lib/membership/subscription";

const now = new Date("2026-10-30T12:00:00Z");
const tomorrow = new Date("2026-10-31T12:00:00Z");
const yesterday = new Date("2026-10-29T12:00:00Z");

describe("isMembershipActive", () => {
  test("activa con período vigente", () => {
    expect(isMembershipActive({ status: "ACTIVE", currentPeriodEnd: tomorrow }, now)).toBe(true);
  });
  test("cancelada sigue activa hasta el fin del período", () => {
    expect(isMembershipActive({ status: "CANCELED", currentPeriodEnd: tomorrow }, now)).toBe(true);
    expect(isMembershipActive({ status: "CANCELED", currentPeriodEnd: yesterday }, now)).toBe(false);
  });
  test("activa con período vencido no cuenta", () => {
    expect(isMembershipActive({ status: "ACTIVE", currentPeriodEnd: yesterday }, now)).toBe(false);
  });
  test("expirada nunca cuenta", () => {
    expect(isMembershipActive({ status: "EXPIRED", currentPeriodEnd: tomorrow }, now)).toBe(false);
  });
  test("sin suscripción no cuenta", () => {
    expect(isMembershipActive(null, now)).toBe(false);
  });
});
