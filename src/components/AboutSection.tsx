import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import Slider from "react-slick";

// --- Datos de marcas ---
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

const AboutSection = () => {
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    speed: 3000,
    autoplaySpeed: 0,
    cssEase: "linear",
    pauseOnHover: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
        }
      }
    ]
  };

  return (
    <section className="bg-[#fcfcfc] py-24 relative overflow-hidden font-gotham">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gray-100/50 rounded-full mix-blend-multiply blur-3xl opacity-70 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full mix-blend-multiply blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 mb-24">

          {/* Izquierda: Texto e Identidad */}
          <div className="w-full lg:w-1/2">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-1 bg-[#fff03b]"></span>
              <span className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">Sobre Nosotros</span>
            </div>

            <h2 className="text-5xl lg:text-7xl font-black text-black leading-[0.9] mb-8 tracking-tighter">
              BRIAGO <br /> <span className="text-black bg-clip-text bg-gradient-to-r from-[#dacc18] to-[#fff03b]">PINTURAS.</span>
            </h2>

            <p className="text-xl lg:text-2xl leading-relaxed text-gray-700 font-medium mb-10 max-w-xl">
              En <span className="font-extrabold text-black">Briago</span>, nos dedicamos a ofrecer soluciones tanto como para el hogar, automotriz e industriales. Brindamos siempre el mejor asesoramiento para tus proyectos.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              <Link
                to="/InfoBriagoPinturas"
                className="inline-flex items-center justify-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#fff03b] hover:text-black hover:scale-105 transition-all duration-300 shadow-xl shadow-black/10 group"
              >
                Contactanos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Derecha: Cards Flotantes (Valores) */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 relative">
            <div className="absolute -z-10 w-full h-full bg-[url('/img/grid.png')] opacity-[0.03]"></div>

            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#fff03b] transition-colors duration-300">
                <CheckCircle2 className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2">Calidad Garantizada</h3>
              <p className="text-gray-500 font-medium">Selección premium de productos para asegurar resultados profesionales y duraderos en cada aplicación.</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 transform hover:-translate-y-1 ml-0 lg:ml-12 group">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#fff03b] transition-colors duration-300">
                <MessageSquare className="w-7 h-7 text-black" />
              </div>
              <h3 className="text-2xl font-black text-black mb-2">Atención Personalizada</h3>
              <p className="text-gray-500 font-medium">Asesoramiento técnico especializado para acompañarte en cada etapa de tus proyectos.</p>
            </div>
          </div>
        </div>

        {/* --- MARCAS (TRUST BAR) --- */}
        <div className="border-t border-gray-200 pt-16">
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">
            Trabajamos con :
          </p>
          <div className="slider-container opacity-60 hover:opacity-100 transition-opacity duration-500">
            <Slider {...settings}>
              {marcas.map((marca) => (
                <div key={marca.name} className="px-6 outline-none">
                  <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer">
                    <img
                      src={marca.logoSrc}
                      alt={marca.name}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
