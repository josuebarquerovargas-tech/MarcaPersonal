import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/server/content";
import { getServiceBySlug, SERVICES } from "@/lib/services/catalog";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const service = getServiceBySlug((await params).slug);
  if (!service) return { title: "Servicio no encontrado" };
  return { title: service.title, description: service.summary };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const [content, contact] = await Promise.all([getContent("services"), getContent("contact")]);
  const copy = content.items[SERVICES.indexOf(service)] ?? { title: service.title, text: service.summary };
  const wa = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`;

  return (
    <main className="py-10 sm:py-16">
      <Container>
        <Reveal className="mx-auto max-w-3xl">
          <Link href="/servicios" className="text-sm text-muted underline-offset-4 hover:underline">
            ← Todos los servicios
          </Link>
          <h1 className="font-display mt-6 text-5xl leading-[1.05] sm:text-6xl">{copy.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-muted">{copy.text}</p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2">
            <section>
              <h2 className="font-display text-2xl">Qué incluye</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <div className="flex flex-col gap-10">
              <section>
                <h2 className="font-display text-2xl">Para quién es</h2>
                <p className="mt-4 leading-relaxed text-muted">{service.forWhom}</p>
              </section>
              <section>
                <h2 className="font-display text-2xl">Cómo funciona</h2>
                <p className="mt-4 leading-relaxed text-muted">{service.howItWorks}</p>
              </section>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
            <LinkButton href={`/contacto?servicio=${service.slug}#cotizacion`} size="lg">
              Solicitar cotización
            </LinkButton>
            <LinkButton href={wa} variant="secondary" size="lg" external>
              Hablar por WhatsApp
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
