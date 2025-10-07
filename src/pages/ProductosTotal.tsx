import { useMemo } from "react";
import CarruselDeProductos from "../components/CarruselDeProductos"; // Asegúrate que el nombre del import sea el correcto
import { productosPinturas as pinturas } from "../data/Pinturas";
import { productosAutomotor as automotor } from "../data/Automotor";
import type { Producto } from "@/types/Producto";

// --- Lógica para agrupar y aplicar descuentos (sin cambios) ---
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
  nombre.replace(/\s*\d+\s*(Litros?|Kg|Kilos?|Lts|Lt)/gi, "").trim();

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
  // Aplicamos descuentos y agrupamos los productos
  const pinturasConPrecio = useMemo(() => pinturas.map(aplicarDescuento), []);
  const automotorConPrecio = useMemo(() => automotor.map(aplicarDescuento), []);

  const pinturasAgrupadas = useMemo(() => agruparPorBaseNombre(pinturasConPrecio), [pinturasConPrecio]);
  const automotorAgrupadas = useMemo(() => agruparPorBaseNombre(automotorConPrecio), [automotorConPrecio]);

  return (
    // He ajustado el padding y el overflow para un mejor layout
    <div className="w-full space-y-0 overflow-hidden">
      
      {/* Carrusel de Pinturas (Hogar y Obra) */}
      <CarruselDeProductos
        // Título claro para la sección
        tituloElemento={
          <h2 className="text-3xl font-bold text-gray-800">Hogar y Obra</h2>
        }
        rutaMas="/productos-pinturas"
        productosAgrupados={pinturasAgrupadas}
        direccion="left"
        // --- Nuevas props de texto para el anuncio ---
        anuncioTitulo="¡Renová Tus Espacios!"
        anuncioDescripcion="Descubrí nuestra gama de látex, esmaltes, revestimientos y más."
        anuncioCta="Explorar Productos"
        linkAnuncio="/productos-pinturas"
      />

      {/* Carrusel de Automotor */}
      <CarruselDeProductos
        // Título claro para la sección
        tituloElemento={
          <h2 className="text-3xl font-bold text-gray-800">Línea Automotor</h2>
        }
        rutaMas="/productos-automotor"
        productosAgrupados={automotorAgrupadas}
        direccion="right"
        // --- Nuevas props de texto para el anuncio ---
        anuncioTitulo="Acabado Profesional"
        anuncioDescripcion="Encontrá todo lo que necesitás para la reparación y el repintado de vehículos. Calidad garantizada."
        anuncioCta="Explorar Productos"
        linkAnuncio="/productos-automotor"
      />
    </div>
  );
};

export default ProductosTotal;