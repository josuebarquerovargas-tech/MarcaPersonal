type Cell = string | number | null | undefined;

function escape(v: Cell): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serializes rows (same keys) as RFC 4180 CSV with CRLF line endings. */
export function toCsv(rows: Record<string, Cell>[]): string {
  if (rows.length === 0) return "\r\n";
  const keys = Object.keys(rows[0]);
  const lines = [keys.join(","), ...rows.map((r) => keys.map((k) => escape(r[k])).join(","))];
  return lines.join("\r\n") + "\r\n";
}
