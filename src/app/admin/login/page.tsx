import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/server/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "Ingresar · Panel",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Panel administrativo</p>
            <h1 className="font-display mt-2 text-3xl">Rubén Rodríguez</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="rounded-[16px] border border-line bg-surface p-6 shadow-soft">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
