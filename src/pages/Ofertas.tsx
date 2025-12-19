import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import ProductoCard from '@/components/ProductoCard';
import { productosPinturas } from '@/data/Pinturas';
import { productosAutomotor } from '@/data/Automotor';
import { productosAbrasivos } from '@/data/Abrasivos';
import { productosAccesorios } from '@/data/Accesorios';
import { productosPulidos } from '@/data/Pulidos';
import { productosIndustria } from '@/data/Industria';
import { Producto } from '@/types/Producto';

const todosLosProductos = [
    ...productosPinturas,
    ...productosAbrasivos,
    ...productosAutomotor,
    ...productosPulidos,
    ...productosAccesorios,
    ...productosIndustria,
];

export default function Ofertas() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 1. Filtrar productos con descuento
    const ofertas = todosLosProductos.filter(p => {
        const mainDiscount = (p.off && p.off > 0) || (p.precioOriginal && p.precio && p.precioOriginal > p.precio);
        if (mainDiscount) return true;
        if (p.variantes) {
            return p.variantes.some(v =>
                (v.off && v.off > 0) || (v.precioOriginal && v.precio && v.precioOriginal > v.precio)
            );
        }
        return false;
    });

    // 2. Agrupar por categorías
    const ofertasPorCategoria = ofertas.reduce((acc, curr) => {
        // Normalizar categoría o usar "Varios"
        const rawCat = curr.categoria || 'Varios';
        // Capitalizar primera letra para uniformidad
        const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {} as Record<string, Producto[]>);

    // 3. Filtrar categorías con <= 7 productos
    const categoriasVisibles = Object.entries(ofertasPorCategoria)
        .filter(([_, productos]) => productos.length > 7);

    // Helper para scrolling horizontal
    const scrollContainer = (id: string, direction: 'left' | 'right') => {
        const container = document.getElementById(id);
        if (container) {
            const scrollAmount = direction === 'left' ? -320 : 320;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header Section */}
            <div className="bg-[#fff03b] py-16 md:py-24 px-4 relative overflow-hidden">
                {/* Dotted Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-black/5 text-black/60 text-sm font-bold tracking-widest mb-4 border border-black/5 backdrop-blur-sm">
                            OPORTUNIDADES EXCLUSIVAS
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-black">
                            OFERTAS <span className="text-transparent [-webkit-text-stroke:2px_black]">ESPECIALES</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium text-black/80 max-w-2xl mx-auto">
                            Explorá nuestras categorías destacadas con grandes descuentos.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="min-h-screen bg-white relative pb-20">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

                <div className="max-w-[1440px] mx-auto px-4 py-12 relative z-10 space-y-16">
                    {categoriasVisibles.length > 0 ? (
                        categoriasVisibles.map(([categoria, productos], idx) => {
                            const carouselId = `carousel-${idx}`;
                            return (
                                <section key={categoria} className="relative group">
                                    <div className="flex items-center justify-between mb-8 px-2 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#fff03b] flex items-center justify-center rounded-xl shadow-sm border-2 border-black transform -rotate-3">
                                                <Tag className="text-black" size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight leading-none">
                                                    {categoria}
                                                </h2>
                                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">
                                                    {productos.length} Productos en promo
                                                </span>
                                            </div>
                                        </div>

                                        {/* Desktop Navigation Arrows - More Elegant */}
                                        <div className="hidden md:flex gap-2">
                                            <button
                                                onClick={() => scrollContainer(carouselId, 'left')}
                                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm"
                                                aria-label="Anterior"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <button
                                                onClick={() => scrollContainer(carouselId, 'right')}
                                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm"
                                                aria-label="Siguiente"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scrollable Container */}
                                    <div
                                        id={carouselId}
                                        className="flex overflow-x-auto gap-6 pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {productos.map((producto) => (
                                            <div key={producto.id} className="min-w-[280px] md:min-w-[320px] snap-start hover:-translate-y-1 transition-transform duration-300">
                                                <ProductoCard
                                                    variantes={producto.variantes && producto.variantes.length > 0 ? [producto, ...producto.variantes] : [producto]}
                                                    baseNombre={producto.nombre}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                            <Tag size={64} className="text-gray-300 mb-6" />
                            <h3 className="text-3xl font-black text-gray-300 uppercase">Sin Categorías Promocionales</h3>
                            <p className="text-gray-400 mt-2 max-w-md">
                                Actualmente ninguna categoría supera los 7 productos en oferta para mostrarse en esta sección.
                            </p>
                            <Link to="/" className="mt-8 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-[#fff03b] hover:text-black transition-colors">
                                Ver Todos los Productos
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
