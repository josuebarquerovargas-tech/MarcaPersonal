"use client";

import { useState } from "react";
import { QUOTE_PLAN_IDS } from "@/lib/quotes/plans";
import { buttonClasses } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { QuoteForm } from "./QuoteForm";

type Plan = { name: string; includes: string };

/** Service plans priced by quote. Choosing one fills the form right below, on the same page. */
export function PlanQuotes({ plans, formToken }: { plans: Plan[]; formToken: string }) {
  const [service, setService] = useState<string>(QUOTE_PLAN_IDS[0]);
  const options = plans.map((p, i) => ({ id: QUOTE_PLAN_IDS[i], name: p.name }));

  function choose(id: string) {
    setService(id);
    // After the browser follows the link, so the jump to the form does not drop the focus.
    requestAnimationFrame(() => document.getElementById("q-name")?.focus({ preventScroll: true }));
  }

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
              <a
                href="#cotizar"
                onClick={() => choose(QUOTE_PLAN_IDS[i])}
                className={`${buttonClasses("primary", "md", "w-full")} mt-8`}
              >
                Solicitar cotización<span className="sr-only"> del {plan.name}</span>
              </a>
            </div>
          </Reveal>
        ))}
      </ul>

      <section id="cotizar" aria-labelledby="cotizar-title" className="mx-auto mt-16 max-w-2xl scroll-mt-24">
        <h2 id="cotizar-title" className="font-display text-3xl sm:text-4xl">
          Solicita tu cotización
        </h2>
        <p className="mt-2 text-muted">Sin crear una cuenta. Te contactamos y nos adaptamos a tu presupuesto.</p>
        <div className="mt-6">
          <QuoteForm formToken={formToken} initialService={QUOTE_PLAN_IDS[0]} plans={options} service={service} onServiceChange={setService} />
        </div>
      </section>
    </>
  );
}
