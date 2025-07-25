import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function IndustriaPage() {
  const imagenes = [
    {
      src: "/img/Otros/Maquinaria.png",
      textoHover: "Texto para imagen 1",
    },
    {
      src: "/img/Otros/maquinaria3.png",
      textoHover: "Texto para imagen 2",
    },
    {
      src: "/img/Otros/maquinaria2.png",
      textoHover: "Texto para imagen 3",
    },
  ];

  const [imagenActiva, setImagenActiva] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setImagenActiva(imagenActiva === index ? null : index);
  };

  const activa = imagenActiva !== null;

  return (
    <motion.div
      layout
      className="min-h-screen bg-white py-16 px-4"
      transition={{ duration: 0.5 }}
    >
      <motion.div
        layout
        transition={{ layout: { type: "spring", stiffness: 80 } }}
        className={`max-w-6xl mx-auto grid gap-8 ${
          activa ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"
        }`}
      >
        {/* Imagen agrandada */}
        <AnimatePresence>
          {activa && (
            <motion.div
              layout
              key="activa"
              onClick={() => handleClick(imagenActiva!)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="relative group rounded-2xl shadow-lg bg-white cursor-pointer overflow-hidden w-full h-[520px] flex items-center justify-center"
            >
              <motion.img
                layout
                src={imagenes[imagenActiva!].src}
                alt={`Industria ${imagenActiva! + 1}`}
                className="object-contain max-h-[460px] scale-110"
              />
              <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center px-4 text-center text-lg font-semibold">
                {imagenes[imagenActiva!].textoHover}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Imágenes pequeñas */}
        <motion.div
          layout
          className={`flex ${
            activa ? "justify-center flex-wrap" : "col-span-3 grid grid-cols-1 md:grid-cols-3"
          } gap-8 w-full`}
        >
          <AnimatePresence>
            {imagenes.map((img, i) => {
              if (activa && i === imagenActiva) return null;

              return (
                <motion.div
                  layout
                  key={i}
                  onClick={() => handleClick(i)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5 }}
                  className="relative group rounded-2xl shadow-lg bg-white cursor-pointer overflow-hidden w-full md:w-[280px] h-[280px] flex items-center justify-center"
                >
                  <motion.img
                    layout
                    src={img.src}
                    alt={`Industria ${i + 1}`}
                    className="object-contain max-h-[220px]"
                  />
                  <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center px-4 text-center text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {img.textoHover}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default IndustriaPage;
