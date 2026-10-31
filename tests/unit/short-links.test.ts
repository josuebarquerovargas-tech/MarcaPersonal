import { describe, expect, test, vi } from "vitest";
import { isShortTikTokLink, resolveShortTikTokLink } from "@/lib/videos/embed";

const CANONICAL = "https://www.tiktok.com/@patriotico83/video/7702832461750816020";

function redirectingTo(location: string | null) {
  return vi.fn(async () => new Response(null, { status: 302, headers: location ? { location } : {} }));
}

describe("enlaces cortos de TikTok", () => {
  test("reconoce solo los dominios cortos de TikTok por https", () => {
    expect(isShortTikTokLink("https://vt.tiktok.com/ZSg3U44x4/")).toBe(true);
    expect(isShortTikTokLink("https://vm.tiktok.com/ZSg3U44x4/")).toBe(true);
    expect(isShortTikTokLink("http://vt.tiktok.com/ZSg3U44x4/")).toBe(false);
    expect(isShortTikTokLink("https://vt.tiktok.com.evil.example/a")).toBe(false);
    expect(isShortTikTokLink("https://www.tiktok.com/@a/video/123456")).toBe(false);
    expect(isShortTikTokLink("no es un enlace")).toBe(false);
  });

  test("devuelve el enlace completo, sin parámetros de rastreo", async () => {
    const fetcher = redirectingTo(`${CANONICAL}?_r=1&u_code=abc`);
    await expect(resolveShortTikTokLink("https://vt.tiktok.com/ZSg3U44x4/", fetcher)).resolves.toBe(CANONICAL);
    expect(fetcher).toHaveBeenCalledWith("https://vt.tiktok.com/ZSg3U44x4/", expect.objectContaining({ redirect: "manual" }));
  });

  test("nunca consulta un dominio que no sea corto de TikTok", async () => {
    const fetcher = redirectingTo(CANONICAL);
    await expect(resolveShortTikTokLink("http://169.254.169.254/latest", fetcher)).resolves.toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("rechaza una redirección que no lleve a un video de TikTok", async () => {
    await expect(resolveShortTikTokLink("https://vt.tiktok.com/a/", redirectingTo("https://evil.example/video/123456"))).resolves.toBeNull();
    await expect(resolveShortTikTokLink("https://vt.tiktok.com/a/", redirectingTo(null))).resolves.toBeNull();
  });

  test("si la red falla no lanza un error", async () => {
    const fetcher = vi.fn(async () => {
      throw new Error("sin red");
    });
    await expect(resolveShortTikTokLink("https://vt.tiktok.com/a/", fetcher)).resolves.toBeNull();
  });
});
