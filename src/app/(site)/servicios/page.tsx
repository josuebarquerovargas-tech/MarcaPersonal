import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { Process } from "@/components/site/Process";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Servicios",
  description: "Sitios web, redes sociales, contenido, herramientas tecnológicas y asesoría para hacer crecer tu marca.",
};
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, process] = await Promise.all([getContent("services"), getContent("process")]);
  return (
    <main>
      <ServicesGrid {...services} standalone />
      <Process {...process} />
      <Container className="py-16 text-center">
        <LinkButton href="/contacto#cotizacion" size="lg">
          Solicitar cotización
        </LinkButton>
      </Container>
    </main>
  );
}
