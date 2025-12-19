import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../img/LogoHeader.png';

import { useSearch } from '../context/SearchContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { query, setQuery } = useSearch();

  const { cart, toggleSidebar } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 0), 0);

  // const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate('/buscar');
      setSearchOpen(false);
    }
  };





  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-[#fff03b] shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto py-3 px-4 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label="Ir al inicio">
            <img src={logo} alt="Logo Briago Pinturas" className="h-16 md:h-19 w-auto transition-transform group-hover:scale-105" />
            <div className="flex flex-col items-center">
              <span className="text-black font-black text-xl md:text-2xl tracking-tight leading-none">BRIAGO</span>
              <span className="text-black/90 font-bold text-xs md:text-sm tracking-[0.19em] ml-[3px] leading-none">PINTURAS</span>
            </div>
          </Link>

          <div className="flex-grow max-w-xl mx-auto hidden lg:block text-black">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-5 pr-12 py-2.5 bg-white border-none rounded-full text-black placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-black outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black rounded-full text-white hover:bg-gray-800 transition-colors"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-8">
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { label: 'PRODUCTOS', onClick: () => navigate('/productos') },
                { label: 'OFERTAS', onClick: () => navigate('/ofertas') },
                { label: 'CONTACTO', onClick: () => navigate('/contactoubicacion') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="group relative text-sm font-black text-black tracking-wider hover:text-black/80 transition-colors"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4 pl-4 border-l border-black/10">
              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden text-black hover:bg-black/5 p-2 rounded-full transition-colors"
                aria-label="Abrir buscador"
              >
                <Search className="w-6 h-6" />
              </button>

              <motion.button
                onClick={toggleSidebar}
                className="relative text-black hover:bg-black/5 p-2 rounded-full transition-colors"
                aria-label="Abrir carrito"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white font-bold text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </motion.button>

              <button
                className="lg:hidden text-black hover:bg-black/5 p-2 rounded-full transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menú"
              >
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Mobile */}
        <div
          className={`lg:hidden bg-[#fff03b] border-t border-black/5 px-4 font-medium text-sm overflow-hidden transition-all duration-500 ease-in-out ${menuOpen ? 'max-h-96 py-6 opacity-100 shadow-md' : 'max-h-0 py-0 opacity-0'
            }`}
        >
          <div className="flex flex-col gap-2">
            {[
              { label: 'PRODUCTOS', action: () => { navigate('/productos'); setMenuOpen(false); } },
              { label: 'OFERTAS', action: () => { navigate('/ofertas'); setMenuOpen(false); } },
              { label: 'CONTACTO', action: () => { navigate('/contactoubicacion'); setMenuOpen(false); } }
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-4 py-4 rounded-xl hover:bg-white/30 text-black font-black tracking-wider border-b border-black/5 last:border-0 flex justify-between items-center group"
              >
                {item.label}
                <span className="w-2 h-2 bg-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Buscador Mobile */}
      {searchOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#fff03b] z-[110] flex flex-col p-4 pt-4">
          {/* Top Bar Mobile Search */}
          <div className="flex justify-between items-center mb-6">
            <span className="font-black text-xl tracking-tight text-black">BUSCAR</span>
            <button onClick={() => setSearchOpen(false)} className="w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-black">
              <FaTimes size={18} />
            </button>
          </div>

          <form onSubmit={handleSearch} className="w-full relative">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-5 pr-12 py-4 bg-white border-2 border-black/5 rounded-2xl text-lg text-black placeholder-gray-500 shadow-sm focus:border-black outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black rounded-xl text-white"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Header;