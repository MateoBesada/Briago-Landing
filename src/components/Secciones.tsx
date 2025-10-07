import { Link } from "react-router-dom";
import React, { useState } from "react"; // 1. Importamos useState

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
  const HEADER_HEIGHT = 84;
  
  return (
    <section
      id="productos"
      className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200 transition-all duration-300 sticky z-40"
      style={{ top: `${HEADER_HEIGHT}px` }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categorias.map((cat) => (
          <CategoriaCard key={cat.id} cat={cat} />
        ))}
      </div>
    </section>
  );
}

// --- COMPONENTE MODIFICADO CON LÓGICA DE ESTADO ---
const CategoriaCard = ({ cat }: CategoriaCardProps) => {
  // 3. Estado para controlar si el botón está activo (por hover o toque)
  const [isActive, setIsActive] = useState(false);

  // Funciones para manejar los eventos
  const handleInteractionStart = () => setIsActive(true);
  const handleInteractionEnd = () => setIsActive(false);

  return (
    <Wrapper
      to={cat.link.startsWith("/") ? cat.link : undefined}
      href={!cat.link.startsWith("/") ? cat.link : undefined}
      className="relative w-full h-16 rounded-md overflow-hidden
                 bg-gray-100 font-bold
                 flex items-center justify-center text-center uppercase px-2
                 transition-all duration-300 ease-in-out"
      // 4. Eventos para mouse (desktop) y touch (celular)
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
    >
      {/* Capa de color que se desliza */}
      <div 
        className={`absolute top-0 left-0 h-full w-full bg-[#fff03b] 
                    transform transition-transform duration-300 ease-in-out
                    ${isActive ? 'translate-x-0' : '-translate-x-full'}`} // 5. Estilo condicional
      >
      </div>

      {/* El texto, que debe estar por encima de la capa */}
      <span 
        className={`relative z-10 text-gray-700 text-sm sm:text-base leading-tight
                    transition-colors duration-200 delay-50
                    ${isActive ? 'text-black' : 'text-gray-700'}`} // 5. Estilo condicional
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