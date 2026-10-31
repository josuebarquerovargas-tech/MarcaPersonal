import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { storage } from "@/lib/storage/storage";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Process } from "@/components/site/Process";
import { Audience } from "@/components/site/Audience";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Sobre Rubén",
  description: "Quién es Rubén Rodríguez y cómo acompaña a marcas y negocios a mejorar su presencia digital.",
};
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [about, process, hero, portrait] = await Promise.all([
    getContent("about"),
    getContent("process"),
    getContent("hero"),
    getContent("portrait"),
  ]);
  const portraitUrl = portrait.key ? storage.publicUrl(portrait.key) : null;

  return (
    <main>
      <section className="py-12 sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.25em] text-accent">Sobre Rubén</p>
              <h1 className="font-display mt-3 text-5xl leading-[1.02] sm:text-7xl">{about.heading}</h1>
              <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-muted">
                {about.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-10">
                <Audience items={about.facts} />
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <LinkButton href="/servicios">Ver servicios</LinkButton>
                <LinkButton href="/contacto" variant="secondary">
                  Contacto
                </LinkButton>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
              <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-surface-2 shadow-soft">
                {portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={portraitUrl} alt={hero.title} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--accent)_35%,transparent),transparent_60%)]">
                    <span className="font-display text-[140px] leading-none tracking-[-0.06em] text-ink/80">RR</span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
      <Process {...process} />
    </main>
  );
}
