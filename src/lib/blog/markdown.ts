/**
 * Small Markdown subset for blog posts. It produces plain data that React
 * renders as elements, so raw HTML in a post is always shown as text.
 */
export type Inline =
  | { t: "text"; v: string }
  | { t: "strong"; v: string }
  | { t: "em"; v: string }
  | { t: "link"; v: string; href: string };

export type Block =
  | { t: "p" | "h2" | "h3" | "quote"; c: Inline[] }
  | { t: "ul" | "ol"; items: Inline[][] };

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((\S+?\)?)\)/g;

export function safeHref(href: string): string | null {
  if (/^(https?:\/\/|mailto:)/i.test(href)) return href;
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;
  return null;
}

function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const pushText = (v: string) => {
    if (!v) return;
    const last = out[out.length - 1];
    if (last?.t === "text") last.v += v;
    else out.push({ t: "text", v });
  };
  let at = 0;
  for (const m of text.matchAll(INLINE)) {
    pushText(text.slice(at, m.index));
    at = m.index + m[0].length;
    if (m[1] !== undefined) out.push({ t: "strong", v: m[1] });
    else if (m[2] !== undefined) out.push({ t: "em", v: m[2] });
    else {
      const href = safeHref(m[4]);
      if (href) out.push({ t: "link", v: m[3], href });
      else pushText(m[3]);
    }
  }
  pushText(text.slice(at));
  return out;
}

const UL = /^[-*]\s+/;
const OL = /^\d+\.\s+/;

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const first = lines[0];
    if (lines.every((l) => UL.test(l))) {
      blocks.push({ t: "ul", items: lines.map((l) => parseInline(l.replace(UL, ""))) });
    } else if (lines.every((l) => OL.test(l))) {
      blocks.push({ t: "ol", items: lines.map((l) => parseInline(l.replace(OL, ""))) });
    } else if (lines.every((l) => l.startsWith(">"))) {
      blocks.push({ t: "quote", c: parseInline(lines.map((l) => l.replace(/^>\s?/, "")).join(" ")) });
    } else if (first.startsWith("### ")) {
      blocks.push({ t: "h3", c: parseInline(lines.join(" ").slice(4)) });
    } else if (first.startsWith("## ")) {
      blocks.push({ t: "h2", c: parseInline(lines.join(" ").slice(3)) });
    } else {
      blocks.push({ t: "p", c: parseInline(lines.join(" ")) });
    }
  }
  return blocks;
}

export function readingMinutes(text: string): number {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}
