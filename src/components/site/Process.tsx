import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

export function Process({ heading, intro, items }: { heading: string; intro: string; items: { title: string; text: string }[] }) {
  return (
    <section id="proceso" className="border-y border-line bg-surface-2/50 py-20 sm:py-28" aria-label="Proceso de trabajo">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Proceso" title={heading} text={intro} />
        </Reveal>
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 0.08} className="border-t-2 border-brand pt-5">
              <p className="font-display text-3xl text-muted">{i + 1}</p>
              <h3 className="font-display mt-2 text-xl leading-snug">{it.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
