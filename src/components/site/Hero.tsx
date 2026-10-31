"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Hero({ eyebrow, title, subtitle, ctaPrimary, ctaSecondary, portraitUrl, social }: Props) {
  const reduce = useReducedMotion();
  const variants = reduce ? undefined : container;
  const child = reduce ? undefined : item;
  const [first, ...rest] = title.split(" ");

  const followers = [
    social.tiktokFollowers && { label: "TikTok", value: social.tiktokFollowers, href: social.tiktok },
    social.instagramFollowers && { label: "Instagram", value: social.instagramFollowers, href: social.instagram },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-4 pt-14 pb-20 sm:px-8 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:pb-28">
        <motion.div variants={variants} initial={reduce ? false : "hidden"} animate="show" className="relative z-10">
          <motion.p variants={child} className="text-xs uppercase tracking-[0.25em] text-accent sm:text-sm">
            {eyebrow}
          </motion.p>
          <motion.h1
            id="hero-title"
            variants={child}
            className="font-display mt-5 text-[clamp(44px,9vw,112px)] leading-[0.95] tracking-[-0.02em]"
          >
            {first}
            {rest.length > 0 && (
              <>
                <br />
                <span className="text-ink/80">{rest.join(" ")}</span>
              </>
            )}
          </motion.h1>
          <motion.p variants={child} className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            {subtitle}
          </motion.p>
          <motion.div variants={child} className="mt-9 flex flex-wrap gap-3">
            <Link href="/videos" className={buttonClasses("primary", "lg")}>
              {ctaPrimary}
            </Link>
            <Link href="/membresia" className={buttonClasses("secondary", "lg")}>
              {ctaSecondary}
            </Link>
          </motion.div>
          <motion.div variants={child} className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <SocialLinks social={social} />
            {followers.map((f) => (
              <a key={f.label} href={f.href} target="_blank" rel="noopener noreferrer" className="group">
                <span className="font-display block text-2xl leading-none group-hover:text-accent">{f.value}</span>
                <span className="text-xs uppercase tracking-wider text-muted">en {f.label}</span>
              </a>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-surface-2 shadow-soft">
            {portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={portraitUrl} alt={title} className="size-full object-cover" fetchPriority="high" />
            ) : (
              <Monogram initials={title.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
            )}
          </div>
          <div aria-hidden="true" className="absolute -right-6 -top-6 -z-10 size-40 rounded-full bg-accent/20 blur-3xl" />
        </motion.div>
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
        <path d="M60 420 C 40 300, 120 220, 200 240 S 360 330, 340 420 Z" fill="url(#hero-grad)" />
        <circle cx="290" cy="130" r="70" fill="var(--accent)" opacity="0.18" />
        <path d="M40 80 Q 200 20 360 90" stroke="var(--line)" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="font-display relative text-[clamp(96px,22vw,180px)] leading-none tracking-[-0.06em] text-ink/85">{initials}</span>
    </div>
  );
}
