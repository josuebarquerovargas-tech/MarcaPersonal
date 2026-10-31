export type ByteRange = { start: number; end: number };

/**
 * Parses a single HTTP Range header against a resource of `size` bytes.
 * Returns null when there is no (usable) range, "invalid" when the range is
 * unsatisfiable (→ 416), or the inclusive byte range to serve.
 */
export function parseRange(header: string | null, size: number): ByteRange | "invalid" | null {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, startStr, endStr] = match;
  if (startStr === "" && endStr === "") return null;

  if (startStr === "") {
    // Suffix range: last N bytes.
    const suffix = Number(endStr);
    if (suffix <= 0) return "invalid";
    const start = Math.max(0, size - suffix);
    return { start, end: size - 1 };
  }

  const start = Number(startStr);
  const end = endStr === "" ? size - 1 : Math.min(Number(endStr), size - 1);
  if (start >= size || start > end) return "invalid";
  return { start, end };
}
