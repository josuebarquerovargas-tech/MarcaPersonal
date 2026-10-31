import type { Plan } from "@prisma/client";
import { Money } from "@/components/ui/Money";
import { LinkButton } from "@/components/ui/Button";

type Props = { plan: Plan; monthlyPrice?: number; href: string; cta: string; highlight?: boolean };

export function PlanCard({ plan, monthlyPrice, href, cta, highlight }: Props) {
  const yearly = plan.intervalMonths === 12;
  const saved = yearly && monthlyPrice ? Math.round((monthlyPrice * 12 - plan.priceCRC) / monthlyPrice) : 0;

  return (
    <div
      className={`relative flex flex-col rounded-[16px] border p-6 shadow-soft sm:p-8 ${
        highlight ? "border-accent bg-surface" : "border-line bg-surface"
      }`}
    >
      {highlight && saved > 0 && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-ink">
          Ahorras {saved} {saved === 1 ? "mes" : "meses"}
        </span>
      )}
      <p className="text-sm uppercase tracking-[0.15em] text-muted">{plan.name}</p>
      <p className="font-display mt-3 text-5xl"><Money amount={plan.priceCRC} /></p>
      <p className="mt-1 text-sm text-muted">{yearly ? "al año" : "al mes"} · cancelas cuando quieras</p>
      {yearly && monthlyPrice && (
        <p className="mt-1 text-sm text-muted">Equivale a <Money amount={Math.round(plan.priceCRC / 12)} /> al mes</p>
      )}
      <div className="mt-8">
        <LinkButton href={href} variant={highlight ? "primary" : "secondary"} className="w-full">
          {cta}
        </LinkButton>
      </div>
    </div>
  );
}
