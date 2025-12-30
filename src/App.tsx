import { useLocation, Routes, Route } from "react-router-dom";
import './index.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "swiper/css";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

import ScrollToTop from '@/components/ScrollToTop';
// 🛑 ELIMINAMOS: Ya no necesitamos 'motion' de framer-motion si no hay animación de carga
// import { motion } from "framer-motion"; 

// --- Tus imports originales ---
import HeaderInicio from "./components/Header";
import Secciones from "./components/Secciones";
import WhatsApp from "./components/WhatsApp";
import UbicaciónFlotante from "./components/UbicaciónFlotante";
import ProductosPage from "./pages/Productos-pinturas";
import AutomotorPage from "./pages/Productos-automotor";
import IndustriaPage from "./pages/Productos-industria";
import AbrasivosPage from "./pages/Productos-abrasivos";
import AccesoriosPage from "./pages/Productos-accesorios";
import ProductosTotal from "./pages/ProductosTotal";
import Buscar from "./components/Buscar";
import Footer from "./components/Footer";
import CartelWhatsApp from "./components/CartelFlotante";
import BannerOficial from "./components/BannerOficial";
import Ubicación from "./pages/ContactoUbicacion";
import Carrito from "@/pages/Carrito";
import CheckoutPage from "./pages/Checkout";
import ProductoPage from "./pages/ProductPage";
import TerminosYCondiciones from "@/pages/Terminos";
import SobreBriago from "@/pages/SobreBriago";
import ProductosDesdeDB from "./pages/Productos";
import TodosLosProductos from "./pages/NuestrosProductos";
import PulidosPage from './pages/Productos-pulidos';
import AboutSection from "@/components/AboutSection";

import AboutPage from './pages/AboutPage';
import CartPanel from './components/CartPanel';
import CompraExitosaPage from './pages/CompraExitosa';
import Ofertas from './pages/Ofertas';

function HomePageWrapper() {
  return (
    <>
      <RevealOnScroll width="100%">
        <Secciones />
      </RevealOnScroll>
      <RevealOnScroll width="100%" delay={0.1}>
        <BannerOficial />
      </RevealOnScroll>
      <RevealOnScroll width="100%" delay={0.1}>
        <ProductosTotal />
      </RevealOnScroll>
      <RevealOnScroll width="100%">
        <AboutSection />
      </RevealOnScroll>
    </>
  );
}

function App() {
  const location = useLocation();

  const ocultarFooterEn = [
    "/productos-pinturas",
    "/productos-automotor",
    "/productos-accesorios",
    "/productos-abrasivos",
    "/productos-pulidos",
    "/productos-db",
  ];

  const mostrarFooter = !ocultarFooterEn.some(path =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  return (
    <>
      <ScrollToTop />
      <div className="font-gotham text-gray-800 bg-gray-100">
        <div className="sticky top-0 z-50">
          <HeaderInicio />
        </div>
        <WhatsApp />
        <UbicaciónFlotante />
        <CartelWhatsApp />

        <main className="pt-20 md:pt-20 min-h-screen">
          <Routes>
            <Route path="/productos" element={<TodosLosProductos />} />
            <Route path="/" element={<HomePageWrapper />} />
            <Route path="/productos-pinturas" element={<ProductosPage />} />
            <Route path="/productos-automotor" element={<AutomotorPage />} />
            <Route path="/productos-industria" element={<IndustriaPage />} />
            <Route path="/productos-abrasivos" element={<AbrasivosPage />} />
            <Route path="/productos-accesorios" element={<AccesoriosPage />} />
            <Route path="/productos-pulidos" element={<PulidosPage />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/compra-exitosa" element={<CompraExitosaPage />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/producto/:id" element={<ProductoPage />} />
            <Route path="/terminos" element={<TerminosYCondiciones />} />
            <Route path="/sobreBriago" element={<SobreBriago />} />
            <Route path="/productos-db" element={<ProductosDesdeDB />} />
            <Route path="/contactoubicacion" element={<Ubicación />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/InfoBriagoPinturas" element={<AboutPage />} />
          </Routes>
        </main>
        {mostrarFooter && <Footer />}
      </div>
      <CartPanel />
    </>
  );
}

export default App;