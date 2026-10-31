import Link from "next/link";
import { SERVICES } from "@/lib/services/catalog";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

type Props = { heading: string; intro: string; items: { title: string; text: string }[]; standalone?: boolean };

export function ServicesGrid({ heading, intro, items, standalone = false }: Props) {
  return (
    <section id="servicios" className={standalone ? "py-12 sm:py-16" : "py-20 sm:py-28"} aria-label="Servicios">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Servicios" title={heading} text={intro} level={standalone ? 1 : 2} />
        </Reveal>
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const copy = items[i] ?? { title: s.title, text: s.summary };
            return (
              <Reveal as="li" key={s.slug} delay={i * 0.06}>
                <Link
                  href={`/servicios/${s.slug}`}
                  className="group flex h-full flex-col rounded-[16px] border border-line bg-surface p-6 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-accent sm:p-8"
                >
                  <span className="text-xs uppercase tracking-[0.2em] text-muted">0{i + 1}</span>
                  <h3 className="font-display mt-3 text-2xl leading-snug sm:text-3xl">{copy.title}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{copy.text}</p>
                  <span className="mt-6 text-sm font-medium text-accent">
                    Ver detalle <span aria-hidden="true" className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
