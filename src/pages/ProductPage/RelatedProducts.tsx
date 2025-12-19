import { productosPinturas } from "@/data/Pinturas";
import { productosAutomotor } from "@/data/Automotor";
import { productosAbrasivos } from "@/data/Abrasivos";
import { productosAccesorios } from "@/data/Accesorios";
import { productosPulidos } from "@/data/Pulidos";
import { productosIndustria } from "@/data/Industria";
import type { Producto } from "@/types/Producto";
import ProductoCard from "@/components/ProductoCard";

const todosLosProductos: Producto[] = [
  ...productosPinturas,
  ...productosAutomotor,
  ...productosAbrasivos,
  ...productosAccesorios,
  ...productosPulidos,
  ...productosIndustria,
];

interface RelatedProductsProps {
  categoria: string;
  currentId: string;
}

export default function RelatedProducts({ categoria, currentId }: RelatedProductsProps) {

  const currentBase = todosLosProductos.find(
    p => p.id === currentId || p.variantes?.some(v => v.id === currentId)
  );

  const variantesIds = currentBase?.variantes?.map(v => v.id) ?? [];
  const idsAExcluir = new Set([currentBase?.id, ...variantesIds]);

  let related = todosLosProductos.filter(
    p => p.categoria === categoria && !idsAExcluir.has(p.id)
  );

  // Rellenar si hay pocos
  if (related.length < 4) {
    const adicionales = todosLosProductos.filter(
      p => !idsAExcluir.has(p.id) && !related.includes(p)
    );
    related = [...related, ...adicionales].slice(0, 4);
  } else {
    related = related.slice(0, 4);
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-20 border-t border-gray-100 pt-12">
      <h2 className="text-3xl font-extrabold mb-8 text-black tracking-tight">También puede interesarte</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {related.map(p => (
          <ProductoCard
            key={p.id}
            variantes={[p]}
            baseNombre={p.nombre}
          />
        ))}
      </div>
    </div>
  );
}