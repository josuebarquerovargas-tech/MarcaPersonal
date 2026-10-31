import type { Metadata } from "next";
import { requireMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { db } from "@/server/db";
import { logoutMember } from "@/server/actions/member-auth";
import { formatCRC } from "@/lib/membership/subscription";
import { formatLongDate } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SubscriptionControls } from "@/components/site/SubscriptionControls";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };
export const dynamic = "force-dynamic";

const statusLabel = { APPROVED: "Aprobado", DECLINED: "Rechazado", INSUFFICIENT_FUNDS: "Sin fondos" } as const;
const statusTone = { APPROVED: "success", DECLINED: "danger", INSUFFICIENT_FUNDS: "warning" } as const;

export default async function AccountPage() {
  const member = await requireMember("/cuenta");
  const membership = await getMembership(member);
  const payments = await db.payment.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    include: { subscription: { include: { plan: true } } },
  });
  const sub = membership.subscription;

  let statusText = "Sin membresía";
  let statusTone2: "neutral" | "success" | "warning" = "neutral";
  if (sub && membership.active && sub.status === "ACTIVE") {
    statusText = `Activa hasta ${formatLongDate(sub.currentPeriodEnd)}`;
    statusTone2 = "success";
  } else if (sub && membership.active && sub.status === "CANCELED") {
    statusText = `Cancelada · acceso hasta ${formatLongDate(sub.currentPeriodEnd)}`;
    statusTone2 = "warning";
  } else if (sub) {
    statusText = `Vencida el ${formatLongDate(sub.currentPeriodEnd)}`;
  }

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Mi cuenta</p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl">Hola, {member.name}</h1>
          <p className="mt-2 text-muted">{member.email}</p>

          <section className="mt-10 rounded-[16px] border border-line bg-surface p-6 shadow-soft" aria-labelledby="membresia">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 id="membresia" className="font-display text-2xl">
                  Membresía
                </h2>
                <p className="mt-2">
                  <Badge tone={statusTone2}>{statusText}</Badge>
                </p>
                {sub && (
                  <p className="mt-2 text-sm text-muted">
                    Plan {sub.plan.name} · {formatCRC(sub.plan.priceCRC)}
                    {sub.plan.intervalMonths === 1 ? " al mes" : " al año"}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {membership.active && sub ? (
                  <SubscriptionControls status={sub.status} />
                ) : (
                  <LinkButton href="/membresia">Activar membresía</LinkButton>
                )}
              </div>
            </div>
          </section>

          <section className="mt-8" aria-labelledby="pagos">
            <h2 id="pagos" className="font-display text-2xl">
              Pagos
            </h2>
            {payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Todavía no hay pagos registrados.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-[12px] border border-line bg-surface">
                <table className="w-full min-w-[520px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-muted">
                    <tr className="border-b border-line">
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Método</th>
                      <th className="px-4 py-3 text-right">Monto</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">{formatLongDate(p.createdAt)}</td>
                        <td className="px-4 py-3">{p.subscription?.plan.name ?? "—"}</td>
                        <td className="px-4 py-3">{p.method === "CARD" ? `Tarjeta ···· ${p.cardLast4 ?? ""}` : "SINPE Móvil"}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatCRC(p.amountCRC)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={statusTone[p.status]}>{statusLabel[p.status]}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <form action={logoutMember} className="mt-10">
            <button type="submit" className="text-sm text-muted underline underline-offset-4 hover:text-ink">
              Cerrar sesión
            </button>
          </form>
        </div>
      </Container>
    </main>
  );
}
