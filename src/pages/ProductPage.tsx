import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { MdLocationOn } from "react-icons/md";
import SelectorVariantes from '@/components/SelectorVariantes';

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

const getPrecioFinal = (producto: Producto): number => {
  if (producto.precio !== undefined) return producto.precio;
  if (producto.precioOriginal && producto.off)
    return Math.round(producto.precioOriginal * (1 - producto.off / 100));
  return producto.precioOriginal ?? 0;
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
  const descripcionRef = useRef<HTMLParagraphElement | null>(null);
  const [tieneOverflow, setTieneOverflow] = useState(false);
  const [modoVenta, setModoVenta] = useState<'unidad' | 'caja'>('unidad');
  const [cantidad, setCantidad] = useState(1);

const calcularPrecioVenta = (
  base: Producto,
  modo: 'unidad' | 'caja'
): number => {
  const precioBase = base.tipoVenta?.[modo]?.precio;
  const off = base.off ?? 0;
  if (precioBase) {
    return Math.round(precioBase * (1 - off / 100));
  }
  return getPrecioFinal(base); // Fallback
};

const precioTipoVenta = producto ? calcularPrecioVenta(producto, modoVenta) : 0;


  const total = precioTipoVenta * cantidad;

  useEffect(() => {
    if (!id) return;
    setProducto(undefined);
    setMainImage('');
    setVariantes([]);

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

    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (descripcionRef.current && producto?.descripcion) {
      const el = descripcionRef.current;
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '20');
      const maxHeight = lineHeight * 3;
      setTieneOverflow(el.scrollHeight > maxHeight);
    }
  }, [producto?.descripcion, mostrarDescripcionCompleta]);

  if (!producto) {
    return <div className="p-8 text-center text-gray-600">Producto no encontrado.</div>;
  }

  const precioFinal = getPrecioFinal(producto);
  const ratingAvg = producto.rating ?? 0;
  const reviewsCount = producto.reviewsCount ?? 0;

  return (
    <div className="bg-white">
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:underline">Inicio</Link> &gt;{" "}
        <Link to={rutaCategoria} className="hover:underline">Productos</Link> &gt;{" "}
        <span className="font-semibold text-gray-700">{producto.categoria}</span>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col-reverse md:flex-row gap-8 items-start">
        {/* Galería + descripción */}
        <div className="flex flex-col gap-6 md:basis-[60%] md:max-w-[60%]">
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
            <p
              ref={descripcionRef}
              className={clsx(
                'whitespace-pre-line leading-relaxed transition-all duration-300',
                !mostrarDescripcionCompleta && 'line-clamp-3'
              )}
            >
              {producto.descripcion || 'Sin descripción disponible.'}
            </p>
            {producto.descripcion && tieneOverflow && (
              <button
                className="mt-2 text-blue-600 hover:underline text-xs"
                onClick={() => setMostrarDescripcionCompleta(prev => !prev)}
              >
                {mostrarDescripcionCompleta ? 'Leer menos' : 'Leer más...'}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-5 w-full md:basis-[40%] md:max-w-[40%] bg-white border rounded-xl shadow px-6 py-6">
  <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>

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

  {/* Detalles técnicos */}
  <div className="text-sm text-gray-700 divide-y divide-gray-200">
    <div className="pb-2 space-y-1">
      <p><span className="font-medium">Marca:</span> {producto.marca}</p>
      <p><span className="font-medium">Categoría:</span> {producto.categoria}</p>
      {producto.capacidad && <p><span className="font-medium">Capacidad:</span> {producto.capacidad} L</p>}
      <p>
        <span className="font-medium">Disponibilidad:</span>{" "}
        {typeof producto.stock === "number" ? (
          producto.stock === 0 ? (
            <span className="text-red-600">Agotado</span>
          ) : producto.stock < 5 ? (
            <span className="text-red-400">Últimas {producto.stock}</span>
          ) : (
            <span className="text-green-600">En stock</span>
          )
        ) : (
          <span className="text-gray-500">Sin datos</span>
        )}
      </p>
    </div>
  </div>

  {/* Variantes */}
  {variantes.length > 1 && (
    <SelectorVariantes
      variantes={variantes}
      productoActualId={producto.id}
      onSeleccionar={(id) => navigate(`/producto/${id}`)}
    />
  )}

  {/* Precio */}
  <div className="bg-gray-100 rounded-md p-4 border">
    {producto.tipoVenta?.[modoVenta]?.precio ? (
      <>
        <span className="text-sm text-gray-500 line-through block">
          {formatearPrecio(producto.tipoVenta[modoVenta]?.precio || 0)}
        </span>
        <span className="text-3xl font-extrabold text-gray-800">
          {formatearPrecio(precioTipoVenta)}
        </span>
        {producto.off && (
          <span className="text-green-600 ml-2 font-bold text-md">{producto.off}% OFF</span>
        )}
      </>
    ) : (
      <>
        {producto.precioOriginal && (
          <span className="text-sm text-gray-500 line-through block">
            {formatearPrecio(producto.precioOriginal)}
          </span>
        )}
        <span className="text-3xl font-extrabold text-gray-800">
          {precioFinal ? formatearPrecio(precioFinal) : "Sin precio"}
        </span>
        {producto.off && (
          <span className="text-green-600 ml-2 font-bold text-sm">{producto.off}% OFF</span>
        )}
      </>
    )}
  </div>

  {/* Selector unidad / caja */}
{/lija/i.test(producto.nombre) && (
  <div className="mt-4 space-y-3 text-sm">
    {/* Botones unidad / caja */}
    <div className="flex gap-3">
      {["unidad", "caja"].map((modo) => (
        <button
          key={modo}
          onClick={() => {
            setModoVenta(modo as "unidad" | "caja");
            setCantidad(1);
          }}
          className={clsx(
            "px-5 py-2 rounded-full border text-sm font-medium capitalize transition-all duration-200",
            modoVenta === modo
              ? "bg-yellow-300 text-gray-900 border-yellow-500 shadow-md"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          )}
        >
          {modo}
        </button>
      ))}
    </div>

    {/* Info precio */}
    {modoVenta === "unidad" && (
      <p className="text-gray-600 text-sm">
        Precio por unidad:{" "}
        <span className="font-medium text-gray-800">
          {formatearPrecio(precioTipoVenta)}
        </span>
      </p>
    )}

    {modoVenta === "caja" && producto.tipoVenta?.caja?.unidadesPorCaja && (
      <p className="text-gray-600 text-sm">
        Caja de{" "}
        <span className="font-semibold text-gray-800">
          {producto.tipoVenta.caja.unidadesPorCaja}
        </span>{" "}
        unidades – Total caja:{" "}
        <span className="font-medium text-gray-800">
          {formatearPrecio(precioTipoVenta)}
        </span>
      </p>
    )}

    {/* Contador cantidad */}
    <div className="flex items-center gap-4 mt-2">
      <button
        onClick={() => setCantidad((c) => Math.max(1, c - 1))}
        className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition"
      >
        −
      </button>
      <span className="text-lg font-semibold text-gray-800">{cantidad}</span>
      <button
        onClick={() => setCantidad((c) => c + 1)}
        className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition"
      >
        +
      </button>
    </div>

    {/* Total */}
    <p className="mt-1 text-base font-semibold text-gray-900">
      Total: {formatearPrecio(total)}
    </p>
  </div>
)}

  {/* Cuotas + retiro */}
  {precioFinal && (
    <p className="text-sm text-gray-500">
      En 6 cuotas sin interés de {formatearPrecio(precioFinal / 6)}
    </p>
  )}

  <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm mt-3">
    <MdLocationOn className="text-xl" />
    <span>Retirá GRATIS en nuestra sucursal</span>
  </div>

  {/* Botón */}
  <button
    disabled={!precioFinal}
    className={clsx(
      "w-full font-semibold px-6 py-3 rounded-xl shadow transition-all",
      precioFinal
        ? "bg-yellow-500 hover:bg-yellow-600 text-white active:animate-wiggle"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    )}
    onClick={() => {
      if (precioFinal) {
        addItem({
          ...producto,
          cantidad,
          precio: precioTipoVenta,
          modoVenta,
        });
        toast.success("Producto agregado al carrito");
      }
    }}
  >
    {precioFinal ? "Agregar al carrito" : "Sin precio disponible"}
  </button>

  {/* Especificaciones */}
  {producto.especificaciones && (
    <details className="mt-4 text-sm text-gray-700">
      <summary className="cursor-pointer font-medium">Características técnicas</summary>
      <ul className="mt-2 list-disc list-inside space-y-1">
        {Object.entries(producto.especificaciones).map(([k, v]) => (
          <li key={k}>
            <strong>{k}:</strong> {v}
          </li>
        ))}
      </ul>
    </details>
  )}
</div>
</div>

      {/* Productos relacionados */}
      <RelatedProducts categoria={producto.categoria} currentId={producto.id} />
    </div>
    </div>
  );
}

// El resto del código queda igual, sin cambios

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

  if (related.length < 6) {
    const adicionales = todosLosProductos.filter(
      p => !idsAExcluir.has(p.id) && !related.includes(p)
    );
    related = [...related, ...adicionales].slice(0, 6);
  } else {
    related = related.slice(0, 6);
  }

  if (related.length === 0) return null;

  return (
  <div className="mt-12">
    <h2 className="text-xl font-semibold mb-4">También puede interesarte</h2>

    {/* ✅ Desktop: grid de 3 productos */}
    <div className="hidden sm:grid grid-cols-3 gap-4 max-w-[730px]">
      {related.slice(0, 3).map(p => {
        const precioFinal = getPrecioFinal(p) ?? 0;
        return (
          <div
            key={p.id}
            className="border rounded p-2 hover:shadow flex flex-col justify-between bg-white"
          >
            <Link to={`/producto/${p.id}`} className="block">
              <img
                src={p.imagen}
                alt={p.nombre}
                loading="lazy"
                className="w-full h-32 object-contain mb-2 transition-transform duration-300 hover:scale-105"
              />
              <p className="text-sm font-medium text-gray-800 line-clamp-2 h-10">{p.nombre}</p>
            </Link>
            <p className="text-sm font-bold text-yellow-600 mt-1">
              {formatearPrecio(precioFinal)}
            </p>
            <button
  onClick={() => {
    const precioFinal = getPrecioFinal(p) ?? 0;
    addItem({
      ...p,
      cantidad: 1,
      precioFinal,
      precio: precioFinal, 
    });
    toast.success('Producto agregado al carrito');
  }}
  className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded shadow active:animate-wiggle"
>
  Agregar al carrito
</button>

          </div>
        );
      })}
    </div>

    {/* ✅ Mobile: carrusel horizontal con scroll suave */}
    <div className="sm:hidden overflow-x-auto scroll-smooth snap-x snap-mandatory px-1">
      <div className="flex gap-4">
        {related.map(p => {
          const precioFinal = getPrecioFinal(p) ?? 0;
          return (
            <div
              key={p.id}
              className="min-w-[260px] max-w-[260px] bg-white rounded shadow border flex flex-col snap-start overflow-hidden"
            >
              <div className="flex gap-3 p-3 items-center">
                {/* Imagen izquierda */}
                <Link to={`/producto/${p.id}`} className="w-1/2">
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    loading="lazy"
                    className="w-full h-24 object-contain"
                  />
                </Link>
                {/* Info derecha */}
                <div className="w-1/2 flex flex-col justify-between">
                  <Link to={`/producto/${p.id}`} className="block">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 h-10">
                      {p.nombre}
                    </p>
                  </Link>
                  <p className="text-sm font-bold text-yellow-600 mt-1">
                    {formatearPrecio(precioFinal)}
                  </p>
                </div>
              </div>
              {/* Botón abajo */}
              <div className="p-2 border-t">
                <button
  onClick={() => {
    const precioFinal = getPrecioFinal(p) ?? 0;
    addItem({
      ...p,
      cantidad: 1,
      precioFinal,
      precio: precioFinal, // ✅ Lo mismo acá
    });
    toast.success('Producto agregado al carrito');
  }}
  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded shadow active:animate-wiggle"
>
  Agregar al carrito
</button>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
}