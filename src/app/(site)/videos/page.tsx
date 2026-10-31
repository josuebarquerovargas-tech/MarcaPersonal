import type { Metadata } from "next";
import { listPublishedVideos } from "@/server/videos";
import { isMembershipEnabled } from "@/server/features";
import { storage } from "@/lib/storage/storage";
import { Container } from "@/components/ui/Container";
import { VideoGrid } from "@/components/site/VideoGrid";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Input } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Videos",
  description: "Videos de Rubén Rodríguez sobre marca personal, redes sociales y crecimiento de negocios.",
};

const accessOptions = [
  { value: "", label: "Todos" },
  { value: "gratis", label: "Gratis" },
  { value: "miembros", label: "Exclusivos" },
] as const;

const platformOptions = [
  { value: "", label: "Todas las fuentes" },
  { value: "FILE", label: "Videos propios" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "YOUTUBE", label: "YouTube" },
] as const;

type Search = { acceso?: string; plataforma?: string; q?: string };

export default async function VideosPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const membershipOn = await isMembershipEnabled();
  const shownAccess = accessOptions.filter((o) => membershipOn || o.value !== "miembros");
  const access = sp.acceso === "gratis" ? "FREE" : sp.acceso === "miembros" ? "MEMBERS" : undefined;
  const platform = platformOptions.some((p) => p.value === sp.plataforma && p.value)
    ? (sp.plataforma as "FILE" | "TIKTOK" | "INSTAGRAM" | "YOUTUBE")
    : undefined;
  const q = sp.q?.trim() || undefined;

  const videos = await listPublishedVideos({ access, platform, q });
  const cards = videos.map((v) => ({ ...v, thumbUrl: v.thumbnailPath ? storage.publicUrl(v.thumbnailPath) : null }));

  function href(next: Partial<Search>) {
    const params = new URLSearchParams();
    const merged = { ...sp, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/videos?${s}` : "/videos";
  }

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Videos" title="Todo el contenido" text="Videos para conocer mejor cómo mostrar y hacer crecer tu marca." />

        <form method="get" action="/videos" className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por acceso">
            {shownAccess.map((o) => {
              const active = (sp.acceso ?? "") === o.value;
              return (
                <a
                  key={o.value}
                  href={href({ acceso: o.value || undefined })}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    active ? "border-ink bg-ink text-bg" : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {o.label}
                </a>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {sp.acceso && <input type="hidden" name="acceso" value={sp.acceso} />}
            <select
              name="plataforma"
              defaultValue={sp.plataforma ?? ""}
              aria-label="Fuente"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm sm:flex-none"
            >
              {platformOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Input name="q" type="search" placeholder="Buscar…" defaultValue={sp.q ?? ""} aria-label="Buscar videos" className="min-w-[140px] flex-1 rounded-full sm:w-44 sm:flex-none" />
            <button type="submit" className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink">
              Aplicar
            </button>
          </div>
        </form>

        <div className="mt-10">
          <VideoGrid videos={cards} emptyText={videos.length === 0 && !q && !sp.plataforma && !sp.acceso ? "Pronto habrá videos aquí." : "No hay videos que coincidan con ese filtro."} />
        </div>
      </Container>
    </main>
  );
}
