import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    // Fondo blanco para un look limpio que resalta el amarillo y negro.
    <section className="bg-white py-20 sm:py-24">
      <div className="container mx-auto max-w-4xl px-6 text-center">
        {/* Nuevo título, más directo y profesional. */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Sobre Briago
        </h2>
        <div className="mb-4 h-1 w-60 mx-auto bg-[#fff03b] rounded mt-1"></div>
        
        {/* Párrafo con tu nuevo texto y colores ajustados. */}
        <p className="mt-6 text-lg leading-8 text-gray-700">
          Ofrecemos una amplia gama de productos para hogar y obra, automotor e industria.
          Calidad, asesoramiento y atención personalizada en cada visita.
          Vení a conocernos y descubrí por qué somos la elección confiable en pinturas y accesorios.
        </p>
        
        {/* Botón adaptado a la nueva paleta de colores. */}
        <div className="mt-10">
          <Link 
            to="/InfoBriagoPinturas" 
            // Fondo amarillo y texto negro para asegurar el contraste y la legibilidad.
            className="inline-block rounded-md bg-[#fff03b] px-6 py-3 text-base font-semibold text-black shadow-md transition duration-300 hover:bg-yellow-400 hover:shadow-lg hover:-translate-y-0.5"
          >
            Más Info
          </Link>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;