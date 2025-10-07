import clsx from "clsx";
import type { Producto } from "@/types/Producto";
import { useEffect, useMemo, useState } from "react";
import ImageZoom from "@/components/ImageZoom"; // <-- 1. Se importa el nuevo componente

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
    <div className="flex flex-col gap-4 md:gap-6 md:basis-[60%] max-w-[100%] md:max-w-[60%]">
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Miniaturas */}
        <div className="flex flex-row md:flex-col gap-2 md:max-h-[480px] overflow-auto pr-2 custom-scrollbar">
          {imagenes.map((img, idx) => (
            <div key={idx} className="p-1 flex-shrink-0">
              <img
                src={img}
                alt={`${producto.nombre} ${idx + 1}`}
                onClick={() => handleThumbnailClick(img)}
                className={clsx(
                  "w-16 h-16 md:w-20 md:h-20 object-cover border-2 rounded-md cursor-pointer transition",
                  mainImage === img ? "border-yellow-500" : "border-transparent hover:border-yellow-300"
                )}
              />
            </div>
          ))}
        </div>

        {/* --- 2. SECCIÓN DE IMAGEN PRINCIPAL ACTUALIZADA --- */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-[480px] border rounded-xl shadow-sm">
          {usarVistaDeColorDinamico ? (
            <>
              <div
                className="absolute inset-0 rounded-xl transition-colors duration-300"
                style={{ backgroundColor: varianteSeleccionada.colorHex }}
              />
              {/* Se usa ImageZoom para la vista de aerosoles */}
              <ImageZoom
                key={varianteSeleccionada.id}
                src={varianteSeleccionada.imagen}
                alt={varianteSeleccionada.nombre || producto.nombre}
                className="absolute inset-0 w-full h-full p-4 z-10"
                galleryImages={imagenes}
              />
            </>
          ) : (
            <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
              {/* Se usa ImageZoom para la vista normal */}
              <ImageZoom
                key={mainImage}
                src={mainImage}
                alt={varianteSeleccionada.nombre || producto.nombre}
                className="w-full h-full p-4"
                galleryImages={imagenes} // Se pasa el array de imágenes
              />
            </div>
          )}
          {producto.marca && logosMarca[normalizarMarca(producto.marca)] && (
            <img
              src={logosMarca[normalizarMarca(producto.marca)]}
              alt={producto.marca}
              className="absolute top-3 left-3 w-20 h-auto opacity-70 z-20 pointer-events-none" 
            />
          )}
        </div>
      </div>

      {/* Selector de Colores (sin cambios) */}
      {variantesDeColor.length > 0 && (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="font-semibold text-sm text-gray-800 mb-3">
            Color: <span className="font-normal text-gray-600">{nombreColorSeleccionado}</span>
          </p>
          <div className="overflow-x-auto pb-2 -mb-2 custom-scrollbar py-2 px-2">
            <div className="flex flex-nowrap gap-3">
              {variantesDeColor.map((variante) => (
                <button
                  key={variante.id}
                  onClick={() => handleColorClick(variante)}
                  className="flex-shrink-0 w-10 h-10 rounded-full border-2 transition-transform duration-200 hover:scale-110 focus:outline-none"
                  style={{
                    backgroundColor: variante.colorHex,
                    outline: variante.id === varianteSeleccionada.id ? '2px solid #FBBF24' : 'none',
                    outlineOffset: '2px'
                  }}
                  aria-label={`Seleccionar color ${variante.ColorAerosol || variante.color}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Descripción (sin cambios) */}
      <div className="bg-white border rounded-xl p-5 text-sm shadow-sm text-gray-700">
        <p className="font-semibold text-base text-gray-800 mb-2">
          Descripción del producto:
        </p>
        <p
          ref={descripcionRef as React.RefObject<HTMLParagraphElement>}
          className={clsx(
            "whitespace-pre-line leading-relaxed transition-all duration-300",
            !mostrarDescripcionCompleta && "line-clamp-3"
          )}
        >
          {producto.descripcion || "Sin descripción disponible."}
        </p>
        {producto.descripcion && tieneOverflow && (
          <button
            className="mt-2 text-blue-600 hover:underline text-xs font-semibold"
            onClick={() => setMostrarDescripcionCompleta(!mostrarDescripcionCompleta)}
          >
            {mostrarDescripcionCompleta ? "Leer menos" : "Leer más..."}
          </button>
        )}
      </div>
    </div>
  );
}