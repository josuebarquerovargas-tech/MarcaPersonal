import type { Metadata } from "next";
import Link from "next/link";
import type { PaymentStatus } from "@prisma/client";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { formatCRC } from "@/lib/membership/subscription";
import { formatDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Pagos" };
export const dynamic = "force-dynamic";

const filters: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "APPROVED", label: "Aprobados" },
  { value: "DECLINED", label: "Rechazados" },
  { value: "INSUFFICIENT_FUNDS", label: "Sin fondos" },
];

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  await requireAdmin();
  const { estado } = await searchParams;
  const status = filters.some((f) => f.value === estado && f.value) ? (estado as PaymentStatus) : undefined;
  const payments = await db.payment.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { member: true, subscription: { include: { plan: true } } },
  });
  const total = payments.filter((p) => p.status === "APPROVED").reduce((a, p) => a + p.amountCRC, 0);

  return (
    <>
      <AdminPageHeader
        title="Pagos"
        description={`${payments.length} transacciones · ${formatCRC(total)} aprobados`}
        actions={
          <LinkButton href={`/admin/pagos/export${status ? `?estado=${status}` : ""}`} variant="secondary" size="sm">
            Exportar CSV
          </LinkButton>
        }
      />
      <nav aria-label="Filtrar por estado" className="mt-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/pagos?estado=${f.value}` : "/admin/pagos"}
            aria-current={(estado ?? "") === f.value ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              (estado ?? "") === f.value ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">
        <DataTable
          rows={payments}
          rowKey={(p) => p.id}
          empty="No hay pagos con ese estado."
          minWidth={760}
          columns={[
            { key: "fecha", header: "Fecha", render: (p) => formatDate(p.createdAt) },
            {
              key: "miembro",
              header: "Miembro",
              render: (p) => (
                <Link href={`/admin/miembros/${p.memberId}`} className="hover:underline">
                  {p.member.name}
                </Link>
              ),
            },
            { key: "plan", header: "Plan", render: (p) => p.subscription?.plan.name ?? "—" },
            { key: "metodo", header: "Método", render: (p) => (p.method === "CARD" ? `Tarjeta ···· ${p.cardLast4 ?? ""}` : "SINPE Móvil") },
            { key: "ref", header: "Referencia", render: (p) => <span className="tabular-nums text-muted">{p.gatewayRef}</span> },
            { key: "monto", header: "Monto", align: "right", render: (p) => formatCRC(p.amountCRC) },
            { key: "estado", header: "Estado", render: (p) => <PaymentStatusBadge status={p.status} /> },
          ]}
        />
      </div>
    </>
  );
}
