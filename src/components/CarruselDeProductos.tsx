import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import ProductoCard from "./ProductoCard";
import type { Producto } from "@/types/Producto";
import type { JSX } from "react";

export interface CarruselProps {
  tituloElemento: JSX.Element;
  rutaMas: string;
  productosAgrupados: [string, Producto[]][];
  direccion?: "left" | "right";
  anuncioTitulo: string;
  anuncioDescripcion: string;
  anuncioCta: string;
  linkAnuncio?: string;
}

// --- Componente para las flechas personalizadas (sin cambios) ---
const CustomArrow = (props: { className?: string, style?: React.CSSProperties, onClick?: () => void, type: 'prev' | 'next' }) => {
  const { className, style, onClick, type } = props;
  const isPrev = type === 'prev';
  return (
    <button
      onClick={onClick}
      className={`${className} absolute top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full shadow-md w-10 h-10 flex items-center justify-center
                text-gray-700 transition-all duration-300 hover:bg-white hover:scale-110
                opacity-0 group-hover:opacity-100
                ${isPrev ? '-left-5' : '-right-5'}`}
      style={{ ...style }}
    >
      {isPrev ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
};


const CarruselDeProductos = ({
  tituloElemento,
  rutaMas,
  productosAgrupados,
  direccion = "left",
  anuncioTitulo,
  anuncioDescripcion,
  anuncioCta,
  linkAnuncio,
}: CarruselProps) => {

  const slidesToShowDesktop = 4;
  const isInfinite = productosAgrupados.length > slidesToShowDesktop;

  const sliderSettings = {
    dots: false,
    infinite: isInfinite,
    speed: 500,
    slidesToShow: slidesToShowDesktop,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
    swipeToSlide: true,
    arrows: true,
    nextArrow: <CustomArrow type="next" />,
    prevArrow: <CustomArrow type="prev" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4, infinite: productosAgrupados.length > 4 } },
      { breakpoint: 1024, settings: { slidesToShow: 3, infinite: productosAgrupados.length > 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2, arrows: false, infinite: productosAgrupados.length > 2 } },
      { breakpoint: 480, settings: { slidesToShow: 2, arrows: false, infinite: productosAgrupados.length > 2 } },
      { breakpoint: 0, settings: { slidesToShow: 1, arrows: false, infinite: productosAgrupados.length > 1 } },
    ],
  };

  const datosValidos = Array.isArray(productosAgrupados) && productosAgrupados.length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, x: direccion === "left" ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          {tituloElemento}
          <Link
            to={rutaMas}
            className="text-sm font-semibold px-4 py-2 rounded-md 
                       border border-gray-400 text-gray-600 
                       transition-all duration-300 ease-in-out
                       hover:bg-[#fff03b] hover:border-[#fff03b] hover:text-black"
          >
            Ver todo
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-2 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

          <Link to={linkAnuncio || "#"} className="hidden lg:block w-full h-full rounded-2xl overflow-hidden group relative shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-[#fff03b]">
            {/* Patrón de puntos decorativo */}
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            ></div>

            <div className="relative h-full p-8 flex flex-col justify-between text-black z-10">
              <div>
                <div className="w-12 h-1 bg-black mb-6"></div>
                <h3 className="text-4xl font-extrabold leading-tight tracking-tight mb-4">{anuncioTitulo}</h3>
                <p className="text-lg font-medium opacity-90 leading-relaxed">{anuncioDescripcion}</p>
              </div>

              <div className="mt-8">
                <div className="inline-flex items-center gap-2 font-bold text-lg border-b-2 border-black pb-1 group-hover:gap-4 transition-all duration-300">
                  <span>{anuncioCta}</span>
                  <ChevronRight size={20} strokeWidth={3} />
                </div>
              </div>
            </div>
          </Link>

          <div className="relative w-full overflow-hidden group">
            {datosValidos ? (
              <Slider {...sliderSettings} className="w-full">
                {productosAgrupados.slice(0, 14).map(([baseNombre, variantes]) => (
                  <div key={baseNombre} className="px-1 py-2 w-full !block">
                    <ProductoCard variantes={variantes} baseNombre={baseNombre} />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-gray-500 min-h-[300px]">
                Cargando productos...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CarruselDeProductos;