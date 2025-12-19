import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Producto } from "@/types/Producto";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

type Props = {
  variantes: Producto[];
  baseNombre: string;
};

export default function ProductoCard({ variantes }: Props) {
  const { addItem } = useCart();
  const {
    mejorVariant,
    mejorPrecio,
    precioOriginal,
    porcentajeOff,
  } = useMemo(() => {
    // 1. Calcular precio real para cada variante
    const opciones = variantes
      .map((v) => {
        const rawPrice = v.precio ?? v.precioOriginal ?? 0;
        const rawOriginal = v.precioOriginal ?? rawPrice;
        const off = v.off ?? 0;

        let finalPrice = rawPrice;

        if (off > 0 && rawOriginal > 0) {
          finalPrice = Math.round(rawOriginal * (1 - off / 100));
        }

        return {
          variant: v,
          precio: finalPrice,
          original: rawOriginal,
          off: off,
        };
      })
      .filter(op => op.precio > 0);

    if (opciones.length === 0) {
      return {
        mejorVariant: variantes[0],
        mejorPrecio: 0,
        precioOriginal: null,
        porcentajeOff: null,
        ahorro: null,
      };
    }

    // 2. Encontrar la mejor opción (menor precio)
    const mejor = opciones.reduce((acc, val) =>
      val.precio < acc.precio ? val : acc
      , opciones[0]);

    // 3. Calcular datos finales
    const tieneDescuento = mejor.off > 0 || mejor.original > mejor.precio;
    const finalOff = mejor.off > 0
      ? mejor.off
      : (mejor.original > mejor.precio ? Math.round(((mejor.original - mejor.precio) / mejor.original) * 100) : null);

    return {
      mejorVariant: mejor.variant,
      mejorPrecio: mejor.precio,
      precioOriginal: tieneDescuento ? mejor.original : null,
      porcentajeOff: finalOff,
      ahorro: tieneDescuento ? mejor.original - mejor.precio : null,
    };
  }, [variantes]);

  // Usamos la mejor variante calculada en lugar del estado inicial fijo
  const activo = mejorVariant;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      ...activo,
      cantidad: 1,
      precioFinal: mejorPrecio,
      precio: mejorPrecio,
    });
    toast.success("Producto agregado al carrito");
  };

  return (
    <Link
      to={`/producto/${activo.id}`}
      className="group bg-white relative overflow-hidden flex flex-col w-full max-w-[220px] mx-auto h-[440px] rounded-3xl transition-all duration-300 hover:shadow-2xl"
    >
      {/* Badge de descuento - Diseño Premium Amarillo Top-Right */}
      {porcentajeOff !== null && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-green-200 text-black font-black text-sm px-3 py-1.5 rounded-bl-2xl shadow-sm border-l border-b border-black/5">
            {porcentajeOff}% OFF
          </div>
        </div>
      )}

      {/* Imagen con fondo sutil */}
      <div className="relative h-[220px] flex items-center justify-center group-hover:bg-[#fff03b]/5 transition-colors duration-500 rounded-t-3xl overflow-hidden p-6">
        <img
          src={activo.imagen}
          alt={`Imagen de ${activo.nombre}`}
          className="max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-multiply"
        />
      </div>

      {/* Info Content */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          {/* Marca */}
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">
            {activo.marca}
          </p>
          {/* Nombre */}
          <h2
            className="font-bold text-black text-[15px] leading-snug mb-2"
            title={activo.nombre}
          >
            {activo.nombre}
          </h2>
        </div>

        {/* Precios y Botón */}
        <div className="mt-auto space-y-3">
          <div className="flex flex-col items-start gap-1">
            {precioOriginal && (
              <span className="line-through text-gray-400 text-sm font-medium">
                ${precioOriginal.toLocaleString("es-AR")}
              </span>
            )}

            <div className="flex flex-col w-full">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-black tracking-tight">
                  ${mejorPrecio.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full bg-black text-white font-bold text-xs py-3 rounded-xl hidden md:flex items-center justify-center gap-2 hover:bg-[#fff03b] hover:text-black transition-all duration-300 shadow-md group-hover:shadow-lg active:scale-95 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingCart size={14} />
            AGREGAR CARRITO
          </button>
        </div>
      </div>
    </Link>
  );
}