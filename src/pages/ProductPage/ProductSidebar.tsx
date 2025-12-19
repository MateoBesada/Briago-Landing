import clsx from "clsx";
import { RiWhatsappLine } from "react-icons/ri";
import SelectorVariantes from "@/components/SelectorVariantes";
import type { Producto } from "@/types/Producto";

interface ProductSidebarProps {
  producto: Producto;
  variantes: Producto[];
  grupoDeVariantes: Producto[];
  navigate: (url: string) => void;
  formatearPrecio: (precio: number) => string;
  modoVenta: "unidad" | "caja";
  setModoVenta: (modo: "unidad" | "caja") => void;
  cantidad: number;
  setCantidad: (cantidad: number) => void;
  addItem: (item: any) => void;
  toast: any;
  reviewsCount: number;
  ratingAvg: number;
  mostrarPrecio?: boolean;
  habilitarCompra?: boolean;
}

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
  mostrarPrecio = false,
  habilitarCompra = false,
}: ProductSidebarProps) {
  if (!producto) return null;

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

  const whatsappUrl = "https://wa.me/1125219626?text=Hola,%20me%20interesa%20consultar%20el%20precio%20de%20" + encodeURIComponent(producto.nombre);

  return (
    <aside className="w-full md:max-w-sm space-y-6 bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-4">
      {/* Título */}
      <div className="space-y-2 border-b border-gray-100 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black leading-tight tracking-tight">
          {producto.nombre}
        </h1>
        <p className="text-sm font-medium text-gray-500 flex flex-wrap gap-2">
          <span className="bg-gray-100 px-2 py-1 rounded-md">Marca: {producto.marca}</span>
          <span className="bg-gray-100 px-2 py-1 rounded-md">Categoría: {producto.categoria}</span>
        </p>
        <p className="text-sm text-gray-500">
          Disponibilidad:{" "}
          <span className={clsx("font-bold", typeof producto.stock === "number" && producto.stock > 0 ? "text-green-600" : "text-red-600")}>
            {typeof producto.stock === "number"
              ? producto.stock === 0 ? "Agotado" : `En Stock (${producto.stock})`
              : "Consultar"}
          </span>
        </p>
      </div>

      {/* Bloque de Precio */}
      {mostrarPrecio && (
        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
          {producto.precioOriginal && producto.off ? (
            <>
              <span className="text-base line-through text-gray-400 font-medium">
                {formatearPrecio(producto.precioOriginal)}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-extrabold text-black tracking-tight">
                  {formatearPrecio(precioFinalUnitario)}
                </span>
                <span className="px-2 py-1 bg-[#fff03b] text-black text-xs font-bold rounded uppercase tracking-wider">
                  {producto.off}% OFF
                </span>
              </div>
            </>
          ) : (
            <div className="text-4xl font-extrabold text-black tracking-tight">
              {formatearPrecio(precioFinalUnitario)}
            </div>
          )}
        </div>
      )}

      {/* Variantes */}
      {esProductoConVariantes && (
        <div className="space-y-3">
          {esgrano ? (
            <div className="space-y-2">
              <p className="text-sm font-bold text-black uppercase tracking-wide">Grano:</p>
              <div className="relative">
                <select
                  value={producto.id}
                  onChange={(e) => navigate(`/producto/${e.target.value}`)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-medium bg-white focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none cursor-pointer"
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
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
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
      <div className="space-y-4">
        {producto.tipoVenta?.caja && (
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
            <p className="text-sm font-bold text-black uppercase tracking-wide">Modo de venta:</p>
            <div className="flex gap-2">
              {["unidad", "caja"].map((modo) => (
                <button
                  key={modo}
                  onClick={() => {
                    setModoVenta(modo as "unidad" | "caja");
                    setCantidad(1);
                  }}
                  className={clsx(
                    "flex-1 px-4 py-2 text-sm rounded-xl border-2 transition-all font-bold capitalize",
                    modoVenta === modo
                      ? "bg-black text-white border-black shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {modo}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium text-center">
              {modoVenta === "caja" && producto.tipoVenta.caja.unidadesPorCaja
                ? `Caja de ${producto.tipoVenta.caja.unidadesPorCaja} unidades`
                : `Precio por unidad`}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <span className="text-sm font-bold text-black uppercase tracking-wide">Cantidad:</span>
          <div className="flex items-center gap-4 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition-colors text-lg font-bold"
            >
              −
            </button>
            <span className="text-lg font-bold text-black w-8 text-center">{cantidad}</span>
            <button
              onClick={() => setCantidad(cantidad + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-black transition-colors text-lg font-bold"
            >
              +
            </button>
          </div>
        </div>

        {mostrarPrecio && (
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-500 font-medium">Total estimado:</span>
            <span className="text-xl font-extrabold text-black">
              {formatearPrecio(total)}
            </span>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="space-y-3 pt-2">
        {habilitarCompra ? (
          <button
            disabled={!precioFinalUnitario}
            onClick={() => {
              if (precioFinalUnitario > 0) {
                addItem({
                  ...producto,
                  cantidad,
                  precio: precioTipoVenta,
                  modoVenta,
                });
                toast.success("Producto agregado al carrito");
              }
            }}
            className={clsx(
              "w-full px-6 py-4 rounded-xl font-extrabold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2",
              !precioFinalUnitario
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#fff03b] text-black hover:bg-black hover:text-white"
            )}
          >
            {!precioFinalUnitario
              ? "NO DISPONIBLE"
              : "AGREGAR AL CARRITO"}
          </button>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center text-white bg-black hover:bg-[#25D366] shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
          >
            <RiWhatsappLine className="text-3xl mr-3 group-hover:scale-110 transition-transform" />
            CONSULTAR PRECIO
          </a>
        )}
      </div>

      {/* Características técnicas */}
      {producto.especificaciones && (
        <div className="pt-4 border-t border-gray-100">
          <details className="group">
            <summary className="cursor-pointer font-bold text-black flex items-center justify-between list-none">
              <span>CARACTERÍSTICAS TÉCNICAS</span>
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <div className="mt-4 text-sm text-gray-600 space-y-2 pb-2">
              {Object.entries(producto.especificaciones).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-50 last:border-0 py-2">
                  <span className="font-medium text-gray-900">{key}:</span>
                  <span className="text-right">{value}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </aside>
  );
}