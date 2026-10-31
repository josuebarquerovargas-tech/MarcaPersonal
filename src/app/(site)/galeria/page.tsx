import type { Metadata } from "next";
import { listPhotos } from "@/server/photos";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PhotoMosaic } from "@/components/site/PhotoMosaic";

export const metadata: Metadata = { title: "Galería", description: "Fotos de campañas, eventos y rescates." };
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const photos = await listPhotos();
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Galería" title="En la calle y en el campo" text="Campañas, eventos, rescates y la manada." />
        <div className="mt-10">
          {photos.length === 0 ? (
            <p className="rounded-[14px] border border-dashed border-line px-6 py-16 text-center text-muted">Pronto habrá fotos aquí.</p>
          ) : (
            <PhotoMosaic photos={photos} />
          )}
        </div>
      </Container>
    </main>
  );
}
