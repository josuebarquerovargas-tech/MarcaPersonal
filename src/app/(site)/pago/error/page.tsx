import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { requireMembershipEnabled } from "@/server/features";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Pago no aprobado", robots: { index: false } };

export default async function CheckoutErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string; plan?: string }>;
}) {
  await requireMembershipEnabled();
  const { motivo, plan } = await searchParams;
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
          <h1 className="font-display mt-6 text-5xl sm:text-6xl">No pudimos procesar el pago</h1>
          <p className="mt-4 text-lg text-muted">{motivo || "La transacción no fue aprobada."}</p>
          <p className="mt-2 text-sm text-muted">No se hizo ningún cargo. Podés intentar con otro método.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href={`/pago?plan=${plan === "YEARLY" ? "YEARLY" : "MONTHLY"}`}>Intentar de nuevo</LinkButton>
            <LinkButton href="/cuenta" variant="secondary">
              Mi cuenta
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
