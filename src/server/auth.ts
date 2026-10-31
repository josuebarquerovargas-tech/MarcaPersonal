import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminUser, Member } from "@prisma/client";
import { db } from "@/server/db";
import { SESSION_COOKIE, cookieOptions, signSession, verifySession } from "@/lib/auth/session";

export async function getAdmin(): Promise<AdminUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE.admin)?.value;
  if (!token) return null;
  const session = await verifySession("admin", token);
  if (!session) return null;
  const admin = await db.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin || admin.sessionVersion !== session.v) return null;
  return admin;
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** For route handlers: returns the admin or a 401 JSON response. */
export async function requireAdminApi(): Promise<AdminUser | Response> {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "No autorizado" }, { status: 401 });
  return admin;
}

export async function setAdminSession(admin: Pick<AdminUser, "id" | "sessionVersion">) {
  const token = await signSession("admin", { sub: admin.id, v: admin.sessionVersion });
  (await cookies()).set(SESSION_COOKIE.admin, token, cookieOptions());
}

export async function clearAdminSession() {
  (await cookies()).delete(SESSION_COOKIE.admin);
}

export async function getMember(): Promise<Member | null> {
  const token = (await cookies()).get(SESSION_COOKIE.member)?.value;
  if (!token) return null;
  const session = await verifySession("member", token);
  if (!session) return null;
  const member = await db.member.findUnique({ where: { id: session.sub } });
  if (!member || member.sessionVersion !== session.v) return null;
  return member;
}

export async function requireMember(next?: string): Promise<Member> {
  const member = await getMember();
  if (!member) redirect(next ? `/ingresar?next=${encodeURIComponent(next)}` : "/ingresar");
  return member;
}

export async function setMemberSession(member: Pick<Member, "id" | "sessionVersion">) {
  const token = await signSession("member", { sub: member.id, v: member.sessionVersion });
  (await cookies()).set(SESSION_COOKIE.member, token, cookieOptions());
}

export async function clearMemberSession() {
  (await cookies()).delete(SESSION_COOKIE.member);
}
