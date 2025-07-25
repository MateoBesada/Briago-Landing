import { useEffect, useMemo, useState } from 'react';
import { productosAccesorios as productos } from '../data/Accesorios';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import { useSearch } from '@/context/SearchContext';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';

const aplicarDescuento = (p: Producto): Producto =>
  p.precioOriginal && p.off != null
    ? { ...p, precio: Math.round(p.precioOriginal * (1 - p.off / 100)) }
    : p;

const limpiarNombre = (n: string): string =>
  n
    .replace(/\d+\s*(Litros?|Kg|Kilos?|cm|mm|unidades?|uds?)/gi, '')
    .replace(/\d+/, '')
    .trim();

export default function AccesoriosPage() {
  useSearch();
  useCart();

  useEffect(() => window.scrollTo(0, 0), []);

  const productosConPrecio = useMemo(() => productos.map(aplicarDescuento), []);

  const agrupados: Record<string, Producto[]> = {};
  productosConPrecio.forEach((p) => {
    const base = limpiarNombre(p.nombre);
    agrupados[base] ??= [];
    agrupados[base].push(p, ...(p.variantes ?? []));
  });

  const [] = useState<Record<string, Producto>>(() => {
    const ini: Record<string, Producto> = {};
    for (const base in agrupados) ini[base] = agrupados[base][0];
    return ini;
  });

  const [filtroActivo, setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
  }>({ categoria: null, marca: null });

  const productosFiltrados = Object.entries(agrupados).filter(([_, vars]) =>
    vars.some(
      (v) =>
        (!filtroActivo.categoria || v.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || v.marca === filtroActivo.marca),
    ),
  );

  const { filtrosDisponibles } = useMemo(() => {
    const catSet = new Set<string>();
    const marcaSet = new Set<string>();
    const catCnt: Record<string, number> = {};
    const marcaCnt: Record<string, number> = {};

    productosConPrecio.forEach((p) => {
      if (
        (!filtroActivo.marca || p.marca === filtroActivo.marca) &&
        p.categoria
      ) {
        catSet.add(p.categoria);
        catCnt[p.categoria] = (catCnt[p.categoria] || 0) + 1;
      }

      if (
        (!filtroActivo.categoria || p.categoria === filtroActivo.categoria) &&
        p.marca
      ) {
        marcaSet.add(p.marca);
        marcaCnt[p.marca] = (marcaCnt[p.marca] || 0) + 1;
      }
    });

    return {
      filtrosDisponibles: {
        categoria: [...catSet],
        marca: [...marcaSet],
      },
      cantidades: {
        categoria: catCnt,
        marca: marcaCnt,
      },
    };
  }, [productosConPrecio, filtroActivo]);

  return (
    <div className="bg-gray-100 min-h-screen px-2 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-80">
            <div className="md:fixed md:top-28">
              <Filtros
                filtros={filtrosDisponibles}
                filtroActivo={filtroActivo}
                onFiltroChange={setFiltroActivo}
                productos={productosConPrecio}
                titulo="ACCESORIOS"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 text-lg mt-10 w-full">
              No se encontraron productos que coincidan con los filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 flex-grow">
              {productosFiltrados.map(([base, variantes]) => (
                <ProductoCard key={base} variantes={variantes} baseNombre={base} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
