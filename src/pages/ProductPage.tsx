import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import { productosPulidos } from '@/data/Pulidos';
import { productosIndustria } from '@/data/Industria';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import RelatedProducts from './ProductPage/RelatedProducts';
import ImageZoom from '@/components/ImageZoom';
import VariantCarousel from '@/components/VariantCarousel';

// --- Helpers ---
const normalizarMarca = (marca: string) =>
  marca.trim().toLowerCase().replace(/\s+/g, '');

const logosMarca: Record<string, string> = {
  ppg: "/img/Marcas/Logo-PPG-Color1.png",
  menzerna: "/img/Marcas/Logo-Menzerna-Color1.png",
  wurth: "/img/Marcas/Logo-Wurth-Color1.png",
  elgalgo: "/img/Marcas/Logo-ElGalgo-Color1.png",
  kovax: "/img/Marcas/Logo-Kovax-Color1.png",
  roberlo: "/img/Marcas/Logo-Roberlo-Color1.png",
  sherwinwilliams: "/img/Marcas/Logo-Sherwin-Color1.png",
  sinteplast: "/img/Marcas/Logo-Sinteplast-Color1.png",
  sata: "/img/Marcas/Logo-SATA-Color.png",
  montana: "/img/Marcas/LogoMTN1-Photoroom.png",
  mirka: "/img/Marcas/Logo-Mirka-Color.png",
  rapifix: "/img/Marcas/Logo-Rapifix-Color.png",
  "3m": "/img/Marcas/Logo-3M-Color.png",
};

