import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";

// --- ESTRUCTURA DE DATOS ---
const slides = [
  {
    id: 3,
    img: "/img/Otros/AddSATAJETXOriginal.png",
    alt: "Sopletes de alta gama marca SATA",
    link: "/productos-automotor?marca=SATA",
    title: "Acabados Perfectos. Nivel Profesional.",
    description: "Descubrí la línea de sopletes SATA.",
    cta: "Ver Sopletes SATA",
  },
  {
    id: 1,
    img: "/img/Otros/AddPiletasOriginal1.png",
    alt: "Pinturas para piletas",
    link: "/productos-pinturas?filtro=Piletas",
    title: "Preparate para el Verano",
    description: "Las mejores pinturas para renovar y proteger tu pileta.",
    cta: "Ver Pinturas de Piletas",
  },
  {
    id: 2,
    img: "/img/Otros/AddPPGOriginal1.png",
    alt: "Promoción PPG",
    link: "/productos-automotor?marca=PPG",
    title: "Calidad Profesional PPG",
    description: "Tecnología de punta para un acabado impecable.",
    cta: "Ver Productos PPG",
  },
  {
    id: 4,
    img: "/img/Otros/AddMontanaOriginal.png",
    alt: "Promoción Montana Colors",
    link: "/productos-automotor?marca=Montana",
    title: "Arte Urbano y Profesional",
    description: "Explorá la gama completa de aerosoles Montana Colors.",
    cta: "Ver Productos Montana",
  },
  {
    id: 5,
    img: "/img/Otros/AddShertexOriginal.png",
    alt: "Promoción Shertex",
    link: "/producto/610",
    title: "Renová tus Paredes con Sherwin",
    description: "Colores vivos y duraderos que transforman tus espacios.",
    cta: "Ver Shertex",
  },
];

// --- VARIANTES DE ANIMACIÓN PARA ESCRITORIO ---
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15 + 0.3, duration: 0.6 },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } },
};

// --- NUEVAS VARIANTES DE ANIMACIÓN PARA EL SLIDER MÓVIL ---
const mobileSliderVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
  }),
  center: {
    zIndex: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? "100%" : "-100%",
  }),
};

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const delay = 6000;

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lógica de Autoplay (ahora actualiza la dirección)
  useEffect(() => {
    if (slides.length <= 1) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setDirection(1); // El autoplay siempre va hacia adelante
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, delay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) };
  }, [current, slides.length]);

  const goToSlide = (newIndex: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Determinamos la dirección solo si el índice es diferente
    if (newIndex !== current) {
      setDirection(newIndex > current ? 1 : -1);
    }
    setCurrent(newIndex);
  }

  const nextSlide = () => goToSlide((current + 1) % slides.length);
  const prevSlide = () => goToSlide((current - 1 + slides.length) % slides.length);

  const handleClick = (link: string | undefined) => { if (link) navigate(link) };

  // --- VISTA MÓVIL (Carrusel Táctil con animación direccional) ---
  if (isMobile) {
    const swipeThreshold = 50;
    const onDragEnd = (_e: any, { offset, velocity }: any) => {
      if (offset.x < -swipeThreshold || velocity.x < -500) {
        nextSlide();
      } else if (offset.x > swipeThreshold || velocity.x > 500) {
        prevSlide();
      }
    };

    return (
      <div className="w-full bg-gray-50">
        <div className="relative w-full overflow-hidden shadow-sm">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={mobileSliderVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
              }}
              className="w-full flex flex-col absolute top-0 left-0"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
            >
              <div
                className="w-full flex flex-col bg-white"
                onClick={() => handleClick(slides[current].link)}
              >
                {/* 1. Imagen (Top) */}
                <div className="w-full aspect-[4/3] relative overflow-hidden">
                  <img src={slides[current].img} alt={slides[current].alt} className="w-full h-full object-cover" />
                </div>

                {/* 2. Contenido (Bottom) */}
                <div className="p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
                  <h3 className="text-2xl font-black leading-none text-black uppercase tracking-tight mb-3">{slides[current].title}</h3>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-xs">{slides[current].description}</p>

                  <div className="mt-6">
                    <span className="inline-block bg-black text-white text-xs font-bold px-6 py-3 rounded-full uppercase tracking-wider shadow-lg">
                      {slides[current].cta}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Spacer div to give height to the relative container because absolute children don't give height */}
          <div className="w-full invisible pointer-events-none">
            <div className="w-full aspect-[4/3]"></div>
            <div className="min-h-[200px]"></div>
          </div>

        </div>

        {/* Paginación (Dots) fuera del slider */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${current === index ? 'w-6 bg-black' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA ESCRITORIO ---
  return (
    <div className="w-full py-4">
      <div className="relative max-w-screen-xl w-full mx-auto h-[480px] overflow-hidden rounded-2xl group">
        <AnimatePresence initial={false}>
          <motion.div
            key={`text-${slides[current].id}`}
            className="absolute top-0 left-0 w-1/2 h-full z-20 flex flex-col justify-center p-12 lg:p-16"
          >
            <motion.h2 variants={textVariants} initial="hidden" animate="visible" exit="exit" custom={0}
              className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900"
            >
              {slides[current].title}
            </motion.h2>
            <motion.p variants={textVariants} initial="hidden" animate="visible" exit="exit" custom={1}
              className="mt-4 text-lg text-gray-600 max-w-md"
            >
              {slides[current].description}
            </motion.p>
            <motion.button variants={textVariants} initial="hidden" animate="visible" exit="exit" custom={2}
              onClick={() => handleClick(slides[current].link)}
              className="mt-8 px-10 py-4 rounded-full font-bold text-lg tracking-wide shadow-lg self-start bg-[#fff03b] text-gray-900 transition-all duration-300 hover:bg-[#ffe00b] hover:scale-[1.03]"
            >
              {slides[current].cta}
            </motion.button>
          </motion.div>

          <motion.div
            key={`image-${slides[current].id}`}
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-0 right-0 w-1/2 h-full z-10"
          >
            <img
              src={slides[current].img}
              alt={slides[current].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-0 w-full z-30 flex justify-center items-center gap-6">
          <button onClick={prevSlide} className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all hover:bg-[#fff03b] hover:scale-110 group">
            <ArrowLeft size={20} className="text-gray-800 group-hover:text-black" />
          </button>

          <div className="flex gap-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${current === index ? "w-8 bg-[#fff03b]" : "w-2.5 bg-gray-400 hover:bg-gray-600"
                  }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>

          <button onClick={nextSlide} className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all hover:bg-[#fff03b] hover:scale-110 group">
            <ArrowRight size={20} className="text-gray-800 group-hover:text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}