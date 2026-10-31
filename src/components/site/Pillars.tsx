import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const icons = [
  <path key="a" d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />,
  <path key="b" d="M4 12a8 8 0 0 1 16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM9 11h.01M15 11h.01M9 16c1 1 5 1 6 0" />,
  <path key="c" d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6" />,
  <path key="d" d="M4 6h16M4 12h10M4 18h7M18 12l3 3-3 3" />,
];

export function Pillars({ heading, intro, items }: { heading: string; intro: string; items: { title: string; text: string }[] }) {
  return (
    <section id="trayectoria" className="border-y border-line bg-surface-2/50 py-20 sm:py-28" aria-labelledby="pillars-title">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Trayectoria" title={heading} text={intro} />
        </Reveal>
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 0.08} className="group rounded-[16px] border border-line bg-surface p-6 transition-transform duration-300 hover:-translate-y-1">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-110">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {icons[i % icons.length]}
                </svg>
              </span>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-muted">0{i + 1}</p>
              <h3 className="font-display mt-1 text-2xl">{it.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{it.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
