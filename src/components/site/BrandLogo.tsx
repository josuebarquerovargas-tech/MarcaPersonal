/** Horizontal brand mark for personal growth: a line that rises into an upward arrow. */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 88 40" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4.5" aria-hidden="true">
      <g className="logo-rise">
        <path d="M4 34 24 19l18 10" stroke="var(--ink)" />
        <path d="M42 29 80 6" stroke="var(--accent)" />
        <path d="M64 5 80 6 73.5 20.5" stroke="var(--accent)" />
      </g>
    </svg>
  );
}
