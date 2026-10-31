import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "./SocialLinks";

type Props = {
  brand: string;
  social: { tiktok: string; instagram: string; youtube: string; facebook: string };
};

export function Footer({ brand, social }: Props) {
  return (
    <footer className="mt-24 border-t border-line">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl">{brand}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">Marca personal y soluciones digitales</p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <SocialLinks social={social} />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {brand}.{" "}
            <Link href="/privacidad" className="underline-offset-4 hover:underline">
              Privacidad
            </Link>{" "}
            ·{" "}
            <Link href="/terminos" className="underline-offset-4 hover:underline">
              Términos
            </Link>{" "}
            ·{" "}
            <Link href="/admin" className="underline-offset-4 hover:underline">
              Administrar
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
