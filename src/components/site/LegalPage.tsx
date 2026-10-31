import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <article className="mx-auto flex max-w-2xl flex-col gap-5 leading-relaxed text-ink/85 [&_h2]:font-display [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:text-ink">
          <h1 className="font-display text-4xl text-ink sm:text-5xl">{title}</h1>
          <p className="rounded-[10px] border border-dashed border-accent/50 bg-accent/5 px-4 py-3 text-sm">
            Borrador de demostración. Debe revisarlo Rubén Rodríguez con asesoría legal antes de publicar el sitio.
          </p>
          {children}
        </article>
      </Container>
    </main>
  );
}
