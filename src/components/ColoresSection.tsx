import Colores3 from "/img/Otros/palette-colori-RAL.jpg";
import Colores2 from "/img/Otros/Para+qué+sirve+y+qué+función+tiene+cada+componente+en+la+pintura+automotriz+2.png";
import Colores1 from "/img/Otros/mnanoci.png";

const ColoresSection = () => {
  const tarjetas = [
    {
      src: Colores2,
      alt: "Bicapa",
      titulo: "Colores Bicapa",
      descripcion:
        "Realizamos colores bicapa personalizados para lograr acabados brillantes y duraderos. Nuestra tecnología permite igualar tonos especiales con precisión automotriz profesional.",
    },
    {
      src: Colores3,
      alt: "RAL",
      titulo: "Colores RAL",
      descripcion:
        "Combinamos precisión y calidad para ofrecerte colores RAL exactos a pedido. Con tecnología de vanguardia, logramos reproducir cada tono con fidelidad para tus proyectos.",
    },
    {
      src: Colores1,
      alt: "Industrial",
      titulo: "Colores Industriales",
      descripcion:
        "Creamos soluciones de color a medida para aplicaciones industriales. Ya sea maquinaria, estructuras metálicas o superficies expuestas a condiciones extremas, asegurando durabilidad, adherencia y fidelidad cromática en cada mezcla.",
    },
  ];
  return (
    <section className="bg-gray-100 border-t border-black font-gotham">
      {/* Tarjetas */}
      <div className="w-full max-w-screen-2xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {tarjetas.map(({ src, alt, titulo, descripcion }, i) => (
          <div
            key={i}
            className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-3 transition duration-300"
          >
            {/* Imagen */}
            <div className="relative h-[300px] md:h-[440px] overflow-hidden">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover desktop */}
              <div className="hidden md:flex absolute inset-0 bg-black/80 text-[#fff03b] opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-center justify-center px-6 text-center">
                <p className="text-md md:text-lg text-xl font-semibold leading-relaxed z-10">
                  {descripcion}
                </p>
              </div>
            </div>

            {/* Título tarjeta */}
            <div className="bg-white py-5 px-4 text-center group-hover:bg-black/95 relative transition duration-300">
              <h3 className="text-lg md:text-xl font-bold text-black uppercase tracking-wide group-hover:text-[#fff03b] transition duration-300">
                {titulo}
              </h3>
              {/* Línea decorativa */}
              <div className="mt-2 h-[3px] w-0 bg-[#fff03b] mx-auto transition-all duration-300 group-hover:w-2/3" />
            </div>

            {/* Descripción en mobile */}
            <div className="md:hidden px-5 pb-5 text-black text-center">
              <p className="text-md leading-[1.6] font-medium">{descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ColoresSection;
