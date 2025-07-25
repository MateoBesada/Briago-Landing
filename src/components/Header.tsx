import { useState, useMemo } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../img/Captura_de_pantalla_2025-05-30_100255-removebg-preview.png';

import { useSearch } from '../context/SearchContext';
import { useCart } from '../context/CartContext';
import GlobalSearch from './GlobalSearch';

import { productosPinturas } from '../data/Pinturas';
import { productosAutomotor } from '../data/Automotor';
import { productosAccesorios } from '../data/Accesorios';
import { productosIndustria } from '../data/Industria';
import { productosAbrasivos } from '../data/Abrasivos';
import type { Producto } from '../types/Producto';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { query, setQuery } = useSearch();
  const { cart, addItem } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const location = useLocation();
  const navigate = useNavigate();

  const productosGlobales = useMemo(
    () => [
      ...productosPinturas,
      ...productosAutomotor,
      ...productosAccesorios,
      ...productosIndustria,
      ...productosAbrasivos,
    ],
    []
  );

  const handleAgregarAlCarrito = (producto: Producto) => {
    addItem({ ...producto, cantidad: 1, precio: producto.precio ?? 0 });
  };

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
    <header className="fixed top-0 z-50 w-full bg-[#fff03b] shadow px-1">
      <div className="max-w-7xl mx-auto py-2 px-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Ir al inicio">
          <img src={logo} alt="Logo Briago Pinturas" className="h-16 md:h-17 w-auto" />
          <span className="text-black font-extrabold text-md md:text-xl tracking-wide leading-tight hidden sm:block">
            BRIAGO<br />PINTURAS
          </span>
        </Link>

        {/* Buscador */}
        <div className="flex-1 sm:flex-none sm:w-auto flex justify-center">
          <GlobalSearch
            productos={productosGlobales}
            query={query}
            setQuery={setQuery}
            agregarAlCarrito={handleAgregarAlCarrito}
          />
        </div>

        {/* Nav Desktop */}
        <nav className="hidden lg:flex items-center space-x-3 font-semibold text-sm uppercase">
          <button
            onClick={() => scrollOrNavigate('productos')}
            className="px-5 py-2 rounded-full border border-black text-black hover:bg-black hover:text-yellow-300 transition"
          >
            PRODUCTOS
          </button>
          <button
            onClick={() => scrollOrNavigate('sucursal')}
            className="px-5 py-2 rounded-full border border-black text-black hover:bg-black hover:text-yellow-300 transition"
          >
            SUCURSAL
          </button>
          <button
            onClick={() => scrollOrNavigate('contacto')}
            className="px-5 py-2 rounded-full bg-black text-yellow-300 border border-black hover:opacity-90 transition"
          >
            CONTÁCTANOS
          </button>
        </nav>

        {/* Carrito */}
        <motion.button
          onClick={() => navigate('/carrito')}
          className="relative text-black"
          aria-label="Ir al carrito"
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

        {/* Toggle Mobile */}
        <button
          className="lg:hidden text-black"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`lg:hidden bg-[#fff03b] px-4 font-semibold text-sm uppercase transition-all duration-500 ease-in-out overflow-hidden ${
          menuOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
        }`}
      >
        <button
          onClick={() => {
            scrollOrNavigate('productos');
            setMenuOpen(false);
          }}
          className="block w-full text-left px-4 py-2 border border-black mb-3 rounded-full text-black"
        >
          NUESTROS PRODUCTOS
        </button>
        <button
          onClick={() => {
            scrollOrNavigate('sucursal');
            setMenuOpen(false);
          }}
          className="block w-full text-left px-4 py-2 border border-black mb-3 rounded-full text-black"
        >
          SUCURSAL
        </button>
        <button
          onClick={() => {
            scrollOrNavigate('contacto');
            setMenuOpen(false);
          }}
          className="block w-full text-left px-4 py-2 bg-black text-yellow-300 rounded-full border border-black"
        >
          CONTÁCTANOS
        </button>
      </div>
    </header>
  );
};

export default Header;
