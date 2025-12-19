import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/Producto';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from "@/components/SeccionesTabs";

// Importar todos los datos
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import { productosPulidos } from '@/data/Pulidos';
import { productosIndustria } from '@/data/Industria';

const todosLosProductos = [
  ...productosPinturas,
  ...productosAutomotor,
  ...productosAbrasivos,
  ...productosAccesorios,
  ...productosPulidos,
  ...productosIndustria,
];

export default function NuestrosProductos() {
  useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paginaInicial = parseInt(searchParams.get("pagina") || "1", 10);
  const marcaInicial = searchParams.get("marca");
  const categoriaInicial = searchParams.get("categoria");
  const seccionInicial = searchParams.get("seccion");

  const aplicarDescuento = (p: Producto): Producto => {
    const precio =
      p.precioOriginal && p.off != null
        ? Math.round(p.precioOriginal * (1 - p.off / 100))
        : p.precio;
    return { ...p, precio, variantes: p.variantes?.map(aplicarDescuento) };
  };

  const productosConPrecio = useMemo(() => todosLosProductos.map(aplicarDescuento), []);

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
    seccion?: string | null;
  }>({ categoria: null, marca: null, seccion: null });

  useEffect(() => {
    _setFiltroActivo({
      categoria: categoriaInicial,
      marca: marcaInicial,
      seccion: seccionInicial,
    });
  }, [categoriaInicial, marcaInicial, seccionInicial]);

  const [paginaActual, setPaginaActual] = useState(paginaInicial);
  const productosPorPagina = 20;

  const productosFiltrados = Object.entries(agrupados).filter(([_, vars]) =>
    vars.some(
      (v) =>
        (!filtroActivo.categoria || v.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || v.marca === filtroActivo.marca) &&
        (!filtroActivo.seccion || v.seccion === filtroActivo.seccion)
    )
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

  const setFiltroActivo = (nuevoFiltro: {
    categoria: string | null;
    marca: string | null;
    seccion?: string | null;
  }) => {
    _setFiltroActivo(nuevoFiltro);
    cambiarPagina(1);
  };

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const productosPaginados = productosFiltrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  const { filtrosDisponibles } = useMemo(() => {
    const catSet = new Set<string>();
    const marcaSet = new Set<string>();
    const seccionSet = new Set<string>();

    productosConPrecio.forEach((p) => {
      const matchMarca = !filtroActivo.marca || p.marca === filtroActivo.marca;
      const matchCategoria = !filtroActivo.categoria || p.categoria === filtroActivo.categoria;
      const matchSeccion = !filtroActivo.seccion || p.seccion === filtroActivo.seccion;

      if (matchMarca && matchSeccion && p.categoria) catSet.add(p.categoria);
      if (matchCategoria && matchSeccion && p.marca) marcaSet.add(p.marca);
      if (matchMarca && matchCategoria && p.seccion) seccionSet.add(p.seccion);
    });

    return {
      filtrosDisponibles: {
        categoria: [...catSet],
        marca: [...marcaSet],
        seccion: [...seccionSet],
      },
    };
  }, [productosConPrecio, filtroActivo]);

  return (
    <div className="bg-gray-100 min-h-screen px-2 py-8">
      <div className="max-w-7xl mx-auto">
        <SeccionesTabs />

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-80 md:self-start">
            <Filtros
              filtros={filtrosDisponibles}
              filtroActivo={filtroActivo}
              onFiltroChange={setFiltroActivo}
              productos={productosConPrecio}
              titulo="TODOS LOS PRODUCTOS"
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
