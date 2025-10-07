import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Producto } from "@/types/Producto";

type Props = {
  variantes: Producto[];
  baseNombre: string;
};

export default function ProductoCard({ variantes }: Props) {
  const [activo] = useState(variantes[0]);

  const {
    mejorPrecio,
    precioOriginal,
    porcentajeOff,
    ahorro,
  } = useMemo(() => {
    const precios = variantes
      .map((v) => ({
        precio: v.precio ?? v.precioOriginal ?? 0,
        original: v.precioOriginal ?? v.precio ?? 0,
      }))
      .filter(p => p.precio > 0 && p.original > 0);

    if (precios.length === 0) {
      return {
        mejorPrecio: 0,
        precioOriginal: null,
        porcentajeOff: null,
        ahorro: null,
      };
    }

    const mejor = precios.reduce((acc, val) =>
      val.precio < acc.precio ? val : acc
    , precios[0]);

    const off = mejor.original > mejor.precio
      ? Math.round(((mejor.original - mejor.precio) / mejor.original) * 100)
      : null;

    return {
      mejorPrecio: mejor.precio,
      precioOriginal: mejor.original !== mejor.precio ? mejor.original : null,
      porcentajeOff: off,
      ahorro: off ? mejor.original - mejor.precio : null,
    };
  }, [variantes]);

  return (
    <Link
      to={`/producto/${activo.id}`}
      className="rounded-2xl shadow-md transition-all duration-300 flex flex-col w-[193px] sm:w-[209px] h-[420px] border border-gray-300 bg-white font-gotham relative overflow-hidden hover:shadow-lg hover:border-neutral-800 "
    >
      {/* Badge de descuento en verde */}
      {porcentajeOff !== null && (
  <div className="absolute top-3 left-3 z-10">
    <div className="bg-[#ffd426] text-gray-800 font-extrabold rounded-lg w-[46px] h-[46px] flex flex-col items-center justify-center shadow-md leading-tight">
      <span className="text-[19px]">{porcentajeOff}%</span>
      <span className="text-[11px] font-bold">OFF</span>
    </div>
  </div>
)}

      {/* Imagen */}
      <div className="relative h-[180px] flex items-center justify-center border-b bg-white">
        <img
          src={activo.imagen}
          alt={`Imagen de ${activo.nombre}`}
          className="max-h-[150px] object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col justify-between flex-grow text-sm text-center">
        <div className="mb-2">
          {/* Aquí sin line-clamp para mostrar título completo */}
          <h2
            className="font-semibold text-gray-900 text-[15px] leading-tight"
            title={activo.nombre}
          >
            {activo.nombre}
          </h2>
          <p className="text-blue-700 font-medium text-[13px] mt-1">
            {activo.marca}
          </p>
        </div>

        <hr className="border-t border-gray-300 my-2 w-3/4 mx-auto" />

        <div className="mt-auto flex flex-col gap-[2px] text-center">
          {precioOriginal && (
            <span className="line-through text-gray-500 text-[13px]">
              ${precioOriginal.toLocaleString("es-AR")}
            </span>
          )}

          <span className="text-[18px] font-bold text-gray-900">
            ${mejorPrecio.toLocaleString("es-AR")}
          </span>

          {ahorro && (
            <div className="text-yellow-700 text-[12px] font-semibold mt-0.5">
              <span className="bg-yellow-200 px-2 py-0.5 rounded-full">
                Ahorrás ${ahorro.toLocaleString("es-AR")}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 text-center italic mb-2 px-2">
        Click para ver más variantes
      </p>
    </Link>
  );
}
