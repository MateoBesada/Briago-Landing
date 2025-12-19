import { motion } from 'framer-motion';
import { Lightbulb, ShieldCheck, Palette, MapPin } from 'lucide-react';

// Importamos las imágenes
import Colores2 from "/img/Otros/Para+qué+sirve+y+qué+función+tiene+cada+componente+en+la+pintura+automotriz+2.png";
import Colores3 from "/img/Otros/palette-colori-RAL.jpg";
import IndustrialImage from "/img/Otros/que-es-la-pintura-industrial (1).jpg";
import ImgLocal from "/img/Otros/FondoBriagoLocal2.png";

const AboutPage = () => {
  const specializedServices = [
    {
      image: Colores2,
      title: "Colores Bicapa y Automotriz",
      description: "Realizamos colores bicapa personalizados para lograr acabados brillantes y duraderos. Nuestra tecnología permite igualar tonos especiales con precisión automotriz profesional."
    },
    {
      image: Colores3,
      title: "Colores RAL",
      description: "Combinamos precisión y calidad para ofrecerte colores RAL exactos a pedido. Con tecnología de vanguardia, logramos reproducir cada tono con fidelidad para tus proyectos."
    },
    {
      image: IndustrialImage,
      title: "Soluciones Industriales",
      description: "Desarrollamos pinturas de alta resistencia para maquinaria y estructuras, asegurando protección certificada contra la corrosión y el desgaste extremo."
    },
  ];

  return (
    <div className="w-full bg-white text-black min-h-screen">

      {/* ===== HERO Section (Estilo Contacto) ===== */}
      <div className="bg-[#fff03b] py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 text-black"
          >
            SOBRE NOSOTROS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-medium text-black/80 max-w-3xl mx-auto leading-relaxed"
          >
            Más que una pinturería, somos tus aliados en cada proyecto. Calidad, innovación y servicio experto.
          </motion.p>
        </div>
      </div>

      {/* ===== VALORES / CARACTERÍSTICAS (Estilo Tarjetas Modernas) ===== */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Lightbulb size={32} />, title: "Asesoramiento Experto", text: "Te guiamos técnica y estéticamente para que tomes la mejor decisión." },
            { icon: <ShieldCheck size={32} />, title: "Calidad Garantizada", text: "Trabajamos solo con marcas líderes y materiales de primera línea." },
            { icon: <Palette size={32} />, title: "Precisión de Color", text: "Tecnología de punta para crear exactamente el color que imaginás." }
          ].map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-black text-[#fff03b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">{card.title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== SERVICIOS PROFESIONALES ===== */}
      <section className="bg-white py-24 relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="text-[#fff03b] font-bold tracking-widest uppercase text-sm">Nuestra Especialidad</span>
            <h2 className="text-4xl md:text-5xl font-black text-black mt-3 mb-6">Tecnología y Precisión</h2>
            <div className="h-1.5 w-24 bg-[#fff03b] mx-auto rounded-full"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Sistemas tintométricos avanzados para los sectores más exigentes.
            </p>
          </div>

          <div className="space-y-24">
            {specializedServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
              >
                {/* Imagen */}
                <div className="w-full lg:w-1/2">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-[400px] object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Borde decorativo */}
                    <div className="absolute inset-0 border-[6px] border-white/20 rounded-3xl pointer-events-none z-20"></div>
                  </div>
                </div>

                {/* Texto */}
                <div className="w-full lg:w-1/2 lg:px-8">
                  <h3 className="text-3xl font-extrabold text-black mb-6">{service.title}</h3>
                  <p className="text-xl text-gray-600 leading-relaxed mb-8">
                    {service.description}
                  </p>
                  <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN FINAL / CTA ===== */}
      <section className="relative py-24 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={ImgLocal} alt="Fondo" className="w-full h-full object-cover grayscale" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            ¿Listo para empezar tu proyecto?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Vení a nuestro local en Pilar y recibí el asesoramiento personalizado que necesitás.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/contactoubicacion"
              className="inline-flex items-center gap-3 bg-[#fff03b] text-black px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,240,59,0.3)] transition-all hover:bg-white hover:scale-105"
            >
              Contactanos Ahora
            </a>
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin size={20} className="text-[#fff03b]" />
              <span className="font-medium">Estanislao López 737, Pilar</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;