import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAdmin } from "@/server/auth";
import { isMembershipEnabled } from "@/server/features";
import { Sidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await getAdmin();
  // The login page shares this layout but has no session: render it bare.
  if (!admin) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-surface-2 text-ink lg:grid lg:grid-cols-[240px_1fr]">
      <Sidebar email={admin.email} showMembership={await isMembershipEnabled()} />
      <main className="min-w-0 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
