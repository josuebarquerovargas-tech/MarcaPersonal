import type { Content } from "./keys";
import { SERVICES } from "@/lib/services/catalog";

/**
 * Default copy for the public site, based only on docs/contexto-negocio.md.
 * No invented clients, results, prices or availability. Everything is editable from the panel.
 */
export const defaults: Content = {
  hero: {
    eyebrow: "¿Estás listo a mostrar tu marca?",
    title: "Rubén Rodríguez",
    subtitle:
      "Ayudo a marcas y negocios a tener mayor visibilidad, conectar con clientes y crecer con estrategias y herramientas digitales.",
    ctaPrimary: "Ver servicios",
    ctaSecondary: "Solicitar cotización",
  },
  services: {
    heading: "Soluciones para mostrar y hacer crecer tu marca",
    intro: "Cada estrategia se adapta a tu marca, tus necesidades y tu presupuesto.",
    items: SERVICES.map((s) => ({ title: s.title, text: s.summary })),
  },
  process: {
    heading: "Cómo trabajamos",
    intro: "Un proceso claro, desde entender tu mercado hasta acompañar tu crecimiento.",
    items: [
      { title: "Análisis del mercado", text: "Encontramos oportunidades reales para tu marca." },
      { title: "Conexión con el mercado", text: "Acercamos tu marca a su cliente ideal." },
      { title: "Campañas estratégicas", text: "Publicidad y estrategias en plataformas digitales." },
      { title: "Resultados medibles", text: "Evaluamos el rendimiento de cada acción." },
      { title: "Confianza y acompañamiento", text: "Damos continuidad y soporte al crecimiento de tu marca." },
    ],
  },
  about: {
    heading: "Presencia digital con acompañamiento",
    paragraphs: [
      "Rubén Rodríguez promociona su marca personal y ayuda a negocios, emprendedores y otras marcas personales a mejorar su presencia digital, su visibilidad y sus ventas.",
      "Cada estrategia se adapta a la marca, las necesidades y el presupuesto de cada cliente, ya sea una marca personal, institucional o de productos y servicios.",
    ],
    facts: [
      { label: "Emprendedores", value: "Emprendedores y microempresas que buscan una presencia digital profesional" },
      { label: "Negocios", value: "Empresas que quieren atraer clientes con redes sociales, contenido y publicidad" },
      { label: "Profesionales", value: "Personas que desean fortalecer su marca personal" },
      { label: "Marcas y proyectos", value: "Productos, servicios y organizaciones que quieren comunicar mejor su propuesta" },
    ],
  },
  membership: {
    title: "Membresía",
    text: "Acceso a contenido exclusivo en video.",
    benefits: ["Videos exclusivos", "Acceso anticipado a nuevos contenidos"],
    faq: [
      {
        q: "¿Puedo cancelar cuando quiera?",
        a: "Sí. Cancelás desde tu cuenta y conservás el acceso hasta el final del período que ya pagaste.",
      },
      { q: "¿Qué métodos de pago aceptan?", a: "Tarjeta de crédito o débito y SINPE Móvil." },
    ],
  },
  contact: {
    title: "Hablemos de tu marca",
    text: "Contame qué necesita tu negocio y te respondo con una propuesta a tu medida.",
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
  seo: {
    title: "Rubén Rodríguez · Marca personal y soluciones digitales",
    description:
      "Sitios web, redes sociales, contenido, herramientas tecnológicas y asesoría para que tu marca tenga mayor visibilidad y conecte con clientes.",
  },
  portrait: {
    key: "",
  },
  features: {
    membership: false,
  },
};
