import { useMemo, useState } from 'react';
import type { Producto } from '@/types/Producto';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

// Componente extraído para evitar re-renderizados que resetean el estado
const FilterSection = ({
    titulo,
    items,
    cantidades,
    selectedValue,
    onChange
}: {
    titulo: string,
    items: string[],
    cantidades: Record<string, number>,
    selectedValue: string | null,
    onChange: (val: string) => void
}) => {
    // Estado inicial basado en el ancho de la pantalla
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768; // 768px es el breakpoint 'md' usual de Tailwind
        }
        return true;
    });

    const ordenados = [...items].sort(
        (a, b) => (cantidades[b] || 0) - (cantidades[a] || 0)
    );

    if (items.length === 0) return null;

    return (
        <div className="border-b border-slate-200 py-4 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full group"
            >
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 group-hover:text-briago-yellow transition-colors">
                    {titulo}
                </h3>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-briago-yellow" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-briago-yellow" />
                )}
            </button>

            {isOpen && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {ordenados.map((item) => {
                        const activo = selectedValue === item;
                        const cantidad = cantidades[item] || 0;

                        return (
                            <label
                                key={item}
                                className={`flex items-center justify-between text-sm cursor-pointer group py-1`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors
                      ${activo
                                            ? 'bg-briago-yellow border-briago-yellow'
                                            : 'border-slate-300 group-hover:border-briago-yellow'
                                        }`}
                                    >
                                        {activo && <div className="w-2 h-2 bg-slate-900 rounded-sm" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={activo}
                                        onChange={() => onChange(item)}
                                        className="hidden"
                                    />
                                    <span className={`capitalize transition-colors ${activo ? 'font-medium text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                        {item}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                    {cantidad}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

function Filtros({
    productos,
    filtros,
    filtroActivo,
    onFiltroChange,
    titulo,
}: FiltrosProps) {
    const handleChange = (tipo: keyof typeof filtroActivo, valor: string) => {
        onFiltroChange({
            ...filtroActivo,
            [tipo]: valor === filtroActivo[tipo] ? null : valor,
        });
    };

    const hayFiltrosActivos = Object.values(filtroActivo).some(v => v !== null);

    const limpiarFiltros = () => {
        onFiltroChange({
            categoria: null,
            marca: null,
            seccion: null,
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

    return (
        <aside className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {titulo}
                    </h2>
                    {hayFiltrosActivos && (
                        <button
                            onClick={limpiarFiltros}
                            className="text-[10px] font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-500 px-2 py-1 rounded-full uppercase tracking-wider transition-all"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                    {productos.length} productos encontrados
                </p>
            </div>

            <div className="space-y-1">
                {filtros.seccion && (
                    <FilterSection
                        titulo="Categoría"
                        items={filtros.seccion}
                        cantidades={cantidades.secciones}
                        selectedValue={filtroActivo.seccion ?? null}
                        onChange={(val) => handleChange('seccion', val)}
                    />
                )}
                <FilterSection
                    titulo="Marca"
                    items={filtros.marca}
                    cantidades={cantidades.marcas}
                    selectedValue={filtroActivo.marca}
                    onChange={(val) => handleChange('marca', val)}
                />
                <FilterSection
                    titulo="Tipo de Producto"
                    items={filtros.categoria}
                    cantidades={cantidades.categorias}
                    selectedValue={filtroActivo.categoria}
                    onChange={(val) => handleChange('categoria', val)}
                />
            </div>
        </aside>
    );
}

export default Filtros;
