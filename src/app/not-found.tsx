import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-accent">Error 404</p>
      <h1 className="font-display mt-4 text-5xl sm:text-7xl">Esta página se escapó</h1>
      <p className="mt-4 max-w-md text-lg text-muted">No encontramos lo que buscabas. Quizás el enlace cambió o el video ya no está publicado.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses("primary")}>
          Ir a la portada
        </Link>
        <Link href="/videos" className={buttonClasses("secondary")}>
          Ver videos
        </Link>
      </div>
    </main>
  );
}
