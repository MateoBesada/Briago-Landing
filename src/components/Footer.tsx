import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white font-gotham text-sm py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 text-left">
        {/* Briago */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-3">Somos Briago</h4>
          <ul className="space-y-1 text-gray-300">
            <li className="hover:text-yellow-300 transition cursor-pointer">
              <Link to="/sobreBriago">Sobre Briago Pinturas</Link>
            </li>
            <li className="hover:text-yellow-300 transition cursor-pointer">Preguntas frecuentes</li>
            <li className="hover:text-yellow-300 transition cursor-pointer">Consultas / Reclamos</li>
            <li className="hover:text-yellow-300 transition cursor-pointer">
              <Link to="/terminos">Términos y Condiciones</Link>
            </li>
          </ul>
        </div>

        {/* Categorías */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-3">Categorías</h4>
          <ul className="space-y-1 text-gray-300">
            <li>
              <a
                href="/productos-Pinturas"
                className="hover:text-yellow-300 transition block"
              >
                Hogar y Obra
              </a>
            </li>
            <li>
              <a
                href="/productos-Automotor"
                className="hover:text-yellow-300 transition block"
              >
                Automotor
              </a>
            </li>
            <li>
              <a
                href="#"
                className="hover:text-yellow-300 transition block"
              >
                Industria
              </a>
            </li>
            <li>
              <a
                href="/productos-Abrasivos"
                className="hover:text-yellow-300 transition block"
              >
                Abrasivos
              </a>
            </li>
            <li>
              <a
                href="/productos-Accesorios"
                className="hover:text-yellow-300 transition block"
              >
                Accesorios
              </a>
            </li>
          </ul>
        </div>

        {/* Atención al cliente */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-3">Atención al cliente</h4>
          <p className="text-gray-300 mb-2">Días y horarios:</p>
          <p className="text-gray-400 leading-relaxed">
            <strong className="text-white">Lunes a Viernes:</strong> 8:00 a 13:00 y 14:00 a 18:00hs<br />
            <strong className="text-white">Sábados:</strong> 8:00 a 13:00hs
          </p>
          <p className="mt-3">
            <a
              href="https://wa.me/5491125219626"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-300 hover:underline transition"
            >
              Envíanos un mensaje de WhatsApp
            </a>
          </p>
        </div>

        {/* Métodos de Pago */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-3">Métodos de pago</h4>
          <ul className="space-y-1 text-gray-400 mt-2">
            <li>Visa</li>
            <li>Mastercard</li>
            <li>MercadoPago</li>
            <li>Débito</li>
          </ul>
        </div>

        {/* Redes sociales */}
        <div>
          <h4 className="text-yellow-400 font-bold text-lg mb-3">Seguinos</h4>
          <div className="flex gap-3">
            <a
              href="https://wa.me/5491125219626"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-300 text-black p-2 rounded-full hover:scale-110 transition"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={18} />
            </a>
            <a
              href="https://instagram.com/briagopinturas"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-yellow-300 text-black p-2 rounded-full hover:scale-110 transition"
              aria-label="Instagram"
            >
              <FaInstagram size={18} />
            </a>
            <a
              href="mailto:briagopinturas@gmail.com"
              className="bg-yellow-300 text-black p-2 rounded-full hover:scale-110 transition"
              aria-label="Email"
            >
              <SiGmail size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-400 text-xs px-4">
        <p>
          Los precios y promociones publicados en este sitio web son válidos únicamente para compras online.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
