import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productosAbrasivos } from '../data/Abrasivos';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from "@/components/SeccionesTabs";

export default function AbrasivosPage() {
  useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const filtroInicial = searchParams.get("filtro");
  const paginaInicial = parseInt(searchParams.get("pagina") || "1", 10);
  const [filtroAbrasivo, setFiltroAbrasivo] = useState<string | null>(null);

  const aplicarDescuento = (p: Producto): Producto =>
    p.precioOriginal && p.off != null
      ? { ...p, precio: Math.round(p.precioOriginal - p.precioOriginal * (p.off / 100)) }
      : p;

  const productosConPrecio = useMemo(
    () => productosAbrasivos.map(aplicarDescuento),
    []
  );

  const agrupados: Record<string, Producto[]> = {};
  productosConPrecio.forEach((p) => {
    const base = p.nombre
      .replace(/\d+[.,]?\d*\s*(Litros?|Kg|Kilos?|Lts|Lt)/gi, '')
      .replace(/\d+/, '')
      .trim();
    (agrupados[base] ??= []).push(p);
  });

  const [filtroActivo, setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
  }>({ categoria: null, marca: null });

  useEffect(() => {
    if (filtroInicial) {
      setFiltroActivo((prev) => ({ ...prev, categoria: filtroInicial }));
    }
  }, [filtroInicial]);

  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const productosPorPagina = 20;

  const productosFiltrados = Object.entries(agrupados).filter(([_, vars]) =>
    vars.some(
      (v) =>
        (!filtroActivo.categoria || v.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || v.marca === filtroActivo.marca) &&
        (!filtroAbrasivo || v.abrasivo === filtroAbrasivo)
    )
  );

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    const totalPaginasCalc = Math.ceil(productosFiltrados.length / productosPorPagina);
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginasCalc) {
      setPaginaActual(nuevaPagina);
      const nuevosParams = new URLSearchParams(searchParams);
      nuevosParams.set("pagina", nuevaPagina.toString());
      navigate(`?${nuevosParams.toString()}`, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { filtrosDisponibles } = useMemo(() => {
    const catSet = new Set<string>();
    const marcaSet = new Set<string>();

    productosConPrecio.forEach((p) => {
      const matchMarca = !filtroActivo.marca || p.marca === filtroActivo.marca;
      const matchCategoria = !filtroActivo.categoria || p.categoria === filtroActivo.categoria;
      const matchAbrasivo = !filtroAbrasivo || p.abrasivo === filtroAbrasivo;

      if (matchMarca && matchAbrasivo && p.categoria) catSet.add(p.categoria);
      if (matchCategoria && matchAbrasivo && p.marca) marcaSet.add(p.marca);
    });

    return {
      filtrosDisponibles: {
        categoria: [...catSet],
        marca: [...marcaSet],
      },
    };
  }, [productosConPrecio, filtroActivo, filtroAbrasivo]);

  return (
    <div className="bg-gray-100 min-h-screen px-2 py-8">
      <div className="max-w-7xl mx-auto">
        <SeccionesTabs />
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-80 md:self-start">
            <Filtros
              filtros={filtrosDisponibles}
              filtroActivo={filtroActivo}
              onFiltroChange={(nuevoFiltro) => {
                setFiltroActivo(nuevoFiltro);
                cambiarPagina(1);
              }}
              productos={productosConPrecio}
              titulo="ABRASIVOS"
            />

            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => {
                  setFiltroAbrasivo(filtroAbrasivo === 'Disco' ? null : 'Disco');
                  cambiarPagina(1);
                }}
                className={`group relative h-44 border border-black bg-white flex flex-col justify-center items-center overflow-hidden transition ${filtroAbrasivo === 'Disco' ? 'ring-2 ring-[#fff03b]' : ''
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
                onClick={() => {
                  setFiltroAbrasivo(filtroAbrasivo === 'Tela' ? null : 'Tela');
                  cambiarPagina(1);
                }}
                className={`group relative h-44 border border-black bg-white flex flex-col justify-center items-center overflow-hidden transition ${filtroAbrasivo === 'Tela' ? 'ring-2 ring-[#fff03b]' : ''
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
          </aside>

          <main className="flex-grow">
            {productosFiltrados.length === 0 ? (
              <p className="text-center text-gray-500 text-lg mt-10 w-full">
                No se encontraron productos que coincidan con los filtros.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productosPaginados.map(([base, vars]) => (
                    <ProductoCard key={base} variantes={vars} baseNombre={base} />
                  ))}
                </div>
                {totalPaginas > 1 && (
                  <div className="flex justify-center mt-10">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="px-3 py-1 rounded border bg-white border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => cambiarPagina(i + 1)}
                          className={`w-10 h-10 rounded ${paginaActual === i + 1
                            ? 'bg-yellow-400 text-black font-bold'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="px-3 py-1 rounded border bg-white border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}