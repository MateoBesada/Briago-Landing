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
          
          <Link to={linkAnuncio || "#"} className="hidden lg:block w-full h-full rounded-lg overflow-hidden group relative">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-[#fff03b] origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-10"></div>
            
            <div 
              className="relative w-full h-full bg-gray-100 p-8 flex flex-col justify-between text-black transition-colors duration-300 group-hover:bg-gray-200"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239ca3af\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")' }}
            >
              <div>
                <h3 className="text-3xl font-black leading-tight text-gray-900">{anuncioTitulo}</h3>
                <p className="mt-4 text-gray-700">{anuncioDescripcion}</p>
              </div>
              {/* --- CONTENEDOR DEL BOTÓN MODIFICADO --- */}
              <div className="mt-8 text-center">
                <div className="inline-flex items-center justify-center bg-black text-white font-bold text-lg px-6 py-3 rounded-full">
                  <span className="whitespace-nowrap">{anuncioCta}</span>
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