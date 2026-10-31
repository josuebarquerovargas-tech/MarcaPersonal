"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminLogout } from "@/server/actions/admin-auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/miembros", label: "Miembros" },
  { href: "/admin/pagos", label: "Pagos" },
  { href: "/admin/contenido", label: "Contenido" },
  { href: "/admin/galeria", label: "Galería" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-0.5">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={`rounded-[8px] px-3 py-2 text-[15px] transition-colors ${
              active ? "bg-ink text-bg" : "text-muted hover:bg-surface hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between px-4 py-4 lg:px-5">
        <Link href="/admin" className="font-display text-lg">
          Rubén Rodríguez
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="rounded-[8px] border border-line px-3 py-2 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="admin-nav"
            onClick={() => setOpen((v) => !v)}
          >
            Menú
          </button>
        </div>
      </div>
      <div
        id="admin-nav"
        className={`${open ? "block" : "hidden"} px-3 pb-4 lg:flex lg:h-[calc(100dvh-72px)] lg:flex-col lg:justify-between lg:px-3`}
      >
        {nav}
        <div className="mt-4 border-t border-line pt-4">
          <p className="truncate px-3 text-xs text-muted" title={email}>
            {email}
          </p>
          <Link
            href="/"
            className="mt-1 block rounded-[8px] px-3 py-2 text-sm text-muted hover:text-ink"
          >
            Ver sitio ↗
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="w-full rounded-[8px] px-3 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-ink"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
