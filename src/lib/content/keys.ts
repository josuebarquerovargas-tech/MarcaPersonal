import { z } from "zod";

const text = z.string().trim();

export const contentSchemas = {
  hero: z.object({
    eyebrow: text.max(60),
    title: text.min(1).max(80),
    subtitle: text.max(240),
    ctaPrimary: text.max(40),
    ctaSecondary: text.max(40),
  }),
  about: z.object({
    heading: text.max(80),
    paragraphs: z.array(text.max(800)).min(1).max(5),
    facts: z.array(z.object({ label: text.max(40), value: text.max(160) })).max(6),
  }),
  services: z.object({
    heading: text.max(80),
    intro: text.max(240),
    items: z.array(z.object({ title: text.max(80), text: text.max(300) })).length(5),
  }),
  process: z.object({
    heading: text.max(80),
    intro: text.max(240),
    items: z.array(z.object({ title: text.max(60), text: text.max(300) })).length(5),
  }),
  membership: z.object({
    title: text.max(80),
    text: text.max(400),
    benefits: z.array(text.max(120)).min(1).max(8),
    faq: z.array(z.object({ q: text.max(160), a: text.max(500) })).max(8),
  }),
  contact: z.object({
    title: text.max(80),
    text: text.max(300),
    whatsapp: text.regex(/^\+?\d{8,15}$/, "Número de WhatsApp inválido"),
    email: text.email("Correo inválido"),
  }),
  social: z.object({
    tiktok: text.max(120),
    instagram: text.max(120),
    youtube: text.max(120),
    facebook: text.max(120),
    tiktokFollowers: text.max(20),
    instagramFollowers: text.max(20),
  }),
  seo: z.object({
    title: text.min(1).max(70),
    description: text.max(160),
  }),
  portrait: z.object({
    key: text.max(200),
  }),
  features: z.object({
    membership: z.boolean(),
  }),
} as const;

export type ContentKey = keyof typeof contentSchemas;
export type Content = { [K in ContentKey]: z.infer<(typeof contentSchemas)[K]> };

export const CONTENT_KEYS = Object.keys(contentSchemas) as ContentKey[];
