import Link from "next/link";
import { SERVICES } from "@/lib/services/catalog";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ServicePhoto } from "./ServicePhoto";
import { SectionHeading } from "./SectionHeading";

type Props = { heading: string; intro: string; items: { title: string; text: string }[]; standalone?: boolean };

export function ServicesGrid({ heading, intro, items, standalone = false }: Props) {
  return (
    <section id="servicios" className={standalone ? "py-12 sm:py-16" : "py-20 sm:py-28"} aria-label="Servicios">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Servicios" title={heading} text={intro} level={standalone ? 1 : 2} />
        </Reveal>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {SERVICES.map((s, i) => {
            const copy = items[i] ?? { title: s.title, text: s.summary };
            return (
              <Reveal as="li" key={s.slug} delay={i * 0.08}>
                <Link href={`/servicios/${s.slug}`} className="raised-card group flex h-full flex-col overflow-hidden">
                  <ServicePhoto name={s.icon} />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-xl leading-snug">{copy.title}</h3>
                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{copy.text}</p>
                    <span className="mt-5 flex items-center justify-between gap-2">
                      <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">{s.tag}</span>
                      <span className="whitespace-nowrap text-sm font-medium">
                        Ver más <span aria-hidden="true" className="inline-block transition-transform duration-200 ease-[var(--ease-out)] group-hover:translate-x-1">→</span>
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
