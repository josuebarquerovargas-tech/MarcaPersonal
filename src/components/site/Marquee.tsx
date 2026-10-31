const ITEMS = ["Sitios web", "Redes sociales", "Contenido que vende", "Anuncios digitales", "Inteligencia artificial", "Automatizaciones", "Más visibilidad", "Más clientes", "Más ventas"];

function Group() {
  return (
    <>
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span key={i} className="flex items-center gap-8 pr-8">
          <span className="font-display whitespace-nowrap text-3xl sm:text-4xl">{item}</span>
          <span className="size-1.5 shrink-0 rounded-full bg-brand" />
        </span>
      ))}
    </>
  );
}

/** Decorative band: its words repeat facts stated in the page, so assistive tech skips it. */
export function Marquee() {
  return (
    <div aria-hidden="true" className="marquee overflow-hidden border-y border-line py-5 sm:py-6">
      <div data-marquee-track className="marquee-track flex w-max">
        <Group />
        <Group />
      </div>
    </div>
  );
}
