import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";
import { VideoGrid } from "./VideoGrid";
import type { VideoCardData } from "./VideoCard";

export function LatestVideos({ videos }: { videos: VideoCardData[] }) {
  return (
    <section id="videos" className="py-20 sm:py-28" aria-labelledby="latest-title">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Contenido"
            title="Lo último"
            text="Contenido para conocer mejor cómo mostrar y hacer crecer tu marca."
            action={
              <LinkButton href="/contenido" variant="secondary">
                Ver todo el contenido
              </LinkButton>
            }
          />
        </Reveal>
        <div className="mt-12">
          <VideoGrid videos={videos} emptyText="Pronto habrá videos aquí." />
        </div>
      </Container>
    </section>
  );
}
