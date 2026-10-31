import type { Metadata } from "next";
import Link from "next/link";
import { getMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { getContent } from "@/server/content";
import { listPlans } from "@/server/plans";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PlanCard } from "@/components/site/PlanCard";

export const metadata: Metadata = {
  title: "Membresía",
  description: "Unite a la manada: videos exclusivos de adiestramiento y contenido que apoya rescates y campañas.",
};
export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const [m, plans, member] = await Promise.all([getContent("membership"), listPlans(), getMember()]);
  const membership = await getMembership(member);
  const monthly = plans.find((p) => p.code === "MONTHLY");

  const planHref = (code: string) => {
    const target = `/pago?plan=${code}`;
    return member ? target : `/registro?next=${encodeURIComponent(target)}`;
  };

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Membresía" title={m.title} text={m.text} />

        {membership.active ? (
          <Reveal className="mt-10 rounded-[16px] border border-accent/40 bg-accent/5 p-6">
            <p className="font-display text-2xl">Ya sos miembro</p>
            <p className="mt-2 text-muted">
              Gracias por apoyar. Administrá tu membresía desde{" "}
              <Link href="/cuenta" className="text-ink underline underline-offset-4">
                tu cuenta
              </Link>
              .
            </p>
          </Reveal>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {plans.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <PlanCard
                  plan={p}
                  monthlyPrice={monthly?.priceCRC}
                  href={planHref(p.code)}
                  cta={p.code === "YEARLY" ? "Suscribirme al año" : "Suscribirme"}
                  highlight={p.code === "YEARLY"}
                />
              </Reveal>
            ))}
          </div>
        )}

        <section className="mt-20 grid gap-12 md:grid-cols-2" aria-labelledby="beneficios">
          <Reveal>
            <h2 id="beneficios" className="font-display text-3xl">
              Qué incluye
            </h2>
            <ul className="mt-6 flex flex-col gap-4">
              {m.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[17px]">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl">Preguntas frecuentes</h2>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {m.faq.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                    {f.q}
                    <span className="text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>
      </Container>
    </main>
  );
}
