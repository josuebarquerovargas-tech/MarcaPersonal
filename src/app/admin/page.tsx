import { requireAdmin } from "@/server/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminHomePage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Resumen" description="Vista general de la plataforma." />
      <p className="mt-6 text-muted">Las métricas aparecerán aquí.</p>
    </>
  );
}
