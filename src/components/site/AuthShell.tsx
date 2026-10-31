import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

export function AuthShell({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children: ReactNode }) {
  return (
    <main className="py-14 sm:py-20">
      <Container>
        <div className="mx-auto max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl">{title}</h1>
          {text && <p className="mt-3 text-muted">{text}</p>}
          <div className="mt-8 rounded-[16px] border border-line bg-surface p-6 shadow-soft">{children}</div>
        </div>
      </Container>
    </main>
  );
}