const todosLosProductos = [
  ...productosPinturas,
  ...productosAbrasivos,
  ...productosAutomotor,
  ...productosPulidos,
  ...productosAccesorios,
  ...productosIndustria,
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState<string>('');

  // Estado del producto
  const [product, setProduct] = useState<Producto | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Carga del producto
  useEffect(() => {
    window.scrollTo(0, 0);
    let foundProduct: Producto | undefined;
    let foundVariant: Producto | undefined;

    for (const p of todosLosProductos) {
      if (p.id === id) {
        foundProduct = p;
        foundVariant = p;
        break;
      }
      const v = p.variantes?.find(v => v.id === id);
      if (v) {
        foundProduct = p;
        foundVariant = v;
        break;
      }
    }

    if (foundProduct && foundVariant) {
      setProduct(foundProduct);
      setSelectedVariant(foundVariant);
      setActiveImage(foundVariant.imagen);
    }
  }, [id]);

  // Reset al cambiar variante
  useEffect(() => {
    if (selectedVariant) {
      setActiveImage(selectedVariant.imagen);
      setQuantity(1);
      setShowFullDesc(false);
    }
  }, [selectedVariant]);

  // Cálculos de Precio
  const { price, originalPrice, off, hasDiscount } = useMemo(() => {
    if (!selectedVariant) return { price: 0, originalPrice: 0, off: 0, hasDiscount: false };

    const rawPrice = selectedVariant.precio ?? selectedVariant.precioOriginal ?? 0;
    const rawOriginal = selectedVariant.precioOriginal ?? rawPrice;
    const rawOff = selectedVariant.off ?? 0;

    // Si tiene descuento explícito
    if (rawOff > 0 && rawOriginal > 0) {
      const finalPrice = Math.round(rawOriginal * (1 - rawOff / 100));
      return { price: finalPrice, originalPrice: rawOriginal, off: rawOff, hasDiscount: true };
    }

    return { price: rawPrice, originalPrice: rawOriginal, off: 0, hasDiscount: false };
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (!selectedVariant || price === 0) return;
    addItem({
      ...selectedVariant,
      cantidad: quantity,
      precio: price,
      precioFinal: price,
    });
    toast.success('Agregado al carrito');
  };

  if (!product || !selectedVariant) return <div className="min-h-screen grid place-items-center">Cargando...</div>;

  const isMontana = normalizarMarca(product.marca || '') === 'montana';

  const variantOptions = product.variantes && product.variantes.length > 0
    ? (isMontana ? product.variantes : [product, ...product.variantes])
    : [];

  // Imágenes para galería
  const galleryImages = Array.from(new Set([
    product.imagen,
    ...(product.imgOpcionales || []),
    ...(product.variantes?.map(v => v.imagen) || [])
  ])).filter(Boolean);

  // const isIndustrial = product.categoria === "Industria" || product.seccion === "Industria";

  return (
    <div className="bg-white min-h-screen font-gotham">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-4 lg:mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-black transition-colors">Inicio</Link>
          <ChevronRight size={14} className="mx-2" />
          <Link to="/productos" className="hover:text-black transition-colors">Productos</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="font-bold text-black">{product.nombre}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Columna Izquierda: Imágenes */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex flex-wrap lg:flex-col gap-3 justify-center lg:justify-start lg:max-h-[500px]">
              {galleryImages.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`w-14 h-14 lg:w-20 lg:h-20 shrink-0 border-2 rounded-xl overflow-hidden transition-all ${activeImage === img ? 'border-yellow-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply p-1" />
                </button>
              ))}
            </div>

            <div
              className="flex-grow bg-white border border-gray-100 shadow-sm rounded-3xl p-1 lg:p-2 relative group aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: selectedVariant.colorHex ? selectedVariant.colorHex : undefined }}
            >
              <ImageZoom
                src={activeImage}
                alt={selectedVariant.nombre}
                className="w-full h-full object-contain"
                galleryImages={galleryImages}
              />
              {/* Marca Logo watermark - Hide if we have a color background because it might look messy */}
              {!selectedVariant.colorHex && product.marca && logosMarca[normalizarMarca(product.marca)] && (
                <img
                  src={logosMarca[normalizarMarca(product.marca)]}
                  className="absolute top-4 right-4 lg:top-5 lg:right-5 w-16 lg:w-24 mix-blend-multiply contrast-130"
                  alt={product.marca}
                />
              )}
            </div>
          </div>

          {/* Columna Derecha: Info */}
          <div className="flex flex-col lg:sticky lg:top-24 h-fit">
            <span className="text-gray-400 font-bold tracking-widest text-xs uppercase mb-2">
              {product.marca} • {product.categoria}
            </span>
            <h1 className="text-2xl lg:text-4xl font-black text-black leading-tight mb-4">
              {selectedVariant.nombre}
            </h1>

            {/* PRECIO */}
            <div className="mb-6 lg:mb-8 p-4 lg:p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl lg:text-5xl font-black text-black tracking-tight">
                  ${price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl lg:text-2xl text-gray-400 line-through mb-1.5 font-medium">
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                    {off}% OFF
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6"></div>

            {/* Selector de Variantes con Carrusel manual */}
            {variantOptions.length > 0 && (
              <div className="mb-6 lg:mb-8">
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  {/* Dynamic Label Logic */}
                  {(() => {
                    const firstVariant = variantOptions[0];
                    if (firstVariant.color || firstVariant.ColorAerosol || firstVariant.colorHex) return "Seleccionar Color:";
                    if (firstVariant.capacidad) return "Seleccionar Capacidad:";
                    if (firstVariant.grano || (firstVariant.especificaciones && firstVariant.especificaciones.Grano)) return "Seleccionar Grano:";
                    return "Seleccionar Variante:";
                  })()}
                </label>

                <VariantCarousel
                  variants={variantOptions}
                  selectedVariant={selectedVariant}
                  productName={product.nombre}
                  onSelect={(v) => navigate(`/producto/${v.id}`)}
                />
              </div>
            )}

            {/* Selector de Cantidad + Botón Agregar */}
            <div className="flex gap-3 lg:gap-4 mb-6 lg:mb-8">
              {/* Deshabilitar selector de cantidad visualmente */}
              <div className="flex items-center bg-gray-100 rounded-xl px-2 lg:px-4 py-2 gap-2 lg:gap-4 h-12 lg:h-auto">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-xl hover:text-yellow-600 transition"
                >-</button>
                <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center font-bold text-xl hover:text-yellow-600 transition"
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={price === 0 || (isMontana && product.id === selectedVariant.id && variantOptions.length > 0)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-bold text-base lg:text-lg h-12 lg:h-auto transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${price === 0 || (isMontana && product.id === selectedVariant.id && variantOptions.length > 0)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-[#fff03b] text-black hover:bg-[#ffe135]' // Amarillo original
                  }`}
              >
                <ShoppingCart size={20} />
                {isMontana && product.id === selectedVariant.id && variantOptions.length > 0 ? 'SELECCIONA UNA VARIANTE' : 'AGREGAR AL CARRITO'}
              </button>
            </div>

            {/* Descripción */}
            <div className="prose prose-sm text-gray-600">
              <h3 className="text-black font-bold uppercase tracking-widest text-xs mb-3">Descripción</h3>
              <p className={`leading-relaxed whitespace-pre-line ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                {selectedVariant.descripcion || product.descripcion}
              </p>
              {(selectedVariant.descripcion || product.descripcion || '').length > 150 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-black font-bold text-xs underline mt-2 hover:text-yellow-600"
                >
                  {showFullDesc ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>

            {/* Especificaciones Técnicas */}
            {product.especificaciones && (
              <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-100">
                <h3 className="text-black font-bold uppercase tracking-widest text-xs mb-4">Especificaciones</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {Object.entries(product.especificaciones).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-100 pb-2">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

          </div>
        </div>

        <RelatedProducts categoria={product.categoria} currentId={product.id} />
      </div>
    </div>
  );
}