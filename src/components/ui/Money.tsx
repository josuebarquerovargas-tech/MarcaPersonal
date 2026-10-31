import { formatCRC } from "@/lib/membership/subscription";

/** Renders an amount in colones with the ₡ glyph from the system font (see globals.css). */
export function Money({ amount, className = "" }: { amount: number; className?: string }) {
  const text = formatCRC(amount);
  return (
    <span className={className}>
      <span className="currency-symbol">₡</span>
      {text.slice(1)}
    </span>
  );
}
