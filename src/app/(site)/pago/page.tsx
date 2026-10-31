import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { getPlanByCode } from "@/server/plans";
import { formTokens } from "@/server/security";
import { payAndSubscribe } from "@/server/actions/checkout";
import { computePeriodEnd } from "@/lib/membership/subscription";
import { Money } from "@/components/ui/Money";
import { formatLongDate } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export const metadata: Metadata = { title: "Pago", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: code = "MONTHLY" } = await searchParams;
  const member = await requireMember(`/pago?plan=${encodeURIComponent(code)}`);
  const plan = await getPlanByCode(code);
  if (!plan) notFound();

  const membership = await getMembership(member);
  if (membership.active && membership.subscription?.status === "ACTIVE") redirect("/cuenta");

  const formToken = await formTokens.issueFormToken();
  const start = membership.active && membership.subscription ? membership.subscription.currentPeriodEnd : new Date();
  const until = computePeriodEnd(start, plan.intervalMonths);

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Pago</p>
            <h1 className="font-display mt-2 text-4xl sm:text-5xl">Activar membresía</h1>
            <p className="mt-2 text-muted">
              Hola, {member.name}. Elegiste el plan {plan.name.toLowerCase()}.{" "}
              <Link href="/membresia" className="text-ink underline underline-offset-4">
                Cambiar plan
              </Link>
            </p>
            <div className="mt-8 rounded-[16px] border border-line bg-surface p-6 shadow-soft">
              <CheckoutForm action={payAndSubscribe} planCode={plan.code} amountCRC={plan.priceCRC} formToken={formToken} />
            </div>
          </div>
          <aside className="lg:pt-16">
            <div className="rounded-[16px] border border-line bg-surface-2/60 p-6">
              <h2 className="font-display text-2xl">Resumen</h2>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Plan</dt>
                  <dd>{plan.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Período</dt>
                  <dd>{plan.intervalMonths === 12 ? "12 meses" : "1 mes"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Acceso hasta</dt>
                  <dd>{formatLongDate(until)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
                  <dt className="font-medium">Total hoy</dt>
                  <dd className="font-display text-2xl"><Money amount={plan.priceCRC} /></dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
