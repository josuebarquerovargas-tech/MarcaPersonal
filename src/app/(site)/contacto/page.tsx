import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { ContactSection } from "@/components/site/ContactSection";

export const metadata: Metadata = { title: "Contacto", description: "Prensa, alianzas, charlas y consultoría canina." };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [contact, social] = await Promise.all([getContent("contact"), getContent("social")]);
  return (
    <main>
      <ContactSection {...contact} social={social} standalone />
    </main>
  );
}
