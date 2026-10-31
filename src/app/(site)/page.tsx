import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { getContent } from "@/server/content";

export default async function Home() {
  const hero = await getContent("hero");
  return (
    <main className="py-16">
      <Container>
        <Reveal className="mt-16 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">{hero.eyebrow}</p>
          <h1 className="font-display mt-4 text-6xl leading-[1.02] sm:text-8xl">{hero.title}</h1>
          <p className="mt-6 text-lg text-muted">{hero.subtitle}</p>
          <div className="mt-8 flex gap-3">
            <LinkButton href="/videos">{hero.ctaPrimary}</LinkButton>
            <LinkButton href="/membresia" variant="secondary">
              {hero.ctaSecondary}
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
