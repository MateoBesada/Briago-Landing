import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import SataProductsImage1 from '/img/Otros/SATA Jet 100 B (Tarjeta)1-Photoroom.png';
import SataProductsImage2 from '/img/Otros/SATAjet X (Tarjeta)-Photoroom.png';
import SataProductsImage3 from '/img/Otros/SATAjet X 5500 (Tarjeta)-Photoroom.png';

const SataFeaturedBanner = () => {
  const productImages = [
    { id: 1, src: SataProductsImage2, alt: 'SATAjet X' },
    { id: 2, src: SataProductsImage3, alt: 'SATAjet X 5500' },
    { id: 3, src: SataProductsImage1, alt: 'SATA Jet 100 B' },
  ];

  const [index, setIndex] = useState(0);

  // Efecto para el autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % productImages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const variants = {
    enter: { x: "100%", opacity: 0 },
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: { zIndex: 0, x: "-100%", opacity: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto mb-5">
      {/* El contenedor principal ahora solo gestiona el layout y la sombra */}
      <div className="rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-200 shadow-sm">

        {/* --- Columna de Texto con su propio fondo --- */}
        <div className="bg-white p-8 md:p-10 flex flex-col justify-center text-center md:text-left items-center md:items-start order-2 md:order-1 z-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
            Acabados Perfectos. Nivel Profesional.
          </h2>
          <p className="text-lg text-slate-600 mb-6 max-w-md">
            Descubrí la línea de sopletes SATA. Tecnología de punta para una aplicación impecable y un rendimiento superior.
          </p>
          <Link
            to="/productos-automotor?marca=SATA&seccion=Herramientas"
            className="inline-block px-8 py-3 border border-slate-200 bg-white text-slate-900 font-bold rounded-full text-base shadow-lg transition duration-300 hover:scale-105 hover:bg-briago-yellow hover:border-briago-yellow"
          >
            Ver Herramientas SATA
          </Link>
        </div>

        {/* --- Columna de Imagen (Carrusel Automático) --- */}
        <div className="relative w-full h-72 md:h-85 flex items-center justify-center overflow-hidden p-1 order-1 md:order-2 border-l border-slate-100">

          {/* 2. Contenedor del carrusel por encima del círculo */}
          <div className="relative w-full h-full flex items-center justify-center z-20">
            <AnimatePresence initial={false}>
              <motion.img
                key={index}
                src={productImages[index].src}
                alt={productImages[index].alt}
                className="absolute h-full w-auto object-contain"
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 100, damping: 20 },
                  opacity: { duration: 0.3 }
                }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SataFeaturedBanner;