import clsx from "clsx";
import type { Producto } from "@/types/Producto";
import { useEffect, useMemo, useState } from "react";
import ImageZoom from "@/components/ImageZoom";

interface ProductMainInfoProps {
  producto: Producto;
  mainImage: string;
  setMainImage: (img: string) => void;
  descripcionRef: React.RefObject<HTMLParagraphElement | null>;
  mostrarDescripcionCompleta: boolean;
  setMostrarDescripcionCompleta: (show: boolean) => void;
  logosMarca: Record<string, string>;
  normalizarMarca: (marca: string) => string;
  varianteSeleccionada: Producto;
  setVarianteSeleccionada: (variante: Producto) => void;
}

const AEROSOLES_GENERICOS = [
  "/img/Aerosoles/MTN94-SinBG.png",
  "/img/Aerosoles/MTNHardcore-SinBg.png"
];

export default function ProductMainInfo({
  producto,
  mainImage,
  setMainImage,
  descripcionRef,
  mostrarDescripcionCompleta,
  setMostrarDescripcionCompleta,
  logosMarca,
  normalizarMarca,
  varianteSeleccionada,
  setVarianteSeleccionada,
}: ProductMainInfoProps) {
  if (!producto) return null;

  const [tieneOverflow, setTieneOverflow] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const element = descripcionRef.current;
      if (element) {
        const hayOverflow = element.scrollHeight > element.clientHeight;
        setTieneOverflow(hayOverflow);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [descripcionRef, producto.descripcion]);

  const variantesDeColor = producto.variantes?.filter(v => !!v.colorHex) ?? [];

  const imagenes = useMemo(() => {
    const setDeImagenes = new Set<string>();
    if (producto.imagen) {
      setDeImagenes.add(producto.imagen);
    }
    if (producto.imgOpcionales) {
      producto.imgOpcionales.forEach(img => setDeImagenes.add(img));
    }
    return Array.from(setDeImagenes);
  }, [producto]);

  const handleThumbnailClick = (img: string) => {
    setMainImage(img);
  }

  const handleColorClick = (varianteColor: Producto) => {
    setVarianteSeleccionada(varianteColor);
    setMainImage(varianteColor.imagen);
  }

  const nombreColorSeleccionado =
    varianteSeleccionada.ColorAerosol ||
    varianteSeleccionada.color ||
    'Seleccioná un color';

  const usarVistaDeColorDinamico =
    AEROSOLES_GENERICOS.includes(varianteSeleccionada.imagen ?? '') &&
    !!varianteSeleccionada.colorHex;

  return (
    <div className="flex flex-col gap-8 md:basis-[60%] max-w-[100%] md:max-w-[60%]">
      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Miniaturas */}
        <div className="flex flex-row md:flex-col gap-3 md:max-h-[500px] overflow-auto pr-2 custom-scrollbar">
          {imagenes.map((img, idx) => (
            <div key={idx} className="flex-shrink-0">
              <img
                src={img}
                alt={`${producto.nombre} ${idx + 1}`}
                onClick={() => handleThumbnailClick(img)}
                className={clsx(
                  "w-16 h-16 md:w-20 md:h-20 object-contain bg-gray-50 rounded-xl cursor-pointer transition-all duration-200",
                  mainImage === img
                    ? "ring-2 ring-[#fff03b] ring-offset-2"
                    : "hover:bg-gray-100 opacity-70 hover:opacity-100"
                )}
              />
            </div>
          ))}
        </div>

        {/* --- 2. SECCIÓN DE IMAGEN PRINCIPAL ACTUALIZADA --- */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] bg-white rounded-3xl overflow-hidden group">
          {usarVistaDeColorDinamico ? (
            <>
              <div
                className="absolute inset-0 transition-colors duration-300"
                style={{ backgroundColor: varianteSeleccionada.colorHex }}
              />
              {/* Se usa ImageZoom para la vista de aerosoles */}
              <ImageZoom
                key={varianteSeleccionada.id}
                src={varianteSeleccionada.imagen}
                alt={varianteSeleccionada.nombre || producto.nombre}
                className="absolute inset-0 w-full h-full p-8 z-10 object-contain mix-blend-multiply"
                galleryImages={imagenes}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50/50">
              {/* Se usa ImageZoom para la vista normal */}
              <ImageZoom
                key={mainImage}
                src={mainImage}
                alt={varianteSeleccionada.nombre || producto.nombre}
                className="w-full h-full p-6 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                galleryImages={imagenes} // Se pasa el array de imágenes
              />
            </div>
          )}
          {producto.marca && logosMarca[normalizarMarca(producto.marca)] && (
            <img
              src={logosMarca[normalizarMarca(producto.marca)]}
              alt={producto.marca}
              className="absolute top-4 left-4 w-16 h-auto opacity-50 z-20 pointer-events-none mix-blend-multiply"
            />
          )}
        </div>
      </div>

      {/* Selector de Colores (sin cambios) */}
      {variantesDeColor.length > 0 && (
        <div className="space-y-3">
          <p className="font-bold text-sm text-black uppercase tracking-wide">
            Color Seleccionado: <span className="text-gray-600 font-medium normal-case">{nombreColorSeleccionado}</span>
          </p>
          <div className="overflow-x-auto pb-2 -mb-2 custom-scrollbar">
            <div className="flex flex-nowrap gap-3">
              {variantesDeColor.map((variante) => (
                <button
                  key={variante.id}
                  onClick={() => handleColorClick(variante)}
                  className="flex-shrink-0 w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none shadow-sm"
                  style={{
                    backgroundColor: variante.colorHex,
                    boxShadow: variante.id === varianteSeleccionada.id
                      ? '0 0 0 2px white, 0 0 0 4px #000'
                      : 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                  aria-label={`Seleccionar color ${variante.ColorAerosol || variante.color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Descripción */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h3 className="font-bold text-lg text-black">
          Descripción
        </h3>
        <div className="relative">
          <p
            ref={descripcionRef as React.RefObject<HTMLParagraphElement>}
            className={clsx(
              "text-gray-600 leading-relaxed whitespace-pre-line text-base",
              !mostrarDescripcionCompleta && "line-clamp-4"
            )}
          >
            {producto.descripcion || "Sin descripción disponible."}
          </p>
          {producto.descripcion && tieneOverflow && (
            <button
              className="mt-3 text-black font-bold hover:text-gray-500 text-sm uppercase tracking-wide transition-colors flex items-center gap-1"
              onClick={() => setMostrarDescripcionCompleta(!mostrarDescripcionCompleta)}
            >
              {mostrarDescripcionCompleta ? "Mostrar menos" : "Leer descripción completa"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}