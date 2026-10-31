import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { getDashboardStats } from "@/server/stats";
import { formatCRC } from "@/lib/membership/subscription";
import { formatDate, formatViews } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable } from "@/components/admin/DataTable";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdmin();
  const s = await getDashboardStats();
  const monthName = new Intl.DateTimeFormat("es-CR", { month: "long" }).format(new Date());

  return (
    <>
      <AdminPageHeader title="Resumen" description="Vista general de la plataforma." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Miembros activos" value={String(s.activeMembers)} />
        <StatCard label={`Ingresos de ${monthName}`} value={formatCRC(s.monthRevenueCRC)} hint="Pagos simulados aprobados" />
        <StatCard label="Videos publicados" value={String(s.publishedVideos)} />
        <StatCard label="Vistas totales" value={formatViews(s.totalViews)} />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="ultimos-pagos">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="ultimos-pagos" className="font-display text-2xl">
              Últimos pagos
            </h2>
            <Link href="/admin/pagos" className="text-sm text-muted underline-offset-4 hover:underline">
              Ver todos
            </Link>
          </div>
          <DataTable
            minWidth={480}
            rows={s.recentPayments}
            rowKey={(p) => p.id}
            empty="Todavía no hay pagos."
            columns={[
              { key: "fecha", header: "Fecha", render: (p) => formatDate(p.createdAt) },
              { key: "miembro", header: "Miembro", render: (p) => p.member.name },
              { key: "plan", header: "Plan", render: (p) => p.subscription?.plan.name ?? "—" },
              { key: "monto", header: "Monto", align: "right", render: (p) => formatCRC(p.amountCRC) },
              { key: "estado", header: "Estado", render: (p) => <PaymentStatusBadge status={p.status} /> },
            ]}
          />
        </section>
        <section aria-labelledby="ultimos-miembros">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="ultimos-miembros" className="font-display text-2xl">
              Últimos registros
            </h2>
            <Link href="/admin/miembros" className="text-sm text-muted underline-offset-4 hover:underline">
              Ver todos
            </Link>
          </div>
          <DataTable
            minWidth={420}
            rows={s.recentMembers}
            rowKey={(m) => m.id}
            empty="Todavía no hay miembros."
            columns={[
              { key: "nombre", header: "Nombre", render: (m) => <Link href={`/admin/miembros/${m.id}`} className="hover:underline">{m.name}</Link> },
              { key: "correo", header: "Correo", render: (m) => <span className="text-muted">{m.email}</span> },
              { key: "fecha", header: "Registro", render: (m) => formatDate(m.createdAt) },
            ]}
          />
        </section>
      </div>
    </>
  );
}
