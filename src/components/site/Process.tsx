import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { DrawnIcon } from "./DrawnIcon";
import { SectionHeading } from "./SectionHeading";

const STEP_ICONS = ["search", "target", "megaphone", "chart", "shield"] as const;

export function Process({ heading, intro, items }: { heading: string; intro: string; items: { title: string; text: string }[] }) {
  return (
    <section id="proceso" className="border-y border-line bg-surface-2/50 py-20 sm:py-28" aria-label="Proceso de trabajo">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Proceso" title={heading} text={intro} />
        </Reveal>
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i * 0.08}>
              <div className="raised-card group h-full p-5">
                <div className="flex items-start justify-between">
                  <DrawnIcon name={STEP_ICONS[i % STEP_ICONS.length]} />
                  <span className="text-xs font-medium tabular-nums text-muted">0{i + 1}</span>
                </div>
                <h3 className="font-display mt-4 text-xl leading-snug">{it.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
