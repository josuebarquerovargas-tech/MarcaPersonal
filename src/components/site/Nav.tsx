"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";

const links = [
  { href: "/videos", label: "Videos" },
  { href: "/membresia", label: "Membresía" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/contacto", label: "Contacto" },
];

export function Nav({ brand, memberName }: { brand: string; memberName: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cta = memberName ? (
    <Link href="/cuenta" className={buttonClasses("secondary", "sm")}>
      Mi cuenta
    </Link>
  ) : (
    <Link href="/membresia" className={buttonClasses("primary", "sm")}>
      Hazte miembro
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="font-display text-xl tracking-tight" aria-label="Inicio">
          {brand}
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname.startsWith(l.href) ? "page" : undefined}
              className="text-[15px] text-muted transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden md:inline-flex">{cta}</span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-line md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span className={`absolute left-0 top-0 h-px w-4 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 top-3 h-px w-4 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-bg px-4 pt-6 pb-8 md:hidden ${open ? "flex" : "hidden"}`}
      >
        <nav aria-label="Principal móvil" className="flex flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display border-b border-line py-4 text-3xl"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">{cta}</div>
      </div>
    </header>
  );
}
