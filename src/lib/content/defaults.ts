import type { Content } from "./keys";

/**
 * Default copy for the public site. Based only on verified facts about Rubén
 * (spec §2). Everything here is editable from the admin panel.
 */
export const defaults: Content = {
  hero: {
    eyebrow: "El mae de los perros",
    title: "Rubén Rodríguez",
    subtitle:
      "Defensor del bienestar animal, juez internacional canino y creador de contenido en Costa Rica.",
    ctaPrimary: "Ver videos",
    ctaSecondary: "Hazte miembro",
  },
  about: {
    heading: "Una vida dedicada a los perros",
    paragraphs: [
      "Ingeniero, empresario y asesor de estrategia, Rubén lleva años al frente del movimiento por el bienestar animal en Costa Rica. Fundó la Asociación Cinológica Autónoma Nacional, hoy Federación Canina de Costa Rica, la primera federación debidamente inscrita en el país.",
      "Es juez internacional de todas las razas, criador de pastor alemán y adiestrador. Impulsa un modelo de crianza responsable y una relación entre personas y perros basada en el respeto y la comprensión del comportamiento canino.",
      "En redes comparte rescates, consejos de adiestramiento y campañas que han llevado la conversación sobre el maltrato animal a la calle, a la televisión y a las instituciones.",
    ],
    facts: [
      {
        label: "Juez internacional",
        value:
          "Todas las razas, avalado por la Federación Canina Mundial y la International Kennel Union",
      },
      {
        label: "Fundador",
        value: "Federación Canina de Costa Rica (ACAN), primera federación inscrita en el país",
      },
      {
        label: "Criador y adiestrador",
        value: "Pastor alemán, talleres y consultoría de comportamiento",
      },
      {
        label: "Activista",
        value: "Campañas contra el maltrato animal, rescates y educación",
      },
    ],
  },
  pillars: {
    heading: "Trayectoria",
    intro: "Cuatro frentes de trabajo por los animales de Costa Rica.",
    items: [
      {
        title: "Activismo y campañas",
        text: "Campañas de concientización sobre el maltrato y la adopción responsable, desde la Estatua Emblema del Maltrato Animal hasta el Zaguaparade.",
      },
      {
        title: "Rescates y organizaciones",
        text: "Colaboración con refugios y organizaciones de rescate para rehabilitar perros abandonados y encontrarles hogar.",
      },
      {
        title: "Legislación",
        text: "Impulso a normas más estrictas contra el maltrato animal y a la crianza responsable desde la Federación Canina de Costa Rica.",
      },
      {
        title: "Educación y conciencia social",
        text: "Charlas, talleres y contenido en redes que cambian la forma en que las personas ven y tratan a los animales.",
      },
    ],
  },
  membership: {
    title: "Unite a la manada",
    text: "Acceso a videos exclusivos de adiestramiento, sesiones completas y contenido que no publico en redes. Tu apoyo financia rescates y campañas.",
    benefits: [
      "Videos exclusivos de adiestramiento y comportamiento canino",
      "Sesiones completas sin cortes",
      "Acceso anticipado a nuevos contenidos",
      "Apoyás directamente rescates y campañas por el bienestar animal",
    ],
    faq: [
      {
        q: "¿Puedo cancelar cuando quiera?",
        a: "Sí. Cancelás desde tu cuenta y conservás el acceso hasta el final del período que ya pagaste.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Tarjeta de crédito o débito y SINPE Móvil.",
      },
      {
        q: "¿Los videos gratuitos siguen siendo gratuitos?",
        a: "Siempre. La membresía suma contenido exclusivo, no quita nada.",
      },
    ],
  },
  contact: {
    title: "Hablemos",
    text: "Para prensa, alianzas, charlas o consultoría canina, escribime por WhatsApp o correo.",
    whatsapp: "+50670150301",
    email: "rr@rubenrodriguezoficial.com",
  },
  social: {
    tiktok: "https://www.tiktok.com/@rubenrodriguezoficialdog",
    instagram: "https://www.instagram.com/rubenrodriguezoficialdog",
    youtube: "https://youtube.com/@rubenrodriguez-lx1gr",
    facebook: "https://www.facebook.com/emprendedorconproyeccionsocial",
    tiktokFollowers: "",
    instagramFollowers: "119 mil",
  },
  seo: {
    title: "Rubén Rodríguez · El mae de los perros",
    description:
      "Defensor del bienestar animal, juez internacional canino y creador de contenido en Costa Rica. Videos, membresía y contacto.",
  },
  portrait: {
    key: "",
  },
};
