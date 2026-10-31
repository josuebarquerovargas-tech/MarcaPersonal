import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { formTokens } from "@/server/security";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { Process } from "@/components/site/Process";
import { PlanQuotes } from "@/components/site/PlanQuotes";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Planes con cotización directa: sitios web, redes sociales, contenido, herramientas tecnológicas y asesoría para hacer crecer tu marca.",
};
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, process, formToken] = await Promise.all([getContent("services"), getContent("process"), formTokens.issueFormToken()]);
  return (
    <main>
      <ServicesGrid {...services} standalone />
      <section id="planes" aria-label="Planes" className="scroll-mt-24 pb-16 sm:pb-24">
        <Container>
          <SectionHeading eyebrow="Planes" title={services.plansTitle} text={services.plansText} />
          <PlanQuotes plans={services.plans} formToken={formToken} />
        </Container>
      </section>
      <Process {...process} />
      <Container className="py-16 text-center">
        <LinkButton href="#cotizar" size="lg">
          Solicitar cotización
        </LinkButton>
      </Container>
    </main>
  );
}
