// 1. Se añaden los hooks 'useNavigate'
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { default as productos } from '@/data/Pinturas';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/Producto';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from "@/components/SeccionesTabs";
import CotizacionBanner from '@/components/CotizacionBanner';

function PinturasPage() {
  useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook para actualizar la URL

  // 2. Se elimina el useEffect que forzaba el scroll al inicio en cada carga
  // useEffect(() => window.scrollTo(0, 0), []); 

  const filtroInicial = searchParams.get("filtro");
  // 3. Se lee el número de página desde la URL al cargar
  const paginaInicial = parseInt(searchParams.get("pagina") || "1", 10);

  const aplicarDescuento = (p: Producto): Producto => {
    const precio =
      p.precioOriginal && p.off != null
        ? Math.round(p.precioOriginal * (1 - p.off / 100))
        : p.precio;
    return { ...p, precio, variantes: p.variantes?.map(aplicarDescuento) };
  };
  const productosConPrecio = productos.map(aplicarDescuento);

  const agrupados: Record<string, Producto[]> = {};
  productosConPrecio.forEach((p: Producto) => {
    const base = p.nombre
      .replace(/\d+[.,]?\d*\s*(Litros?|Kg|Kilos?|Lts|Lt)/gi, '')
      .replace(/\d+/, '')
      .trim();
    (agrupados[base] ??= []).push(p); 
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

  useEffect(() => {
    if (filtroInicial) {
      setFiltroActivo((prev) => ({ ...prev, categoria: filtroInicial }));
    }
  }, [filtroInicial]);

  // 4. Se inicializa el estado de la página con el valor de la URL
  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const productosPorPagina = 20;

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

  // 5. Se crea una nueva función para cambiar de página que también actualiza la URL
  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      const nuevosParams = new URLSearchParams(searchParams);
      nuevosParams.set("pagina", nuevaPagina.toString());
      navigate(`?${nuevosParams.toString()}`, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll al top solo cuando se cambia de página
    }
  };
  
  // Se elimina el useEffect que hacía scroll al cambiar 'paginaActual', ahora está dentro de 'cambiarPagina'

  const { filtrosDisponibles } = useMemo(() => {
    const catSet = new Set<string>();
    const marcaSet = new Set<string>();
    productosConPrecio.forEach((p: { marca: string; categoria: string; }) => {
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
      <SeccionesTabs />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-80">
            <div className="md:fixed md:top-28">
              <Filtros
                filtros={filtrosDisponibles}
                filtroActivo={filtroActivo}
                productos={productosConPrecio}
                titulo="HOGAR Y OBRA"
                onFiltroChange={(nuevoFiltro) => {
                  setFiltroActivo(nuevoFiltro);
                  // 6. Se actualiza el handler de filtros para usar la nueva función
                  cambiarPagina(1);
                }}
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
                      {/* 7. Se usan las nuevas funciones en los botones de paginación */}
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50"
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalPaginas }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => cambiarPagina(i + 1)}
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
                        onClick={() => cambiarPagina(paginaActual + 1)}
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
      <CotizacionBanner />
    </div>
  );
}

export default PinturasPage;