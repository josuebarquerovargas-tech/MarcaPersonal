"use client";

import { useEffect, useState } from "react";
import { resolveTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function readCurrent(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {}
  return resolveTheme(stored, window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(readCurrent());
  }, []);

  function toggle() {
    const next: Theme = (theme ?? readCurrent()) === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  }

  const isDark = theme === "dark";
  const label = theme === null ? "Cambiar tema" : isDark ? "Usar tema claro" : "Usar tema oscuro";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-theme-toggle
      className={`inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      <span className="relative block size-5" aria-hidden="true">
        {/* Sol */}
        <svg
          viewBox="0 0 24 24"
          className={`absolute inset-0 size-5 transition-all duration-300 ${isDark ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        {/* Luna */}
        <svg
          viewBox="0 0 24 24"
          className={`absolute inset-0 size-5 transition-all duration-300 ${isDark ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </span>
    </button>
  );
}
