import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { formatCRC, isMembershipActive } from "@/lib/membership/subscription";
import { formatDate, formatLongDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { MemberStatusButton } from "@/components/admin/MemberStatusButton";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

export const metadata: Metadata = { title: "Miembro" };
export const dynamic = "force-dynamic";

export default async function AdminMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const member = await db.member.findUnique({
    where: { id },
    include: {
      subscriptions: { orderBy: { startedAt: "desc" }, include: { plan: true } },
      payments: { orderBy: { createdAt: "desc" }, include: { subscription: { include: { plan: true } } } },
    },
  });
  if (!member) notFound();

  return (
    <>
      <AdminPageHeader
        title={member.name}
        description={`${member.email} · registro ${formatLongDate(member.createdAt)}`}
        actions={<MemberStatusButton id={member.id} status={member.status} />}
      />
      <div className="mt-6 flex items-center gap-2">
        <span className="text-sm text-muted">Cuenta:</span>
        {member.status === "ACTIVE" ? <Badge tone="success">Activa</Badge> : <Badge tone="danger">Suspendida</Badge>}
      </div>

      <section className="mt-8" aria-labelledby="subs">
        <h2 id="subs" className="font-display mb-3 text-2xl">
          Suscripciones
        </h2>
        <DataTable
          rows={member.subscriptions}
          rowKey={(s) => s.id}
          empty="Sin suscripciones."
          columns={[
            { key: "plan", header: "Plan", render: (s) => s.plan.name },
            {
              key: "estado",
              header: "Estado",
              render: (s) => {
                const active = isMembershipActive(s);
                return <Badge tone={active ? "success" : "neutral"}>{s.status === "ACTIVE" ? "Activa" : s.status === "CANCELED" ? "Cancelada" : "Expirada"}{active ? "" : " (sin acceso)"}</Badge>;
              },
            },
            { key: "inicio", header: "Inicio", render: (s) => formatDate(s.startedAt) },
            { key: "fin", header: "Acceso hasta", render: (s) => formatDate(s.currentPeriodEnd) },
          ]}
        />
      </section>

      <section className="mt-8" aria-labelledby="pagos">
        <h2 id="pagos" className="font-display mb-3 text-2xl">
          Pagos
        </h2>
        <DataTable
          rows={member.payments}
          rowKey={(p) => p.id}
          empty="Sin pagos."
          columns={[
            { key: "fecha", header: "Fecha", render: (p) => formatDate(p.createdAt) },
            { key: "plan", header: "Plan", render: (p) => p.subscription?.plan.name ?? "—" },
            { key: "metodo", header: "Método", render: (p) => (p.method === "CARD" ? `Tarjeta ···· ${p.cardLast4 ?? ""}` : "SINPE Móvil") },
            { key: "ref", header: "Referencia", render: (p) => <span className="tabular-nums text-muted">{p.gatewayRef}</span> },
            { key: "monto", header: "Monto", align: "right", render: (p) => formatCRC(p.amountCRC) },
            { key: "estado", header: "Estado", render: (p) => <PaymentStatusBadge status={p.status} /> },
          ]}
        />
      </section>
    </>
  );
}
