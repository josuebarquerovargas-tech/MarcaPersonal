"use client";

import { useEffect, useRef, type ReactNode } from "react";

const L = (props: React.SVGProps<SVGPathElement>) => <path pathLength={1} {...props} />;
const C = (props: React.SVGProps<SVGCircleElement>) => <circle pathLength={1} {...props} />;
const R = (props: React.SVGProps<SVGRectElement>) => <rect pathLength={1} {...props} />;

export type IllustrationName = "web" | "social" | "video" | "tools" | "chat";

const DRAWINGS: Record<IllustrationName, ReactNode> = {
  web: (
    <>
      <R x={30} y={10} width={100} height={64} rx={5} />
      <L d="M16 84h128l-14-10H30z" />
      <L d="M30 22h100" />
      <L d="M38 16h.01M45 16h.01M52 16h.01" />
      <R x={40} y={31} width={34} height={33} rx={3} />
      <L d="M40 56l10-9 8 7 6-5 10 8" />
      <L d="M84 34h36M84 44h36M84 54h22" />
    </>
  ),
  social: (
    <>
      <R x={60} y={6} width={40} height={88} rx={7} />
      <L d="M75 13h10" />
      <L d="M80 56c-8-5-11-9-11-14a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 5-3 9-11 14z" />
      <L d="M68 68h24M68 77h16" />
      <C cx={26} cy={30} r={15} />
      <L d="M23 22v16l13-8z" />
      <C cx={134} cy={28} r={15} />
      <L d="M137 20h-3a4 4 0 0 0-4 4v14M126 29h9" />
      <C cx={132} cy={74} r={13} />
      <L d="M136 68v9a4 4 0 1 1-4-4" />
      <L d="M41 34l19 8M119 33l-19 9M120 69l-20-7" />
    </>
  ),
  video: (
    <>
      <R x={18} y={34} width={84} height={52} rx={7} />
      <L d="M38 34l7-13h30l7 13" />
      <C cx={60} cy={60} r={17} />
      <C cx={60} cy={60} r={7} />
      <L d="M88 45h6" />
      <R x={114} y={14} width={34} height={26} rx={4} />
      <L d="M126 21v12l10-6z" />
      <L d="M116 86V72M128 86V62M140 86V52" />
    </>
  ),
  tools: (
    <>
      <R x={50} y={22} width={60} height={56} rx={7} />
      <R x={63} y={35} width={34} height={30} rx={4} />
      <L d="M71 58l6-15 6 15M73.5 53h7" />
      <L d="M89 43v15" />
      <L d="M65 22V10M80 22V10M95 22V10M65 90V78M80 90V78M95 90V78" />
      <L d="M50 38H34M50 62H34M110 38h16M110 62h16" />
      <C cx={28} cy={38} r={6} />
      <C cx={28} cy={62} r={6} />
      <C cx={132} cy={38} r={6} />
      <C cx={132} cy={62} r={6} />
    </>
  ),
  chat: (
    <>
      <C cx={78} cy={40} r={18} />
      <L d="M46 94c0-18 14-28 32-28s32 10 32 28" />
      <L d="M56 42a22 22 0 0 1 44 0" />
      <L d="M56 40v9M100 40v9" />
      <L d="M100 49c0 8-7 11-14 11" />
      <L d="M118 12h26a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5h-16l-8 8v-8h-2a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5z" />
      <L d="M122 22h18M122 29h11" />
      <C cx={26} cy={28} r={14} />
      <L d="M26 20v8l6 4" />
    </>
  ),
};

/** Service drawing that traces itself stroke by stroke when it enters the viewport. */
export function ServiceIllustration({ name }: { name: IllustrationName }) {
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
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`illustration-panel tone-${name}`}>
      <svg ref={ref} viewBox="0 0 160 100" className="drawn-icon drawn-illustration" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {DRAWINGS[name]}
      </svg>
    </div>
  );
}
