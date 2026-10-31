import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { requireMembershipEnabled } from "@/server/features";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Pago aprobado", robots: { index: false } };

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  await requireMembershipEnabled();
  const { ref } = await searchParams;
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent">
            <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h1 className="font-display mt-6 text-5xl sm:text-6xl">¡Ya eres miembro!</h1>
          <p className="mt-4 text-lg text-muted">
            Tu membresía quedó activa. Ya puedes ver todo el contenido exclusivo.
          </p>
          {ref && <p className="mt-2 text-sm text-muted">Referencia: <span className="tabular-nums">{ref}</span></p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/contenido?acceso=miembros">Ver contenido exclusivo</LinkButton>
            <LinkButton href="/cuenta" variant="secondary">
              Mi cuenta
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
