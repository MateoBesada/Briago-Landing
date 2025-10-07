import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import { productosPulidos } from '@/data/Pulidos';
import type { Producto } from '@/types/Producto';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import ProductMainInfo from './ProductPage/ProductMainInfo';
import ProductSidebar from './ProductPage/ProductSidebar';
import RelatedProducts from './ProductPage/RelatedProducts';

// --- Lógica de Datos y Helpers ---
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

const normalizarMarca = (marca: string) =>
  marca.trim().toLowerCase().replace(/\s+/g, '');

const formatearPrecio = (precio: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(precio);

const todosLosProductos = [
  ...productosPinturas,
  ...productosAbrasivos,
  ...productosAutomotor,
  ...productosPulidos,
  ...productosAccesorios,
];


// --- Componente Principal ---
export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // --- Estados del Componente ---
  const [productoBase, setProductoBase] = useState<Producto | undefined>();
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Producto | undefined>();
  const [grupoDeVariantes, setGrupoDeVariantes] = useState<Producto[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [modoVenta, setModoVenta] = useState<'unidad' | 'caja'>('unidad');
  const [mostrarDescripcionCompleta, setMostrarDescripcionCompleta] = useState(false);
  const [] = useState(false);
  const descripcionRef = useRef<HTMLParagraphElement | null>(null);

  // --- Efecto Principal para Cargar Datos del Producto ---
  useEffect(() => {
    window.scrollTo(0, 0);

    let productoEncontrado: Producto | undefined;
    let baseDelGrupo: Producto | undefined;

    // Buscamos el producto o la variante por el ID de la URL
    for (const p of todosLosProductos) {
      if (p.id === id) {
        productoEncontrado = p;
        baseDelGrupo = p; // El producto base es él mismo
        break;
      }
      const variante = p.variantes?.find(v => v.id === id);
      if (variante) {
        productoEncontrado = variante;
        baseDelGrupo = p; // El producto base es el padre de la variante
        break;
      }
    }

    if (baseDelGrupo && productoEncontrado) {
      const grupoCompleto = [baseDelGrupo, ...(baseDelGrupo.variantes || [])];
      
      setProductoBase(baseDelGrupo);
      setVarianteSeleccionada(productoEncontrado);
      setGrupoDeVariantes(grupoCompleto);
      setMainImage(productoEncontrado.imagen);
      document.title = `${productoEncontrado.nombre} | Pinturería Briago`;
    } else {
      setProductoBase(undefined); // Producto no encontrado
    }
  }, [id]);

  // --- Efecto para sincronizar estados al cambiar de variante ---
  useEffect(() => {
    if (varianteSeleccionada) {
      setMainImage(varianteSeleccionada.imagen);
      setCantidad(1); // Reseteamos la cantidad a 1
      setModoVenta('unidad'); // Reseteamos el modo de venta
    }
  }, [varianteSeleccionada]);

  // --- Lógica de Precios y Total ---


  if (!productoBase || !varianteSeleccionada) {
    return <div className="p-8 text-center text-gray-600">Producto no encontrado.</div>;
  }
  
  const ratingAvg = productoBase.rating ?? 0;
  const reviewsCount = productoBase.reviewsCount ?? 0;
  const rutaCategoria = `/productos?categoria=${encodeURIComponent(productoBase.categoria)}`;
  
  return (
    <div className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:underline">Inicio</Link> &gt;{" "}
          <Link to="/productos" className="hover:underline">Productos</Link> &gt;{" "}
          <Link to={rutaCategoria} className="hover:underline">{productoBase.categoria}</Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <ProductMainInfo
            producto={productoBase}
            mainImage={mainImage}
            setMainImage={setMainImage}
            varianteSeleccionada={varianteSeleccionada}
            setVarianteSeleccionada={setVarianteSeleccionada}
            descripcionRef={descripcionRef}
            mostrarDescripcionCompleta={mostrarDescripcionCompleta}
            setMostrarDescripcionCompleta={setMostrarDescripcionCompleta}
            
            logosMarca={logosMarca}
            normalizarMarca={normalizarMarca}
          />
          
          <ProductSidebar
            producto={varianteSeleccionada}
            variantes={grupoDeVariantes.filter(v => v.id !== productoBase.id)}
            grupoDeVariantes={grupoDeVariantes} // <-- SE PASA EL GRUPO COMPLETO AQUÍ
            navigate={navigate}
            formatearPrecio={formatearPrecio}
            
            modoVenta={modoVenta}
            setModoVenta={setModoVenta}
            cantidad={cantidad}
            setCantidad={setCantidad}
            
            addItem={addItem}
            toast={toast}
            
            reviewsCount={reviewsCount}
            ratingAvg={ratingAvg}
          />
        </div>
        
        <RelatedProducts categoria={productoBase.categoria} currentId={productoBase.id} />
      </div>
    </div>
  );
}