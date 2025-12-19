import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#fcfcfc] border-t border-gray-200 mt-16 font-gotham">

      {/* Top Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gray-100 via-[#fff03b] via-[#fff03b] via-[#fff03b] to-gray-100" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* 1. Brand Identity */}
          <div className="space-y-6">
            <Link to="/" className="inline-block group">
              <div className="flex flex-col items-start leading-none gap-0.5">
                <span className="text-black font-black text-3xl tracking-tight">BRIAGO</span>
                <span className="text-black/80 font-bold text-[1rem] tracking-[0.30em] ml-[1px]">PINTURAS</span>
              </div>
            </Link>

            <p className="text-gray-500 text-sm leading-relaxed font-medium pr-4 max-w-xs">
              Soluciones profesionales para hogar, obra e industria. Calidad garantizada en cada producto.
            </p>

            <div className="flex gap-3 pt-2">
              {[
                { icon: <Instagram size={18} />, href: "https://instagram.com/briagopinturas" },
                { icon: <Mail size={18} />, href: "mailto:briagopinturas@gmail.com" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-[#fff03b] hover:text-black hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/10"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-black font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#fff03b] rounded-full"></span>
              Explorar
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Inicio" },
                { to: "/productos", label: "Productos" },
                { to: "/ofertas", label: "Ofertas Especiales" },
                { to: "/sobreBriago", label: "Sobre Nosotros" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-500 hover:text-black hover:translate-x-1 font-semibold text-sm transition-all duration-200 flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200 text-[#fff03b]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Categories */}
          <div>
            <h4 className="text-black font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#fff03b] rounded-full"></span>
              Catálogo
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/productos-pinturas", label: "Hogar y Obra" },
                { to: "/productos-automotor", label: "Automotor" },
                { to: "/productos-industria", label: "Industria" },
                { to: "/productos-accesorios", label: "Accesorios" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-500 hover:text-black hover:translate-x-1 font-semibold text-sm transition-all duration-200 flex items-center gap-2 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all duration-200 text-[#fff03b]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h4 className="text-black font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#fff03b] rounded-full"></span>
              Contacto
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4 group">
                <div className="w-10 h-10 bg-gray-100 text-black group-hover:bg-[#fff03b] transition-colors duration-300 flex items-center justify-center rounded-xl shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="block font-bold text-black text-xs uppercase tracking-wide mb-1 opacity-50">Dirección</span>
                  <span className="text-gray-800 text-sm font-bold leading-snug block">
                    Estanislao López 737,<br />Pilar Centro
                  </span>
                </div>
              </li>
              <li className="flex gap-4 group">
                <div className="w-10 h-10 bg-gray-100 text-black group-hover:bg-[#fff03b] transition-colors duration-300 flex items-center justify-center rounded-xl shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="block font-bold text-black text-xs uppercase tracking-wide mb-1 opacity-50">Teléfono</span>
                  <span className="text-gray-800 text-sm font-bold block">+54 9 11 2521-9626</span>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs font-semibold tracking-wide">
            © {currentYear} Briago Pinturas. Todos los derechos reservados.
          </p>
          <div className="flex gap-8">
            <Link to="/terminos" className="text-gray-400 hover:text-black text-xs font-bold transition-colors uppercase tracking-wider">Términos</Link>
            <Link to="/privacidad" className="text-gray-400 hover:text-black text-xs font-bold transition-colors uppercase tracking-wider">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
