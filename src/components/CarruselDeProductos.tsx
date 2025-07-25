import { useEffect, useRef } from "react";
import Slider from "react-slick";
import { motion, useAnimation, useInView } from "framer-motion";
import { Link } from "react-router-dom"; // ✅ Importación

import ProductoCard from "./ProductoCard";
import type { Producto } from "@/types/Producto";
import type { JSX } from "react";

import ImagenHogar from "/img/Otros/HogarOferta1.png";

export interface CarruselProps {
  tituloElemento: JSX.Element;
  rutaMas: string;
  productosAgrupados: [string, Producto[]][];
  direccion?: "left" | "right";
  imagenAnuncio?: string;
  linkAnuncio?: string; // ✅ Nueva prop
}

const sliderSettings = {
  dots: false,
  infinite: true,
  speed: 500,
  centerMode: false,
  centerPadding: "0px",
  slidesToShow: 4,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: false,
  swipeToSlide: true,
  arrows: false,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 4 } },
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        centerMode: false,
        centerPadding: "0px",
        arrows: false,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        centerMode: false,
        centerPadding: "0px",
        arrows: false,
        dots: false,
      },
    },
  ],
};

const CarruselDeProductos = ({
  tituloElemento,
  productosAgrupados,
  direccion = "left",
  imagenAnuncio,
  linkAnuncio, // ✅ Uso de nueva prop
}: CarruselProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20% 0px" });
  const controls = useAnimation();
  const startX = direccion === "left" ? -100 : 100;

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        transition: { duration: 0.8, ease: "easeOut" },
      });
    }
  }, [isInView, controls]);

  const datosValidos =
    Array.isArray(productosAgrupados) &&
    productosAgrupados.length > 0 &&
    productosAgrupados.every(
      ([base, variantes]) =>
        typeof base === "string" && Array.isArray(variantes)
    );

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, x: startX }}
      animate={controls}
      className="bg-white px-1 py-8 font-gotham"
    >
      {tituloElemento && <div className="text-center">{tituloElemento}</div>}

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-4 items-start">
        {/* Anuncio lateral izquierdo */}
        <div className="hidden lg:block w-[400px] h-[420px] flex-shrink-0 transition-brightness duration-500 hover:brightness-85">
          {linkAnuncio ? (
            <Link to={linkAnuncio}>
              <img
                src={imagenAnuncio || ImagenHogar}
                alt="Anuncio lateral"
                className="rounded-xl shadow-md object-cover w-full h-full"
              />
            </Link>
          ) : (
            <img
              src={imagenAnuncio || ImagenHogar}
              alt="Anuncio lateral"
              className="rounded-xl shadow-md object-cover w-full h-full"
            />
          )}
        </div>

        {/* Carrusel de productos */}
        <div className="relative w-full lg:w-[calc(100%-420px)]">
          {datosValidos ? (
            <Slider {...sliderSettings}>
              {productosAgrupados.slice(0, 14).map(([baseNombre, variantes]) => (
                <div
                  key={baseNombre}
                  className="px-1 sm:px-1.5 transition-transform duration-300 md:hover:scale-[1.00]"
                >
                  <ProductoCard variantes={variantes} baseNombre={baseNombre} />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="text-center text-gray-400 text-base">
              No hay productos para mostrar.
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default CarruselDeProductos;
