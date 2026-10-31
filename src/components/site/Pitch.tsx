import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";

type Props = { text: string; author: string; whatsapp: string };

/** Rubén's own pitch, in his own voice. Editable from the panel. */
export function Pitch({ text, author, whatsapp }: Props) {
  return (
    <section className="py-20 sm:py-28" aria-label="Mensaje de Rubén">
      <Container>
        <Reveal className="mx-auto max-w-4xl">
          <figure className="border-l-4 border-brand pl-6 sm:pl-10">
            <blockquote className="font-display text-3xl leading-[1.2] sm:text-5xl">{text}</blockquote>
            <figcaption className="mt-6 text-sm uppercase tracking-[0.2em] text-muted">{author}</figcaption>
          </figure>
          <div className="mt-10 flex flex-wrap gap-3 pl-7 sm:pl-11">
            <LinkButton href="/contacto#cotizacion" size="lg">
              Contactar a Rubén
            </LinkButton>
            <LinkButton href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} variant="secondary" size="lg" external>
              Hablar por WhatsApp
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
