import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { getContent } from "@/server/content";
import { listPlans } from "@/server/plans";
import { isMembershipEnabled } from "@/server/features";
import { saveContent } from "@/server/actions/content";
import { contentFields, contentSections } from "@/lib/content/fields";
import type { ContentKey } from "@/lib/content/keys";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentForm } from "@/components/admin/ContentForm";
import { PlansForm } from "@/components/admin/PlansForm";

export const metadata: Metadata = { title: "Contenido" };
export const dynamic = "force-dynamic";

const PLANS_SECTION = "planes";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  await requireAdmin();
  const { seccion } = await searchParams;
  const membershipOn = await isMembershipEnabled();
  const sections = contentSections.filter((s) => membershipOn || s.key !== "membership");
  const isPlans = membershipOn && seccion === PLANS_SECTION;
  const current =
    sections.find((s) => s.key === seccion)?.key ?? ("hero" satisfies ContentKey);
  const tabs = [...sections.map((s) => ({ key: s.key as string, label: s.label })), ...(membershipOn ? [{ key: PLANS_SECTION, label: "Planes" }] : [])];
  const activeKey = isPlans ? PLANS_SECTION : current;

  return (
    <>
      <AdminPageHeader
        title="Contenido"
        description="Textos y precios del sitio público. Los cambios se publican al guardar."
      />
      <nav aria-label="Secciones de contenido" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((s) => (
          <Link
            key={s.key}
            href={`/admin/contenido?seccion=${s.key}`}
            aria-current={s.key === activeKey ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              s.key === activeKey
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        {isPlans ? (
          <PlansForm plans={await listPlans()} />
        ) : (
          <ContentForm
            key={current}
            fields={contentFields[current]}
            value={(await getContent(current)) as Record<string, unknown>}
            action={saveContent.bind(null, current)}
          />
        )}
      </div>
    </>
  );
}
