import { useState, useMemo } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../img/LogoHeader.png';

import { useSearch } from '../context/SearchContext';
import { useCart } from '../context/CartContext'; // Importamos useCart
import GlobalSearch from './GlobalSearch';
import type { Producto } from './GlobalSearch'; 

import { productosPinturas } from '../data/Pinturas';
import { productosAutomotor } from '../data/Automotor';
import { productosAccesorios } from '../data/Accesorios';
import { productosIndustria } from '../data/Industria';
import { productosAbrasivos } from '../data/Abrasivos';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { query, setQuery } = useSearch();
  
  // ✅ Usamos useCart para obtener el estado del carrito y la función para abrir/cerrar el panel
  const { cart, toggleSidebar } = useCart(); 
  const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 0), 0);

  const location = useLocation();
  const navigate = useNavigate();

  const productosGlobales: Producto[] = useMemo(() => [
    ...productosPinturas,
    ...productosAutomotor,
    ...productosAccesorios,
    ...productosIndustria,
    ...productosAbrasivos,
  ], []);

  const scrollOrNavigate = (id: string) => {
    if (location.pathname === '/') {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-[#fff03b] shadow px-1">
        <div className="max-w-7xl mx-auto py-2 px-2 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Ir al inicio">
            <img src={logo} alt="Logo Briago Pinturas" className="h-16 md:h-17 w-auto" />
            <span className="text-black font-extrabold text-md md:text-xl tracking-wide leading-tight hidden sm:block">
              BRIAGO<br />PINTURAS
            </span>
          </Link>

          <div className="flex-grow mx-4 hidden lg:flex">
            <GlobalSearch
              productos={productosGlobales}
              query={query}
              setQuery={setQuery}
            />
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex items-center space-x-3 font-semibold text-sm uppercase">
              <button
                onClick={() => navigate('/productos')} 
                className="px-5 py-2 rounded-full border border-black text-black hover:bg-black hover:text-yellow-300 transition"
              >
                PRODUCTOS
              </button>
              <button
                onClick={() => scrollOrNavigate('ofertas')}
                className="px-5 py-2 rounded-full border border-black text-black hover:bg-black hover:text-yellow-300 transition"
              >
                OFERTAS
              </button>
              <button
                onClick={() => navigate('/contactoubicacion')}
                className="px-5 py-2 rounded-full bg-black text-yellow-300 border border-black hover:opacity-90 transition"
              >
                CONTÁCTANOS
              </button>
            </nav>

            <button onClick={() => setSearchOpen(true)} className="lg:hidden text-black" aria-label="Abrir buscador">
              <Search className="w-6 h-6" />
            </button>

            {/* ✅ Aquí el cambio: onClick ahora llama a toggleSidebar */}
            <motion.button
              onClick={toggleSidebar} // Llama a la función para abrir/cerrar el CartPanel
              className="relative text-black"
              aria-label="Abrir carrito" // Cambiamos el aria-label
              animate={totalItems > 0 ? { y: [0, -10, 2, 0] } : { y: 0 }}
              transition={
                totalItems > 0
                  ? { duration: 0.6, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }
                  : {}
              }
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </motion.button>

            <button
              className="lg:hidden text-black"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden bg-[#fff03b] px-4 font-semibold text-sm uppercase transition-all duration-500 ease-in-out overflow-hidden ${
            menuOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
        >
          <button onClick={() => { navigate('/productos'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 border border-black mb-3 rounded-full text-black">
            NUESTROS PRODUCTOS
          </button>
          <button onClick={() => { scrollOrNavigate('sucursal'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 border border-black mb-3 rounded-full text-black">
            SUCURSAL
          </button>
          <button onClick={() => { scrollOrNavigate('contacto'); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 bg-black text-yellow-300 rounded-full border border-black">
            CONTÁCTANOS
          </button>
        </div>
      </header>
      
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex flex-col p-4 pt-24">
          <div className="bg-white rounded-lg p-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Buscar Productos</h3>
              <button onClick={() => setSearchOpen(false)} className="text-gray-600">
                <FaTimes size={22}/>
              </button>
            </div>
            <GlobalSearch
              productos={productosGlobales}
              query={query}
              setQuery={setQuery}
              onResultClick={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;