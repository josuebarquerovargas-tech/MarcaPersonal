"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { requireMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { getPlanByCode } from "@/server/plans";
import { formTokens } from "@/server/security";
import { gateway } from "@/lib/payments/fake-gateway";
import { cardSchema, sinpeSchema } from "@/lib/payments/schemas";
import { computePeriodEnd, isMembershipActive } from "@/lib/membership/subscription";
import { FORM_TOKEN_FIELD } from "@/lib/form-token";

export type CheckoutState = { error?: string; field?: string };

function str(fd: FormData, k: string): string {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
}

export async function payAndSubscribe(_prev: CheckoutState, fd: FormData): Promise<CheckoutState> {
  const planCode = str(fd, "plan");
  const member = await requireMember(`/pago?plan=${encodeURIComponent(planCode)}`);

  const plan = await getPlanByCode(planCode);
  if (!plan) return { error: "Plan no disponible." };

  const method = str(fd, "method") === "SINPE" ? "SINPE" : "CARD";
  let input: Parameters<typeof gateway.charge>[0];
  if (method === "CARD") {
    const parsed = cardSchema.safeParse({
      number: str(fd, "number"),
      name: str(fd, "name"),
      expMonth: str(fd, "expMonth"),
      expYear: str(fd, "expYear"),
      cvv: str(fd, "cvv"),
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { error: issue.message, field: String(issue.path[0] ?? "") };
    }
    input = { amountCRC: plan.priceCRC, method: "CARD", card: parsed.data };
  } else {
    const parsed = sinpeSchema.safeParse({ phone: str(fd, "phone") });
    if (!parsed.success) return { error: parsed.error.issues[0].message, field: "phone" };
    input = { amountCRC: plan.priceCRC, method: "SINPE", phone: parsed.data.phone };
  }

  // The one-time token is spent only once the input is valid, right before the charge,
  // so a validation error never locks the user out of retrying.
  if (!(await formTokens.consumeFormToken(str(fd, FORM_TOKEN_FIELD)))) {
    return { error: "Este pago ya fue enviado. Revisá tu cuenta antes de intentar de nuevo." };
  }
  const charge = await gateway.charge(input);

  const now = new Date();
  const result = await db.$transaction(async (tx) => {
    let subscriptionId: string | null = null;
    if (charge.status === "APPROVED") {
      const current = await tx.subscription.findFirst({
        where: { memberId: member.id, status: { in: ["ACTIVE", "CANCELED"] } },
        orderBy: { currentPeriodEnd: "desc" },
      });
      if (current && isMembershipActive(current, now)) {
        const updated = await tx.subscription.update({
          where: { id: current.id },
          data: {
            status: "ACTIVE",
            canceledAt: null,
            planId: plan.id,
            currentPeriodEnd: computePeriodEnd(current.currentPeriodEnd, plan.intervalMonths),
          },
        });
        subscriptionId = updated.id;
      } else {
        if (current) await tx.subscription.update({ where: { id: current.id }, data: { status: "EXPIRED" } });
        const created = await tx.subscription.create({
          data: {
            memberId: member.id,
            planId: plan.id,
            status: "ACTIVE",
            startedAt: now,
            currentPeriodEnd: computePeriodEnd(now, plan.intervalMonths),
          },
        });
        subscriptionId = created.id;
      }
    }
    const payment = await tx.payment.create({
      data: {
        memberId: member.id,
        subscriptionId,
        amountCRC: plan.priceCRC,
        method,
        status: charge.status,
        gatewayRef: charge.ref,
        cardLast4: charge.last4,
      },
    });
    return { payment, subscriptionId };
  });

  revalidatePath("/", "layout");
  if (charge.status === "APPROVED") {
    redirect(`/pago/exito?ref=${encodeURIComponent(result.payment.gatewayRef)}`);
  }
  redirect(`/pago/error?motivo=${encodeURIComponent(charge.message)}&plan=${plan.code}`);
}

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
