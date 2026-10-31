import type { Content } from "./keys";
import { SERVICES } from "@/lib/services/catalog";

/**
 * Default copy for the public site, based only on docs/contexto-negocio.md.
 * No invented clients, results, prices or availability. Everything is editable from the panel.
 */
/** Shown until a portrait is uploaded from the admin panel. */
export const DEFAULT_PORTRAIT = "/images/ruben.webp";
export const HOME_PORTRAIT = "/images/ruben-inicio.webp";

export const defaults: Content = {
  hero: {
    eyebrow: "¿Estás listo a mostrar tu marca?",
    title: "Rubén Rodríguez",
    subtitle:
      "Tu negocio, tu marca personal o tu marca de producto o servicio, en una plataforma con estrategas, creadores y todas las herramientas para darte a conocer y convertir clientes en ventas.",
    ctaPrimary: "Ver servicios",
    ctaSecondary: "Solicitar cotización",
  },
  services: {
    heading: "Creamos una estrategia a tu medida y a tu presupuesto",
    intro: "Marca personal, marca institucional o marca de producto y servicio, para llegar al nicho de mercado que deseas.",
    items: SERVICES.map((s) => ({ title: s.title, text: s.summary })),
    plansTitle: "Planes para tu marca",
    plansText: "Elige el plan que más se acerca a lo que necesitas y solicita tu cotización de una vez. Nos adaptamos a tu presupuesto.",
    plans: [
      { name: "Plan Inicio", includes: "Estrategia a tu medida\nSitio web profesional\nAsesoría personal" },
      { name: "Plan Crecimiento", includes: "Todo lo del Plan Inicio\nManejo de redes sociales\nContenido que vende" },
      { name: "Plan Completo", includes: "Todo lo del Plan Crecimiento\nHerramientas tecnológicas para vender\nAnuncios digitales y automatización" },
    ],
  },
  process: {
    heading: "Cómo trabajamos",
    intro: "Un proceso claro, desde entender tu mercado hasta acompañar tu crecimiento.",
    items: [
      { title: "Análisis del mercado", text: "Identificamos oportunidades reales." },
      { title: "Conexión con el mercado", text: "Te conectamos con tu cliente ideal." },
      { title: "Campañas estratégicas", text: "Publicidad efectiva en plataformas digitales." },
      { title: "Resultados medibles", text: "Evaluamos el rendimiento de cada acción." },
      { title: "Confianza y acompañamiento", text: "Un equipo comprometido con el éxito de tu marca." },
    ],
  },
  about: {
    heading: "Más que publicidad: soluciones reales para el crecimiento de tu marca",
    paragraphs: [
      "Rubén Rodríguez promociona su marca personal y ayuda a negocios, emprendedores y otras marcas personales a mejorar su presencia digital, su visibilidad y sus ventas.",
      "Junto a su equipo de estrategas y creadores, y con una plataforma para que cada marca se dé a conocer, adapta cada estrategia a las necesidades y al presupuesto del cliente, ya sea una marca personal, institucional o de productos y servicios.",
    ],
    facts: [
      { label: "Empresas grandes y medianas", value: "" },
      { label: "Microempresarios", value: "" },
      { label: "Emprendedores", value: "" },
      { label: "Marcas personales", value: "" },
      { label: "Productos y servicios", value: "" },
      { label: "Negocios locales", value: "" },
      { label: "Organizaciones y proyectos", value: "" },
    ],
  },
  membership: {
    title: "Contenido exclusivo para tu marca",
    text: "Una membresía para acceder a videos exclusivos sobre marca personal, presencia digital y ventas.",
    benefits: ["Videos exclusivos", "Acceso anticipado a nuevos contenidos", "Acceso desde tu cuenta, en cualquier dispositivo"],
    faq: [
      {
        q: "¿Puedo cancelar cuando quiera?",
        a: "Sí. Cancelas desde tu cuenta y conservas el acceso hasta el final del período que ya pagaste.",
      },
      { q: "¿Qué métodos de pago aceptan?", a: "Tarjeta de crédito o débito y SINPE Móvil." },
      { q: "¿Los videos gratuitos siguen siendo gratuitos?", a: "Sí. La membresía suma contenido exclusivo, no quita nada." },
    ],
  },
  contact: {
    title: "¿Quieres cotizar?",
    text: "Contáctame y empecemos a trabajar ya. Tenemos estrategas, creadores y una plataforma para que te des a conocer, y nos adaptamos a tu presupuesto.",
    whatsapp: "+50663360450",
    email: "rr@rubenrodriguezoficial.com",
  },
  social: {
    tiktok: "",
    instagram: "https://www.instagram.com/rubenrodriguezoficialdog",
    youtube: "",
    facebook: "https://www.facebook.com/emprendedorconproyeccionsocial",
    tiktokFollowers: "",
    instagramFollowers: "119 mil",
  },
  pitch: {
    text: "Hacer una marca, una estrategia, tener todas las herramientas para el manejo de redes sociales y clientes, y convertirlas en ventas. Hacer dinero. ¿Quiere que le ayude? Tenemos estrategas, tenemos los creadores, tenemos una plataforma para que usted se dé a conocer y facture. Contácteme y nos adaptamos a su presupuesto.",
    author: "Rubén Rodríguez",
  },
  seo: {
    title: "Rubén Rodríguez · Marca personal y soluciones digitales",
    description:
      "Sitios web, redes sociales, contenido, herramientas tecnológicas y asesoría para que tu marca tenga mayor visibilidad y conecte con clientes.",
  },
  portrait: {
    key: "",
  },
  features: {
    membership: true,
  },
};
