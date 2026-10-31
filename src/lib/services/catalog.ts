/**
 * The five services from Rubén's advertising (docs/contexto-negocio.md §4).
 * Only claims present in that document: no prices, clients, results or 24/7 availability.
 */
export type Service = {
  slug: string;
  title: string;
  summary: string;
  includes: string[];
  forWhom: string;
  howItWorks: string;
};

export const SERVICES: Service[] = [
  {
    slug: "sitios-web",
    title: "Sitios web",
    summary: "Páginas web profesionales para mostrar tu marca, tus productos y tus servicios.",
    includes: [
      "Creación de una página web profesional",
      "Presentación de tu marca, productos y servicios",
      "Formas claras de contacto para tus clientes",
    ],
    forWhom: "Emprendedores, negocios y profesionales que necesitan una presencia digital propia.",
    howItWorks: "Revisamos qué necesita mostrar tu marca y adaptamos el sitio a tus objetivos y tu presupuesto.",
  },
  {
    slug: "redes-sociales",
    title: "Manejo de redes sociales",
    summary: "Gestión profesional de tus redes para conectar con tu audiencia y generar clientes potenciales.",
    includes: [
      "Gestión profesional de tus redes sociales",
      "Estrategia de comunicación",
      "Conexión con tu audiencia y generación de clientes potenciales",
    ],
    forWhom: "Negocios y marcas personales que quieren atraer clientes mediante redes sociales y contenido.",
    howItWorks: "Partimos de tu mercado y tu cliente ideal para definir qué comunicar y dónde hacerlo.",
  },
  {
    slug: "contenido",
    title: "Contenido que vende",
    summary: "Videos, reels, fotografías y contenido estratégico para presentar lo que ofreces.",
    includes: ["Producción de videos y reels", "Fotografías", "Contenido estratégico para presentar productos o servicios"],
    forWhom: "Marcas de productos o servicios que necesitan mostrar mejor lo que ofrecen.",
    howItWorks: "Definimos qué quieres comunicar y producimos el contenido pensando en apoyar tus ventas.",
  },
  {
    slug: "herramientas-tecnologicas",
    title: "Herramientas tecnológicas para vender",
    summary: "Inteligencia artificial, automatizaciones y anuncios digitales para mejorar tus procesos comerciales.",
    includes: ["Inteligencia artificial", "Automatizaciones", "Anuncios digitales y otras soluciones tecnológicas"],
    forWhom: "Negocios que quieren apoyarse en la tecnología para mejorar sus procesos comerciales y sus ventas.",
    howItWorks: "Identificamos qué procesos conviene mejorar y elegimos las herramientas según tus necesidades.",
  },
  {
    slug: "asesoria",
    title: "Asesoría y acompañamiento",
    summary: "Orientación personalizada durante el crecimiento de tu marca, con seguimiento y apoyo estratégico.",
    includes: ["Orientación personalizada", "Seguimiento durante el proceso", "Apoyo estratégico"],
    forWhom: "Profesionales, marcas y proyectos que quieren crecer con acompañamiento.",
    howItWorks: "Conversamos sobre tu situación y damos seguimiento a las decisiones durante el proceso.",
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
