export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}

/**
 * Inline script injected in <head> before any CSS so the first paint already
 * carries the right theme (no flash). Must stay self-contained: no imports.
 */
export const THEME_INIT_SCRIPT = `(function(){
  var theme = null;
  try { theme = localStorage.getItem("${THEME_STORAGE_KEY}"); } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    var dark = false;
    try { dark = window.matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) {}
    theme = dark ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
})();`;
