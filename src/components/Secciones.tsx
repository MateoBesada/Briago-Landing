import { Link } from "react-router-dom";
import React from "react";

// --- ARRAY DE CATEGORÍAS (sin cambios) ---
const categorias = [
  { id: 1, nombre: "Hogar y Obra", link: "/productos-pinturas" },
  { id: 2, nombre: "Automotor", link: "/productos-automotor" },
  { id: 3, nombre: "Industria", link: "#productos-industria" },
  { id: 4, nombre: "Pulidos", link: "/productos-pulidos" },
  { id: 5, nombre: "Abrasivos", link: "/productos-abrasivos" },
  { id: 6, nombre: "Accesorios", link: "/productos-accesorios" },
];

// --- Definición de tipos para TypeScript ---
interface Categoria {
  id: number;
  nombre: string;
  link: string;
}

interface CategoriaCardProps {
  cat: Categoria;
}

// 2. Modificamos la interfaz para que acepte cualquier prop (eventos)
interface WrapperProps {
  to?: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: any; // Permite pasar props adicionales como onMouseEnter, etc.
}

export default function Secciones() {
  const HEADER_HEIGHT = 80; // Ajustado un poco para el nuevo header

  return (
    <section
      id="productos"
      className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300 sticky z-40"
      style={{ top: `${HEADER_HEIGHT}px` }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 py-4 md:mt-8 grid mt-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categorias.map((cat) => (
          <CategoriaCard key={cat.id} cat={cat} />
        ))}
      </div>
    </section>
  );
}

// --- COMPONENTE MODIFICADO PARA HOVER CSS ---
const CategoriaCard = ({ cat }: CategoriaCardProps) => {
  return (
    <Wrapper
      to={cat.link.startsWith("/") ? cat.link : undefined}
      href={!cat.link.startsWith("/") ? cat.link : undefined}
      // 🛑 NUEVAS CLASES BASE: Diseño más limpio, sin bordes pesados
      className="relative w-full h-16 md:h-16 rounded-xl overflow-hidden
                 bg-white border border-gray-200 font-black group shadow-sm hover:shadow-xl
                 flex items-center justify-center text-center uppercase px-2
                 transition-all duration-300 ease-out 
                 hover:border-[#fff03b] hover:-translate-y-1 transform"
    >
      {/* 🛑 MODIFICADO: Capa de color que se desliza de abajo hacia arriba */}
      <div
        className={`absolute left-0 bottom-0 h-full w-full bg-[#fff03b] 
                    transform transition-transform duration-300 ease-in-out
                    group-hover:translate-y-0 translate-y-full opacity-90`}
      >
      </div>

      {/* El texto, que debe estar por encima de la capa */}
      <span
        className={`relative z-10 text-gray-800 text-sm md:text-sm font-black tracking-wider
                    transition-colors duration-200 delay-50
                    group-hover:text-black`}
      >
        {cat.nombre}
      </span>
    </Wrapper>
  );
};

// 6. COMPONENTE WRAPPER (modificado para aceptar los eventos)
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