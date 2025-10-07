import { useState, useMemo, useEffect } from 'react';
import { productosPulidos as productos } from '../data/Pulidos';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/Producto';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from '@/components/SeccionesTabs';

function PulidosPage() {
  useCart();
  useEffect(() => window.scrollTo(0, 0), []);

  const aplicarDescuento = (p: Producto): Producto => {
    const precio =
      p.precioOriginal && p.off != null
        ? Math.round(p.precioOriginal * (1 - p.off / 100))
        : p.precio;
    return { ...p, precio, variantes: p.variantes?.map(aplicarDescuento) };
  };
  const productosConPrecio = productos.map(aplicarDescuento);

  const agrupados: Record<string, Producto[]> = {};
  productosConPrecio.forEach((p) => {
    const base = p.nombre
      .replace(/\d+[.,]?\d*\s*(Litros?|Kg|Kilos?|Lts|Lt)/gi, '')
      .replace(/\d+/, '')
      .trim();
    (agrupados[base] ??= []).push(p, ...(p.variantes ?? []));
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

  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 20;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [paginaActual]);

  const productosFiltrados = Object.entries(agrupados).filter(([_, vars]) =>
    vars.some(
      (v) =>
        (!filtroActivo.categoria || v.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || v.marca === filtroActivo.marca)
    )
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
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
        total: productosFiltrados.reduce((acc, [_, vars]) => acc + vars.length, 0),
      },
    };
  }, [productosConPrecio, filtroActivo, productosFiltrados]);

  return (
    <div className="bg-gray-100 min-h-screen px-2 py-8">
      <SeccionesTabs />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-80">
            <div className="md:fixed md:top-28">
              <Filtros
                filtros={filtrosDisponibles}
                filtroActivo={filtroActivo}
                onFiltroChange={setFiltroActivo}
                productos={productosConPrecio}
                titulo="PULIDOS"
              />
            </div>
          </div>

          <div className="flex-grow">
            {productosFiltrados.length === 0 ? (
              <p className="text-center text-gray-500 text-lg mt-10 w-full">
                No se encontraron productos que coincidan con los filtros seleccionados.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productosPaginados.map(([base, vars]) => (
                    <ProductoCard key={base} variantes={vars} baseNombre={base} />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
                        disabled={paginaActual === 1}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ‹
                      </button>

                      {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setPaginaActual(i + 1)}
                          className={`px-4 py-2 rounded ${
                            paginaActual === i + 1
                              ? 'bg-yellow-300 text-black font-bold'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() =>
                          setPaginaActual((p) => Math.min(p + 1, totalPaginas))
                        }
                        disabled={paginaActual === totalPaginas}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PulidosPage;
