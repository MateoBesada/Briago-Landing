import { Link, useLocation } from "react-router-dom";
import React from "react";

// --- ARRAY DE CATEGORÍAS ---
const categorias = [
    { id: 1, nombre: "Hogar y Obra", link: "/productos-pinturas" },
    { id: 2, nombre: "Automotor", link: "/productos-automotor" },
    { id: 3, nombre: "Industria", link: "/productos-industria" }, // Updated link to be consistent
    { id: 4, nombre: "Pulidos", link: "/productos-pulidos" },
    { id: 5, nombre: "Abrasivos", link: "/productos-abrasivos" },
    { id: 6, nombre: "Accesorios", link: "/productos-accesorios" },
];

interface Categoria {
    id: number;
    nombre: string;
    link: string;
}

interface CategoriaCardProps {
    cat: Categoria;
    isActive: boolean;
}

interface WrapperProps {
    to?: string;
    href?: string;
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
}

export default function SeccionesTabs() {
    const location = useLocation();
    const HEADER_HEIGHT = 80;

    return (
        <section
            id="secciones-tabs"
            className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 sticky z-40 mb-8"
            style={{ top: `${HEADER_HEIGHT}px` }}
        >
            <div className="w-full max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {categorias.map((cat) => (
                    <CategoriaCard
                        key={cat.id}
                        cat={cat}
                        isActive={location.pathname === cat.link}
                    />
                ))}
            </div>
        </section>
    );
}

const CategoriaCard = ({ cat, isActive }: CategoriaCardProps) => {
    return (
        <Wrapper
            to={cat.link.startsWith("/") ? cat.link : undefined}
            href={!cat.link.startsWith("/") ? cat.link : undefined}
            className={`relative w-full h-12 md:h-14 rounded-xl overflow-hidden
                 font-bold group shadow-sm hover:shadow-md
                 flex items-center justify-center text-center uppercase px-2
                 transition-all duration-300 ease-out border
                 ${isActive
                    ? 'bg-[#fff03b] border-[#fff03b] text-black'
                    : 'bg-gray-50 border-transparent text-gray-600 hover:border-[#fff03b] hover:-translate-y-0.5'
                }`}
        >
            {!isActive && (
                <div
                    className={`absolute left-0 bottom-0 h-full w-full bg-[#fff03b] 
                      transform transition-transform duration-300 ease-in-out
                      group-hover:translate-y-0 translate-y-full opacity-90`}
                />
            )}

            <span
                className={`relative z-10 text-xs md:text-sm font-bold tracking-wide
                    transition-colors duration-200 delay-50
                    ${isActive ? 'text-black' : 'group-hover:text-black'}`}
            >
                {cat.nombre}
            </span>
        </Wrapper>
    );
};

const Wrapper = ({ to, href, className, children, ...props }: WrapperProps) => {
    return to ? (
        <Link to={to} className={className} {...props}>
            {children}
        </Link>
    ) : (
        <a href={href} className={className} {...props}>
            {children}
        </a>
    );
};
