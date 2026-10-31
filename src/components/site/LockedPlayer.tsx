import { LinkButton } from "@/components/ui/Button";

type Props = { poster?: string | null; title: string; signedIn: boolean; slug: string };

export function LockedPlayer({ poster, title, signedIn, slug }: Props) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-surface-2">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          className="size-full scale-105 object-cover opacity-80 blur-[12px]"
        />
      ) : (
        <div className="size-full bg-[radial-gradient(circle_at_30%_30%,color-mix(in_oklab,var(--accent)_35%,transparent),transparent_60%)]" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/40 px-6 text-center backdrop-blur-sm">
        <span className="flex size-14 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-soft">
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <div>
          <p className="font-display text-2xl sm:text-3xl">Contenido exclusivo para miembros</p>
          <p className="mt-1 text-sm text-muted">
            {signedIn ? `Activa tu membresía para ver “${title}”.` : `Únete para ver “${title}” y todo el contenido exclusivo.`}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <LinkButton href="/membresia">Hazte miembro</LinkButton>
          {!signedIn && (
            <LinkButton href={`/ingresar?next=/videos/${slug}`} variant="secondary">
              Ingresar
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
