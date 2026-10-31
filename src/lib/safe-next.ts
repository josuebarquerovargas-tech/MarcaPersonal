/**
 * Accepts only same-site relative paths for post-login redirects.
 * Rejects protocol-relative URLs (`//x`), backslash tricks (`/\x`, which
 * browsers normalize to `//x`), absolute URLs and anything not starting with "/".
 */
export function safeNext(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 2048) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.includes("\\")) return null;
  if (/^\/[^/?#]*:/.test(value)) return null;
  try {
    const base = "http://local.invalid";
    if (new URL(value, base).origin !== base) return null;
  } catch {
    return null;
  }
  return value;
}
