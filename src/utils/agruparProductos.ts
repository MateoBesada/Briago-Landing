import type { Producto } from "@/types/Producto";

export function agruparPorNombreBase(productos: Producto[]): [string, Producto[]][] {
  const mapa = new Map<string, Producto[]>();

  productos.forEach((producto) => {
    const base = producto.nombre || producto.nombre;
    if (!mapa.has(base)) {
      mapa.set(base, []);
    }
    mapa.get(base)!.push(producto);
  });

  return Array.from(mapa.entries());
}
