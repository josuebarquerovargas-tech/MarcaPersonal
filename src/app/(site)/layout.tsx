import type { ReactNode } from "react";
import { getMember } from "@/server/auth";
import { getContent } from "@/server/content";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [member, hero, social] = await Promise.all([
    getMember(),
    getContent("hero"),
    getContent("social"),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <div aria-hidden="true" data-scroll-progress className="scroll-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-accent" />
      <Nav brand={hero.title} memberName={member?.name ?? null} />
      <div className="flex-1">{children}</div>
      <Footer brand={hero.title} social={social} />
    </div>
  );
}
