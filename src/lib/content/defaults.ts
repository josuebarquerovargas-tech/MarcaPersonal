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
      "Una marca, una estrategia y todas las herramientas para manejar tus redes sociales, conectar con clientes y convertirlos en ventas.",
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
      "Junto a su equipo de estrategas y creadores, y con una plataforma para que cada marca se dé a conocer, adapta cada estrategia a las necesidades y al presupuesto del cliente, ya sea una marca personal, institucional o de productos y servicios.",
    ],
    facts: [
      { label: "Emprendedores", value: "Emprendedores y microempresas que buscan una presencia digital profesional" },
      { label: "Negocios", value: "Empresas que quieren atraer clientes con redes sociales, contenido y publicidad" },
      { label: "Profesionales", value: "Personas que desean fortalecer su marca personal" },
      { label: "Marcas y proyectos", value: "Productos, servicios y organizaciones que quieren comunicar mejor su propuesta" },
    ],
  },
  membership: {
    title: "Contenido exclusivo para tu marca",
    text: "Una membresía para acceder a videos exclusivos sobre marca personal, presencia digital y ventas.",
    benefits: ["Videos exclusivos", "Acceso anticipado a nuevos contenidos", "Acceso desde tu cuenta, en cualquier dispositivo"],
    faq: [
      {
        q: "¿Puedo cancelar cuando quiera?",
        a: "Sí. Cancelás desde tu cuenta y conservás el acceso hasta el final del período que ya pagaste.",
      },
      { q: "¿Qué métodos de pago aceptan?", a: "Tarjeta de crédito o débito y SINPE Móvil." },
      { q: "¿Los videos gratuitos siguen siendo gratuitos?", a: "Sí. La membresía suma contenido exclusivo, no quita nada." },
    ],
  },
  contact: {
    title: "Hablemos de tu marca",
    text: "Tenemos estrategas, creadores y una plataforma para que te des a conocer. Contactame y nos adaptamos a tu presupuesto.",
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
