import { useEffect, useMemo, useState } from 'react';
import { productosAbrasivos } from '../data/Abrasivos';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import { useFiltrosProductos } from '@/hooks/useFiltrosProductos';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';


const aplicarDescuento = (p: Producto): Producto =>
  p.precioOriginal && p.off != null
    ? { ...p, precio: Math.round(p.precioOriginal - p.precioOriginal * (p.off / 100)) }
    : p;

export default function AbrasivosPage() {
  useCart();
  const [filtroAbrasivo, setFiltroAbrasivo] = useState<string | null>(null);

  useEffect(() => window.scrollTo(0, 0), []);

  const productosConPrecio = useMemo(
    () => productosAbrasivos.map(aplicarDescuento),
    []
  );

  const {
    filtroActivo,
    setFiltroActivo,
    productosFiltrados,
    filtrosDisponibles,
  } = useFiltrosProductos(productosConPrecio);

  const [] = useState<Record<string, boolean>>({});


  const productosFiltradosFinal = useMemo<[string, Producto[]][]>(() => {
    if (!filtroAbrasivo) return productosFiltrados;

    return productosFiltrados
      .map(([base, prods]) => {
        const filtrados = prods.filter(p => p.abrasivo === filtroAbrasivo);
        return filtrados.length > 0 ? [base, filtrados] as [string, Producto[]] : null;
      })
      .filter((item): item is [string, Producto[]] => item !== null);
  }, [productosFiltrados, filtroAbrasivo]);

  return (
  <div className="bg-gray-100 min-h-screen px-2 py-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filtros + Botones */}
        <div className="w-full md:w-80">
          <div className="md:sticky md:top-28 flex flex-col gap-6">
            <Filtros
              filtros={filtrosDisponibles}
              filtroActivo={filtroActivo}
              onFiltroChange={setFiltroActivo}
              productos={productosConPrecio}
              titulo="ABRASIVOS"
            />

            {/* Botones de Disco y Tela debajo de filtros */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  setFiltroAbrasivo(filtroAbrasivo === 'Disco' ? null : 'Disco')
                }
                className={`group relative h-44 border border-black bg-white flex flex-col justify-center items-center overflow-hidden transition ${
                  filtroAbrasivo === 'Disco' ? 'ring-2 ring-[#fff03b]' : ''
                }`}
              >
                <div className="relative z-10 flex-1 flex items-center justify-center w-full bg-white overflow-hidden border-b border-black">
                  <div className="absolute inset-0 bg-[#fff03b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
                  <img
                    src="/img/Otros/Captura de pantalla 2025-07-03 155242-Photoroom.png"
                    alt="Lijas en Disco"
                    className="h-32 object-contain relative z-10"
                  />
                </div>
                <div className="relative z-10 py-2">
                  <span className="text-md font-semibold text-black">Lijas en DISCO</span>
                </div>
              </button>

              <button
                onClick={() =>
                  setFiltroAbrasivo(filtroAbrasivo === 'Tela' ? null : 'Tela')
                }
                className={`group relative h-44 border border-black bg-white flex flex-col justify-center items-center overflow-hidden transition ${
                  filtroAbrasivo === 'Tela' ? 'ring-2 ring-[#fff03b]' : ''
                }`}
              >
                <div className="relative z-10 flex-1 flex items-center justify-center w-full bg-white overflow-hidden border-b border-black">
                  <div className="absolute inset-0 bg-[#fff03b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
                  <img
                    src="/img/Otros/Captura de pantalla 2025-07-03 155213-Photoroom.png"
                    alt="Lijas en Tela"
                    className="h-32 object-contain relative z-10"
                  />
                </div>
                <div className="relative z-10 py-2">
                  <span className="text-md font-semibold text-black">Lijas en TELA</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="flex-grow flex flex-col gap-4">
          {productosFiltradosFinal.length === 0 ? (
            <p className="text-center text-gray-500 text-lg mt-10 w-full">
              No se encontraron productos que coincidan con los filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosFiltradosFinal.map(([base, vars]) => (
                <ProductoCard key={base} variantes={vars} baseNombre={base} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}