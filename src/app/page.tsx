import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="py-16">
      <Container>
        <div className="flex items-center justify-between">
          <span className="font-display text-xl">Rubén Rodríguez</span>
          <ThemeToggle />
        </div>
        <Reveal className="mt-24 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">El mae de los perros</p>
          <h1 className="font-display mt-4 text-6xl leading-[1.02] sm:text-8xl">Rubén Rodríguez</h1>
          <p className="mt-6 text-lg text-muted">
            Defensor del bienestar animal, juez internacional canino y creador de contenido en
            Costa Rica.
          </p>
          <div className="mt-8 flex gap-3">
            <LinkButton href="/videos">Ver videos</LinkButton>
            <LinkButton href="/membresia" variant="secondary">
              Hazte miembro
            </LinkButton>
          </div>
        </Reveal>
      </Container>
    </main>
  );
}
