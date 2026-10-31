import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { Money } from "@/components/ui/Money";

type Props = { title: string; text: string; benefits: string[]; monthlyPriceCRC: number | null; isMember: boolean };

export function MembershipCta({ title, text, benefits, monthlyPriceCRC, isMember }: Props) {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="cta-title">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] bg-ink px-6 py-14 text-bg sm:px-12 sm:py-20">
            <div aria-hidden="true" className="breathe absolute -right-24 -top-24 size-96 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent">Membresía</p>
                <h2 id="cta-title" className="font-display mt-3 text-4xl leading-[1.02] sm:text-6xl">
                  {title}
                </h2>
                <p className="mt-5 max-w-xl text-lg text-bg/70">{text}</p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <LinkButton href={isMember ? "/videos?acceso=miembros" : "/membresia"} className="!bg-accent !text-accent-ink hover:!bg-bg hover:!text-ink">
                    {isMember ? "Ver contenido exclusivo" : "Hazte miembro"}
                  </LinkButton>
                  {monthlyPriceCRC !== null && !isMember && (
                    <span className="text-sm text-bg/60">
                      Desde <span className="font-display text-xl text-bg"><Money amount={monthlyPriceCRC} /></span> al mes
                    </span>
                  )}
                </div>
              </div>
              <ul className="flex flex-col gap-3 border-t border-bg/15 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {benefits.slice(0, 4).map((b) => (
                  <li key={b} className="flex items-start gap-3 text-bg/85">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
