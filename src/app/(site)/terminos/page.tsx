import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso">
      <h2>Uso del sitio</h2>
      <p>Este sitio presenta la marca personal y los servicios de Rubén Rodríguez. Su contenido es informativo y puede cambiar sin aviso.</p>
      <h2>Cotizaciones</h2>
      <p>Enviar una solicitud no crea un contrato ni una obligación de pago. El alcance, el precio y las condiciones de cada servicio se acuerdan por separado.</p>
      <h2>Resultados</h2>
      <p>Los resultados de una estrategia dependen de cada marca, su mercado y su presupuesto, por lo que no se pueden asegurar de antemano.</p>
      <h2>Propiedad del contenido</h2>
      <p>Los textos, imágenes y videos pertenecen a sus titulares y no pueden reutilizarse sin autorización.</p>
    </LegalPage>
  );
}
