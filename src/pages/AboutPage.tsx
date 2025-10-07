import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Importamos las imágenes, incluyendo la nueva para el sector industrial
import Colores2 from "/img/Otros/Para+qué+sirve+y+qué+función+tiene+cada+componente+en+la+pintura+automotriz+2.png";
import Colores3 from "/img/Otros/palette-colori-RAL.jpg";
import IndustrialImage from "/img/Otros/que-es-la-pintura-industrial (1).jpg"; // Asegúrate de tener una imagen así en tu proyecto
import ImgLocal from "/img/Otros/FondoBriagoLocal2.png";

// Iconos (sin cambios)
const PaintBrushIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /> </svg> );
const ShieldCheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> </svg> );
const LightBulbIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /> </svg> );
const LocationMarkerIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );
const ClockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ArrowRightIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}> <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /> </svg> );


const AboutPage = () => {
  const heroRef = useRef(null);
  const locationRef = useRef(null);
  
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const { scrollYProgress: locationScroll } = useScroll({
    target: locationRef,
    offset: ["start end", "end start"],
  });

  const heroBlur = useTransform(heroScroll, [0, 1], ["0px", "10px"]);
  // Ajuste la transformación parallax para asegurar que la imagen de fondo esté siempre "dentro"
  const locationParallax = useTransform(locationScroll, [0, 1], ["-25%", "25%"]); 

  const specializedServices = [
    { image: Colores2, title: "Colores Bicapa y Automotriz", description: "Realizamos colores bicapa personalizados para lograr acabados brillantes y duraderos. Nuestra tecnología permite igualar tonos especiales con precisión automotriz profesional." },
    { image: Colores3, title: "Colores RAL", description: "Combinamos precisión y calidad para ofrecerte colores RAL exactos a pedido. Con tecnología de vanguardia, logramos reproducir cada tono con fidelidad para tus proyectos." },
    { image: IndustrialImage, title: "Soluciones Industriales de Alto Rendimiento", description: "Desarrollamos pinturas de alta resistencia para maquinaria y estructuras, asegurando protección certificada contra la corrosión y el desgaste extremo en los entornos industriales más exigentes." },
  ];

  return (
    <div className="bg-white">
      {/* ===== HERO Section ===== */}
      <div ref={heroRef} className="relative h-[60vh] min-h-[600px] overflow-hidden">
  <motion.img
    src={ImgLocal}
    alt="Frente del local de Briago Pinturas"
    className="absolute inset-0 w-full h-full object-cover object-[50%_50%]"
    style={{ filter: useTransform(heroBlur, b => `blur(${b})`) }}
  />
  <div className="absolute inset-0 bg-black/50"></div>
  <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
    <motion.h1 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, delay: 0.2 }} 
      className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl" 
      style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
      Briago Pinturas
    </motion.h1>
    <motion.p 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.8, delay: 0.4 }} 
      className="mt-6 text-lg max-w-3xl text-gray-200" 
      style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}>
      Ofrecemos una amplia gama de productos para hogar y obra, automotor e industria.
    </motion.p>
  </div>
</div>

      <div className="relative">
        <div className="container mx-auto max-w-7xl px-6 relative z-10 -mt-26">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: "easeOut" }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[ { icon: <LightBulbIcon />, title: "Asesoramiento Personalizado", text: "Te guiamos en cada paso para que elijas la mejor solución técnica y estética." }, { icon: <ShieldCheckIcon />, title: "Calidad Garantizada", text: "Trabajamos solo con las mejores marcas y materiales para resultados duraderos." }, { icon: <PaintBrushIcon />, title: "Colores a Medida", text: "Nuestra tecnología nos permite crear cualquier color que imagines con total precisión." } ].map((card, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 group"> {/* Added group for hover effects */}
                <div className="flex items-center justify-center mx-auto h-16 w-16 rounded-full bg-[#fff03b] transition-transform duration-300 group-hover:scale-110">{card.icon}</div> {/* Icon hover effect */}
                <h3 className="mt-5 text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-base text-gray-600">{card.text}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* ===== SECCIÓN DE SERVICIOS PROFESIONALES (ALTERNADA Y MEJORADA) ===== */}
      <section className="relative bg-white pb-24 pt-18 sm:pb-32 overflow-hidden">
        {/* Nuevo fondo con patrón de ondas */}
        <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23f3f4f6\' fill-opacity=\'1\' d=\'M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,170.7C672,171,768,117,864,96C960,75,1056,85,1152,101.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z\'%3E%3C/path%3E%3C/svg%3E")' , backgroundSize: 'cover' }}></div>
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23ffffff\' fill-opacity=\'1\' d=\'M0,192L48,170.7C96,149,192,107,288,112C384,117,480,171,576,170.7C672,171,768,117,864,96C960,75,1056,85,1152,101.3C1248,117,1344,139,1392,149.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: 'cover' }}></div>
        
        <div className="container mx-auto max-w-7xl px-6 relative z-10"> {/* z-10 para que el contenido esté sobre el patrón */}
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Tecnología y Precisión en Cada Tono</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">Nuestros sistemas tintométricos y experiencia nos permiten ofrecer soluciones de color avanzadas para los sectores más exigentes.</p>
          </motion.div>
          
          <div className="space-y-16">
            {specializedServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
                <div className={`w-full h-80 rounded-lg overflow-hidden shadow-xl ${index % 2 === 1 ? 'lg:order-last' : ''}`}>
                  <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105" />
                </div>
                <div className={`lg:pr-8 ${index % 2 === 1 ? 'lg:pl-8 lg:pr-0' : ''}`}>
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-4 text-lg text-gray-600">
                    {service.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NUEVA SECCIÓN DE UBICACIÓN (CON PARALLAX) ===== */}
      <section ref={locationRef} className="relative h-[70vh] min-h-[500px] bg-gray-800 overflow-hidden flex items-center justify-center">
        {/* El scale-125 se aplica al contenedor que se mueve, no solo a la imagen */}
        <motion.div 
          className="absolute inset-0 scale-125" 
          style={{ y: locationParallax }}
        >
          <img 
            src={ImgLocal} 
            alt="Interior del local de Briago Pinturas" 
            className="absolute inset-0 w-full h-full object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0 bg-black/60"></div> 
        </motion.div>
        
        <div className="relative z-10 h-full flex items-center justify-center w-full">
          <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 sm:p-12 text-white text-center max-w-2xl mx-4 border border-white/20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Encontranos en Pilar</h2>
              <p className="mt-4 text-lg text-gray-200">Estamos listos para recibirte y brindarte el asesoramiento necesitás y te podamos ofrecer.</p>
              
              <div className="mt-8 text-left space-y-4 text-base text-gray-100">
                <div className="flex items-center"><LocationMarkerIcon /> <span className='font-medium'>Estanislao López 737, Pilar, Buenos Aires</span></div>
                <div className="flex items-center"><ClockIcon /> <span className='font-medium'>Lunes a Viernes: 8:00-13:00 y 14:00-18:00 hs.<br />Sábados: 8:00-13:00 hs.</span></div>
              </div>

              <a href="https://maps.app.goo.gl/ngezfT3Z7r9DonbB6" target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center justify-center px-8 py-3 bg-[#fff03b] text-gray-900 font-bold rounded-md shadow-xl transition-all hover:scale-105 hover:bg-[#ffe00b]">
                  Cómo llegar
                  <ArrowRightIcon />
              </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;