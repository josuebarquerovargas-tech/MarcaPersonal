import { Reveal } from "@/components/ui/Reveal";

/** "Estamos para servirte": who the services are for, as listed in Rubén's advertising. */
export function Audience({ items }: { items: { label: string; value: string }[] }) {
  return (
    <Reveal delay={0.1} className="raised-card p-6 sm:p-8">
      <h3 className="font-display text-2xl">Estamos para servirte</h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((f) => (
          <li key={f.label} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-brand-ink">
              <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-[15px]">
              {f.label}
              {f.value && <span className="mt-0.5 block text-sm text-muted">{f.value}</span>}
            </span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
