import Link from "next/link";
import type { Plan } from "@prisma/client";
import type { Content } from "@/lib/content/keys";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";
import { PlanCard } from "./PlanCard";

type Props = {
  content: Content["membership"];
  plans: Plan[];
  signedIn: boolean;
  isMember: boolean;
};

/** Subscription to the exclusive content: part of the content page, not a page of its own. */
export function MembershipSection({ content, plans, signedIn, isMember }: Props) {
  const monthly = plans.find((p) => p.code === "MONTHLY");
  const planHref = (code: string) => {
    const target = `/pago?plan=${code}`;
    return signedIn ? target : `/registro?next=${encodeURIComponent(target)}`;
  };

  return (
    <section id="membresia" aria-label="Contenido exclusivo" className="mt-24 scroll-mt-24">
      <SectionHeading eyebrow="Contenido exclusivo" title={content.title} text={content.text} />

      {isMember ? (
        <Reveal className="mt-10 rounded-[16px] border border-accent/40 bg-accent/5 p-6">
          <p className="font-display text-2xl">Ya eres miembro</p>
          <p className="mt-2 text-muted">
            Gracias por apoyar. Administra tu membresía desde{" "}
            <Link href="/cuenta" className="text-ink underline underline-offset-4">
              tu cuenta
            </Link>
            .
          </p>
        </Reveal>
      ) : (
        <>
          <p className="mt-10 text-sm text-muted">Precios de ejemplo para esta demostración.</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
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
        </>
      )}

      <div className="mt-20 grid gap-12 md:grid-cols-2">
        <Reveal>
          <h3 className="font-display text-3xl">Qué incluye</h3>
          <ul className="mt-6 flex flex-col gap-4">
            {content.benefits.map((b) => (
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
          <h3 className="font-display text-3xl">Preguntas frecuentes</h3>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {content.faq.map((f) => (
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
      </div>
    </section>
  );
}
