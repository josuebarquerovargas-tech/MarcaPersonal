import { LinkButton } from "@/components/ui/Button";

/** Stands in for an exclusive article's text, which never reaches a visitor without membership. */
export function LockedPost({ title, signedIn, slug }: { title: string; signedIn: boolean; slug: string }) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-[16px] border border-accent/40 bg-accent/5 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </span>
      <div>
        <p className="font-display text-2xl sm:text-3xl">Artículo exclusivo para miembros</p>
        <p className="mt-2 text-muted">
          {signedIn ? `Activa tu membresía para leer “${title}”.` : `Únete para leer “${title}” y todo el contenido exclusivo.`}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <LinkButton href="/contenido#membresia">Hazte miembro</LinkButton>
        {!signedIn && (
          <LinkButton href={`/ingresar?next=/blog/${slug}`} variant="secondary">
            Ingresar
          </LinkButton>
        )}
      </div>
    </div>
  );
}
