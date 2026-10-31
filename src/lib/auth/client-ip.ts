export type ClientIpInput = {
  forwardedFor: string | null;
  realIp: string | null;
  trustProxy: boolean;
};

/**
 * Resolves the IP used for login rate limiting. Proxy headers are trusted
 * only when TRUST_PROXY=true; otherwise every request shares the "direct"
 * bucket, which is coarse but cannot be bypassed by forging headers.
 */
export function resolveClientIp({ forwardedFor, realIp, trustProxy }: ClientIpInput): string {
  if (!trustProxy) return "direct";
  const first = forwardedFor?.split(",")[0]?.trim();
  if (first) return first;
  const real = realIp?.trim();
  return real || "direct";
}
