import { useState, useMemo } from 'react';
import type { Producto } from '@/types/Producto';

export function useFiltrosProductos(productos: Producto[]) {
  const [filtroActivo, setFiltroActivo] = useState<{
    categoria: string | null;
    marca: string | null;
  }>({ categoria: null, marca: null });

  const agrupados: Record<string, Producto[]> = {};

  productos.forEach((p) => {
    // Usamos el nombre del padre como base para agrupar
    const base = p.nombre
      .replace(/\s*\d+\s*(Litros?|Kg|Kilos?|cm|mm|unidades?|uds?|granos?|g)?\b/gi, '')
      .replace(/\s*\d+$/g, '') // en caso de solo número al final
      .trim();

    if (!agrupados[base]) agrupados[base] = [];

    agrupados[base].push(p);

    if (p.variantes && Array.isArray(p.variantes)) {
      agrupados[base].push(...p.variantes);
    }
  });

  const productosFiltrados = Object.entries(agrupados).filter(([_, variantes]) =>
    variantes.some(
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

    productos.forEach((p) => {
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

    const total = productosFiltrados.reduce(
      (acc, [_, variantes]) => acc + variantes.length,
      0
    );

    return {
      filtrosDisponibles: {
        categoria: [...catSet],
        marca: [...marcaSet],
      },
      cantidades: {
        categoria: catCnt,
        marca: marcaCnt,
        total,
      },
    };
  }, [productos, filtroActivo, productosFiltrados]);

  return {
    filtroActivo,
    setFiltroActivo,
    productosFiltrados,
    filtrosDisponibles,
    agrupados,
  };
}
