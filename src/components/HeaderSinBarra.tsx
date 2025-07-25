import { useState } from 'react';
import { FaWhatsapp, FaBars, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../img/Captura_de_pantalla_2025-05-30_100255-removebg-preview.png';

const HeaderInicio = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="shadow-md fixed top-0 z-50 w-full"
      style={{ backgroundColor: '#fff03b' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-1 w-full flex items-center justify-between gap-2 md:flex-nowrap">
        <Link to="/" className="flex-shrink-0 mr-2">
          <img src={logo} alt="Logo" className="h-19 w-auto" />
        </Link>

        <button
          className="md:hidden text-gray-800 ml-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/ProductosTotal"
            className="text-black hover:scale-95 font-medium transition"
          >
            Productos
          </Link>
          <a
            href="#contacto"
            className="text-black hover:scale-95 font-medium transition"
          >
            Contacto
          </a>
          <a
            href="https://www.google.com/maps/place/Estanislao+López+737,+B1629+Pilar,+Provincia+de+Buenos+Aires"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-400 space-x-1 font-semibold"
          >
            <FaMapMarkerAlt />
            <span>Ubicación</span>
          </a>
          <a
            href="https://wa.me/5491125219626"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 hover:text-green-500 space-x-2 font-semibold"
          >
            <FaWhatsapp className="text-lg" />
            <span>11 2521 9626</span>
          </a>
        </nav>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gray-100 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/productos"
            className="block text-gray-800 hover:text-yellow-500 font-medium"
            onClick={() => setMenuOpen(false)}
          >
            Productos
          </Link>
          <a
            href="#contacto"
            className="block text-gray-800 hover:text-yellow-500 font-medium pointer-events-none opacity-50"
            onClick={(e) => e.preventDefault()}
          >
            Contacto
          </a>
          <a
            href="https://www.google.com/maps/place/GVM,+Estanislao+López+737,+B1629+Pilar,+Provincia+de+Buenos+Aires"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-yellow-500 space-x-2 font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            <FaMapMarkerAlt />
            <span>Ubicación</span>
          </a>
          <a
            href="https://wa.me/5491125219626"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-green-600 space-x-2 font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            <FaWhatsapp />
            <span>11 2521 9626</span>
          </a>
        </div>
      )}
    </header>
  );
};

export default HeaderInicio;
