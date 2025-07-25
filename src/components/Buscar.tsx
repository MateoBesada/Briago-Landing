import { useSearch } from '../context/SearchContext';
import { productosPinturas as pinturas } from '../data/Pinturas';
import { productosAutomotor as automotor } from '../data/Automotor';
import type { Producto } from '@/types/Producto';

const todasLasCategorias: { nombre: string; productos: Producto[] }[] = [
  { nombre: 'Pinturas', productos: pinturas },
  { nombre: 'Automotor', productos: automotor },
];

// 🔠 Normaliza texto: quita acentos, pasa a minúsculas
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .trim();
}

// 🧼 Asegura que todas las descripciones en variantes existan
function normalizarDescripcionEnVariantes(productos: Producto[]): Producto[] {
  return productos.map((prod) => {
    if (prod.variantes) {
      const variantesNormalizadas = prod.variantes.map((v) => ({
        ...v,
        descripcion: v.descripcion ?? '',
      }));
      return { ...prod, variantes: variantesNormalizadas };
    }
    return prod;
  });
}

// 💸 Aplica descuento si existe, y asegura que precio y precioOriginal siempre tengan un valor
function aplicarDescuento(producto: Producto): Producto {
  const precioOriginal = producto.precioOriginal ?? producto.precio ?? 0;
  let precioFinal = producto.precio ?? precioOriginal;

  if (producto.off != null && producto.precioOriginal != null) {
    const descuento = producto.precioOriginal * (producto.off / 100);
    precioFinal = Math.round(producto.precioOriginal - descuento);
  }

  return {
    ...producto,
    precioOriginal,
    precio: precioFinal,
  };
}

// 🏷️ Agrega marca si no tiene
function agregarMarcaSiFalta(productos: Producto[]): Producto[] {
  return productos.map((producto) => ({
    ...producto,
    marca: producto.marca ?? 'Sin marca',
  }));
}

function Buscar() {
  const { query } = useSearch();
  const queryNormalizado = normalizarTexto(query);

  const categoriasConVariantesYMarca = todasLasCategorias.map((cat) => ({
    ...cat,
    productos: agregarMarcaSiFalta(
      normalizarDescripcionEnVariantes(cat.productos)
    ),
  }));

  const resultados: Producto[] = categoriasConVariantesYMarca
    .flatMap((cat) =>
      cat.productos
        .map(aplicarDescuento)
        .filter((producto) => {
          const nombre = normalizarTexto(producto.nombre);
          const descripcion = normalizarTexto(producto.descripcion ?? '');
          const marca = normalizarTexto(producto.marca ?? '');
          return (
            nombre.includes(queryNormalizado) ||
            descripcion.includes(queryNormalizado) ||
            marca.includes(queryNormalizado)
          );
        })
    );

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Resultados para "{query}"</h1>

      {resultados.length === 0 ? (
        <p className="text-gray-500">
          No se encontraron productos que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {resultados.map((producto) => (
            <div
              key={producto.id}
              className="bg-gray-100 rounded-xl shadow hover:shadow-lg transition flex flex-col h-[420px] relative"
            >
              {producto.off != null &&
                producto.precioOriginal != null &&
                producto.precio != null &&
                producto.precioOriginal > producto.precio && (
                  <span className="absolute -top-2 -left-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md z-10">
                    {producto.off}% OFF
                  </span>
                )}

              <div className="h-40 flex items-center justify-center bg-white rounded-t-xl overflow-hidden">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="max-h-[160px] object-contain transition-transform duration-300 hover:scale-110"
                />
              </div>

              <div className="p-4 flex flex-col justify-between flex-grow">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-1">
                    {producto.nombre}
                  </h2>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {producto.descripcion}
                  </p>
                </div>

                <div>
                  {producto.off != null &&
                  producto.precioOriginal != null &&
                  producto.precio != null &&
                  producto.precioOriginal > producto.precio ? (
                    <>
                      <span className="line-through text-gray-500 block text-sm">
                        ${producto.precioOriginal.toLocaleString('es-AR')}
                      </span>
                      <span className="text-lg font-bold text-yellow-600">
                        ${producto.precio.toLocaleString('es-AR')}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">
                      ${producto.precio?.toLocaleString('es-AR') ??
                        producto.precioOriginal?.toLocaleString('es-AR') ??
                        '0'}
                    </span>
                  )}
                  <button className="mt-2 w-full bg-yellow-500 text-black text-sm py-1.5 rounded-md font-semibold hover:bg-yellow-600 transition">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Buscar;
