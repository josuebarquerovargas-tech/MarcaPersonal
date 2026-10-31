import type { ContentKey } from "./keys";

export type FieldDef =
  | { name: string; label: string; kind: "text"; hint?: string }
  | { name: string; label: string; kind: "textarea"; hint?: string }
  | { name: string; label: string; kind: "lines"; hint?: string }
  | {
      name: string;
      label: string;
      kind: "pairs";
      keys: [string, string];
      labels: [string, string];
      fixed?: number;
      hint?: string;
    };

export const contentSections: { key: ContentKey; label: string }[] = [
  { key: "hero", label: "Portada" },
  { key: "about", label: "Sobre mí" },
  { key: "services", label: "Servicios" },
  { key: "process", label: "Proceso" },
  { key: "membership", label: "Membresía" },
  { key: "contact", label: "Contacto" },
  { key: "social", label: "Redes" },
  { key: "pitch", label: "Mensaje de Rubén" },
  { key: "seo", label: "SEO" },
];

export const contentFields: Record<ContentKey, FieldDef[]> = {
  hero: [
    { name: "eyebrow", label: "Línea superior", kind: "text" },
    { name: "title", label: "Título", kind: "text" },
    { name: "subtitle", label: "Subtítulo", kind: "textarea" },
    { name: "ctaPrimary", label: "Botón principal", kind: "text" },
    { name: "ctaSecondary", label: "Botón secundario", kind: "text" },
  ],
  about: [
    { name: "heading", label: "Encabezado", kind: "text" },
    { name: "paragraphs", label: "Párrafos", kind: "lines", hint: "Un párrafo por línea." },
    {
      name: "facts",
      label: "A quién servimos",
      kind: "pairs",
      keys: ["label", "value"],
      labels: ["Público", "Detalle (opcional)"],
    },
  ],
  services: [
    { name: "heading", label: "Encabezado", kind: "text" },
    { name: "intro", label: "Introducción", kind: "textarea" },
    { name: "items", label: "Servicios", kind: "pairs", keys: ["title", "text"], labels: ["Título", "Resumen"], fixed: 5 },
  ],
  process: [
    { name: "heading", label: "Encabezado", kind: "text" },
    { name: "intro", label: "Introducción", kind: "textarea" },
    { name: "items", label: "Pasos", kind: "pairs", keys: ["title", "text"], labels: ["Paso", "Texto"], fixed: 5 },
  ],
  membership: [
    { name: "title", label: "Título", kind: "text" },
    { name: "text", label: "Texto", kind: "textarea" },
    { name: "benefits", label: "Beneficios", kind: "lines", hint: "Un beneficio por línea." },
    {
      name: "faq",
      label: "Preguntas frecuentes",
      kind: "pairs",
      keys: ["q", "a"],
      labels: ["Pregunta", "Respuesta"],
    },
  ],
  contact: [
    { name: "title", label: "Título", kind: "text" },
    { name: "text", label: "Texto", kind: "textarea" },
    { name: "whatsapp", label: "WhatsApp", kind: "text", hint: "Con código de país, p. ej. +50670150301" },
    { name: "email", label: "Correo", kind: "text" },
  ],
  social: [
    { name: "tiktok", label: "TikTok (URL)", kind: "text" },
    { name: "instagram", label: "Instagram (URL)", kind: "text" },
    { name: "youtube", label: "YouTube (URL)", kind: "text" },
    { name: "facebook", label: "Facebook (URL)", kind: "text" },
    { name: "tiktokFollowers", label: "Seguidores en TikTok", kind: "text", hint: "Texto libre, p. ej. 250 mil" },
    { name: "instagramFollowers", label: "Seguidores en Instagram", kind: "text" },
  ],
  pitch: [
    { name: "text", label: "Mensaje", kind: "textarea", hint: "Se muestra en la portada, con sus palabras." },
    { name: "author", label: "Firma", kind: "text" },
  ],
  seo: [
    { name: "title", label: "Título de la página", kind: "text" },
    { name: "description", label: "Descripción", kind: "textarea" },
  ],
  portrait: [],
  features: [],
};

function str(fd: FormData, name: string): string {
  const v = fd.get(name);
  return typeof v === "string" ? v : "";
}

/** Converts submitted form data into the raw object for a content key (validated later by Zod). */
export function formDataToContent(key: ContentKey, fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of contentFields[key]) {
    if (f.kind === "text" || f.kind === "textarea") {
      out[f.name] = str(fd, f.name);
    } else if (f.kind === "lines") {
      out[f.name] = str(fd, f.name)
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      const rows: Record<string, string>[] = [];
      for (let i = 0; i < 50; i++) {
        const a = fd.get(`${f.name}.${i}.${f.keys[0]}`);
        const b = fd.get(`${f.name}.${i}.${f.keys[1]}`);
        if (a === null && b === null) break;
        const av = typeof a === "string" ? a.trim() : "";
        const bv = typeof b === "string" ? b.trim() : "";
        if (!av && !bv) continue;
        rows.push({ [f.keys[0]]: av, [f.keys[1]]: bv });
      }
      out[f.name] = rows;
    }
  }
  return out;
}
