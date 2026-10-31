import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "./SectionHeading";

type Props = {
  heading: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
  compact?: boolean;
};

export function About({ heading, paragraphs, facts, compact = false }: Props) {
  const shown = compact ? paragraphs.slice(0, 2) : paragraphs;
  return (
    <section id="sobre-mi" className="py-20 sm:py-28" aria-labelledby="about-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Sobre Rubén" title={heading} />
            <div className="mt-8 flex flex-col gap-5 text-lg leading-relaxed text-muted">
              {shown.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {compact && paragraphs.length > 2 && (
              <div className="mt-8">
                <LinkButton href="/sobre-mi" variant="secondary">
                  Conocer más
                </LinkButton>
              </div>
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="grid gap-px overflow-hidden rounded-[16px] border border-line bg-line sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="bg-surface p-6">
                  <dt className="font-display text-2xl">{f.label}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
