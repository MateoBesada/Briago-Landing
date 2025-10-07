import { useState, useMemo, useEffect } from "react";
import { agruparPorNombreBase } from "@/utils/agruparProductos";
import { productosAutomotor } from "@/data/Automotor";
import { productosPinturas } from "@/data/Pinturas";
import { productosAbrasivos } from "@/data/Abrasivos";
import { productosPulidos } from "@/data/Pulidos";
import { productosAccesorios } from "@/data/Accesorios";
import ProductoCard from "@/components/ProductoCard";
import Filtros from "@/components/FiltrosLocales";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

import type { Producto } from "@/types/Producto";

const aplicarDescuento = (p: Producto): Producto => {
  const precio =
    p.precioOriginal && p.off != null
      ? Math.round(p.precioOriginal * (1 - p.off / 100))
      : p.precio;
  return {
    ...p,
    precio,
    variantes: p.variantes?.map(aplicarDescuento),
  };
};

const todosLosProductos: Producto[] = [
  ...productosAutomotor,
  ...productosPulidos,
  ...productosPinturas,
  ...productosAbrasivos,
  ...productosAccesorios,
].map(aplicarDescuento);

const categorias = Array.from(new Set(todosLosProductos.map(p => p.categoria)));
const marcas = Array.from(new Set(todosLosProductos.map(p => p.marca)));
const secciones = Array.from(
  new Set(
    todosLosProductos
      .map(p => p.seccion)
      .filter((s): s is string => typeof s === "string" && s.length > 0)
  )
);

function normalizar(txt: string) {
  return (txt || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export default function TodosLosProductos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paginaInicial = parseInt(searchParams.get("pagina") || "1", 10);

  const [filtroActivo, setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
    seccion: string | null;
  }>({
    categoria: searchParams.get("categoria"),
    marca: searchParams.get("marca"),
    seccion: searchParams.get("seccion"),
  });

  const [terminoBusqueda] = useState(searchParams.get("buscar") || "");
  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);
  const productosPorPagina = 24;
  
  useEffect(() => {
    const nuevosParams = new URLSearchParams(searchParams.toString());
    
    // Actualizar o eliminar los parámetros de filtro
    Object.entries(filtroActivo).forEach(([key, value]) => {
      if (value) {
        nuevosParams.set(key, value);
      } else {
        nuevosParams.delete(key);
      }
    });

    // Actualizar o eliminar el parámetro de página
    if (paginaActual > 1) {
      nuevosParams.set("pagina", paginaActual.toString());
    } else {
      nuevosParams.delete("pagina");
    }

    navigate(`?${nuevosParams.toString()}`, { replace: true });

  }, [filtroActivo, paginaActual, navigate, searchParams]);

  const productosFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizar(terminoBusqueda);
    return todosLosProductos.filter((p) => {
      const busquedaCoincide = busquedaNormalizada
        ? normalizar(p.nombre).includes(busquedaNormalizada) || normalizar(p.marca).includes(busquedaNormalizada)
        : true;
      return (
        busquedaCoincide &&
        (!filtroActivo.categoria || p.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || p.marca === filtroActivo.marca) &&
        (!filtroActivo.seccion || p.seccion === filtroActivo.seccion)
      );
    });
  }, [filtroActivo, terminoBusqueda]);

  const agrupados = useMemo(
    () => agruparPorNombreBase(productosFiltrados),
    [productosFiltrados]
  );

  const totalPaginas = Math.ceil(agrupados.length / productosPorPagina);
  const inicio = (paginaActual - 1) * productosPorPagina;
  const productosPaginados = agrupados.slice(inicio, inicio + productosPorPagina);

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFiltroChange = (nuevosFiltros: any) => {
    setFiltroActivo(nuevosFiltros);
    setPaginaActual(1);
  };
  
  return (
    <div className="bg-gray-100 py-6 px-4 md:px-6 lg:px-10 font-gotham">
      {/* --- CAMBIO AQUÍ: Añadimos 'md:items-start' --- */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
        
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 md:sticky md:top-28">
          <div className="md:hidden">
            <button
              onClick={() => setFiltrosVisibles(!filtrosVisibles)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm font-bold text-gray-800"
            >
              <SlidersHorizontal size={20} />
              <span>{filtrosVisibles ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            </button>
          </div>

          <div 
            className={`transition-all duration-300 ${
              filtrosVisibles ? "max-h-screen" : "max-h-0"
            } overflow-hidden md:max-h-none md:overflow-visible`}
          >
            <Filtros
              productos={todosLosProductos}
              filtros={{
                categoria: categorias,
                marca: marcas,
                seccion: secciones,
              }}
              filtroActivo={filtroActivo}
              onFiltroChange={handleFiltroChange}
              titulo="Filtrar Productos"
            />
          </div>
        </aside>

        <main className="flex-1">
          {terminoBusqueda && (
            <div className="mb-6 border-b pb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Resultados para: "{terminoBusqueda}"</h1>
            </div>
          )}

          {agrupados.length === 0 ? (
            <p className="text-gray-600 mt-8 text-center">No se encontraron productos.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productosPaginados.map(([baseNombre, variantes]) => (
                  <ProductoCard
                    key={baseNombre}
                    baseNombre={baseNombre}
                    variantes={variantes}
                  />
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
                        className={`w-10 h-10 rounded ${
                          paginaActual === i + 1
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
  );
}