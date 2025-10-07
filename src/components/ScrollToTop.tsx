import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Usa 'instant' para anular cualquier 'scroll-behavior: smooth' del CSS
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); 
  }, [pathname]); // Se ejecuta cada vez que cambia la URL

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;