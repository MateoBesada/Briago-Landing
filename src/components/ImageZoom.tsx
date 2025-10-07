import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Expand, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  galleryImages?: string[]; // <-- Nueva prop para el array de imágenes
}

const ImageZoom = ({ src, alt, className, galleryImages = [] }: ImageZoomProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // <-- Nuevo estado para el índice
  const imageWrapperRef = useRef<HTMLDivElement>(null); // Referencia al contenedor que delimita el arrastre
  const imageRef = useRef<HTMLImageElement>(null); // Referencia a la imagen misma

  // Sincroniza el currentImageIndex con la prop `src` inicial cuando el componente se monta
  useEffect(() => {
    const initialIndex = galleryImages.indexOf(src);
    if (initialIndex !== -1) {
      setCurrentImageIndex(initialIndex);
    }
  }, [src, galleryImages]);


  // Calcula los límites de arrastre basados en el scale y el tamaño del contenedor
  const calculateDragConstraints = useCallback(() => {
    if (!imageWrapperRef.current || !imageRef.current || scale <= 1) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const container = imageWrapperRef.current;
    const containerRect = container.getBoundingClientRect();

    // Las dimensiones del contenido real con el zoom aplicado
    const contentWidth = imageRef.current.offsetWidth * scale;
    const contentHeight = imageRef.current.offsetHeight * scale;

    // Cuánto del contenido se desborda del contenedor
    const overflowX = Math.max(0, contentWidth - containerRect.width);
    const overflowY = Math.max(0, contentHeight - containerRect.height);

    // Los límites son la mitad del desbordamiento en cada dirección
    return {
      top: -overflowY / 2,
      bottom: overflowY / 2,
      left: -overflowX / 2,
      right: overflowX / 2,
    };
  }, [scale, isZoomed]); // Depende del scale y si está haciendo zoom


  const resetZoomAndPosition = useCallback(() => {
    setScale(1);
    // Para que la imagen vuelva al centro al cambiar de imagen
    if (imageRef.current) {
        imageRef.current.style.transform = 'scale(1)'; // Resetea directamente el scale CSS
        imageRef.current.style.transformOrigin = 'center center'; // Resetea el origen del transform
    }
  }, []);


  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomIntensity = 0.15;
    let newScale = event.deltaY < 0 ? scale * (1 + zoomIntensity) : scale / (1 + zoomIntensity);
    newScale = Math.max(1, Math.min(4, newScale)); // Limitar el zoom entre 1x y 4x

    setScale(newScale);

    if (newScale === 1) {
      resetZoomAndPosition();
    } else {
      // Ajustar el origen de la transformación para hacer zoom en la posición del ratón
      // Esto es crucial para un zoom "libre" o "hacia el punto del cursor"
      const transformOriginX = (mouseX / rect.width) * 100;
      const transformOriginY = (mouseY / rect.height) * 100;
      imageRef.current.style.transformOrigin = `${transformOriginX}% ${transformOriginY}%`;
    }
  };


  const closeZoomModal = () => {
    setIsZoomed(false);
    setTimeout(() => {
      resetZoomAndPosition();
    }, 300);
  };


  // --- NUEVOS HANDLERS PARA NAVEGACIÓN ---
  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el modal se cierre
    resetZoomAndPosition(); // Resetea el zoom y posición de la imagen actual
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };
  
  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el modal se cierre
    resetZoomAndPosition(); // Resetea el zoom y posición de la imagen actual
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const currentDisplayedImageSrc = galleryImages[currentImageIndex] || src;


  return (
    <>
      <div className={`relative ${className} overflow-hidden rounded-xl group`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
        />
        <button
          onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
          className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-20"
          aria-label="Ampliar imagen"
        >
          <Expand className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
            onClick={closeZoomModal}
          >
            {/* Botón para cerrar */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 z-50"
              onClick={closeZoomModal}
              aria-label="Cerrar zoom"
            >
              <X className="w-6 h-6" />
            </motion.button>
            
            {/* Controles de Zoom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50 bg-black/50 backdrop-blur-sm p-2 rounded-full"
            >
              <button onClick={(e) => { e.stopPropagation(); setScale(prev => Math.min(4, prev + 0.2)); }} className="p-2 text-white rounded-full hover:bg-white/20" aria-label="Acercar">
                <ZoomIn className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setScale(prev => Math.max(1, prev - 0.2)); }} className="p-2 text-white rounded-full hover:bg-white/20" aria-label="Alejar">
                <ZoomOut className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); resetZoomAndPosition(); }} className="p-2 text-white rounded-full hover:bg-white/20" aria-label="Restablecer zoom">
                <RotateCcw className="w-6 h-6" />
              </button>
            </motion.div>

            {/* --- FLECHAS DE NAVEGACIÓN (NUEVAS) --- */}
            {galleryImages.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={goToPrevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={32} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
                  exit={{ opacity: 0, x: 20 }}
                  onClick={goToNextImage} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={32} />
                </motion.button>
              </>
            )}

            {/* Contenedor principal de la imagen en zoom */}
            <div
              ref={imageWrapperRef}
              className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Evita que se cierre el modal al hacer clic en la imagen
              onWheel={handleWheel} // El zoom con rueda del mouse
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentDisplayedImageSrc} // <-- CLAVE: Esto fuerza a Framer Motion a tratar cada imagen como nueva
                  ref={imageRef}
                  initial={{ opacity: 0, scale: 1 }} // La animación inicial es desde una escala 1
                  animate={{ opacity: 1, scale: scale }} // Anima a la escala actual (si hay zoom)
                  exit={{ opacity: 0, scale: 1 }} // Animación de salida antes de que entre la nueva imagen
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  src={currentDisplayedImageSrc}
                  alt={alt}
                  className="w-full h-full object-contain" // Utiliza object-contain para mostrar la imagen completa dentro del espacio
                  style={{ cursor: scale > 1 ? 'grab' : 'auto' }}
                  drag={scale > 1} // Solo se puede arrastrar si hay zoom
                  dragConstraints={calculateDragConstraints()} // Los límites de arrastre se calculan dinámicamente
                  dragElastic={0.1}
                  onDragStart={(e) => e.preventDefault()} // Previene el arrastre nativo del navegador
                  whileTap={{ cursor: 'grabbing' }}
                />
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageZoom;