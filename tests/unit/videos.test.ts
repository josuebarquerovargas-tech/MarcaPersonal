import { describe, expect, test } from "vitest";
import { slugify, uniqueSlug } from "@/lib/videos/slug";
import { parseEmbedUrl } from "@/lib/videos/embed";
import { canWatch } from "@/lib/videos/access";

describe("slugify", () => {
  test("quita tildes, signos y espacios", () => {
    expect(slugify("Rescate en Heredia: ¡Bruno!")).toBe("rescate-en-heredia-bruno");
  });
  test("recorta a 80 caracteres sin guion final", () => {
    const s = slugify("a ".repeat(100));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
  test("vacío devuelve 'video'", () => {
    expect(slugify("¡¡¡")).toBe("video");
  });
});

describe("uniqueSlug", () => {
  test("agrega sufijo incremental cuando existe", async () => {
    const taken = new Set(["x", "x-2"]);
    expect(await uniqueSlug("x", async (s) => taken.has(s))).toBe("x-3");
  });
  test("devuelve el base cuando está libre", async () => {
    expect(await uniqueSlug("libre", async () => false)).toBe("libre");
  });
});

describe("parseEmbedUrl", () => {
  test("YouTube watch", () => {
    expect(parseEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10")).toEqual({
      platform: "YOUTUBE",
      externalId: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    });
  });
  test("YouTube corto youtu.be", () => {
    expect(parseEmbedUrl("https://youtu.be/dQw4w9WgXcQ")?.externalId).toBe("dQw4w9WgXcQ");
  });
  test("YouTube shorts", () => {
    expect(parseEmbedUrl("https://youtube.com/shorts/abc123DEF_-")?.embedUrl).toBe(
      "https://www.youtube-nocookie.com/embed/abc123DEF_-",
    );
  });
  test("TikTok", () => {
    expect(parseEmbedUrl("https://www.tiktok.com/@rubenrodriguezoficialdog/video/7434961888640781624")).toEqual({
      platform: "TIKTOK",
      externalId: "7434961888640781624",
      embedUrl: "https://www.tiktok.com/embed/v2/7434961888640781624",
    });
  });
  test("Instagram reel y post", () => {
    expect(parseEmbedUrl("https://www.instagram.com/reel/C1a2B3c4D5e/?utm_source=ig")).toEqual({
      platform: "INSTAGRAM",
      externalId: "C1a2B3c4D5e",
      embedUrl: "https://www.instagram.com/reel/C1a2B3c4D5e/embed",
    });
    expect(parseEmbedUrl("https://instagram.com/p/C1a2B3c4D5e")?.embedUrl).toBe(
      "https://www.instagram.com/p/C1a2B3c4D5e/embed",
    );
  });
  test("otro dominio o basura devuelve null", () => {
    expect(parseEmbedUrl("https://vimeo.com/123")).toBeNull();
    expect(parseEmbedUrl("no es url")).toBeNull();
    expect(parseEmbedUrl("https://www.tiktok.com/@alguien")).toBeNull();
  });
});

describe("canWatch", () => {
  test("gratis siempre se ve", () => {
    expect(canWatch({ access: "FREE" }, { active: false })).toBe(true);
  });
  test("exclusivo requiere membresía activa", () => {
    expect(canWatch({ access: "MEMBERS" }, { active: false })).toBe(false);
    expect(canWatch({ access: "MEMBERS" }, { active: true })).toBe(true);
  });
});
