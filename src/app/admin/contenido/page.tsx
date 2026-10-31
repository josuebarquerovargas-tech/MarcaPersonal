import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { getContent } from "@/server/content";
import { saveContent } from "@/server/actions/content";
import { contentFields, contentSections } from "@/lib/content/fields";
import type { ContentKey } from "@/lib/content/keys";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentForm } from "@/components/admin/ContentForm";

export const metadata: Metadata = { title: "Contenido" };

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string }>;
}) {
  await requireAdmin();
  const { seccion } = await searchParams;
  const current =
    contentSections.find((s) => s.key === seccion)?.key ?? ("hero" satisfies ContentKey);
  const value = await getContent(current);
  const action = saveContent.bind(null, current);

  return (
    <>
      <AdminPageHeader
        title="Contenido"
        description="Textos del sitio público. Los cambios se publican al guardar."
      />
      <nav aria-label="Secciones de contenido" className="mt-6 flex flex-wrap gap-2">
        {contentSections.map((s) => (
          <Link
            key={s.key}
            href={`/admin/contenido?seccion=${s.key}`}
            aria-current={s.key === current ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              s.key === current
                ? "border-ink bg-ink text-bg"
                : "border-line bg-surface text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">
        <ContentForm
          key={current}
          fields={contentFields[current]}
          value={value as Record<string, unknown>}
          action={action}
        />
      </div>
    </>
  );
}
