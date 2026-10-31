import { HOME_PORTRAIT } from "@/lib/content/defaults";
import { getMember } from "@/server/auth";
import { getMembership } from "@/server/members";
import { getContent } from "@/server/content";
import { listPublishedVideos } from "@/server/videos";
import { listPhotos } from "@/server/photos";
import { listPublishedPosts } from "@/server/posts";
import { PostGrid } from "@/components/site/PostCard";
import { listPlans } from "@/server/plans";
import { storage } from "@/lib/storage/storage";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Pitch } from "@/components/site/Pitch";
import { LatestVideos } from "@/components/site/LatestVideos";
import { About } from "@/components/site/About";
import { Process } from "@/components/site/Process";
import { ServicesGrid } from "@/components/site/ServicesGrid";
import { isMembershipEnabled } from "@/server/features";
import { MembershipCta } from "@/components/site/MembershipCta";
import { JsonLd } from "@/components/site/JsonLd";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { PhotoMosaic } from "@/components/site/PhotoMosaic";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, pitch, about, services, processContent, membership, contact, social, seo, portrait, videos, photos, plans, member, posts, membershipOn] =
    await Promise.all([
      getContent("hero"),
      getContent("pitch"),
      getContent("about"),
      getContent("services"),
      getContent("process"),
      getContent("membership"),
      getContent("contact"),
      getContent("social"),
      getContent("seo"),
      getContent("portrait"),
      listPublishedVideos({ take: 6 }),
      listPhotos(),
      listPlans(),
      getMember(),
      listPublishedPosts({ take: 3 }),
      isMembershipEnabled(),
    ]);
  const { active: isMember } = await getMembership(member);
  const portraitUrl = portrait.key ? storage.publicUrl(portrait.key) : HOME_PORTRAIT;
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
      <Marquee />
      <Pitch {...pitch} whatsapp={contact.whatsapp} />
      <ServicesGrid {...services} />
      <Process {...processContent} />
      {videos.length > 0 && (
        <LatestVideos
          videos={videos.map((v) => ({ ...v, thumbUrl: v.thumbnailPath ? storage.publicUrl(v.thumbnailPath) : null }))}
        />
      )}
      <About heading={about.heading} paragraphs={about.paragraphs} facts={about.facts} compact />
      {membershipOn && (
        <MembershipCta
          title={membership.title}
          text={membership.text}
          benefits={membership.benefits}
          monthlyPriceCRC={monthly}
          isMember={isMember}
        />
      )}
      {posts.length > 0 && (
        <section className="py-10 sm:py-16" aria-labelledby="blog-title">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Artículos"
                title="Ideas para tu marca"
                action={
                  <LinkButton href="/contenido#articulos" variant="secondary">
                    Ver todos los artículos
                  </LinkButton>
                }
              />
            </Reveal>
            <div className="mt-10">
              <PostGrid posts={posts} />
            </div>
          </Container>
        </section>
      )}
      {photos.length > 0 && (
        <section className="py-10 sm:py-16" aria-labelledby="gallery-title">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Galería"
                title="Proyectos y actividades"
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
    </main>
  );
}
