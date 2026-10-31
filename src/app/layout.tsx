import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { getContent } from "@/server/content";
import { defaults } from "@/lib/content/defaults";
import { storage } from "@/lib/storage/storage";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Sin ejes extra: la instancia por defecto (opsz 144) basta para titulares y
// pesa menos de la mitad que la variable completa.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // The 404 page is prerendered at build time, when there may be no database:
  // fall back to the default copy instead of failing the build.
  const [seo, portrait] = await Promise.all([getContent("seo"), getContent("portrait")]).catch(
    () => [defaults.seo, defaults.portrait] as const,
  );
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const image = portrait.key ? storage.publicUrl(portrait.key) : undefined;
  return {
    metadataBase: new URL(base),
    title: { default: seo.title, template: `%s · Rubén Rodríguez` },
    description: seo.description,
    openGraph: {
      type: "website",
      locale: "es_CR",
      siteName: "Rubén Rodríguez",
      title: seo.title,
      description: seo.description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: seo.title, description: seo.description },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-CR"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh">
        {children}
      </body>
    </html>
  );
}
