import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { formTokens } from "@/server/security";
import { getServiceBySlug, SERVICES } from "@/lib/services/catalog";
import { isQuotePlan, QUOTE_PLAN_IDS } from "@/lib/quotes/plans";
import { ContactSection } from "@/components/site/ContactSection";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Contacto", description: "Solicita una cotización o habla por WhatsApp con Rubén Rodríguez." };
export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  const [contact, social, services, formToken] = await Promise.all([getContent("contact"), getContent("social"), getContent("services"), formTokens.issueFormToken()]);
  const initial = servicio && (getServiceBySlug(servicio) || isQuotePlan(servicio)) ? servicio : SERVICES[0].slug;
  const plans = services.plans.map((p, i) => ({ id: QUOTE_PLAN_IDS[i], name: p.name }));

  return (
    <main>
      <ContactSection {...contact} social={social} standalone />
      <Container className="pb-16">
        <section id="cotizacion" aria-labelledby="cotizacion-title" className="mx-auto max-w-2xl scroll-mt-24">
          <h2 id="cotizacion-title" className="font-display text-3xl sm:text-4xl">
            Solicitar cotización
          </h2>
          <div className="mt-6">
            <QuoteForm formToken={formToken} initialService={initial} plans={plans} />
          </div>
        </section>
      </Container>
    </main>
  );
}
