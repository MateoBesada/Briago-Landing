import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const marcas = [
  { nombre: "Andina", gris: "img/Marcas/Andina-gris.png", color: "img/Marcas/Andina-color.png" },
  { nombre: "PPG", gris: "img/Marcas/Ppg-gris.png", color: "img/Marcas/Ppg-color.png" },
  { nombre: "Menzerna", gris: "img/Marcas/menzerna-gris.png", color: "img/Marcas/menzerna-color.png" },
  { nombre: "Wurth", gris: "img/Marcas/Wurth-gris.png", color: "img/Marcas/Wurth-color.png" },
  { nombre: "Elgalgo", gris: "img/Marcas/Logo-ElGalgo-Gris.png", color: "img/Marcas/Logo-ElGalgo-Color.png" },
  { nombre: "Kovax", gris: "img/Marcas/Kovax-gris.png", color: "img/Marcas/Kovax-color.png" },
  { nombre: "Norton", gris: "img/Marcas/Norton-gris.png", color: "img/Marcas/Norton-color.png" },
  { nombre: "Autopolish", gris: "img/Marcas/Autopolish-gris.png", color: "img/Marcas/Autopolish-color.png" },
  { nombre: "Roberlo", gris: "img/Marcas/Roberlo-gris.png", color: "img/Marcas/Roberlo-color.png" },
  { nombre: "Sherwin", gris: "img/Marcas/Sherwin-gris.png", color: "img/Marcas/Sherwin-color.png" },
  { nombre: "Sinteplast", gris: "img/Marcas/Sinteplast-gris.png", color: "img/Marcas/Sinteplast-color.png" },
  { nombre: "Vitecso", gris: "img/Marcas/Vitecso-gris.png", color: "img/Marcas/Vitecso-color.png" },
];

const CarruselMarcas = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const itemWidth = 180 + 16; // tarjeta + gap

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      const totalScroll = marcas.length * itemWidth;
      slider.scrollLeft = totalScroll; // comenzamos desde la mitad duplicada
    }
  }, []);

  const scroll = (dir: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const totalScroll = marcas.length * itemWidth;
    const newScrollLeft =
      slider.scrollLeft + (dir === "left" ? -itemWidth : itemWidth);

    slider.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });

    // lógica de duplicación infinita visual
    setTimeout(() => {
      if (newScrollLeft >= totalScroll * 2) {
        slider.scrollLeft = totalScroll;
      } else if (newScrollLeft <= 0) {
        slider.scrollLeft = totalScroll;
      }
    }, 300);
  };

  return (
    <section className="bg-gray-200 py-16 border-t border-gray-200 font-gotham">
      <div className="max-w-7xl mx-auto px-[10px] lg:px-[60px] text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-black uppercase">
          Nuestras principales marcas:
        </h2>

        <div className="relative mt-10">
          {/* Flechas */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 text-gray-500 hover:text-black hover:scale-120 transition duration-300"
          >
            <ChevronLeft size={26} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 text-gray-500 hover:text-black hover:scale-120 transition duration-300"
          >
            <ChevronRight size={26} />
          </button>

          {/* Carrusel */}
          <div
            ref={sliderRef}
            className="overflow-x-auto scroll-smooth whitespace-nowrap scrollbar-hide"
          >
            <div className="inline-flex gap-4">
              {[...marcas, ...marcas, ...marcas].map((marca, index) => (
                <div
                  key={index}
                  className="relative w-[180px] h-[100px] flex items-center justify-center group bg-white border border-gray-200 rounded-md shadow-sm"
                >
                  <img
                    src={`/${marca.gris}`}
                    alt={`Logo ${marca.nombre} gris`}
                    className="absolute w-full h-full object-contain opacity-100 group-hover:opacity-0 transition duration-300"
                  />
                  <img
                    src={`/${marca.color}`}
                    alt={`Logo ${marca.nombre} color`}
                    className="w-full h-full object-contain opacity-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarruselMarcas;
