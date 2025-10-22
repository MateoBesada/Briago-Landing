import clsx from "clsx";
import { MdLocationOn } from "react-icons/md";
import SelectorVariantes from "@/components/SelectorVariantes";
import type { Producto } from "@/types/Producto";

interface ProductSidebarProps {
  producto: Producto;
  variantes: Producto[];
  grupoDeVariantes: Producto[]; 
  navigate: (url: string) => void;
  formatearPrecio: (precio: number) => string;
  // Ya no necesitamos 'precioTipoVenta', lo calcularemos aquí mismo
  // precioTipoVenta: number;
  modoVenta: "unidad" | "caja";
  setModoVenta: (modo: "unidad" | "caja") => void;
  cantidad: number;
  setCantidad: (cantidad: number) => void;
  // 'total' se calculará aquí, así que no es necesario como prop
  // total: number;
  addItem: (item: any) => void;
  toast: any;
  // 'precioFinal' se calculará aquí, así que no es necesario como prop
  // precioFinal: number;
  reviewsCount: number;
  ratingAvg: number;
}

// --- Función para obtener el precio final con descuento ---
const getFinalPrice = (producto: Producto): number => {
  if (producto.precio !== undefined) return producto.precio;
  if (producto.precioOriginal && producto.off)
    return Math.round(producto.precioOriginal * (1 - producto.off / 100));
  return producto.precioOriginal ?? 0;
};


export default function ProductSidebar({
  producto,
  variantes,
  grupoDeVariantes,
  navigate,
  formatearPrecio,
  modoVenta,
  setModoVenta,
  cantidad,
  setCantidad,
  addItem,
  toast,
}: ProductSidebarProps) {
  if (!producto) return null;

  // --- Lógica de precios ahora dentro del componente ---
  const precioFinalUnitario = getFinalPrice(producto);
  const precioTipoVenta = modoVenta === 'caja' && producto.tipoVenta?.caja 
    ? producto.tipoVenta.caja.precio 
    : precioFinalUnitario;
  const total = precioTipoVenta * cantidad;

  const todasLasVariantes = grupoDeVariantes && grupoDeVariantes.length > 0 
    ? grupoDeVariantes 
    : [producto, ...variantes.filter(v => v.id !== producto.id)];

  const esProductoConVariantes = todasLasVariantes.length > 1;
  const esgrano = producto.seccion?.toLowerCase() === "grano";

  return (
    <aside className="w-full md:max-w-sm space-y-4 bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      {/* Título */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-gray-900 leading-snug">
          {producto.nombre}
        </h1>
        <p className="text-sm text-gray-500">
          Marca: {producto.marca} · Categoría: {producto.categoria} ·{" "}
          Disponibilidad:{" "}
          {typeof producto.stock === "number"
            ? producto.stock === 0 ? "Agotado" : `Stock: ${producto.stock}`
            : "Sin datos"}
        </p>
      </div>

      {/* Precio */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
        {producto.precioOriginal && producto.off ? (
          <>
            <span className="text-sm line-through text-gray-400">
              {formatearPrecio(producto.precioOriginal)}
            </span>
            <div className="text-2xl font-bold text-gray-900">
              {formatearPrecio(precioFinalUnitario)}
              <span className="ml-2 text-sm text-green-600 font-semibold">
                {producto.off}% OFF
              </span>
            </div>
          </>
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            {formatearPrecio(precioFinalUnitario)}
          </div>
        )}
      </div>

      {/* Variantes */}
      {esProductoConVariantes && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          {esgrano ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Grano:</p>
              <select
                value={producto.id}
                onChange={(e) => navigate(`/producto/${e.target.value}`)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {todasLasVariantes.map((v) => {
                  const granoLabel = (v as any).grano ?? v.especificaciones?.Grano ?? v.nombre.match(/P\d+/i)?.[0] ?? "N/A";
                  return (
                    <option key={v.id} value={v.id}>
                      {granoLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <SelectorVariantes
              variantes={todasLasVariantes}
              productoActualId={producto.id}
              onSeleccionar={(id) => navigate(`/producto/${id}`)}
            />
          )}
        </div>
      )}

      {/* Modo de venta + Cantidad */}
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
        {producto.tipoVenta?.caja && (
          <>
            <div className="flex gap-2">
              {["unidad", "caja"].map((modo) => (
                <button
                  key={modo}
                  onClick={() => {
                    setModoVenta(modo as "unidad" | "caja");
                    setCantidad(1);
                  }}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded-full border transition font-medium capitalize",
                    modoVenta === modo
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  )}
                >
                  {modo}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {modoVenta === "caja" && producto.tipoVenta.caja.unidadesPorCaja
                ? `Caja de ${producto.tipoVenta.caja.unidadesPorCaja} unidades`
                : `Precio por unidad`}
            </p>
          </>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300">
              −
            </button>
            <span className="text-base font-semibold">{cantidad}</span>
            <button onClick={() => setCantidad(cantidad + 1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300">
              +
            </button>
          </div>
          <span className="text-base font-semibold text-gray-900">
            Total: {formatearPrecio(total)}
          </span>
        </div>
      </div>

      {/* Agregar al carrito */}
<div className="space-y-3">
      <button
        disabled={!precioFinalUnitario}
        onClick={() => {
          if (precioFinalUnitario > 0) {
            addItem({
              ...producto,
              cantidad,
              precio: precioTipoVenta, // Este ya es el precio correcto según el modoVenta
              modoVenta, // <-- AGREGAR ESTO AQUÍ
              // Si necesitas saber cuántas unidades realmente se compran en modo caja,
              // puedes agregar:
              // unidadesCompradas: modoVenta === 'caja' && producto.tipoVenta?.caja ? cantidad * producto.tipoVenta.caja.unidadesPorCaja : cantidad,
            });
            toast.success("Producto agregado al carrito");
          }
        }}
        className={clsx(
          "w-full px-6 py-3 rounded-xl font-semibold transition text-white",
          !precioFinalUnitario
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-900 hover:bg-gray-800"
        )}
      >
        {!precioFinalUnitario
          ? "Producto no disponible"
          : "Agregar al carrito"}
      </button>
        <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
          <MdLocationOn className="text-lg" />
          <span>Retirá GRATIS en nuestra sucursal</span>
        </div>
      </div>

      {/* Características técnicas */}
      {producto.especificaciones && (
        <details className="mt-2 text-sm text-gray-700">
          <summary className="cursor-pointer font-medium">
            Características técnicas
          </summary>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {Object.entries(producto.especificaciones).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </details>
      )}
    </aside>
  );
}