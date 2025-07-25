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
    <section className="bg-white px-4 pb-14 pt-14">
      <div className="w-full max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {tarjetas.map(({ src, alt, titulo, descripcion }, i) => (
          <div
            key={i}
            className="group relative w-full overflow-hidden rounded-xl border border-gray-300 shadow hover:shadow-xl transition"
          >
            {/* Título SOLO en mobile (arriba de la imagen) */}
            <div className="md:hidden bg-white py-4 px-4 text-center">
              <span className="text-lg font-bold text-black uppercase tracking-wide">
                {titulo}
              </span>
            </div>

            {/* Imagen */}
            <div className="relative w-full h-[300px] md:h-[440px] overflow-hidden bg-white">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
              />

              {/* Hover visible en desktop */}
              <div className="hidden md:flex absolute inset-0 h-full w-full bg-[#fff03b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out items-center justify-center px-6 py-6 text-center">
                <p className="text-black text-xl font-semibold leading-relaxed z-10">
                  {descripcion}
                </p>
              </div>
            </div>

            {/* Texto fijo en mobile */}
            <div className="md:hidden bg-white px-5 py-5 text-black text-center">
              <p className="text-md leading-[1.6] font-medium">
                {descripcion}
              </p>
            </div>

            {/* Título en desktop (abajo) */}
            <div className="hidden md:block bg-gray-200 group-hover:bg-white py-5 px-4 text-center">
              <span className="text-lg md:text-xl font-bold text-black uppercase tracking-wide">
                {titulo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ColoresSection;
