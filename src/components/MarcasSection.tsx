import { Link } from 'react-router-dom';
import React from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Tus datos de marcas ---
const marcas = [
  { name: '3M', logoSrc: '/img/Marcas/Logo-3M-Color.png', link: '/productos?marca=3M' },
  { name: 'El Galgo', logoSrc: '/img/Marcas/Logo-ElGalgo-Color1.png', link: '/productos?marca=El+Galgo' },
  { name: 'Kovax', logoSrc: '/img/Marcas/Logo-Kovax-Color1.png', link: '/productos?marca=Kovax' },
  { name: 'PPG', logoSrc: '/img/Marcas/Logo-PPG-Color1.png', link: '/productos?marca=PPG' },
  { name: 'Menzerna', logoSrc: '/img/Marcas/Logo-Menzerna-Color1.png', link: '/productos?marca=Menzerna' },
  { name: 'Mirka', logoSrc: '/img/Marcas/Logo-Mirka-Color.png', link: '/productos?marca=Mirka' },
  { name: 'Montana', logoSrc: '/img/Marcas/LogoMTN1-Photoroom.png', link: '/productos?marca=Montana' },
  { name: 'Rapifix', logoSrc: '/img/Marcas/Logo-Rapifix-Color.png', link: '/productos?marca=Rapifix' },
  { name: 'Roberlo', logoSrc: '/img/Marcas/Logo-Roberlo-Color1.png', link: '/productos?marca=Roberlo' },
  { name: 'SATA', logoSrc: '/img/Marcas/Logo-SATA-Color.png', link: '/productos?marca=SATA' },
  { name: 'Sherwin-Williams', logoSrc: '/img/Marcas/Logo-Sherwin-Color1.png', link: '/productos?marca=Sherwin+Williams' },
  { name: 'Sinteplast', logoSrc: '/img/Marcas/Logo-Sinteplast-Color1.png', link: '/productos?marca=Sinteplast' },
  { name: 'Wurth', logoSrc: '/img/Marcas/Logo-Wurth-Color1.png', link: '/productos?marca=Wurth' },
];

// --- Componente para las flechas personalizadas ---
const CustomArrow = (props: { className?: string, style?: React.CSSProperties, onClick?: () => void, type: 'prev' | 'next' }) => {
  const { onClick, type } = props;
  const isPrev = type === 'prev';
  return (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md w-10 h-10 flex items-center justify-center
                 text-gray-700 transition-all duration-300 hover:bg-gray-200 hover:scale-110
                 ${isPrev ? '-left-4' : '-right-4'}`}
      aria-label={isPrev ? "Anterior" : "Siguiente"}
    >
      {isPrev ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
};

const MarcasSection = () => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 6, // Cantidad de logos visibles en escritorio
    slidesToScroll: 2, // Cuántos logos se mueven al hacer clic
    autoplay: false, // Carrusel manual
    arrows: true,
    nextArrow: <CustomArrow type="next" />,
    prevArrow: <CustomArrow type="prev" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 5, slidesToScroll: 2 } },
      { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Trabajamos con las Marcas Líderes del Mercado
        </h2>
        <p className="text-center text-gray-600 text-lg mb-12">
          Calidad y confianza garantizada en cada producto.
        </p>
        
        <div className="relative px-8"> {/* Padding para que las flechas no se corten */}
          <Slider {...sliderSettings}>
            {marcas.map((marca) => (
              <div key={marca.name} className="px-4">
                <Link
                  to={marca.link}
                  className="flex items-center justify-center h-24"
                  aria-label={`Ver productos de ${marca.name}`}
                >
                  <img
                    src={marca.logoSrc}
                    alt={`Logo de ${marca.name}`}
                    className="max-h-16 w-full object-contain grayscale opacity-60 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  />
                </Link>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default MarcasSection;