import { useState, useMemo, useEffect } from 'react';
// 1. Se añaden 'useNavigate'
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productosAutomotor as productos } from '../data/Automotor';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/Producto';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from "@/components/SeccionesTabs";
import BannerSata from "@/components/SataFeaturedBanner";

function AutomotorPage() {
  useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook para actualizar la URL

  // 2. Se elimina el useEffect que forzaba el scroll al inicio en cada carga
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  // 3. Se lee el número de página desde la URL al cargar
  const paginaInicial = parseInt(searchParams.get("pagina") || "1", 10);
  const marcaInicial = searchParams.get("marca");
  const categoriaInicial = searchParams.get("categoria");

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
    (agrupados[base] ??= []).push(p);
  });

  const [filtroActivo, _setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
  }>({ categoria: null, marca: null });

  useEffect(() => {
    _setFiltroActivo({
      categoria: categoriaInicial,
      marca: marcaInicial,
    });
  }, [categoriaInicial, marcaInicial]);

  // 4. Se inicializa el estado de la página con el valor de la URL
  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const productosPorPagina = 20;

  // 5. Se crea una nueva función para cambiar de página que también actualiza la URL
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

  const setFiltroActivo = (nuevoFiltro: {
    categoria: string | null;
    marca: string | null;
  }) => {
    _setFiltroActivo(nuevoFiltro);
    cambiarPagina(1); // Usamos la nueva función para resetear a página 1
  };

  // Se elimina el useEffect que hacía scroll al cambiar 'paginaActual'

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
    productosConPrecio.forEach((p) => {
      if ((!filtroActivo.marca || p.marca === filtroActivo.marca) && p.categoria) {
        catSet.add(p.categoria);
      }
      if ((!filtroActivo.categoria || p.categoria === filtroActivo.categoria) && p.marca) {
        marcaSet.add(p.marca);
      }
    });
    return {
      filtrosDisponibles: {
        categoria: [...catSet],
        marca: [...marcaSet],
      },
    };
  }, [productosConPrecio, filtroActivo]);

  return (
    <div className="bg-gray-100 min-h-screen px-2 py-8">
      <div className="max-w-7xl mx-auto">
        <SeccionesTabs />
        <BannerSata />
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-80 md:self-start">
            <Filtros
              filtros={filtrosDisponibles}
              filtroActivo={filtroActivo}
              onFiltroChange={setFiltroActivo}
              productos={productosConPrecio}
              titulo="AUTOMOTOR"
            />
          </aside>
          <main className="flex-grow">
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
                  <div className="flex justify-center mt-10">
                    <div className="flex gap-2 flex-wrap">
                      {/* --- 6. Se usan las nuevas funciones en los botones de paginación --- */}
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

export default AutomotorPage;