import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
  galleryImages?: string[];
}

export default function ImageZoom({ src, alt, className, galleryImages = [] }: ImageZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightBoxIndex, setCurrentLightBoxIndex] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index when src changes (so clicking a thumbnail updates the lightbox starting point)
  useEffect(() => {
    const idx = galleryImages.indexOf(src);
    if (idx !== -1) setCurrentLightBoxIndex(idx);
  }, [src, galleryImages]);

  // -- HOVER ZOOM LOGIC --
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  // -- LIGHTBOX LOGIC --
  const openLightbox = () => {
    setLightboxOpen(true);
    setLightboxScale(1);
    // Ensure we start at the current image
    const idx = galleryImages.indexOf(src);
    if (idx !== -1) setCurrentLightBoxIndex(idx);
    else setCurrentLightBoxIndex(0);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxScale(1);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentLightBoxIndex((prev) => (prev + 1) % galleryImages.length);
    setLightboxScale(1);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentLightBoxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setLightboxScale(1);
  };

  const currentLightboxImage = galleryImages[currentLightBoxIndex] || src;

  return (
    <>
      {/* --- INLINE ZOOM CONTAINER --- */}
      <div
        className={`relative overflow-hidden cursor-zoom-in ${className}`}
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-contain pointer-events-none"
          // We use Framer Motion for the smooth scale transition
          animate={{
            scale: isHovering ? 2 : 1,
          }}
          style={{
            transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
          }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
        />

        {/* Mobile/Touch Hint or Icon */}
        <div className="absolute bottom-3 right-3 lg:opacity-0 transition-opacity bg-white/80 p-1.5 rounded-full text-black pointer-events-none">
          <Maximize2 size={16} />
        </div>
      </div>

      {/* --- LIGHTBOX MODAL --- */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
              onClick={closeLightbox}
            >
              <X size={24} />
            </button>

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
                  onClick={prevImage}
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
                  onClick={nextImage}
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Image Container */}
            <div
              className="relative w-full h-full p-4 flex items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={currentLightboxImage} // Re-mount on image change for animation
                src={currentLightboxImage}
                alt={alt}
                className="max-w-full max-h-full object-contain select-none"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: lightboxScale }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                drag
                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                onDragStart={(e) => e.preventDefault()}
                style={{ cursor: lightboxScale > 1 ? 'grab' : 'zoom-in' }}
                onClick={() => setLightboxScale(s => s === 1 ? 2 : 1)} // Double tap/click to zoom
              />
            </div>

            {/* Zoom Controls (Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md z-50" onClick={e => e.stopPropagation()}>
              <button onClick={() => setLightboxScale(Math.max(1, lightboxScale - 0.5))} className="text-white hover:text-yellow-400 transition">
                <ZoomOut size={20} />
              </button>
              <span className="text-white font-mono text-sm w-12 text-center my-auto">{Math.round(lightboxScale * 100)}%</span>
              <button onClick={() => setLightboxScale(Math.min(4, lightboxScale + 0.5))} className="text-white hover:text-yellow-400 transition">
                <ZoomIn size={20} />
              </button>
            </div>

            {/* Counter */}
            {galleryImages.length > 1 && (
              <div className="absolute top-6 left-6 text-white/50 font-mono text-sm">
                {currentLightBoxIndex + 1} / {galleryImages.length}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}