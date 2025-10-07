import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Producto {
  nombre: string;
  marca: string;
  categoria: string;
}

type FiltrosProps = {
  productos: Producto[];
  filtros: {
    categoria: string[];
    marca: string[];
  };
  filtroActivo: {
    categoria: string | null;
    marca: string | null;
  };
  onFiltroChange: (filtros: {
    categoria: string | null;
    marca: string | null;
  }) => void;
  titulo: string;
};

function Filtros({
  productos,
  filtros,
  filtroActivo,
  onFiltroChange,
  titulo,
}: FiltrosProps) {
  // --- CORRECCIÓN AQUÍ ---
  // Se cambia el estado inicial a 'false' para que los filtros empiecen cerrados.
  const [abiertos, setAbiertos] = useState({
    categoria: false,
    marca: false,
  });

  const [scrolled, setScrolled] = useState(false);
  
  // Este useEffect ya no es necesario si el estado inicial es el correcto.
  // useEffect(() => {
  //   setAbiertos({
  //     categoria: false,
  //     marca: false,
  //   });
  // }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggle = (seccion: keyof typeof abiertos) => {
    setAbiertos((prev) => ({
      // Esta lógica permite abrir una sección y cerrar la otra automáticamente.
      // Si preferís que se puedan abrir ambas a la vez, usá la lógica comentada debajo.
      categoria: seccion === 'categoria' ? !prev.categoria : false,
      marca: seccion === 'marca' ? !prev.marca : false,
      // Lógica para mantener ambas abiertas si se desea:
      // ...prev,
      // [seccion]: !prev[seccion],
    }));
  };

  const handleChange = (tipo: keyof typeof filtroActivo, valor: string) => {
    onFiltroChange({
      ...filtroActivo,
      [tipo]: valor === filtroActivo[tipo] ? null : valor,
    });
  };

  const calcularCantidades = useMemo(() => {
    const marcas: Record<string, number> = {};
    const categorias: Record<string, number> = {};

    filtros.marca.forEach((marca) => (marcas[marca] = 0));
    filtros.categoria.forEach((cat) => (categorias[cat] = 0));

    productos.forEach((p) => {
      const matchCategoria = !filtroActivo.categoria || p.categoria === filtroActivo.categoria;
      const matchMarca = !filtroActivo.marca || p.marca === filtroActivo.marca;

      if (matchCategoria && p.marca) marcas[p.marca] = (marcas[p.marca] || 0) + 1;
      if (matchMarca && p.categoria) categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    });

    return { marcas, categorias };
  }, [productos, filtroActivo, filtros]);

  const totalFiltrados = useMemo(() => {
    return productos.filter(
      (p) =>
        (!filtroActivo.categoria || p.categoria === filtroActivo.categoria) &&
        (!filtroActivo.marca || p.marca === filtroActivo.marca)
    ).length;
  }, [productos, filtroActivo]);

  const renderSeccion = (
    tipo: 'marca' | 'categoria',
    tituloSeccion: string,
    items: string[],
    cantidades: Record<string, number>
  ) => {
    const abierto = abiertos[tipo];
    const ordenados = [...items].sort((a, b) => (cantidades[b] || 0) - (cantidades[a] || 0));

    return (
      <div className="border-t border-gray-200 py-3">
        <button
          className="w-full flex justify-between items-center text-left text-base font-semibold text-gray-800 hover:text-black transition"
          onClick={() => toggle(tipo)}
        >
          {tituloSeccion}
          {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence initial={false}>
          {abierto && (
            <motion.div
              key={tipo}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden mt-2"
            >
              <div className="space-y-1">
                {ordenados.map((item) => {
                  const activo = filtroActivo[tipo] === item;
                  const cantidad = cantidades[item] || 0;
                  if (cantidad === 0 && !activo) return null;

                  return (
                    <label key={item} className={`flex items-center justify-between w-full text-sm py-1 cursor-pointer px-2 rounded-md transition ${activo ? 'bg-yellow-100 font-semibold text-yellow-900' : 'hover:bg-gray-100 text-gray-800'}`}>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={activo} onChange={() => handleChange(tipo, item)} className="accent-yellow-500 w-4 h-4"/>
                        <span>{item}</span>
                      </div>
                      <span className="text-gray-500 text-xs">({cantidad})</span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const hayFiltrosActivos = filtroActivo.categoria || filtroActivo.marca;
  
  const isAutomotorPage = titulo === 'AUTOMOTOR';
  const positioningClasses = !isAutomotorPage 
    ? `sticky top-24 ${scrolled ? 'mt-0' : 'md:mt-20'}`
    : '';

  return (
    <div
      className={`w-full md:w-80 border border-gray-200 px-4 py-6 bg-white rounded-xl shadow self-start z-10 ${positioningClasses}`}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h2>
      <p className="text-sm text-gray-600 font-medium mb-4">
        {totalFiltrados} productos
      </p>

      {hayFiltrosActivos && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          {filtroActivo.marca && (
            <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
              Marca: {filtroActivo.marca}
              <button onClick={() => onFiltroChange({ ...filtroActivo, marca: null })} className="ml-1 text-xs font-bold hover:text-red-600 transition">×</button>
            </span>
          )}
          {filtroActivo.categoria && (
            <span className="bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
              Categoría: {filtroActivo.categoria}
              <button onClick={() => onFiltroChange({ ...filtroActivo, categoria: null })} className="ml-1 text-xs font-bold hover:text-red-600 transition">×</button>
            </span>
          )}
          <button onClick={() => onFiltroChange({ categoria: null, marca: null })} className="text-xs text-blue-600 hover:underline">
            Limpiar todos
          </button>
        </div>
      )}

      {renderSeccion('marca', 'Marca', filtros.marca, calcularCantidades.marcas)}
      {renderSeccion('categoria', 'Tipo de Producto', filtros.categoria, calcularCantidades.categorias)}
    </div>
  );
}

export default Filtros;