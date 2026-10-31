import "server-only";
import type { Member, Plan, Subscription } from "@prisma/client";
import { db } from "@/server/db";
import { isMembershipActive } from "@/lib/membership/subscription";

export { getMember } from "@/server/auth";

export type Membership = {
  active: boolean;
  subscription: (Subscription & { plan: Plan }) | null;
};

/** Current membership for a member (or for "no member" when null). */
export async function getMembership(member: Member | null): Promise<Membership> {
  if (!member || member.status !== "ACTIVE") return { active: false, subscription: null };
  const subscription = await db.subscription.findFirst({
    where: { memberId: member.id, status: { in: ["ACTIVE", "CANCELED"] } },
    orderBy: { currentPeriodEnd: "desc" },
    include: { plan: true },
  });
  return { active: isMembershipActive(subscription), subscription };
}
