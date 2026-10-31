import Image from "next/image";

/** Horizontal brand mark for personal growth: gold bars rising into an upward arrow. */
export function BrandLogo({ className = "" }: { className?: string }) {
  return <Image src="/images/logo.webp" alt="" width={480} height={305} priority className={className} />;
}
