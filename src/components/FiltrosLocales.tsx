import { useMemo, useEffect, useState } from 'react';
import type { Producto } from '@/types/Producto';

type FiltrosProps = {
  productos: Producto[];
  filtros: {
    categoria: string[];
    marca: string[];
    seccion?: string[];
  };
  filtroActivo: {
    categoria: string | null;
    marca: string | null;
    seccion?: string | null;
  };
  onFiltroChange: (filtros: {
    categoria: string | null;
    marca: string | null;
    seccion?: string | null;
  }) => void;
  titulo: string;
};

function Filtros({
  productos,
  filtros,
  filtroActivo,
  onFiltroChange,
}: FiltrosProps) {
  const [, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleChange = (tipo: keyof typeof filtroActivo, valor: string) => {
    onFiltroChange({
      ...filtroActivo,
      [tipo]: valor === filtroActivo[tipo] ? null : valor,
    });
  };

  const calcularCantidades = () => {
    const marcas: Record<string, number> = {};
    const categorias: Record<string, number> = {};
    const secciones: Record<string, number> = {};

    filtros.marca?.forEach((marca) => (marcas[marca] = 0));
    filtros.categoria?.forEach((cat) => (categorias[cat] = 0));
    filtros.seccion?.forEach((sec) => (secciones[sec] = 0));

    productos.forEach((p) => {
      const matchCategoria = !filtroActivo.categoria || p.categoria === filtroActivo.categoria;
      const matchMarca = !filtroActivo.marca || p.marca === filtroActivo.marca;
      const matchSeccion = !filtroActivo.seccion || p.seccion === filtroActivo.seccion;

      if (matchCategoria && matchSeccion) marcas[p.marca] = (marcas[p.marca] || 0) + 1;
      if (matchMarca && matchSeccion) categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
      if (matchMarca && matchCategoria) secciones[p.seccion || ''] = (secciones[p.seccion || ''] || 0) + 1;
    });

    return { marcas, categorias, secciones };
  };

  const cantidades = useMemo(() => calcularCantidades(), [productos, filtroActivo]);

  const renderSeccion = (
    tipo: keyof typeof filtroActivo,
    titulo: string,
    items: string[],
    cantidades: Record<string, number>
  ) => {
    const ordenados = [...items].sort(
      (a, b) => (cantidades[b] || 0) - (cantidades[a] || 0)
    );

    return (
      <div className="mb-4 border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <h3 className="text-base font-semibold text-gray-700 mb-2">{titulo}</h3>
        <div className="max-h-52 overflow-y-auto pr-1 custom-scrollbar space-y-1">
          {ordenados.map((item) => {
            const activo = filtroActivo[tipo] === item;
            const cantidad = cantidades[item] || 0;

            return (
              <label
                key={item}
                className={`flex items-center justify-between text-sm px-2 py-1 rounded-md cursor-pointer transition border ${activo
                  ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                  : 'hover:bg-gray-100 border-transparent text-gray-800'
                  }`}
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={() => handleChange(tipo, item)}
                    className="accent-yellow-500 w-4 h-4"
                  />
                  <span className="capitalize">{item}</span>
                </div>
                <span className="text-gray-500 text-xs">{cantidad}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`w-full md:w-64 lg:min-w-80 px-2 py-2 transition-all sticky top-24 self-start z-10`}
    >
      {filtros.seccion && renderSeccion('seccion', 'Categoría:', filtros.seccion, cantidades.secciones)}
      {renderSeccion('marca', 'Marca', filtros.marca, cantidades.marcas)}
      {renderSeccion('categoria', 'Tipo de producto', filtros.categoria, cantidades.categorias)}
    </aside>
  );
}

export default Filtros;
