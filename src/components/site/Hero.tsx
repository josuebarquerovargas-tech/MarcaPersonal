import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { SocialLinks } from "./SocialLinks";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  portraitUrl: string | null;
  social: { tiktok: string; instagram: string; youtube: string; facebook: string; tiktokFollowers: string; instagramFollowers: string };
};

const step = (i: number) => ({ "--i": i } as React.CSSProperties);

export function Hero({ eyebrow, title, subtitle, ctaPrimary, ctaSecondary, portraitUrl, social }: Props) {
  const [first, ...rest] = title.split(" ");
  const followers = [
    social.tiktokFollowers && { label: "TikTok", value: social.tiktokFollowers, href: social.tiktok },
    social.instagramFollowers && { label: "Instagram", value: social.instagramFollowers, href: social.instagram },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pt-14 pb-20 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-28">
        <div className="relative z-10">
          <p className="hero-in text-xs uppercase tracking-[0.25em] text-accent sm:text-sm" style={step(0)}>
            {eyebrow}
          </p>
          <h1
            id="hero-title"
            className="font-display mt-5 text-[clamp(44px,9vw,112px)] leading-[0.95] tracking-[-0.02em]"
          >
            <span className="hero-line">
              <span className="hero-line-inner" style={step(1)}>
                {first}
              </span>
            </span>{" "}
            {rest.length > 0 && (
              <span className="hero-line">
                <span className="hero-line-inner text-ink/80" style={step(2)}>
                  {rest.join(" ")}
                </span>
              </span>
            )}
          </h1>
          <p className="hero-in mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl" style={step(2)}>
            {subtitle}
          </p>
          <div className="hero-in mt-9 flex flex-wrap gap-3" style={step(3)}>
            <Link href="/videos" className={buttonClasses("primary", "lg")}>
              {ctaPrimary}
            </Link>
            <Link href="/membresia" className={buttonClasses("secondary", "lg")}>
              {ctaSecondary}
            </Link>
          </div>
          <div className="hero-in mt-12 flex flex-wrap items-center gap-x-8 gap-y-4" style={step(4)}>
            <SocialLinks social={social} />
            {followers.map((f) => (
              <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="group">
                <span className="font-display block text-2xl leading-none group-hover:text-accent">{f.value}</span>
                <span className="text-xs uppercase tracking-wider text-muted">en {f.label}</span>
              </a>
            ))}
          </div>
          <a
            href="#videos"
            className="hero-in group mt-12 hidden items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:text-ink lg:inline-flex"
            style={step(5)}
          >
            <span aria-hidden="true" className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue-line absolute inset-0 block bg-accent" />
            </span>
            Seguí bajando
          </a>
        </div>

        <div className="hero-portrait-in relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-surface-2 shadow-soft">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portraitUrl} alt={title} className="size-full object-cover" fetchPriority="high" />
            ) : (
              <Monogram initials={title.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
            )}
          </div>
          <div aria-hidden="true" className="breathe absolute -right-6 -top-6 -z-10 size-40 rounded-full bg-accent/20 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

function Monogram({ initials }: { initials: string }) {
  return (
    <div className="relative flex size-full items-center justify-center">
      <svg viewBox="0 0 400 500" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id="hero-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path className="drift-b" d="M60 420 C 40 300, 120 220, 200 240 S 360 330, 340 420 Z" fill="url(#hero-grad)" />
        <circle className="drift-a" cx="290" cy="130" r="70" fill="var(--accent)" opacity="0.18" />
        <path d="M40 80 Q 200 20 360 90" stroke="var(--line)" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="font-display relative text-[clamp(96px,22vw,180px)] leading-none tracking-[-0.06em] text-ink/85">{initials}</span>
    </div>
  );
}
