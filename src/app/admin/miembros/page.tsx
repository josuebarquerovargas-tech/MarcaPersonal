import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { isMembershipActive } from "@/lib/membership/subscription";
import { formatDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = { title: "Miembros" };
export const dynamic = "force-dynamic";

export default async function AdminMembersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const { q } = await searchParams;
  const members = await db.member.findMany({
    where: q
      ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { subscriptions: { orderBy: { currentPeriodEnd: "desc" }, take: 1, include: { plan: true } } },
  });

  return (
    <>
      <AdminPageHeader
        title="Miembros"
        description={`${members.length} ${members.length === 1 ? "cuenta" : "cuentas"}`}
        actions={
          <form method="get" className="flex gap-2">
            <Input name="q" type="search" defaultValue={q ?? ""} placeholder="Buscar por nombre o correo" aria-label="Buscar miembros" className="w-64" />
            <button type="submit" className="rounded-[10px] border border-line px-4 text-sm hover:border-ink">
              Buscar
            </button>
          </form>
        }
      />
      <div className="mt-6">
        <DataTable
          rows={members}
          rowKey={(m) => m.id}
          empty="No hay miembros que coincidan."
          columns={[
            {
              key: "nombre",
              header: "Miembro",
              render: (m) => (
                <div>
                  <Link href={`/admin/miembros/${m.id}`} className="font-medium hover:underline">
                    {m.name}
                  </Link>
                  <p className="text-xs text-muted">{m.email}</p>
                </div>
              ),
            },
            {
              key: "cuenta",
              header: "Cuenta",
              render: (m) => (m.status === "ACTIVE" ? <Badge tone="success">Activa</Badge> : <Badge tone="danger">Suspendida</Badge>),
            },
            {
              key: "membresia",
              header: "Membresía",
              render: (m) => {
                const s = m.subscriptions[0];
                if (!s) return <span className="text-muted">Sin membresía</span>;
                const active = isMembershipActive(s);
                return (
                  <span>
                    <Badge tone={active ? (s.status === "CANCELED" ? "warning" : "accent") : "neutral"}>
                      {active ? (s.status === "CANCELED" ? "Cancelada" : "Activa") : "Vencida"}
                    </Badge>
                    <span className="ml-2 text-xs text-muted">
                      {s.plan.name} · hasta {formatDate(s.currentPeriodEnd)}
                    </span>
                  </span>
                );
              },
            },
            { key: "registro", header: "Registro", render: (m) => formatDate(m.createdAt) },
          ]}
        />
      </div>
    </>
  );
}
