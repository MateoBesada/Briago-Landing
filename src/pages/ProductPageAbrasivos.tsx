import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar } from 'react-icons/fa';

const logosMarca: Record<string, string> = {
  andina: "/img/Marcas/Andina-color.png",
  ppg: "/img/Marcas/Ppg-color.png",
  menzerna: "/img/Marcas/menzerna-color.png",
  wurth: "/img/Marcas/Wurth-color.png",
  elgalgo: "/img/Marcas/Logo-ElGalgo-Color.png",
  kovax: "/img/Marcas/Kovax-color.png",
  norton: "/img/Marcas/Norton-color.png",
  autopolish: "/img/Marcas/Autopolish-color.png",
  roberlo: "/img/Marcas/Roberlo-color.png",
  sherwinwilliams: "/img/Marcas/Sherwin-color.png",
  sinteplast: "/img/Marcas/Sinteplast-color.png",
  vitecso: "/img/Marcas/Vitecso-color.png",
  netso: "/img/Marcas/Netso.png",
};

const normalizarMarca = (marca: string) =>
  marca.trim().toLowerCase().replace(/\s+/g, '');

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);

const todosLosProductos: Producto[] = [
  ...productosPinturas,
  ...productosAutomotor,
  ...productosAbrasivos,
  ...productosAccesorios,
];

const getPrecioFinal = (producto: Producto): number | null => {
  if (producto.precio) return producto.precio;
  if (producto.precioOriginal && producto.off)
    return Math.round(producto.precioOriginal * (1 - producto.off / 100));
  return producto.precioOriginal ?? null;
};

