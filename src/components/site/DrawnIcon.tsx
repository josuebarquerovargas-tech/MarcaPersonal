"use client";

import { useEffect, useRef, type ReactNode } from "react";

const L = (props: React.SVGProps<SVGPathElement>) => <path pathLength={1} {...props} />;
const C = (props: React.SVGProps<SVGCircleElement>) => <circle pathLength={1} {...props} />;
const R = (props: React.SVGProps<SVGRectElement>) => <rect pathLength={1} {...props} />;

const ICONS: Record<string, ReactNode> = {
  web: (
    <>
      <R x={3} y={4} width={18} height={16} rx={2} />
      <L d="M3 9h18" />
      <L d="M7 6.5h.01M10 6.5h.01" />
      <L d="M8 14h8M8 17h5" />
    </>
  ),
  social: (
    <>
      <C cx={18} cy={5} r={3} />
      <C cx={6} cy={12} r={3} />
      <C cx={18} cy={19} r={3} />
      <L d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
  video: (
    <>
      <R x={2} y={6} width={14} height={12} rx={2} />
      <L d="M22 8l-6 4 6 4V8z" />
    </>
  ),
  tools: (
    <>
      <L d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </>
  ),
  chat: (
    <>
      <L d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <L d="M8 8h8M8 12h5" />
    </>
  ),
  search: (
    <>
      <C cx={11} cy={11} r={8} />
      <L d="M21 21l-4.3-4.3" />
    </>
  ),
  target: (
    <>
      <C cx={12} cy={12} r={10} />
      <C cx={12} cy={12} r={6} />
      <C cx={12} cy={12} r={2} />
    </>
  ),
  megaphone: (
    <>
      <L d="M3 11v3l15 5V6L3 11z" />
      <L d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      <L d="M21 10v5" />
    </>
  ),
  chart: (
    <>
      <L d="M3 3v18h18" />
      <L d="M8 16v-5M13 16V8M18 16v-3" />
    </>
  ),
  shield: (
    <>
      <L d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <L d="M9 12l2 2 4-4" />
    </>
  ),
};

/**
 * Line icon that draws itself stroke by stroke when it enters the viewport and
 * again on card hover. Fully visible without JavaScript or with reduced motion,
 * because the hidden state only exists inside the animation.
 */
export function DrawnIcon({ name }: { name: keyof typeof ICONS }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-drawing");
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span className="icon-frame">
      <svg ref={ref} viewBox="0 0 24 24" className="drawn-icon size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[name]}
      </svg>
    </span>
  );
}
