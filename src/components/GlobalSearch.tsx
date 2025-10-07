import React, { useState, useEffect, useMemo, useRef, FC } from 'react';
import { Link } from 'react-router-dom';
import Fuse from 'fuse.js';
import type { FuseResult, FuseResultMatch, IFuseOptions } from 'fuse.js';
import { Search, Paintbrush, Tags, Building2 } from 'lucide-react';

export interface Producto {
  id: number | string;
  nombre: string;
  marca: string;
  categoria: string;
  descripcion?: string;
  slug?: string;
}

interface SimpleSearchItem {
  nombre: string;
}

interface GlobalSearchProps {
  productos: Producto[];
  query: string;
  setQuery: (query: string) => void;
  onResultClick?: () => void; // Prop opcional para notificar un clic
}

interface HighlightProps {
  text: string;
  matches: readonly FuseResultMatch[] | undefined;
  keyName: string;
}

interface SearchResults {
  productos: FuseResult<Producto>[];
  categorias: FuseResult<SimpleSearchItem>[];
  marcas: FuseResult<SimpleSearchItem>[];
}

const Highlight: FC<HighlightProps> = ({ text, matches, keyName }) => {
  if (!matches) return <span>{text}</span>;
  const highlightMatch = matches.find(m => m.key === keyName);
  if (!highlightMatch || !highlightMatch.indices) {
    return <span>{text}</span>;
  }
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  highlightMatch.indices.forEach(([start, end]: readonly [number, number], i: number) => {
    if (start > lastIndex) {
      result.push(<span key={`unmatched-${i}-pre`}>{text.substring(lastIndex, start)}</span>);
    }
    result.push(
      <strong key={`matched-${i}`} className="text-black font-bold">
        {text.substring(start, end + 1)}
      </strong>
    );
    lastIndex = end + 1;
  });
  if (lastIndex < text.length) {
    result.push(<span key="unmatched-post">{text.substring(lastIndex)}</span>);
  }
  return <>{result}</>;
};

const GlobalSearch: FC<GlobalSearchProps> = ({ productos, query, setQuery, onResultClick }) => {
  const [results, setResults] = useState<SearchResults>({ productos: [], categorias: [], marcas: [] });
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleResultClick = () => {
    setIsFocused(false);
    setQuery('');
    if (onResultClick) {
      onResultClick();
    }
  };

  const { categoriasUnicas, marcasUnicas } = useMemo(() => {
    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    const marcas = [...new Set(productos.map(p => p.marca).filter(Boolean))];
    return { 
      categoriasUnicas: categorias.map((c): SimpleSearchItem => ({ nombre: c })),
      marcasUnicas: marcas.map((m): SimpleSearchItem => ({ nombre: m }))
    };
  }, [productos]);

  const fuseOptions: IFuseOptions<any> = {
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.3,
  };

  const fuseProductos = useMemo(() => new Fuse<Producto>(productos, {
    ...fuseOptions,
    keys: ['nombre', 'marca', 'categoria', 'descripcion'],
    ignoreLocation: true,
  }), [productos]);

  const fuseCategorias = useMemo(() => new Fuse<SimpleSearchItem>(categoriasUnicas, {
    ...fuseOptions,
    keys: ['nombre'],
  }), [categoriasUnicas]);

  const fuseMarcas = useMemo(() => new Fuse<SimpleSearchItem>(marcasUnicas, {
    ...fuseOptions,
    keys: ['nombre'],
  }), [marcasUnicas]);

  useEffect(() => {
    if (query.trim().length > 1) {
      const productResults = fuseProductos.search(query).slice(0, 5);
      const categoryResults = fuseCategorias.search(query).slice(0, 3);
      const brandResults = fuseMarcas.search(query).slice(0, 3);
      setResults({ productos: productResults, categorias: categoryResults, marcas: brandResults });
    } else {
      setResults({ productos: [], categorias: [], marcas: [] });
    }
  }, [query, fuseProductos, fuseCategorias, fuseMarcas]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasResults = results.productos.length > 0 || results.categorias.length > 0 || results.marcas.length > 0;

  return (
    <div className="relative w-full max-w-lg" ref={searchContainerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar por producto, marca, o categoría..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-black transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {isFocused && query.length > 1 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-2xl overflow-hidden z-10 border">
          {hasResults ? (
            <div className="max-h-[60vh] overflow-y-auto">
              {results.productos.length > 0 && (
                <div className="p-2">
                  <h3 className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Productos</h3>
                  <ul>
                    {results.productos.map(({ item, matches }) => (
                      <li key={item.id}>
                        <Link to={`/producto/${item.id}`} onClick={handleResultClick} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-md transition-colors">
                          <Paintbrush className="w-5 h-5 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-800">
                            <Highlight text={item.nombre} matches={matches} keyName="nombre" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.categorias.length > 0 && (
                <div className="p-2 border-t">
                  <h3 className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Categorías</h3>
                   <ul>
                    {results.categorias.map(({ item, matches }) => (
                      <li key={item.nombre}>
                        <Link to={`/productos?categoria=${item.nombre}`} onClick={handleResultClick} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-md transition-colors">
                          <Tags className="w-5 h-5 text-gray-400 shrink-0" />
                           <span className="text-sm text-gray-800">
                            <Highlight text={item.nombre} matches={matches} keyName="nombre" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.marcas.length > 0 && (
                <div className="p-2 border-t">
                  <h3 className="px-3 py-1 text-xs font-bold text-gray-500 uppercase">Marcas</h3>
                   <ul>
                    {results.marcas.map(({ item, matches }) => (
                      <li key={item.nombre}>
                        <Link to={`/productos?marca=${item.nombre}`} onClick={handleResultClick} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-100 rounded-md transition-colors">
                          <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
                           <span className="text-sm text-gray-800">
                            <Highlight text={item.nombre} matches={matches} keyName="nombre" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-600">
              <p>No se encontraron resultados para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;