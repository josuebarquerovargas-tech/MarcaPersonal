import type { Metadata } from "next";
import { getContent } from "@/server/content";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Política de privacidad" };
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const contact = await getContent("contact");
  return (
    <LegalPage title="Política de privacidad">
      <h2>Qué datos recogemos</h2>
      <p>
        Cuando solicitas una cotización guardamos tu nombre, tu correo o teléfono, el servicio de interés, tu mensaje y la fecha en que autorizaste el tratamiento. También
        guardamos un identificador cifrado de tu conexión para limitar envíos abusivos; no guardamos tu dirección IP en claro.
      </p>
      <h2>Para qué los usamos</h2>
      <p>Solo para responder tu consulta y dar seguimiento a tu solicitud. No los vendemos ni los compartimos con fines publicitarios.</p>
      <h2>Cuentas y pagos</h2>
      <p>
        Si creas una cuenta guardamos tu nombre, tu correo y tu contraseña cifrada. De cada pago guardamos el plan, el monto, el método, el estado, una referencia y, en tarjetas,
        solo los últimos 4 dígitos. Nunca guardamos el número completo ni el código de seguridad. En esta demostración los pagos son simulados y no se realiza ningún cobro.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes pedir acceso, corrección o eliminación de tus datos escribiendo a{" "}
        <a href={`mailto:${contact.email}`} className="text-accent underline underline-offset-4">
          {contact.email}
        </a>
        . En Costa Rica, el tratamiento de datos personales se rige por la Ley N.° 8968.
      </p>
      <h2>Contenido de otras plataformas</h2>
      <p>Los videos de YouTube, Instagram o TikTok se cargan solo cuando pulsas reproducir. A partir de ese momento aplican las políticas de cada plataforma.</p>
    </LegalPage>
  );
}
