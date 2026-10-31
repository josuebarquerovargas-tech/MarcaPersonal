import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SocialLinks } from "./SocialLinks";

type Props = {
  title: string;
  text: string;
  whatsapp: string;
  email: string;
  social: { tiktok: string; instagram: string; youtube: string; facebook: string };
  standalone?: boolean;
};

export function ContactSection({ title, text, whatsapp, email, social, standalone = false }: Props) {
  const wa = `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
  const Heading = standalone ? "h1" : "h2";
  return (
    <section id="contacto" className={standalone ? "py-12 sm:py-16" : "py-20 sm:py-28"} aria-labelledby="contact-title">
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Contacto</p>
          <Heading id="contact-title" className="font-display mt-3 text-5xl leading-[1.02] sm:text-7xl">
            {title}
          </Heading>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">{text}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <LinkButton href={wa} external size="lg">
              Escribir por WhatsApp
            </LinkButton>
            <LinkButton href={`mailto:${email}`} variant="secondary" size="lg" external>
              {email}
            </LinkButton>
          </div>
          <div className="mt-10 flex justify-center">
            <SocialLinks social={social} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
