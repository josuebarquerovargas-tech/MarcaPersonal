type Props = { name: string; url: string; sameAs: string[]; description: string; image?: string | null };

export function JsonLd({ name, url, sameAs, description, image }: Props) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    description,
    jobTitle: "Marca personal y soluciones digitales",
    nationality: { "@type": "Country", name: "Costa Rica" },
    sameAs: sameAs.filter(Boolean),
    ...(image ? { image } : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
