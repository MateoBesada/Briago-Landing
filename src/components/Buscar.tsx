import { useSearch } from '../context/SearchContext';
import { productosPinturas as pinturas } from '../data/Pinturas';
import { productosAutomotor as automotor } from '../data/Automotor';
import { productosAccesorios as accesorios } from '../data/Accesorios';
import { productosIndustria as industria } from '../data/Industria';
import { productosAbrasivos as abrasivos } from '../data/Abrasivos';
import { productosPulidos as pulidos } from '../data/Pulidos';
import type { Producto } from '@/types/Producto';
import ProductoCard from './ProductoCard';

const todasLasCategorias: { nombre: string; productos: Producto[] }[] = [
  { nombre: 'Pinturas', productos: pinturas },
  { nombre: 'Automotor', productos: automotor },
  { nombre: 'Accesorios', productos: accesorios },
  { nombre: 'Industria', productos: industria },
  { nombre: 'Abrasivos', productos: abrasivos },
  { nombre: 'Pulidos', productos: pulidos },
];

// 🔠 Normaliza texto: quita acentos, pasa a minúsculas
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

// 🏷️ Agrega marca si no tiene
function agregarMarcaSiFalta(productos: Producto[]): Producto[] {
  return productos.map((producto) => ({
    ...producto,
    marca: producto.marca ?? 'Sin marca',
  }));
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

function Buscar() {
  const { query } = useSearch();

  // Dividimos la query en palabras para búsqueda flexible (todas las palabras deben estar presentes)
  const palabrasQuery = normalizarTexto(query).split(/\s+/).filter(Boolean);

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
          if (palabrasQuery.length === 0) return false;

          const nombreNormalizado = normalizarTexto(producto.nombre);
          const marcaNormalizada = normalizarTexto(producto.marca ?? '');

          // Lógica "Flexible": TODAS las palabras de la búsqueda deben estar en el nombre O en la marca
          // Ejemplo: "Alba Latex" matchea si "Alba" está en marca y "Latex" en nombre
          return palabrasQuery.every(palabra =>
            nombreNormalizado.includes(palabra) || marcaNormalizada.includes(palabra)
          );
        })
    );

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Resultados para "{query}"</h1>

      {resultados.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 font-medium">
            No encontramos productos que coincidan con tu búsqueda.
          </p>
          <p className="text-gray-400 mt-2">
            Probá buscando por nombre del producto (ej: "Látex", "Barniz").
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 justify-items-center">
          {resultados.map((producto) => (
            <ProductoCard
              key={producto.id}
              variantes={[producto]}
              baseNombre={producto.nombre}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Buscar;
