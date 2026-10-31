import { expect, test } from "vitest";
import { resolveClientIp } from "@/lib/auth/client-ip";

test("sin proxy de confianza ignora las cabeceras y usa un único cubo", () => {
  expect(resolveClientIp({ forwardedFor: "1.2.3.4", realIp: "5.6.7.8", trustProxy: false })).toBe("direct");
});

test("con proxy de confianza usa la primera IP de X-Forwarded-For", () => {
  expect(resolveClientIp({ forwardedFor: " 9.9.9.9, 10.0.0.1", realIp: null, trustProxy: true })).toBe("9.9.9.9");
});

test("con proxy de confianza cae a X-Real-IP y luego a direct", () => {
  expect(resolveClientIp({ forwardedFor: null, realIp: "7.7.7.7", trustProxy: true })).toBe("7.7.7.7");
  expect(resolveClientIp({ forwardedFor: null, realIp: null, trustProxy: true })).toBe("direct");
});
