import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${align === "center" ? "text-center md:flex-col md:items-center" : ""}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
        <h2 className="font-display mt-2 text-4xl leading-[1.05] sm:text-5xl">{title}</h2>
        {text && <p className="mt-3 text-lg text-muted">{text}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
