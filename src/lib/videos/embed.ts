export type EmbedPlatform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE";

export type ParsedEmbed = {
  platform: EmbedPlatform;
  externalId: string;
  embedUrl: string;
};

const YT_ID = /^[A-Za-z0-9_-]{6,20}$/;

export function parseEmbedUrl(input: string): ParsedEmbed | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") id = parts[1] ?? null;
    if (!id || !YT_ID.test(id)) return null;
    return {
      platform: "YOUTUBE",
      externalId: id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  }

  if (host === "tiktok.com") {
    const i = parts.indexOf("video");
    const id = i >= 0 ? parts[i + 1] : null;
    if (!id || !/^\d{6,25}$/.test(id)) return null;
    return {
      platform: "TIKTOK",
      externalId: id,
      embedUrl: `https://www.tiktok.com/player/v1/${id}`,
    };
  }

  if (host === "instagram.com") {
    const kind = parts[0];
    const code = parts[1];
    if ((kind !== "reel" && kind !== "p" && kind !== "reels") || !code) return null;
    if (!/^[A-Za-z0-9_-]{5,20}$/.test(code)) return null;
    const k = kind === "reels" ? "reel" : kind;
    return {
      platform: "INSTAGRAM",
      externalId: code,
      embedUrl: `https://www.instagram.com/${k}/${code}/embed`,
    };
  }

  return null;
}

export const PLATFORM_LABEL: Record<EmbedPlatform, string> = {
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
};
