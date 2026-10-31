"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireMember } from "@/server/auth";
import { getMembership } from "@/server/members";

export async function cancelSubscription(): Promise<void> {
  const member = await requireMember("/cuenta");
  const { subscription } = await getMembership(member);
  if (!subscription || subscription.status !== "ACTIVE") return;
  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: "CANCELED", canceledAt: new Date() },
  });
  revalidatePath("/cuenta");
}

export async function reactivateSubscription(): Promise<void> {
  const member = await requireMember("/cuenta");
  const { subscription, active } = await getMembership(member);
  if (!subscription || subscription.status !== "CANCELED" || !active) return;
  await db.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE", canceledAt: null },
  });
  revalidatePath("/cuenta");
}
