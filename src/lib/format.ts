const dateFmt = new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "short", year: "numeric" });
const longDateFmt = new Intl.DateTimeFormat("es-CR", { day: "numeric", month: "long", year: "numeric" });

/** "12 oct 2026" */
export function formatDate(d: Date | string): string {
  return dateFmt.format(new Date(d)).replace(/\.$/, "").replace(" de ", " ");
}

/** "12 de octubre de 2026" */
export function formatLongDate(d: Date | string): string {
  return longDateFmt.format(new Date(d));
}

export function formatDuration(sec: number | null | undefined): string | null {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")} mil`;
  return String(n);
}
