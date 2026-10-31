import "server-only";
import { notFound } from "next/navigation";
import { getContent } from "@/server/content";

/** Membership and payments stay hidden until plans and prices are confirmed. */
export async function isMembershipEnabled(): Promise<boolean> {
  return (await getContent("features")).membership;
}

export async function requireMembershipEnabled(): Promise<void> {
  if (!(await isMembershipEnabled())) notFound();
}