export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [producto, setProducto] = useState<Producto | undefined>();
  const [variantes, setVariantes] = useState<Producto[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [mostrarDescripcionCompleta, setMostrarDescripcionCompleta] = useState(false);
  const [rutaCategoria, setRutaCategoria] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    let found: Producto | undefined;
    let vars: Producto[] = [];

    const buscar = (productos: Producto[], ruta: string): boolean => {
      for (const p of productos) {
        if (p.id === id) {
          found = p;
          vars = [p, ...(p.variantes ?? [])];
          setRutaCategoria(ruta);
          return true;
        }
        const v = p.variantes?.find(variant => variant.id === id);
        if (v) {
          found = v;
          vars = [p, ...(p.variantes ?? [])];
          setRutaCategoria(ruta);
          return true;
        }
      }
      return false;
    };

    buscar(productosPinturas, '/Productos-pinturas') ||
    buscar(productosAbrasivos, '/Productos-abrasivos') ||
    buscar(productosAutomotor, '/Productos-automotor') ||
    buscar(productosAccesorios, '/Productos-accesorios');

    if (found) {
      setProducto(found);
      setVariantes(vars);

      const imagenesCompletas = [
        ...(found.imagenes ?? []),
        ...(found.imgOpcionales ?? []),
        found.imagen
      ].filter(Boolean);

      setMainImage(imagenesCompletas[0] || '');
      document.title = `${found.nombre} | Pinturería Briago`;
    }
  }, [id]);

  if (!producto) {
    return <div className="p-8 text-center text-gray-600">Producto no encontrado.</div>;
  }

  const precioFinal = getPrecioFinal(producto);
  const ratingAvg = producto.rating ?? 0;
  const reviewsCount = producto.reviewsCount ?? 0;
  const LIMITE_CARACTERES = 300;

  const [presentacion, setPresentacion] = useState<'unidad' | 'caja'>('unidad');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
  {/* Breadcrumbs */}
  <div className="text-sm text-gray-500 mb-6">
    <Link to="/" className="hover:underline">Inicio</Link> &gt;{" "}
    <Link to={rutaCategoria} className="hover:underline">Productos</Link> &gt;{" "}
    <span className="font-semibold text-gray-700">{producto.categoria}</span>
  </div>

  {/* Contenido principal */}
  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
    {/* Galería + descripción */}
    <div className="flex flex-col gap-6">
      {/* Galería con miniaturas */}
      <div className="flex gap-4">
        {/* Miniaturas verticales */}
        <div className="flex flex-col gap-2">
          {[...(producto.imagenes ?? []), ...(producto.imgOpcionales ?? []), producto.imagen]
            .filter(Boolean)
            .map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${producto.nombre} ${idx}`}
                className={clsx(
                  'w-16 h-16 object-cover border rounded cursor-pointer transition-all',
                  img === mainImage
                    ? 'ring-2 ring-yellow-500'
                    : 'hover:ring-2 hover:ring-yellow-300'
                )}
                onClick={() => setMainImage(img)}
              />
            ))}
        </div>

        {/* Imagen principal */}
        <div className="relative flex-1 border rounded shadow bg-white flex items-center justify-center min-h-[250px] md:h-[320px] px-6">
          {producto.marca && logosMarca[normalizarMarca(producto.marca)] && (
            <img
              src={logosMarca[normalizarMarca(producto.marca)]}
              alt={producto.marca}
              className="absolute top-2 left-2 w-20 h-auto object-contain z-10 opacity-80"
            />
          )}
          <img
            src={mainImage}
            alt={producto.nombre}
            loading="lazy"
            className="max-h-[80%] max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-gray-200 p-5 rounded shadow text-sm border border-gray-300 text-gray-700">
        <p className="font-semibold mb-2 text-base text-gray-800">Descripción del producto:</p>
        <p className="whitespace-pre-line leading-relaxed">
          {producto.descripcion
            ? mostrarDescripcionCompleta
              ? producto.descripcion
              : producto.descripcion.slice(0, LIMITE_CARACTERES) +
                (producto.descripcion.length > LIMITE_CARACTERES ? '...' : '')
            : 'Sin descripción disponible.'}
        </p>
        {producto.descripcion && producto.descripcion.length > LIMITE_CARACTERES && (
          <button
            className="mt-2 text-blue-600 hover:underline text-xs"
            onClick={() => setMostrarDescripcionCompleta(prev => !prev)}
          >
            {mostrarDescripcionCompleta ? 'Leer menos' : 'Leer más...'}
          </button>
        )}
      </div>
    </div>

    {/* Detalles del producto */}
    <div className="space-y-5 w-full bg-white border rounded shadow px-6 py-5">
      <h1 className="text-2xl font-bold text-gray-900">{producto.nombre}</h1>

      {/* Rating */}
      {reviewsCount > 0 && (
        <div className="flex items-center gap-1 text-yellow-500">
          {[...Array(5)].map((_, i) =>
            i < Math.round(ratingAvg) ? <FaStar key={i} /> : <FaRegStar key={i} />
          )}
          <span className="text-gray-700 text-sm ml-2">
            {ratingAvg.toFixed(1)} · {reviewsCount} opiniones
          </span>
        </div>
      )}

      {/* Info técnica */}
      <div className="text-sm text-gray-700 space-y-1">
        <p><strong>Marca:</strong> {producto.marca}</p>
        <p><strong>Categoría:</strong> {producto.categoria}</p>
        {producto.capacidad && <p><strong>Capacidad:</strong> {producto.capacidad} L</p>}
        <p><strong>Disponibilidad:</strong>{' '}
  {typeof producto.stock === 'number' ? (
    producto.stock === 0 ? (
      <span className="text-red-600">Agotado</span>
    ) : producto.stock < 5 ? (
      <span className="text-red-600">Últimas {producto.stock}</span>
    ) : (
      <span className="text-green-600">En stock</span>
    )
  ) : (
    <span className="text-gray-500">Sin datos</span>
  )}
</p>

      </div>

      {/* Variantes */}
      {variantes.length > 1 && (
        <div>
          <p className="font-semibold text-sm text-gray-800 mb-1">Litros:</p>
          <div className="flex gap-2 flex-wrap">
            {variantes.map(v => (
              <button
                key={v.id}
                onClick={() => navigate(`/producto/${v.id}`)}
                className={clsx(
                  'border rounded px-3 py-1 text-sm',
                  v.id === producto.id
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white hover:border-yellow-400'
                )}
              >
                {v.capacidad ?? 'Variante'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Precio */}
      <div className="mt-2">
        {producto.precioOriginal && (
          <span className="text-sm text-gray-500 line-through block">
            {formatearPrecio(producto.precioOriginal)}
          </span>
        )}
        <span className="text-2xl font-bold text-yellow-600">
          {precioFinal ? formatearPrecio(precioFinal) : 'Sin precio'}
        </span>
        {producto.off && <span className="text-green-600 ml-2">{producto.off}% OFF</span>}
      </div>

      {precioFinal && (
        <p className="text-sm text-gray-500">
          En 6 cuotas sin interés de {formatearPrecio(precioFinal / 6)}
        </p>
      )}

{/* Selector Unidad / Caja */}
<div className="flex gap-2 items-center mt-4">
  <span className="font-semibold text-sm text-gray-800">Presentación:</span>
  <div className="flex gap-2">
    <button
      onClick={() => setPresentacion('unidad')}
      className={clsx(
        'px-3 py-1 rounded border text-sm transition-colors',
        presentacion === 'unidad'
          ? 'bg-yellow-500 text-white border-yellow-500'
          : 'bg-white text-gray-800 hover:border-yellow-400'
      )}
    >
      Unidad
    </button>
    <button
      onClick={() => setPresentacion('caja')}
      className={clsx(
        'px-3 py-1 rounded border text-sm transition-colors',
        presentacion === 'caja'
          ? 'bg-yellow-500 text-white border-yellow-500'
          : 'bg-white text-gray-800 hover:border-yellow-400'
      )}
    >
      Caja
    </button>
  </div>
</div>

      {/* Botón */}
      <button
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded shadow active:animate-wiggle"
        onClick={() => {
          addItem({
  ...producto,
  cantidad: 1,
  precio: producto.precio ?? 0, // o producto.precio!
});

          toast.success('Producto agregado al carrito');
        }}
      >
        Agregar al carrito
      </button>

      {/* Especificaciones */}
      {producto.especificaciones && (
        <details className="mt-2 text-sm text-gray-700">
          <summary className="cursor-pointer font-medium">Características técnicas</summary>
          <ul className="mt-2 list-disc list-inside">
            {Object.entries(producto.especificaciones).map(([k, v]) => (
              <li key={k}><strong>{k}:</strong> {v}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  </div>

  {/* Productos relacionados */}
  <RelatedProducts categoria={producto.categoria} currentId={producto.id} />
</div>

  );
}

function RelatedProducts({ categoria, currentId }: { categoria: string; currentId: string }) {
  const { addItem } = useCart();

  const currentBase = todosLosProductos.find(
    p => p.id === currentId || p.variantes?.some(v => v.id === currentId)
  );

  const variantesIds = currentBase?.variantes?.map(v => v.id) ?? [];
  const idsAExcluir = new Set([currentBase?.id, ...variantesIds]);

  let related = todosLosProductos.filter(
    p => p.categoria === categoria && !idsAExcluir.has(p.id)
  );

  if (related.length < 3) {
    const adicionales = todosLosProductos.filter(
      p => !idsAExcluir.has(p.id) && !related.includes(p)
    );
    related = [...related, ...adicionales].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">También puede interesarte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[730px]">
        {related.map(p => (
          <div key={p.id} className="border rounded p-2 hover:shadow flex flex-col justify-between">
            <Link to={`/producto/${p.id}`} className="block">
              <img
                src={p.imagen}
                alt={p.nombre}
                loading="lazy"
                className="w-full h-32 object-contain mb-2 transition-transform duration-300 hover:scale-105"
              />
              <p className="text-sm font-medium text-gray-800">{p.nombre}</p>
            </Link>
            <p className="text-sm font-bold text-yellow-600 mt-1">
              {formatearPrecio(getPrecioFinal(p) ?? 0)}
            </p>
            <button
              onClick={() => {
                addItem({ ...p, cantidad: 1, precio: p.precio ?? 0 });
                toast.success('Producto agregado al carrito');
              }}
              className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded shadow active:animate-wiggle"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
