import { jwtVerify, SignJWT } from "jose";

export type SessionKind = "admin" | "member";
export type SessionPayload = { sub: string; v: number };

export const SESSION_COOKIE: Record<SessionKind, string> = {
  admin: "rr_admin",
  member: "rr_member",
};

export const SESSION_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function secretBytes(secret?: string): Uint8Array {
  const s = secret ?? process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("SESSION_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(s);
}

export async function signSession(
  kind: SessionKind,
  payload: SessionPayload,
  secret?: string,
  opts: { expiresInSec?: number } = {},
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (opts.expiresInSec ?? SESSION_MAX_AGE_SEC);
  return new SignJWT({ k: kind, v: payload.v })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(secretBytes(secret));
}

export async function verifySession(
  kind: SessionKind,
  token: string,
  secret?: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretBytes(secret), { algorithms: ["HS256"] });
    if (payload.k !== kind || typeof payload.sub !== "string" || typeof payload.v !== "number") {
      return null;
    }
    return { sub: payload.sub, v: payload.v };
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}
