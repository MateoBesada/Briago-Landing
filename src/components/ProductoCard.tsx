import { useState } from "react";
import { Link } from "react-router-dom";
import { type Producto } from "@/types/Producto";

type Props = {
  variantes: Producto[];
  baseNombre: string;
};

export default function ProductoCard({ variantes }: Props) {
  const [activo] = useState(variantes[0]);


  const porcentajeOff =
    activo.precioOriginal != null && activo.precio != null
      ? Math.round(
          ((activo.precioOriginal - activo.precio) / activo.precioOriginal) * 100
        )
      : null;

  return (
    <Link
      to={`/producto/${activo.id}`}
      className="rounded-2xl shadow-md transition-all duration-300 flex flex-col w-[193px] sm:w-[209px] h-[420px] border border-gray-300 bg-white font-gotham relative overflow-hidden hover:shadow-lg hover:border-neutral-800 ease-in-out"
    >

  {porcentajeOff !== null && (
  <div className="absolute top-2 left-[-6px] z-10 rotate-[-10deg]">
    <div className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white text-[12px] font-extrabold px-3 py-1 rounded-r-full shadow-xl border border-white tracking-wide drop-shadow-sm">
      {porcentajeOff}% OFF
    </div>
  </div>
)}


  {/* Imagen */}
  <div className="relative h-[180px] flex items-center justify-center border-b bg-white">
    <img
      src={activo.imagen}
      alt={`Imagen de ${activo.nombre}`}
      className="max-h-[150px] object-contain transition duration-300"
    />
  </div>

  {/* Info del producto */}
  <div className="p-3 flex flex-col justify-between flex-grow text-sm text-center">
    <div className="mb-2">
      <h2 className="font-semibold text-gray-900 text-[15px] leading-tight transition whitespace-normal">
        {activo.nombre}
      </h2>
      <p className="text-blue-700 font-medium text-[13px] mt-1">{activo.marca}</p>
    </div>

    {/* Línea divisoria */}
    <hr className="border-t border-gray-300 my-2 w-3/4 mx-auto" />

    {/* Precios */}
    <div className="mt-auto flex flex-col gap-[2px] text-center">
      {activo.precioOriginal != null && (
        <span className="line-through text-gray-500 text-[13px]">
          ${activo.precioOriginal.toLocaleString("es-AR")}
        </span>
      )}

      <span className="text-[18px] font-bold text-gray-900">
        {activo.precio != null
          ? `$${activo.precio.toLocaleString("es-AR")}`
          : "Precio no disponible"}
      </span>

      {activo.precioOriginal != null && activo.precio != null && (
  <div className="text-green-700 text-[12px] font-semibold mt-0.5">
    <span className="bg-green-100 px-2 py-0.5 rounded-full">
      Ahorrás ${(
        activo.precioOriginal - activo.precio
      ).toLocaleString("es-AR")}
    </span>
  </div>
)}
    </div>
  </div>
  <p className="text-[11px] text-gray-500 text-center italic mt- mb-2 px-2">
  Click para ver más variantes
</p>
</Link>
  );
}
