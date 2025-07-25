import { useEffect } from "react";

const SobreBriago = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white min-h-screen w-full py-12 text-gray-800 leading-relaxed">
      <div className="max-w-7xl text-sm mx-auto px-4">
        <h1 className="text-3xl mx-auto max-w-7xl md:text-4xl font-extrabold text-center mb-10 border-b-4 border-[#fff03b] inline-block pb-4">
          Sobre Briago
        </h1>

        <p className="mb-4">
          En <strong>Briago Pinturas</strong> creemos que pintar no es solo renovar una pared, una máquina o un auto. Es transformar espacios, proteger lo que más querés y dar vida a tus ideas. Somos una empresa familiar con sucursal en la ciudad de Pilar, Buenos Aires, y queremos <strong>hacer que tu proyecto sea un éxito</strong>.
        </p>

        <p className="mb-4">
          Nuestro compromiso es simple pero poderoso: ofrecerte productos de calidad, asesoramiento técnico y una atención personalizada y cercana. Ya sea que seas un profesional del rubro, un pintor de oficio, una empresa industrial o una persona que quiere mejorar su hogar, en Briago vas a encontrar una respuesta clara, rápida y confiable.
        </p>

        <p className="mb-4">
          Nos especializamos en productos para <strong>hogar, automotor e industria</strong>. Trabajamos con las mejores marcas del país, seleccionadas por su rendimiento, durabilidad y respaldo.
        </p>

        <p className="mb-4">
          A lo largo del tiempo, fuimos construyendo una comunidad de clientes que no solo vuelven, sino que nos recomiendan.
        </p>

        <p className="mb-4">
          Nos capacitamos constantemente para ofrecerte no solo un buen precio, sino también el consejo justo en el momento que lo necesitás. Si tenés dudas, te las aclaramos. Si necesitás ayuda, ahí estamos.
        </p>

        <p className="mb-4">
          <strong>Briago Pinturas</strong> es más que una pinturería. Es una familia, un equipo, una comunidad. Y queremos que vos también seas parte.
        </p>

        <div className="mt-12">
          <img
            src="/img/Otros/NegocioExterior.jpg"
            alt="Frente del local"
            className="w-full rounded-xl shadow-lg mb-6"
          />
        </div>
      </div>
    </div>
  );
};

export default SobreBriago;
