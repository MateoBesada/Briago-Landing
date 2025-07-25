import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '@/types/Producto';

interface GlobalSearchProps {
  productos: Producto[];
  query: string;
  setQuery: (value: string) => void;
  agregarAlCarrito: (producto: Producto) => void;
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export default function GlobalSearch({
  productos,
  query,
  setQuery,
  agregarAlCarrito,
}: GlobalSearchProps) {
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const flattenProductos = (lista: Producto[]) =>
    lista.flatMap((p) => [p, ...(p.variantes ?? [])]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setResultados([]);
      setOpen(false);
      return;
    }

    const palabras = normalizar(query.toLowerCase()).split(/\s+/).filter(Boolean);
    const productosPlanos = flattenProductos(productos);

    const filtrados = productosPlanos
      .filter((p) => {
        const texto = normalizar(`${p.nombre} ${p.descripcion ?? ''}`.toLowerCase());
        return palabras.every((palabra) => texto.includes(palabra));
      })
      .filter(
        (producto, index, self) =>
          index === self.findIndex((p) => p.id === producto.id)
      );

    setResultados(filtrados);
    setOpen(filtrados.length > 0);
  }, [query, productos]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderResultados = () => {
    if (resultados.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No se encontraron productos
        </div>
      );
    }

    return resultados.map((p) => (
      <Link
        to={`/producto/${p.id}`}
        key={p.id}
        className="flex items-center gap-4 bg-white rounded-lg shadow hover:bg-gray-100 transition p-3 mb-3"
        onClick={() => setOpen(false)}
      >
        <div className="relative min-w-[60px] max-w-[60px]">
          {p.off && p.off > 0 && (
            <div className="absolute -top-3 -left-2 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              {p.off}% OFF
            </div>
          )}
          <img
            src={p.imagen}
            alt={p.nombre}
            className="w-14 h-14 object-contain"
          />
        </div>

        <div className="flex flex-col flex-1">
          <span className="text-black font-semibold text-sm leading-tight">
            {p.nombre}
          </span>
          <span className="text-black font-bold text-sm mt-1">
            $
            {(p.precio ??
              (p.precioOriginal && p.off != null
                ? Math.round(p.precioOriginal * (1 - p.off / 100))
                : p.precioOriginal)
            )?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) ?? 'Consultar'}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault(); // evita redirección inmediata
            agregarAlCarrito(p);
          }}
          className="bg-black text-yellow-400 hover:text-black text-sm font-semibold rounded-full px-4 py-1 transition hover:bg-yellow-300 hover:border hover:border-black"
        >
          Agregar
        </button>
      </Link>
    ));
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        />
      )}

      <div
        ref={ref}
        className="relative z-50 w-full max-w-[480px] md:w-[480px] mx-auto"
      >
        <input
          type="search"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setOpen(true)}
          className="w-full px-5 py-1.5 text-base rounded-full border border-black text-black placeholder-gray-600 bg-white focus:outline-none shadow-md"
        />

        <div
          className={`hidden md:block absolute top-full mt-6 bg-white border border-black shadow-xl max-h-[70vh] overflow-y-auto transition-all duration-300 ease-in-out px-2 w-[480px] left-1/2 -translate-x-1/2 z-50
            ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
        >
          {renderResultados()}
        </div>
      </div>

      {open && (
        <div className="block md:hidden fixed top-20 left-0 right-0 z-50 px-2">
          <div className="bg-white border border-black rounded-lg shadow-xl max-h-[70vh] overflow-y-auto px-2 py-4 w-full">
            {renderResultados()}
          </div>
        </div>
      )}
    </>
  );
}
