type Social = { tiktok: string; instagram: string; youtube: string; facebook: string };

const icons = {
  tiktok: (
    <path d="M16.5 3c.3 2.2 1.6 3.6 3.8 3.8v3.1c-1.4 0-2.7-.4-3.8-1.2v5.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.2a2.5 2.5 0 1 0 1.6 2.3V3h3.1Z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" />
    </>
  ),
  youtube: (
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  ),
  facebook: (
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.6v7h2.9Z" />
  ),
};

/** Each network's own color, with a white icon, the same in light and dark themes. */
const brand = {
  tiktok: "bg-black ring-1 ring-white/20",
  instagram: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285aeb_90%)]",
  youtube: "bg-[#ff0000]",
  facebook: "bg-[#1877f2]",
};

const labels = { tiktok: "TikTok", instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };

export function SocialLinks({ social, className = "" }: { social: Social; className?: string }) {
  const entries = (Object.keys(icons) as (keyof typeof icons)[]).filter((k) => social[k]);
  return (
    <ul className={`flex items-center gap-2 ${className}`} aria-label="Redes sociales">
      {entries.map((k) => (
        <li key={k}>
          <a
            href={social[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labels[k]}
            title={labels[k]}
            className={`inline-flex size-10 items-center justify-center rounded-full text-white transition-transform duration-200 hover:scale-110 active:scale-95 ${brand[k]}`}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
              {icons[k]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
