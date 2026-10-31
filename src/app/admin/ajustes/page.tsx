import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { getContent } from "@/server/content";
import { storage } from "@/lib/storage/storage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ModulesForm, PasswordForm, PortraitForm } from "@/components/admin/SettingsForms";

export const metadata: Metadata = { title: "Ajustes" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const [portrait, features] = await Promise.all([getContent("portrait"), getContent("features")]);
  const portraitUrl = portrait.key ? storage.publicUrl(portrait.key) : null;

  return (
    <>
      <AdminPageHeader title="Ajustes" description={`Sesión iniciada como ${admin.email}.`} />
      <section className="mt-8 rounded-[12px] border border-line bg-surface p-6" aria-labelledby="retrato">
        <h2 id="retrato" className="font-display text-2xl">
          Retrato
        </h2>
        <div className="mt-5">
          <PortraitForm currentUrl={portraitUrl} />
        </div>
      </section>
      <section className="mt-6 rounded-[12px] border border-line bg-surface p-6" aria-labelledby="modulos">
        <h2 id="modulos" className="font-display text-2xl">
          Módulos
        </h2>
        <div className="mt-5">
          <ModulesForm membership={features.membership} />
        </div>
      </section>
      <section className="mt-6 rounded-[12px] border border-line bg-surface p-6" aria-labelledby="clave">
        <h2 id="clave" className="font-display text-2xl">
          Contraseña
        </h2>
        <p className="mt-1 text-sm text-muted">Al cambiarla se cierran las demás sesiones abiertas del panel.</p>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </section>
      <section className="mt-6 rounded-[12px] border border-dashed border-line p-6 text-sm text-muted" aria-labelledby="demo">
        <h2 id="demo" className="font-display text-2xl text-ink">
          Modo demostración
        </h2>
        <p className="mt-2">
          Los pagos usan una pasarela simulada y no se realizan cobros reales. Si olvidas la contraseña, el administrador del servidor puede
          restablecerla con <code className="rounded bg-surface-2 px-1.5 py-0.5 text-ink">npm run admin:reset-password</code>.
        </p>
      </section>
    </>
  );
}
