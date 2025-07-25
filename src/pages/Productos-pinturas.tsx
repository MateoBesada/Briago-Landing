import { useState, useMemo, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { useCart } from '@/context/CartContext';
import type { Producto } from '@/types/Producto';
import Filtros from '@/components/Filtros';
import ProductoCard from '@/components/ProductoCard';
import SeccionesTabs from "@/components/SeccionesTabs";

function PinturasPage() {
  useSearch();
  useCart();
  useEffect(() => window.scrollTo(0, 0), []);

  const [productos, setProductos] = useState<Producto[]>([]);

  // 🔁 Obtener productos del backend
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/productos');
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    fetchProductos();
  }, []);

  const aplicarOff = (p: Producto): Producto => {
    const precioCalculado =
      p.precioOriginal && p.off != null
        ? Math.round(p.precioOriginal * (1 - p.off / 100))
        : p.precio;

    return {
      ...p,
      precio: precioCalculado,
      variantes: p.variantes?.map(aplicarOff),
    };
  };

  const productosConPrecio = productos.map(aplicarOff);

  const agrupados: Record<string, Producto[]> = {};
  productosConPrecio.forEach((p) => {
    const base = p.nombre
      .replace(/\d+\s*(Litros?|Kg|Kilos?)/gi, '')
      .replace(/\d+/, '')
      .trim();
    (agrupados[base] ??= []).push(p, ...(p.variantes ?? []));
  });

  const [filtroActivo, setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
  }>({ categoria: null, marca: null });

  const productosFiltrados = Object.entries(agrupados).filter(([_, vars]) =>
    vars.some(
      (v) =>
        (!filtroActivo.categoria || v.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || v.marca === filtroActivo.marca)
    )
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
                titulo="HOGAR Y OBRA"
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 text-lg mt-10 w-full">
              No se encontraron productos que coincidan con los filtros.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-grow">
              {productosFiltrados.map(([base, vars]) => (
                <ProductoCard key={base} variantes={vars} baseNombre={base} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PinturasPage;
