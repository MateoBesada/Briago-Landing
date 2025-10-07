import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { productosPinturas } from "@/data/Pinturas";
import { productosAutomotor } from "@/data/Automotor";
import { productosAbrasivos } from "@/data/Abrasivos";
import { productosAccesorios } from "@/data/Accesorios";
import { productosPulidos } from "@/data/Pulidos";
import type { Producto } from "@/types/Producto";
import toast from "react-hot-toast";

const todosLosProductos: Producto[] = [
  ...productosPinturas,
  ...productosAutomotor,
  ...productosAbrasivos,
  ...productosAccesorios,
  ...productosPulidos,
];

const getPrecioFinal = (producto: Producto): number => {
  if (producto.precio !== undefined) return producto.precio;
  if (producto.precioOriginal && producto.off)
    return Math.round(producto.precioOriginal * (1 - producto.off / 100));
  return producto.precioOriginal ?? 0;
};

interface RelatedProductsProps {
  categoria: string;
  currentId: string;
}

export default function RelatedProducts({ categoria, currentId }: RelatedProductsProps) {
  const { addItem } = useCart();

  const currentBase = todosLosProductos.find(
    p => p.id === currentId || p.variantes?.some(v => v.id === currentId)
  );

  const variantesIds = currentBase?.variantes?.map(v => v.id) ?? [];
  const idsAExcluir = new Set([currentBase?.id, ...variantesIds]);

  let related = todosLosProductos.filter(
    p => p.categoria === categoria && !idsAExcluir.has(p.id)
  );

  if (related.length < 6) {
    const adicionales = todosLosProductos.filter(
      p => !idsAExcluir.has(p.id) && !related.includes(p)
    );
    related = [...related, ...adicionales].slice(0, 6);
  } else {
    related = related.slice(0, 6);
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">También puede interesarte</h2>

      {/* Desktop: grid de 3 productos */}
      <div className="hidden sm:grid grid-cols-3 gap-4 max-w-[730px]">
        {related.slice(0, 3).map(p => {
          const precioFinal = getPrecioFinal(p) ?? 0;
          return (
            <div
              key={p.id}
              className="border rounded p-2 hover:shadow flex flex-col justify-between bg-white"
            >
              <Link to={`/producto/${p.id}`} className="block">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  loading="lazy"
                  className="w-full h-32 object-contain mb-2 transition-transform duration-300 hover:scale-105"
                />
                <p className="text-sm font-medium text-gray-800 line-clamp-2 h-10">{p.nombre}</p>
              </Link>
              <p className="text-sm font-bold text-yellow-600 mt-1">
                {precioFinal.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                })}
              </p>
              <button
                onClick={() => {
                  addItem({
                    ...p,
                    cantidad: 1,
                    precioFinal,
                    precio: precioFinal,
                  });
                  toast.success("Producto agregado al carrito");
                }}
                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded shadow active:animate-wiggle"
              >
                Agregar al carrito
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile: carrusel horizontal con scroll suave */}
      <div className="sm:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory px-1">
        <div className="flex gap-4">
          {related.map(p => {
            const precioFinal = getPrecioFinal(p) ?? 0;
            return (
              <div
                key={p.id}
                className="min-w-[260px] max-w-[260px] bg-white rounded shadow border flex flex-col snap-start overflow-hidden"
              >
                <div className="flex gap-3 p-3 items-center">
                  {/* Imagen izquierda */}
                  <Link to={`/producto/${p.id}`} className="w-1/2">
                    <img
                      src={p.imagen}
                      alt={p.nombre}
                      loading="lazy"
                      className="w-full h-24 object-contain"
                    />
                  </Link>
                  {/* Info derecha */}
                  <div className="w-1/2 flex flex-col justify-between">
                    <Link to={`/producto/${p.id}`} className="block">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 h-10">
                        {p.nombre}
                      </p>
                    </Link>
                    <p className="text-sm font-bold text-yellow-600 mt-1">
                      {precioFinal.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
                {/* Botón abajo */}
                <div className="p-2 border-t">
                  <button
                    onClick={() => {
                      addItem({
                        ...p,
                        cantidad: 1,
                        precioFinal,
                        precio: precioFinal,
                      });
                      toast.success("Producto agregado al carrito");
                    }}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded shadow active:animate-wiggle"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}