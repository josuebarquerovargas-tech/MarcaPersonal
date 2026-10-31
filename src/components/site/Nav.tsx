"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import { BrandLogo } from "./BrandLogo";


type NavProps = { brand: string; memberName: string | null };

export function Nav({ brand, memberName }: NavProps) {
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/servicios", label: "Servicios" },
    { href: "/contenido", label: "Contenido" },
    { href: "/sobre-mi", label: "Sobre Rubén" },
    { href: "/contacto", label: "Contacto" },
  ];
  const pathname = usePathname();
  // "/" prefixes every path, so the home link only counts on the home page itself.
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    // Articles keep their /blog address but belong to the content section.
    if (href === "/contenido" && pathname.startsWith("/blog")) return true;
    return pathname.startsWith(href);
  };
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
    <Link href="/contacto#cotizacion" className={buttonClasses("primary", "sm")}>
      Solicitar cotización
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
        <Link href="/" aria-label={brand} title={brand} className="logo-link flex size-11 items-center justify-center rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          <BrandLogo className="size-10" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className="relative text-[15px] text-muted transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform after:duration-200 after:ease-[var(--ease-out)] hover:text-ink hover:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100"
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
        className={`fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] flex-col overflow-y-auto bg-bg px-4 pt-6 pb-8 md:hidden ${open ? "flex" : "hidden"}`}
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
