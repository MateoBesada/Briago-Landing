// pages/ProductosTotal.tsx
import { productosPinturas as pinturas } from "../data/Pinturas";
import { productosAutomotor as automotor } from "../data/Automotor";
import CarruselSinAnuncio from "../components/CarruselDeProductos";
import type { Producto } from "@/types/Producto";
import Automotor from "/img/Otros/OfertaPPG.png";



const aplicarDescuento = (producto: Producto): Producto => {
  let nuevoPrecio = producto.precio;
  if (producto.precioOriginal && producto.off != null) {
    const descuento = producto.precioOriginal * (producto.off / 100);
    nuevoPrecio = Math.round(producto.precioOriginal - descuento);
  }
  return {
    ...producto,
    precio: nuevoPrecio,
    variantes: producto.variantes?.map(aplicarDescuento),
  };
};

const getBaseNombre = (nombre: string) =>
  nombre.replace(/\s*\d+\s*(Litros?|Kg|Kilos?)$/i, "").trim();

const agruparPorBaseNombre = (productos: Producto[]) => {
  const map = new Map<string, Producto[]>();
  productos.forEach((p) => {
    const base = getBaseNombre(p.nombre);
    if (!map.has(base)) map.set(base, []);
    map.get(base)!.push(p);
  });
  return Array.from(map.entries());
};

const ProductosTotal = () => {
  const pinturasConPrecio = pinturas.map(aplicarDescuento);
  const automotorConPrecio = automotor.map(aplicarDescuento);

  const pinturasAgrupadas = agruparPorBaseNombre(pinturasConPrecio);
  const automotorAgrupadas = agruparPorBaseNombre(automotorConPrecio);

  return (
    <div className="px-2 md:px-5 lg:px-0 w-full max-w-screen-2xl mx-auto">
      {/* Carrusel de Pinturas (imagen por defecto) */}
      <CarruselSinAnuncio
        tituloElemento={
          <h2 className="block lg: text-2xl font-bold text-center"></h2>
        }
        rutaMas="/productos-pinturas"
        productosAgrupados={pinturasAgrupadas}
        direccion="left"
        linkAnuncio="/productos-pinturas"
      />

      {/* Carrusel de Automotor (imagen personalizada) */}
      <CarruselSinAnuncio
        tituloElemento={
          <h2 className="block text-2xl font-bold text-center"></h2>
        }
        rutaMas="/productos-automotor"
        productosAgrupados={automotorAgrupadas}
        direccion="right"
        imagenAnuncio={Automotor}
        linkAnuncio="/productos-automotor"
      />
    </div>
  );
};

export default ProductosTotal;
