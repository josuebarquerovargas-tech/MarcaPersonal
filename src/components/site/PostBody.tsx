import { parseMarkdown, type Inline } from "@/lib/blog/markdown";

function Inlines({ items }: { items: Inline[] }) {
  return (
    <>
      {items.map((n, i) => {
        if (n.t === "strong") return <strong key={i} className="font-semibold text-ink">{n.v}</strong>;
        if (n.t === "em") return <em key={i}>{n.v}</em>;
        if (n.t === "link") {
          const external = /^https?:/i.test(n.href);
          return (
            <a
              key={i}
              href={n.href}
              className="text-accent underline underline-offset-4"
              {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
            >
              {n.v}
            </a>
          );
        }
        return <span key={i}>{n.v}</span>;
      })}
    </>
  );
}

export function PostBody({ source }: { source: string }) {
  return (
    <div className="flex flex-col gap-6 text-lg leading-relaxed text-ink/85">
      {parseMarkdown(source).map((b, i) => {
        switch (b.t) {
          case "h2":
            return <h2 key={i} className="font-display mt-6 text-3xl leading-tight text-ink sm:text-4xl"><Inlines items={b.c} /></h2>;
          case "h3":
            return <h3 key={i} className="font-display mt-2 text-2xl leading-tight text-ink"><Inlines items={b.c} /></h3>;
          case "quote":
            return <blockquote key={i} className="font-display border-l-2 border-accent pl-6 text-2xl leading-snug text-ink"><Inlines items={b.c} /></blockquote>;
          case "ul":
            return <ul key={i} className="flex list-disc flex-col gap-2 pl-6 marker:text-accent">{b.items.map((it, j) => <li key={j}><Inlines items={it} /></li>)}</ul>;
          case "ol":
            return <ol key={i} className="flex list-decimal flex-col gap-2 pl-6 marker:text-accent">{b.items.map((it, j) => <li key={j}><Inlines items={it} /></li>)}</ol>;
          default:
            return <p key={i}><Inlines items={b.c} /></p>;
        }
      })}
    </div>
  );
}
