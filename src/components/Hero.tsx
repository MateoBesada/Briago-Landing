import mercadoLibreLogo from '../img/Mercadolibre.png';

const Hero = () => {
  return (
    <section className="bg-white py-12 px-4 font-gotham-book">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-gotham-bold text-black mb-2">
          ¿Preferís comprar online?
        </h2>

        <p className="text-lg md:text-xl text-gray-800 mb-8">
          ¡También podés encontrarnos en Mercado Libre!
        </p>

        <div className="inline-flex flex-col items-center gap-4">
          <img
            src={mercadoLibreLogo}
            alt="Mercado Libre"
            className="w-36 md:w-44 object-contain"
          />

          <a
            href="https://www.mercadolibre.com.ar/perfil/PINTURERIASBRIAGO"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black font-gotham-bold text-lg px-8 py-3 rounded-full border-4 border-black hover:bg-black hover:text-yellow-300 transition"
          >
            Ir a Mercado Libre
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
