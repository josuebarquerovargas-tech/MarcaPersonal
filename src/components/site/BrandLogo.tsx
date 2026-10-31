/** Brand mark for personal growth: a figure rising over two upward steps. */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`rounded-[11px] ${className}`} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="var(--ink)" />
      <g className="logo-rise" fill="none" stroke="var(--bg)" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="9.5" r="4" fill="var(--brand)" stroke="none" />
        <path d="M9.5 25 20 18l10.5 7" strokeWidth="3.6" />
        <path d="M9.5 33 20 26l10.5 7" strokeWidth="3.6" opacity="0.55" />
      </g>
    </svg>
  );
}
