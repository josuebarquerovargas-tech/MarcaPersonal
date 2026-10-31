import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { db } from "@/server/db";
import { getServiceBySlug } from "@/lib/services/catalog";
import { getContent } from "@/server/content";
import { quotePlanName } from "@/lib/quotes/plans";
import { QUOTE_STATUS_LABEL } from "@/lib/quotes/quote";
import { formatDate } from "@/lib/format";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { QuoteActions } from "@/components/admin/QuoteActions";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Cotizaciones" };
export const dynamic = "force-dynamic";

const TONE = { NEW: "accent", CONTACTED: "success", CLOSED: "neutral" } as const;

export default async function AdminQuotesPage() {
  await requireAdmin();
  const [quotes, membership] = await Promise.all([db.quoteRequest.findMany({ orderBy: { createdAt: "desc" } }), getContent("membership")]);
  return (
    <>
      <AdminPageHeader title="Cotizaciones" description="Solicitudes recibidas desde el formulario de contacto." />
      <div className="mt-6">
        <DataTable
          rows={quotes}
          rowKey={(q) => q.id}
          minWidth={860}
          empty="Todavía no hay solicitudes."
          columns={[
            { key: "fecha", header: "Fecha", render: (q) => formatDate(q.createdAt) },
            {
              key: "persona",
              header: "Persona",
              render: (q) => (
                <div>
                  <p className="font-medium">{q.name}</p>
                  <p className="text-xs text-muted">{q.contact}</p>
                </div>
              ),
            },
            { key: "servicio", header: "Servicio", render: (q) => getServiceBySlug(q.service)?.title ?? quotePlanName(q.service, membership.plans) ?? "Todavía no lo sabe" },
            { key: "mensaje", header: "Mensaje", render: (q) => <p className="max-w-xs whitespace-pre-line text-muted">{q.message || "—"}</p> },
            { key: "estado", header: "Estado", render: (q) => <Badge tone={TONE[q.status]}>{QUOTE_STATUS_LABEL[q.status]}</Badge> },
            { key: "acciones", header: "Acciones", align: "right", render: (q) => <QuoteActions id={q.id} status={q.status} name={q.name} /> },
          ]}
        />
      </div>
    </>
  );
}
