import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/site/SectionHeading";

export const metadata: Metadata = { title: "Membresía" };

export default async function MembershipPage() {
  const m = await getContent("membership");
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="Membresía" title={m.title} text={m.text} />
        <p className="mt-10 text-muted">Los planes se mostrarán aquí.</p>
      </Container>
    </main>
  );
}
