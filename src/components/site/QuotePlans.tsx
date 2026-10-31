import { QUOTE_PLAN_IDS } from "@/lib/quotes/plans";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

type Plan = { name: string; includes: string };

/** Service plans priced by quote. Each one links to the contact form with the plan already chosen. */
export function QuotePlans({ plans }: { plans: Plan[] }) {
  return (
    <>
      <p className="mt-10 text-sm text-muted">Planes de ejemplo para esta demostración.</p>
      <ul className="mt-4 grid gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal as="li" key={QUOTE_PLAN_IDS[i]} delay={i * 0.08}>
            <div data-quote-plan={QUOTE_PLAN_IDS[i]} className="raised-card flex h-full flex-col p-6 sm:p-8">
              <h3 className="font-display text-3xl">{plan.name}</h3>
              <p className="mt-2 text-sm font-medium text-accent">Precio según cotización</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.includes
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line} className="flex items-start gap-3 text-[15px]">
                      <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink">
                        <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {line}
                    </li>
                  ))}
              </ul>
              <div className="mt-8">
                <LinkButton href={`/contacto?servicio=${QUOTE_PLAN_IDS[i]}#cotizacion`} className="w-full">
                  Solicitar cotización<span className="sr-only"> del {plan.name}</span>
                </LinkButton>
              </div>
            </div>
          </Reveal>
        ))}
      </ul>
    </>
  );
}
