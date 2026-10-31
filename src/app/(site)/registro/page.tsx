import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMember } from "@/server/auth";
import { formTokens } from "@/server/security";
import { registerMember } from "@/server/actions/member-auth";
import { AuthForm } from "@/components/site/AuthForm";
import { AuthShell } from "@/components/site/AuthShell";

export const metadata: Metadata = { title: "Crear cuenta", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getMember()) redirect(next?.startsWith("/") ? next : "/cuenta");
  const formToken = await formTokens.issueFormToken();
  return (
    <AuthShell eyebrow="Cuenta" title="Crear cuenta" text="Con tu cuenta podés activar la membresía y ver el contenido exclusivo.">
      <AuthForm mode="register" action={registerMember} next={next ?? null} formToken={formToken} />
    </AuthShell>
  );
}
