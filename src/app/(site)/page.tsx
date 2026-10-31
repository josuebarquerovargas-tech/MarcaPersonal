import { getMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { getContent } from "@/server/content";
import { listPublishedVideos } from "@/server/videos";
import { listPhotos } from "@/server/photos";
import { listPlans } from "@/server/plans";
import { storage } from "@/lib/storage/storage";
import { Hero } from "@/components/site/Hero";
import { LatestVideos } from "@/components/site/LatestVideos";
import { About } from "@/components/site/About";
import { Pillars } from "@/components/site/Pillars";
import { MembershipCta } from "@/components/site/MembershipCta";
import { ContactSection } from "@/components/site/ContactSection";
import { JsonLd } from "@/components/site/JsonLd";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PhotoMosaic } from "@/components/site/PhotoMosaic";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, about, pillars, membership, contact, social, seo, portrait, videos, photos, plans, member] =
    await Promise.all([
      getContent("hero"),
      getContent("about"),
      getContent("pillars"),
      getContent("membership"),
      getContent("contact"),
      getContent("social"),
      getContent("seo"),
      getContent("portrait"),
      listPublishedVideos({ take: 6 }),
      listPhotos(),
      listPlans(),
      getMember(),
    ]);
  const { active: isMember } = await getMembership(member);
  const portraitUrl = portrait.key ? storage.publicUrl(portrait.key) : null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const monthly = plans.find((p) => p.code === "MONTHLY")?.priceCRC ?? null;

  return (
    <main>
      <JsonLd
        name={hero.title}
        url={siteUrl}
        description={seo.description}
        sameAs={[social.tiktok, social.instagram, social.youtube, social.facebook]}
        image={portraitUrl ? `${siteUrl}${portraitUrl}` : null}
      />
      <Hero {...hero} portraitUrl={portraitUrl} social={social} />
      <LatestVideos
        videos={videos.map((v) => ({ ...v, thumbUrl: v.thumbnailPath ? storage.publicUrl(v.thumbnailPath) : null }))}
      />
      <About heading={about.heading} paragraphs={about.paragraphs} facts={about.facts} compact />
      <Pillars heading={pillars.heading} intro={pillars.intro} items={pillars.items} />
      <MembershipCta
        title={membership.title}
        text={membership.text}
        benefits={membership.benefits}
        monthlyPriceCRC={monthly}
        isMember={isMember}
      />
      {photos.length > 0 && (
        <section className="py-10 sm:py-16" aria-labelledby="gallery-title">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Galería"
                title="En la calle y en el campo"
                action={
                  <LinkButton href="/galeria" variant="secondary">
                    Ver galería completa
                  </LinkButton>
                }
              />
            </Reveal>
            <div className="mt-10">
              <PhotoMosaic photos={photos.slice(0, 6)} />
            </div>
          </Container>
        </section>
      )}
      <ContactSection {...contact} social={social} />
    </main>
  );
}
