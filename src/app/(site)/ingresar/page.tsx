import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMember } from "@/server/auth";
import { loginMember } from "@/server/actions/member-auth";
import { AuthForm } from "@/components/site/AuthForm";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getMember()) redirect(next?.startsWith("/") ? next : "/cuenta");
  return (
    <AuthShell eyebrow="Cuenta" title="Ingresar" text="Bienvenido de vuelta.">
      <AuthForm mode="login" action={loginMember} next={next ?? null} />
    </AuthShell>
  );
}
